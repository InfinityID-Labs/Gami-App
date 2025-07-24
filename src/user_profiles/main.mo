import Debug "mo:base/Debug";
import Time "mo:base/Time";
import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Result "mo:base/Result";

actor UserProfiles {
    // Types
    public type UserId = Principal;
    
    public type UserProfile = {
        id: UserId;
        username: Text;
        email: ?Text;
        level: Nat;
        xp: Nat;
        totalRewards: Float;
        joinDate: Int;
        lastActive: Int;
        streak: Nat;
        achievements: [Text];
        preferences: UserPreferences;
    };
    
    public type UserPreferences = {
        notifications: Bool;
        privacy: Bool;
        theme: Text; // "light", "dark", "auto"
        language: Text;
    };
    
    public type Achievement = {
        id: Text;
        title: Text;
        description: Text;
        category: Text;
        requirement: Nat;
        unlocked: Bool;
        unlockedAt: ?Int;
    };

    // State
    private stable var profilesEntries : [(UserId, UserProfile)] = [];
    private var profiles = HashMap.fromIter<UserId, UserProfile>(
        profilesEntries.vals(), 50, Principal.equal, Principal.hash
    );
    
    private stable var achievementsEntries : [(Text, Achievement)] = [];
    private var achievements = HashMap.fromIter<Text, Achievement>(
        achievementsEntries.vals(), 20, Text.equal, Text.hash
    );

    // System functions
    system func preupgrade() {
        profilesEntries := profiles.entries() |> Array.fromIter(_);
        achievementsEntries := achievements.entries() |> Array.fromIter(_);
    };

    system func postupgrade() {
        profilesEntries := [];
        achievementsEntries := [];
    };

    // Initialize default achievements
    public func initializeAchievements() : async () {
        let defaultAchievements = [
            {
                id = "early_adopter";
                title = "Early Adopter";
                description = "Joined in the first month";
                category = "milestone";
                requirement = 1;
                unlocked = false;
                unlockedAt = null;
            },
            {
                id = "quest_crusher";
                title = "Quest Crusher";
                description = "Complete 25 quests";
                category = "quests";
                requirement = 25;
                unlocked = false;
                unlockedAt = null;
            },
            {
                id = "level_master";
                title = "Level Master";
                description = "Reach level 15";
                category = "progression";
                requirement = 15;
                unlocked = false;
                unlockedAt = null;
            },
            {
                id = "streak_legend";
                title = "Streak Legend";
                description = "Maintain 30-day streak";
                category = "consistency";
                requirement = 30;
                unlocked = false;
                unlockedAt = null;
            }
        ];
        
        for (achievement in defaultAchievements.vals()) {
            achievements.put(achievement.id, achievement);
        };
    };

    // Profile Management
    public func createProfile(username: Text, email: ?Text) : async Result.Result<UserProfile, Text> {
        let caller = Principal.fromActor(UserProfiles);
        
        switch (profiles.get(caller)) {
            case (?existing) { #err("Profile already exists") };
            case null {
                let defaultPreferences : UserPreferences = {
                    notifications = true;
                    privacy = false;
                    theme = "auto";
                    language = "en";
                };
                
                let profile : UserProfile = {
                    id = caller;
                    username = username;
                    email = email;
                    level = 1;
                    xp = 100; // Welcome bonus
                    totalRewards = 0.0;
                    joinDate = Time.now();
                    lastActive = Time.now();
                    streak = 1;
                    achievements = [];
                    preferences = defaultPreferences;
                };
                
                profiles.put(caller, profile);
                #ok(profile)
            };
        }
    };

    public query func getProfile(userId: ?UserId) : async ?UserProfile {
        let targetId = switch (userId) {
            case (?id) { id };
            case null { Principal.fromActor(UserProfiles) };
        };
        profiles.get(targetId)
    };

    public func updateProfile(
        username: ?Text,
        email: ?Text,
        preferences: ?UserPreferences
    ) : async Result.Result<UserProfile, Text> {
        let caller = Principal.fromActor(UserProfiles);
        
        switch (profiles.get(caller)) {
            case null { #err("Profile not found") };
            case (?profile) {
                let updatedProfile : UserProfile = {
                    id = profile.id;
                    username = switch (username) { case (?u) { u }; case null { profile.username } };
                    email = switch (email) { case (?e) { ?e }; case null { profile.email } };
                    level = profile.level;
                    xp = profile.xp;
                    totalRewards = profile.totalRewards;
                    joinDate = profile.joinDate;
                    lastActive = Time.now();
                    streak = profile.streak;
                    achievements = profile.achievements;
                    preferences = switch (preferences) { case (?p) { p }; case null { profile.preferences } };
                };
                
                profiles.put(caller, updatedProfile);
                #ok(updatedProfile)
            };
        }
    };

    public func updateXP(xpGain: Nat) : async Result.Result<UserProfile, Text> {
        let caller = Principal.fromActor(UserProfiles);
        
        switch (profiles.get(caller)) {
            case null { #err("Profile not found") };
            case (?profile) {
                let newXP = profile.xp + xpGain;
                let newLevel = calculateLevel(newXP);
                
                let updatedProfile : UserProfile = {
                    id = profile.id;
                    username = profile.username;
                    email = profile.email;
                    level = newLevel;
                    xp = newXP;
                    totalRewards = profile.totalRewards;
                    joinDate = profile.joinDate;
                    lastActive = Time.now();
                    streak = profile.streak;
                    achievements = profile.achievements;
                    preferences = profile.preferences;
                };
                
                profiles.put(caller, updatedProfile);
                
                // Check for level-based achievements
                let _ = await checkLevelAchievements(caller, newLevel);
                
                #ok(updatedProfile)
            };
        }
    };

    // Achievement System
    public func unlockAchievement(userId: UserId, achievementId: Text) : async Result.Result<Achievement, Text> {
        switch (achievements.get(achievementId)) {
            case null { #err("Achievement not found") };
            case (?achievement) {
                if (achievement.unlocked) {
                    return #err("Achievement already unlocked");
                };
                
                let unlockedAchievement : Achievement = {
                    id = achievement.id;
                    title = achievement.title;
                    description = achievement.description;
                    category = achievement.category;
                    requirement = achievement.requirement;
                    unlocked = true;
                    unlockedAt = ?Time.now();
                };
                
                achievements.put(achievementId, unlockedAchievement);
                
                // Add to user's achievements list
                switch (profiles.get(userId)) {
                    case null { #err("User profile not found") };
                    case (?profile) {
                        let updatedAchievements = Array.append(profile.achievements, [achievementId]);
                        let updatedProfile : UserProfile = {
                            id = profile.id;
                            username = profile.username;
                            email = profile.email;
                            level = profile.level;
                            xp = profile.xp;
                            totalRewards = profile.totalRewards;
                            joinDate = profile.joinDate;
                            lastActive = profile.lastActive;
                            streak = profile.streak;
                            achievements = updatedAchievements;
                            preferences = profile.preferences;
                        };
                        profiles.put(userId, updatedProfile);
                        #ok(unlockedAchievement)
                    };
                }
            };
        }
    };

    public query func getUserAchievements(userId: UserId) : async [Achievement] {
        switch (profiles.get(userId)) {
            case null { [] };
            case (?profile) {
                profile.achievements
                |> Array.mapFilter(_, func(achievementId: Text) : ?Achievement {
                    achievements.get(achievementId)
                })
            };
        }
    };

    public query func getAllAchievements() : async [Achievement] {
        achievements.vals() |> Array.fromIter(_)
    };

    // Private helper functions
    private func calculateLevel(xp: Nat) : Nat {
        if (xp < 1000) { 1 }
        else if (xp < 2500) { 2 }
        else if (xp < 5000) { 3 }
        else if (xp < 8000) { 4 }
        else if (xp < 12000) { 5 }
        else if (xp < 18000) { 6 }
        else if (xp < 25000) { 7 }
        else if (xp < 35000) { 8 }
        else if (xp < 50000) { 9 }
        else if (xp < 70000) { 10 }
        else { (xp / 7000) + 3 }
    };

    private func checkLevelAchievements(userId: UserId, level: Nat) : async () {
        if (level >= 15) {
            let _ = await unlockAchievement(userId, "level_master");
        };
    };

    // Statistics
    public query func getGlobalStats() : async {
        totalUsers: Nat;
        averageLevel: Float;
        totalXP: Nat;
    } {
        let allProfiles = profiles.vals() |> Array.fromIter(_);
        let totalUsers = allProfiles.size();
        
        if (totalUsers == 0) {
            return {
                totalUsers = 0;
                averageLevel = 0.0;
                totalXP = 0;
            };
        };
        
        var totalLevels = 0;
        var totalXP = 0;
        
        for (profile in allProfiles.vals()) {
            totalLevels := totalLevels + profile.level;
            totalXP := totalXP + profile.xp;
        };
        
        {
            totalUsers = totalUsers;
            averageLevel = Float.fromInt(totalLevels) / Float.fromInt(totalUsers);
            totalXP = totalXP;
        }
    };

    // Health check
    public query func greet(name : Text) : async Text {
        "Hello, " # name # "! User Profiles canister is running!"
    };
}