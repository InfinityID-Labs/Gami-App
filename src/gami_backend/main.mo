import Debug "mo:base/Debug";
import Time "mo:base/Time";
import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Result "mo:base/Result";

actor GamiBackend {
    // Types
    public type UserId = Principal;
    public type QuestId = Text;
    public type TokenAmount = Nat;
    
    public type UserProfile = {
        id: UserId;
        username: Text;
        level: Nat;
        xp: Nat;
        totalRewards: Float;
        joinDate: Int;
        globalRank: Nat;
    };
    
    public type Quest = {
        id: QuestId;
        title: Text;
        description: Text;
        category: Text;
        xpReward: Nat;
        moneyReward: ?Float;
        timeLimit: Text;
        participants: Nat;
        difficulty: Text;
        sponsor: Text;
        active: Bool;
    };
    
    public type QuestCompletion = {
        userId: UserId;
        questId: QuestId;
        completedAt: Int;
        xpEarned: Nat;
        rewardEarned: ?Float;
    };

    // State
    private stable var userProfilesEntries : [(UserId, UserProfile)] = [];
    private var userProfiles = HashMap.fromIter<UserId, UserProfile>(
        userProfilesEntries.vals(), 10, Principal.equal, Principal.hash
    );
    
    private stable var questsEntries : [(QuestId, Quest)] = [];
    private var quests = HashMap.fromIter<QuestId, Quest>(
        questsEntries.vals(), 10, Text.equal, Text.hash
    );
    
    private stable var completionsEntries : [(Text, QuestCompletion)] = [];
    private var questCompletions = HashMap.fromIter<Text, QuestCompletion>(
        completionsEntries.vals(), 10, Text.equal, Text.hash
    );

    // System functions for upgrades
    system func preupgrade() {
        userProfilesEntries := userProfiles.entries() |> Array.fromIter(_);
        questsEntries := quests.entries() |> Array.fromIter(_);
        completionsEntries := questCompletions.entries() |> Array.fromIter(_);
    };

    system func postupgrade() {
        userProfilesEntries := [];
        questsEntries := [];
        completionsEntries := [];
    };

    // User Profile Management
    public func createUserProfile(username: Text) : async Result.Result<UserProfile, Text> {
        let caller = Principal.fromActor(GamiBackend);
        
        switch (userProfiles.get(caller)) {
            case (?existing) { #err("User profile already exists") };
            case null {
                let profile : UserProfile = {
                    id = caller;
                    username = username;
                    level = 1;
                    xp = 100; // Welcome bonus
                    totalRewards = 0.0;
                    joinDate = Time.now();
                    globalRank = userProfiles.size() + 1;
                };
                userProfiles.put(caller, profile);
                #ok(profile)
            };
        }
    };

    public query func getUserProfile(userId: ?UserId) : async ?UserProfile {
        let targetId = switch (userId) {
            case (?id) { id };
            case null { Principal.fromActor(GamiBackend) };
        };
        userProfiles.get(targetId)
    };

    public func updateUserXP(xpGain: Nat) : async Result.Result<UserProfile, Text> {
        let caller = Principal.fromActor(GamiBackend);
        
        switch (userProfiles.get(caller)) {
            case null { #err("User profile not found") };
            case (?profile) {
                let newXP = profile.xp + xpGain;
                let newLevel = calculateLevel(newXP);
                
                let updatedProfile : UserProfile = {
                    id = profile.id;
                    username = profile.username;
                    level = newLevel;
                    xp = newXP;
                    totalRewards = profile.totalRewards;
                    joinDate = profile.joinDate;
                    globalRank = profile.globalRank;
                };
                
                userProfiles.put(caller, updatedProfile);
                #ok(updatedProfile)
            };
        }
    };

    // Quest Management
    public func createQuest(
        id: QuestId,
        title: Text,
        description: Text,
        category: Text,
        xpReward: Nat,
        moneyReward: ?Float,
        timeLimit: Text,
        difficulty: Text,
        sponsor: Text
    ) : async Result.Result<Quest, Text> {
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
                #ok(quest)
            };
        }
    };

    public query func getQuests() : async [Quest] {
        quests.vals() |> Array.fromIter(_)
    };

    public query func getActiveQuests() : async [Quest] {
        quests.vals() 
        |> Array.fromIter(_)
        |> Array.filter(_, func(q: Quest) : Bool { q.active })
    };

    public func completeQuest(questId: QuestId) : async Result.Result<QuestCompletion, Text> {
        let caller = Principal.fromActor(GamiBackend);
        
        switch (quests.get(questId)) {
            case null { #err("Quest not found") };
            case (?quest) {
                if (not quest.active) {
                    return #err("Quest is not active");
                };
                
                let completionId = Principal.toText(caller) # "_" # questId;
                
                switch (questCompletions.get(completionId)) {
                    case (?existing) { #err("Quest already completed by user") };
                    case null {
                        let completion : QuestCompletion = {
                            userId = caller;
                            questId = questId;
                            completedAt = Time.now();
                            xpEarned = quest.xpReward;
                            rewardEarned = quest.moneyReward;
                        };
                        
                        questCompletions.put(completionId, completion);
                        
                        // Update user XP
                        let _ = await updateUserXP(quest.xpReward);
                        
                        // Update quest participants
                        let updatedQuest : Quest = {
                            id = quest.id;
                            title = quest.title;
                            description = quest.description;
                            category = quest.category;
                            xpReward = quest.xpReward;
                            moneyReward = quest.moneyReward;
                            timeLimit = quest.timeLimit;
                            participants = quest.participants + 1;
                            difficulty = quest.difficulty;
                            sponsor = quest.sponsor;
                            active = quest.active;
                        };
                        quests.put(questId, updatedQuest);
                        
                        #ok(completion)
                    };
                }
            };
        }
    };

    public query func getUserCompletions(userId: ?UserId) : async [QuestCompletion] {
        let targetId = switch (userId) {
            case (?id) { id };
            case null { Principal.fromActor(GamiBackend) };
        };
        
        questCompletions.vals()
        |> Array.fromIter(_)
        |> Array.filter(_, func(c: QuestCompletion) : Bool { 
            Principal.equal(c.userId, targetId) 
        })
    };

    // Leaderboard
    public query func getLeaderboard(limit: ?Nat) : async [UserProfile] {
        let maxResults = switch (limit) {
            case (?l) { l };
            case null { 100 };
        };
        
        userProfiles.vals()
        |> Array.fromIter(_)
        |> Array.sort(_, func(a: UserProfile, b: UserProfile) : {#less; #equal; #greater} {
            if (a.xp > b.xp) { #less }
            else if (a.xp < b.xp) { #greater }
            else { #equal }
        })
        |> Array.take(_, maxResults)
    };

    // Utility functions
    private func calculateLevel(xp: Nat) : Nat {
        if (xp < 1000) { 1 }
        else if (xp < 2500) { 2 }
        else if (xp < 5000) { 3 }
        else if (xp < 8000) { 4 }
        else if (xp < 12000) { 5 }
        else { (xp / 2000) + 1 }
    };

    // Health check
    public query func greet(name : Text) : async Text {
        "Hello, " # name # "! Welcome to Gami on ICP!"
    };
}