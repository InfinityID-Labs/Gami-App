import Time "mo:base/Time";
import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Blob "mo:base/Blob";
import Nat16 "mo:base/Nat16";
import Debug "mo:base/Debug";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Float "mo:base/Float";

// O bloco do ator persistente que contém toda a lógica e estado do canister.
persistent actor GamiBackend {
  // Tipos HTTP
  type HttpRequest = {
    method : Text;
    url : Text;
    headers : [(Text, Text)];
    body : Blob;
    certificate_version : ?Nat16;
  };
  type HttpResponse = {
    status : Nat16;
    headers : [(Text, Text)];
    body : Blob;
    streaming_strategy : ?();
  };

  // Tipos auxiliares do projeto
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
    joinDate : Time.Time;
    globalRank : Nat;
  };
  type QuestCompletion = {
    userId : UserId;
    questId : QuestId;
    completedAt : Time.Time;
    xpEarned : Nat;
    rewardEarned : ?Float;
  };
  // Variáveis de estado persistentes
  transient let appDeepLinkBase = "gamiapp://auth/callback";
  transient var quests = HashMap.HashMap<QuestId, Quest>(0, Text.equal, Text.hash);
  transient var userProfiles = HashMap.HashMap<UserId, UserProfile>(0, Principal.equal, Principal.hash);
  transient var _questCompletions = HashMap.HashMap<Text, QuestCompletion>(0, Text.equal, Text.hash);

  // A função http_request, agora query, para ser mais segura e não gastar cycles desnecessariamente
  // Corrigimos o parsing da URL para buscar o principal no fragmento, que é o padrão do ICP.
  public query func http_request(req : HttpRequest) : async HttpResponse {
    Debug.print("Requisição HTTP recebida para URL: " # req.url);

    // Extrai o 'principal' do fragmento da URL, que é o padrão de retorno do Internet Identity
    let urlParts = Iter.toArray(Text.split(req.url, #char '#'));
    if (urlParts.size() < 2) {
      Debug.print("Erro: URL sem fragmento para principal.");
      return {
        status = 400;
        headers = [];
        body = Blob.fromArray([]);
        streaming_strategy = null;
      };
    };

    let fragmentParams = Iter.toArray(Text.split(urlParts[1], #char '&'));
    var principal = "";
    for (p in fragmentParams.vals()) {
      let kv = Iter.toArray(Text.split(p, #char '='));
      if (kv.size() == 2 and kv[0] == "principal") {
        principal := kv[1];
      };
    };

    let redirectUrl = appDeepLinkBase # "?principal=" # principal;
    Debug.print("Redirecionando para: " # redirectUrl);

    return {
      status = 302; // Código HTTP para redirecionamento
      headers = [("Location", redirectUrl)];
      body = Blob.fromArray([]); // Corpo vazio para redirecionamento
      streaming_strategy = null;
    };
  };

  // Funções de usuário
  public shared ({ caller }) func createUserProfile(username : Text) : async Result.Result<UserProfile, Text> {
    if (Text.size(username) < 3 or Text.size(username) > 20) {
      return #err("Username must be 3-20 characters");
    };
    if (Text.contains(username, #char ' ')) {
      return #err("Username cannot contain spaces");
    };
    switch (userProfiles.get(caller)) {
      case (?_) { return #err("User profile already exists") };
      case null {
        let profile : UserProfile = {
          id = caller;
          username = username;
          level = 1;
          xp = 100;
          totalRewards = 0.0;
          joinDate = Time.now();
          globalRank = 0;
        };
        userProfiles.put(caller, profile);
        return #ok(profile);
      };
    };
  };

  public shared query ({ caller }) func getUserProfile(userId : ?UserId) : async ?UserProfile {
    let targetId = switch (userId) {
      case (?id) { id };
      case null { caller };
    };
    userProfiles.get(targetId);
  };

  // Funções de Quest
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
      case (?_) { return #err("Quest already exists") };
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
        return #ok(quest);
      };
    };
  };

  public query func getQuests() : async [Quest] {
    return Iter.toArray<Quest>(quests.vals());
  };

  public query func getLeaderboard(limit : ?Nat) : async [UserProfile] {
    let maxResults = switch (limit) {
      case (?l) l;
      case null 100;
    };

    var sortedUsers = Iter.toArray<UserProfile>(userProfiles.vals());

    sortedUsers := Array.sort<UserProfile>(
      sortedUsers,
      func(a, b) {
        if (a.xp > b.xp) { #less } else if (a.xp < b.xp) { #greater } else {
          #equal;
        };
      },
    );

    if (maxResults < sortedUsers.size()) {
      return Array.tabulate<UserProfile>(maxResults, func(j) { sortedUsers[j] });
    } else {
      return sortedUsers;
    };
  };

  public query func greet(name : Text) : async Text {
    "Hello, " # name # "! Welcome to Gami on ICP!";
  };
};
