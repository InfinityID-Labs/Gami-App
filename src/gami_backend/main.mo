import Time "mo:base/Time";
import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import TokenLedger "canister:token_ledger";

// Tipos auxiliares
type QuestId = Text;
type UserId = Principal;

type Quest = {
  id : QuestId;
  title : Text;
  description : Text;
  category : Text;
  xpReward : Nat;
  moneyReward : ?Float;
  timeLimit : Text;
  participants : Nat;
  difficulty : Text;
  sponsor : Text;
  active : Bool;
};

type UserProfile = {
  id : UserId;
  username : Text;
  level : Nat;
  xp : Nat;
  totalRewards : Float;
  joinDate : Int;
  globalRank : Nat;
};

type QuestCompletion = {
  userId : UserId;
  questId : QuestId;
  completedAt : Int;
  xpEarned : Nat;
  rewardEarned : ?Float;
};

persistent actor GamiBackend {
  // Criação de perfil de usuário
  public func createUserProfile(username : Text) : async Result.Result<UserProfile, Text> {
    let caller = Principal.fromActor(this);
    if (Text.size(username) < 3 or Text.size(username) > 20) {
      return #err("Username must be 3-20 characters");
    };
    if (Text.contains(username, #char ' ')) {
      return #err("Username cannot contain spaces");
    };
    switch (userProfiles.get(caller)) {
      case (?existing) { #err("User profile already exists") };
      case null {
        let profile : UserProfile = {
          id = caller;
          username = username;
          level = 1;
          xp = 100;
          totalRewards = 0.0;
          joinDate = Time.now();
          globalRank = userProfiles.size() + 1;
        };
        userProfiles.put(caller, profile);
        #ok(profile);
      };
    };
  };

  // Buscar perfil de usuário
  public query func getUserProfile(userId : ?UserId) : async ?UserProfile {
    let targetId = switch (userId) {
      case (?id) { id };
      case null { Principal.fromActor(this) };
    };
    userProfiles.get(targetId);
  };

  // Criar quest
  public func createQuest(
    id : QuestId,
    title : Text,
    description : Text,
    category : Text,
    xpReward : Nat,
    moneyReward : ?Float,
    timeLimit : Text,
    difficulty : Text,
    sponsor : Text,
  ) : async Result.Result<Quest, Text> {
    if (Text.size(title) < 3 or Text.size(title) > 50) {
      return #err("Title must be 3-50 characters");
    };
    if (xpReward < 1 or xpReward > 10000) {
      return #err("XP reward must be 1-10000");
    };
    if (moneyReward != null) {
      switch (moneyReward) {
        case (?m) {
          if (m < 0.0 or m > 10000.0) {
            return #err("Money reward must be between 0 and 10000");
          };
        };
        case null {};
      };
    };
    switch (quests.get(id)) {
      case (?existing) { #err("Quest already exists") };
      case null {
        let quest : Quest = {
          id = id;
          title = title;
          description = description;
          category = category;
          xpReward = xpReward;
          moneyReward = moneyReward;
          timeLimit = timeLimit;
          participants = 0;
          difficulty = difficulty;
          sponsor = sponsor;
          active = true;
        };
        quests.put(id, quest);
        #ok(quest);
      };
    };
  };

  // Buscar todas as quests
  public query func getQuests() : async [Quest] {
    let vals = quests.vals();
    let dummy : Quest = {
      id = "";
      title = "";
      description = "";
      category = "";
      xpReward = 0;
      moneyReward = null;
      timeLimit = "";
      participants = 0;
      difficulty = "";
      sponsor = "";
      active = false;
    };
    var arr : [var Quest] = Array.init<Quest>(0, dummy);
    var count = 0;
    label l for (q in vals) {
      let tmp = Array.init<Quest>(count + 1, dummy);
      var i = 0;
      while (i < count) {
        tmp[i] := arr[i];
        i += 1;
      };
      tmp[count] := q;
      arr := tmp;
      count += 1;
    };
    if (count == 0)[] else Array.freeze(arr);
  };

  // Leaderboard simples (top N por XP)
  public query func getLeaderboard(limit : ?Nat) : async [UserProfile] {
    let maxResults = switch (limit) {
      case (?l) l;
      case null 100;
    };
    let vals = userProfiles.vals();
    let dummy : UserProfile = {
      id = Principal.fromText("aaaaa-aa");
      username = "";
      level = 0;
      xp = 0;
      totalRewards = 0.0;
      joinDate = 0;
      globalRank = 0;
    };
    var arr : [var UserProfile] = Array.init<UserProfile>(0, dummy);
    var count = 0;
    label l for (u in vals) {
      let tmp = Array.init<UserProfile>(count + 1, dummy);
      var i = 0;
      while (i < count) {
        tmp[i] := arr[i];
        i += 1;
      };
      tmp[count] := u;
      arr := tmp;
      count += 1;
    };
    let frozen = Array.freeze(arr);
    let sorted = Array.sort<UserProfile>(
      frozen,
      func(a, b) {
        if (a.xp > b.xp) { #less } else if (a.xp < b.xp) { #greater } else {
          #equal;
        };
      },
    );
    if (maxResults < sorted.size()) {
      Array.tabulate<UserProfile>(maxResults, func(j) { sorted[j] });
    } else {
      sorted;
    };
  };
  // Variáveis globais e mapas
  transient let quests = HashMap.HashMap<QuestId, Quest>(0, Text.equal, Text.hash);
  transient let userProfiles = HashMap.HashMap<UserId, UserProfile>(0, Principal.equal, Principal.hash);
  transient let questCompletions = HashMap.HashMap<Text, QuestCompletion>(0, Text.equal, Text.hash);

  // Função utilitária de cálculo de nível
  private func calculateLevel(xp : Nat) : Nat {
    if (xp < 1000) { 1 } else if (xp < 2500) { 2 } else if (xp < 5000) { 3 } else if (xp < 8000) {
      4;
    } else if (xp < 12000) { 5 } else { (xp / 2000) + 1 };
  };

  // Health check
  public query func greet(name : Text) : async Text {
    "Hello, " # name # "! Welcome to Gami on ICP!";
  };
};
