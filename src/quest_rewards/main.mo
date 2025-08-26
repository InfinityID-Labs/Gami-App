import Debug "mo:base/Debug";
import Time "mo:base/Time";
import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Float "mo:base/Float";
import Int "mo:base/Int";

persistent actor QuestRewards {
  // Types
  public type UserId = Principal;
  public type TokenSymbol = Text;
  public type TokenAmount = Float;
  public type QuestId = Text;

  public type RewardToken = {
    symbol : TokenSymbol;
    name : Text;
    totalSupply : TokenAmount;
    decimals : Nat8;
  };

  public type UserBalance = {
    userId : UserId;
    balances : [(TokenSymbol, TokenAmount)];
  };

  public type Transaction = {
    id : Text;
    from : ?UserId;
    to : UserId;
    token : TokenSymbol;
    amount : TokenAmount;
    timestamp : Int;
    transactionType : Text; // "quest_reward", "transfer", "mint"
  };

  // State
  private stable var tokensEntries : [(TokenSymbol, RewardToken)] = [];
  private transient var tokens = HashMap.HashMap<TokenSymbol, RewardToken>(10, Text.equal, Text.hash);
  for ((k, v) in tokensEntries.vals()) {
    tokens.put(k, v);
  };

  private stable var balancesEntries : [(Text, TokenAmount)] = [];
  private transient var balances = HashMap.HashMap<Text, TokenAmount>(100, Text.equal, Text.hash);
  for ((k, v) in balancesEntries.vals()) {
    balances.put(k, v);
  };

  private stable var transactionsEntries : [(Text, Transaction)] = [];
  private transient var transactions = HashMap.HashMap<Text, Transaction>(100, Text.equal, Text.hash);
  for ((k, v) in transactionsEntries.vals()) {
    transactions.put(k, v);
  };

  // System functions
  system func preupgrade() {
    var tempTokens : [(TokenSymbol, RewardToken)] = [];
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

  // Initialize default tokens
  public func initializeTokens() : async () {
    let defaultTokens = [
      ("GAMI", { symbol = "GAMI"; name = "Gami Token"; totalSupply = 1000000.0; decimals = 8 : Nat8 }),
      ("QUEST", { symbol = "QUEST"; name = "Quest Token"; totalSupply = 500000.0; decimals = 8 : Nat8 }),
      ("LOCAL", { symbol = "LOCAL"; name = "Local Rewards"; totalSupply = 250000.0; decimals = 8 : Nat8 }),
      ("FIT", { symbol = "FIT"; name = "Fitness Token"; totalSupply = 750000.0; decimals = 8 : Nat8 }),
      ("PROD", { symbol = "PROD"; name = "Productivity Token"; totalSupply = 300000.0; decimals = 8 : Nat8 }),
    ];
    for ((symbol, token) in defaultTokens.vals()) {
      tokens.put(symbol, token);
    };
  };

  // Token Management
  public query func getToken(symbol : TokenSymbol) : async ?RewardToken {
    tokens.get(symbol);
  };

  public query func getAllTokens() : async [RewardToken] {
    var temp : [RewardToken] = [];
    for (t in tokens.vals()) {
      temp := Array.append(temp, [t]);
    };
    temp;
  };

  // Balance Management
  private func getBalanceKey(userId : UserId, token : TokenSymbol) : Text {
    Principal.toText(userId) # "_" # token;
  };

  public query func getBalance(userId : UserId, token : TokenSymbol) : async TokenAmount {
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
          ?(tokenSymbol, balance);
        } else {
          null;
        };
      },
    );
  };

  // Reward Distribution
  public func awardQuestReward(
    userId : UserId,
    questId : QuestId,
    tokenRewards : [(TokenSymbol, TokenAmount)],
  ) : async Result.Result<[Transaction], Text> {
    let caller = Principal.fromActor(QuestRewards);
    var resultTransactions : [Transaction] = [];

    for ((token, amount) in tokenRewards.vals()) {
      switch (tokens.get(token)) {
        case null { return #err("Token not found: " # token) };
        case (?tokenInfo) {
          let key = getBalanceKey(userId, token);
          let currentBalance = switch (balances.get(key)) {
            case (?balance) { balance };
            case null { 0.0 };
          };

          let newBalance = currentBalance + amount;
          balances.put(key, newBalance);

          let transactionId = Principal.toText(userId) # "_" # questId # "_" # token # "_" # Int.toText(Time.now());
          let transaction : Transaction = {
            id = transactionId;
            from = null; // Minted reward
            to = userId;
            token = token;
            amount = amount;
            timestamp = Time.now();
            transactionType = "quest_reward";
          };

          transactions.put(transactionId, transaction);
          resultTransactions := Array.append(resultTransactions, [transaction]);
        };
      };
    };

    #ok(resultTransactions);
  };

  // Token Transfer
  public func transfer(
    to : UserId,
    token : TokenSymbol,
    amount : TokenAmount,
  ) : async Result.Result<Transaction, Text> {
    let caller = Principal.fromActor(QuestRewards);

    if (Principal.equal(caller, to)) {
      return #err("Cannot transfer to yourself");
    };

    switch (tokens.get(token)) {
      case null { #err("Token not found") };
      case (?tokenInfo) {
        let fromKey = getBalanceKey(caller, token);
        let toKey = getBalanceKey(to, token);

        let fromBalance = switch (balances.get(fromKey)) {
          case (?balance) { balance };
          case null { 0.0 };
        };

        if (fromBalance < amount) {
          return #err("Insufficient balance");
        };

        let toBalance = switch (balances.get(toKey)) {
          case (?balance) { balance };
          case null { 0.0 };
        };

        balances.put(fromKey, fromBalance - amount);
        balances.put(toKey, toBalance + amount);

        let transactionId = Principal.toText(caller) # "_to_" # Principal.toText(to) # "_" # token # "_" # Int.toText(Time.now());
        let transaction : Transaction = {
          id = transactionId;
          from = ?caller;
          to = to;
          token = token;
          amount = amount;
          timestamp = Time.now();
          transactionType = "transfer";
        };

        transactions.put(transactionId, transaction);
        #ok(transaction);
      };
    };
  };

  // Transaction History
  public query func getUserTransactions(userId : UserId) : async [Transaction] {
    var temp : [Transaction] = [];
    for (t in transactions.vals()) {
      temp := Array.append(temp, [t]);
    };
    let filtered = Array.filter(
      temp,
      func(t : Transaction) : Bool {
        Principal.equal(t.to, userId) or (switch (t.from) { case (?from) { Principal.equal(from, userId) }; case null { false } });
      },
    );
    Array.sort(
      filtered,
      func(a : Transaction, b : Transaction) : { #less; #equal; #greater } {
        if (a.timestamp > b.timestamp) { #less } else if (a.timestamp < b.timestamp) {
          #greater;
        } else { #equal };
      },
    );
  };

  // Portfolio Value (mock prices for demo)
  public query func getPortfolioValue(userId : UserId) : async Float {
    // Não é possível usar await em query, então retorna 0.0 ou implementa lógica alternativa
    0.0;
  };

  private func getTokenPrice(token : TokenSymbol) : Float {
    switch (token) {
      case ("GAMI") { 0.50 };
      case ("QUEST") { 0.25 };
      case ("LOCAL") { 0.10 };
      case ("FIT") { 0.15 };
      case ("PROD") { 0.20 };
      case (_) { 0.01 };
    };
  };

  // Health check
  public query func greet(name : Text) : async Text {
    "Hello, " # name # "! Quest Rewards canister is running!";
  };
};
