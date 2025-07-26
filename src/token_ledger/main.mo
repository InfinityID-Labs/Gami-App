// import Debug "mo:base/Debug";
import Time "mo:base/Time";
import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Float "mo:base/Float";
import Int "mo:base/Int";

persistent actor TokenLedger {
  // Types
  public type UserId = Principal;
  public type TokenSymbol = Text;
  public type TokenAmount = Float;

  public type Token = {
    symbol : TokenSymbol;
    name : Text;
    totalSupply : TokenAmount;
    decimals : Nat8;
    createdAt : Int;
    creator : UserId;
  };

  public type Balance = {
    owner : UserId;
    token : TokenSymbol;
    amount : TokenAmount;
    lastUpdated : Int;
  };

  public type Transaction = {
    id : Text;
    from : ?UserId;
    to : UserId;
    token : TokenSymbol;
    amount : TokenAmount;
    timestamp : Int;
    transactionType : Text;
    blockHeight : Nat;
  };

  public type TransferArgs = {
    to : UserId;
    token : TokenSymbol;
    amount : TokenAmount;
    memo : ?Text;
  };

  // State
  private var tokensEntries : [(TokenSymbol, Token)] = [];
  private transient var tokens = HashMap.HashMap<TokenSymbol, Token>(20, Text.equal, Text.hash);
  for ((k, v) in tokensEntries.vals()) {
    tokens.put(k, v);
  };

  private var balancesEntries : [(Text, TokenAmount)] = [];
  private transient var balances = HashMap.HashMap<Text, TokenAmount>(1000, Text.equal, Text.hash);
  for ((k, v) in balancesEntries.vals()) {
    balances.put(k, v);
  };

  private var transactionsEntries : [(Text, Transaction)] = [];
  private transient var transactions = HashMap.HashMap<Text, Transaction>(1000, Text.equal, Text.hash);
  for ((k, v) in transactionsEntries.vals()) {
    transactions.put(k, v);
  };

  private var nextBlockHeight : Nat = 1;

  // System functions
  system func preupgrade() {
    var tempTokens : [(TokenSymbol, Token)] = [];
    for (entry in tokens.entries()) {
      tempTokens := Array.append(tempTokens, [entry]);
    };
    tokensEntries := tempTokens;
    var tempBalances : [(Text, TokenAmount)] = [];
    for (entry in balances.entries()) {
      tempBalances := Array.append(tempBalances, [entry]);
    };
    balancesEntries := tempBalances;
    var tempTransactions : [(Text, Transaction)] = [];
    for (entry in transactions.entries()) {
      tempTransactions := Array.append(tempTransactions, [entry]);
    };
    transactionsEntries := tempTransactions;
  };

  system func postupgrade() {
    tokensEntries := [];
    balancesEntries := [];
    transactionsEntries := [];
  };

  // Token Management
  public func createToken(
    symbol : TokenSymbol,
    name : Text,
    totalSupply : TokenAmount,
    decimals : Nat8,
  ) : async Result.Result<Token, Text> {
    let caller = Principal.fromActor(TokenLedger);

    switch (tokens.get(symbol)) {
      case (_) { #err("Token already exists") };
      case null {
        let token : Token = {
          symbol = symbol;
          name = name;
          totalSupply = totalSupply;
          decimals = decimals;
          createdAt = Time.now();
          creator = caller;
        };

        tokens.put(symbol, token);

        // Mint initial supply to creator
        let balanceKey = getBalanceKey(caller, symbol);
        balances.put(balanceKey, totalSupply);

        #ok(token);
      };
    };
  };

  public query func getToken(symbol : TokenSymbol) : async ?Token {
    tokens.get(symbol);
  };

  public query func getAllTokens() : async [Token] {
    var temp : [Token] = [];
    for (t in tokens.vals()) {
      temp := Array.append(temp, [t]);
    };
    temp;
  };

  // Balance Management
  private func getBalanceKey(userId : UserId, token : TokenSymbol) : Text {
    Principal.toText(userId) # "_" # token;
  };

  public query func balanceOf(userId : UserId, token : TokenSymbol) : async TokenAmount {
    let key = getBalanceKey(userId, token);
    switch (balances.get(key)) {
      case (?balance) { balance };
      case null { 0.0 };
    };
  };

  public query func getUserBalances(userId : UserId) : async [(TokenSymbol, TokenAmount)] {
    let userPrefix = Principal.toText(userId) # "_";

    var temp : [(Text, TokenAmount)] = [];
    for (entry in balances.entries()) {
      temp := Array.append(temp, [entry]);
    };
    Array.mapFilter(
      temp,
      func((key, balance) : (Text, TokenAmount)) : ?(TokenSymbol, TokenAmount) {
        if (Text.startsWith(key, #text userPrefix)) {
          let tokenSymbol = Text.replace(key, #text userPrefix, "");
          if (balance > 0.0) {
            ?(tokenSymbol, balance);
          } else {
            null;
          };
        } else {
          null;
        };
      },
    );
  };

  // Transfer Functions
  public func transfer(args : TransferArgs) : async Result.Result<Transaction, Text> {
    let caller = Principal.fromActor(TokenLedger);

    if (Principal.equal(caller, args.to)) {
      return #err("Cannot transfer to yourself");
    };

    if (args.amount <= 0.0) {
      return #err("Transfer amount must be positive");
    };

    switch (tokens.get(args.token)) {
      case null { #err("Token not found") };
      case (_) {
        let fromKey = getBalanceKey(caller, args.token);
        let toKey = getBalanceKey(args.to, args.token);

        let fromBalance = switch (balances.get(fromKey)) {
          case (?balance) { balance };
          case null { 0.0 };
        };

        if (fromBalance < args.amount) {
          return #err("Insufficient balance");
        };

        let toBalance = switch (balances.get(toKey)) {
          case (?balance) { balance };
          case null { 0.0 };
        };

        // Update balances
        balances.put(fromKey, fromBalance - args.amount);
        balances.put(toKey, toBalance + args.amount);

        // Create transaction record
        let transactionId = Principal.toText(caller) # "_" # Principal.toText(args.to) # "_" # args.token # "_" # Int.toText(Time.now());
        let transaction : Transaction = {
          id = transactionId;
          from = ?caller;
          to = args.to;
          token = args.token;
          amount = args.amount;
          timestamp = Time.now();
          transactionType = "transfer";
          blockHeight = nextBlockHeight;
        };

        transactions.put(transactionId, transaction);
        nextBlockHeight := nextBlockHeight + 1;

        #ok(transaction);
      };
    };
  };

  public func mint(
    to : UserId,
    token : TokenSymbol,
    amount : TokenAmount,
    _ : ?Text,
  ) : async Result.Result<Transaction, Text> {
    let caller = Principal.fromActor(TokenLedger);

    switch (tokens.get(token)) {
      case null { #err("Token not found") };
      case (?tokenInfo) {
        if (not Principal.equal(caller, tokenInfo.creator)) {
          return #err("Only token creator can mint");
        };

        let toKey = getBalanceKey(to, token);
        let currentBalance = switch (balances.get(toKey)) {
          case (?balance) { balance };
          case null { 0.0 };
        };

        balances.put(toKey, currentBalance + amount);

        let transactionId = "mint_" # Principal.toText(to) # "_" # token # "_" # Int.toText(Time.now());
        let transaction : Transaction = {
          id = transactionId;
          from = null;
          to = to;
          token = token;
          amount = amount;
          timestamp = Time.now();
          transactionType = "mint";
          blockHeight = nextBlockHeight;
        };

        transactions.put(transactionId, transaction);
        nextBlockHeight := nextBlockHeight + 1;

        #ok(transaction);
      };
    };
  };

  // Quest Reward Distribution
  public func distributeQuestReward(
    userId : UserId,
    questId : Text,
    tokenRewards : [(TokenSymbol, TokenAmount)],
  ) : async Result.Result<[Transaction], Text> {
    var resultTransactions : [Transaction] = [];

    for ((tokenSymbol, amount) in tokenRewards.vals()) {
      let memo = ?("quest_reward_" # questId);
      let mintResult = await mint(userId, tokenSymbol, amount, memo);
      switch (mintResult) {
        case (#err(error)) { return #err(error) };
        case (#ok(transaction)) {
          resultTransactions := Array.append(resultTransactions, [transaction]);
        };
      };
    };

    #ok(resultTransactions);
  };

  // Transaction History
  public query func getTransactionHistory(userId : ?UserId, limit : ?Nat) : async [Transaction] {
    let maxResults = switch (limit) {
      case (?l) { l };
      case null { 100 };
    };

    var allTransactions : [Transaction] = [];
    for (t in transactions.vals()) {
      allTransactions := Array.append(allTransactions, [t]);
    };

    let filteredTransactions = switch (userId) {
      case null { allTransactions };
      case (?id) {
        Array.filter(
          allTransactions,
          func(t : Transaction) : Bool {
            Principal.equal(t.to, id) or (switch (t.from) { case (?from) { Principal.equal(from, id) }; case null { false } });
          },
        );
      };
    };

    let sortedTransactions = Array.sort(
      filteredTransactions,
      func(a : Transaction, b : Transaction) : { #less; #equal; #greater } {
        if (a.timestamp > b.timestamp) { #less } else if (a.timestamp < b.timestamp) {
          #greater;
        } else { #equal };
      },
    );

    Array.take(sortedTransactions, maxResults);
  };

  // Portfolio Management
  public query func getPortfolioValue(_ : UserId) : async Float {
    0.0;
  };

  private func _getTokenPrice(token : TokenSymbol) : Float {
    // Mock prices for demo - in production, this would fetch from price oracle
    switch (token) {
      case ("GAMI") { 0.50 };
      case ("QUEST") { 0.25 };
      case ("LOCAL") { 0.10 };
      case ("FIT") { 0.15 };
      case ("PROD") { 0.20 };
      case (_) { 0.01 };
    };
  };

  // Statistics
  public query func getTokenStats(token : TokenSymbol) : async ?{
    totalHolders : Nat;
    totalTransactions : Nat;
    circulatingSupply : TokenAmount;
  } {
    switch (tokens.get(token)) {
      case null { null };
      case (?tokenInfo) {
        var tempTransactions : [Transaction] = [];
        for (t in transactions.vals()) {
          tempTransactions := Array.append(tempTransactions, [t]);
        };
        let tokenTransactions = Array.filter(tempTransactions, func(t : Transaction) : Bool { t.token == token });
        var tempBalances : [(Text, TokenAmount)] = [];
        for (entry in balances.entries()) {
          tempBalances := Array.append(tempBalances, [entry]);
        };
        let tokenBalances = Array.filter(
          tempBalances,
          func((key, balance) : (Text, TokenAmount)) : Bool {
            Text.endsWith(key, #text("_" # token)) and balance > 0.0
          },
        );

        ?{
          totalHolders = tokenBalances.size();
          totalTransactions = tokenTransactions.size();
          circulatingSupply = tokenInfo.totalSupply;
        };
      };
    };
  };

  // Health check
  public query func greet(name : Text) : async Text {
    "Hello, " # name # "! Token Ledger canister is running!";
  };
};
