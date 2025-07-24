import Debug "mo:base/Debug";
import Time "mo:base/Time";
import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Int "mo:base/Int";

actor Leaderboard {
    // Types
    public type UserId = Principal;
    
    public type LeaderboardEntry = {
        userId: UserId;
        username: Text;
        level: Nat;
        xp: Nat;
        rank: Nat;
        change: Int; // Position change from last update
        streak: Nat;
        lastActive: Int;
    };
    
    public type LeaderboardType = {
        #Global;
        #Local;
        #Weekly;
        #Monthly;
    };

    // State
    private stable var entriesData : [(UserId, LeaderboardEntry)] = [];
    private var entries = HashMap.fromIter<UserId, LeaderboardEntry>(
        entriesData.vals(), 100, Principal.equal, Principal.hash
    );
    
    private stable var lastUpdateTime : Int = 0;

    // System functions
    system func preupgrade() {
        entriesData := entries.entries() |> Array.fromIter(_);
    };

    system func postupgrade() {
        entriesData := [];
    };

    // Leaderboard Management
    public func updateUserEntry(
        userId: UserId,
        username: Text,
        level: Nat,
        xp: Nat,
        streak: Nat
    ) : async Result.Result<LeaderboardEntry, Text> {
        let currentTime = Time.now();
        
        let previousRank = switch (entries.get(userId)) {
            case (?entry) { entry.rank };
            case null { 0 };
        };
        
        let entry : LeaderboardEntry = {
            userId = userId;
            username = username;
            level = level;
            xp = xp;
            rank = 0; // Will be calculated in updateRankings
            change = 0; // Will be calculated in updateRankings
            streak = streak;
            lastActive = currentTime;
        };
        
        entries.put(userId, entry);
        
        // Recalculate rankings
        await updateRankings();
        
        switch (entries.get(userId)) {
            case (?updatedEntry) { #ok(updatedEntry) };
            case null { #err("Failed to update entry") };
        }
    };

    public func updateRankings() : async () {
        let allEntries = entries.vals() |> Array.fromIter(_);
        
        // Sort by XP (descending)
        let sortedEntries = Array.sort(allEntries, func(a: LeaderboardEntry, b: LeaderboardEntry) : {#less; #equal; #greater} {
            if (a.xp > b.xp) { #less }
            else if (a.xp < b.xp) { #greater }
            else { #equal }
        });
        
        // Update ranks and calculate changes
        for (i in sortedEntries.keys()) {
            let entry = sortedEntries[i];
            let newRank = i + 1;
            let previousRank = entry.rank;
            let change = if (previousRank == 0) { 0 } else { Int.abs(previousRank - newRank) };
            
            let updatedEntry : LeaderboardEntry = {
                userId = entry.userId;
                username = entry.username;
                level = entry.level;
                xp = entry.xp;
                rank = newRank;
                change = if (previousRank > newRank) { change } else { -change };
                streak = entry.streak;
                lastActive = entry.lastActive;
            };
            
            entries.put(entry.userId, updatedEntry);
        };
        
        lastUpdateTime := Time.now();
    };

    // Query Functions
    public query func getLeaderboard(leaderboardType: LeaderboardType, limit: ?Nat) : async [LeaderboardEntry] {
        let maxResults = switch (limit) {
            case (?l) { l };
            case null { 50 };
        };
        
        let allEntries = entries.vals() |> Array.fromIter(_);
        
        let filteredEntries = switch (leaderboardType) {
            case (#Global) { allEntries };
            case (#Local) { 
                // For demo, filter by some criteria (could be location-based)
                Array.filter(allEntries, func(e: LeaderboardEntry) : Bool { e.level >= 5 })
            };
            case (#Weekly) {
                let weekAgo = Time.now() - (7 * 24 * 60 * 60 * 1000000000); // 7 days in nanoseconds
                Array.filter(allEntries, func(e: LeaderboardEntry) : Bool { e.lastActive >= weekAgo })
            };
            case (#Monthly) {
                let monthAgo = Time.now() - (30 * 24 * 60 * 60 * 1000000000); // 30 days in nanoseconds
                Array.filter(allEntries, func(e: LeaderboardEntry) : Bool { e.lastActive >= monthAgo })
            };
        };
        
        let sortedEntries = Array.sort(filteredEntries, func(a: LeaderboardEntry, b: LeaderboardEntry) : {#less; #equal; #greater} {
            if (a.rank < b.rank) { #less }
            else if (a.rank > b.rank) { #greater }
            else { #equal }
        });
        
        Array.take(sortedEntries, maxResults)
    };

    public query func getUserRank(userId: UserId, leaderboardType: LeaderboardType) : async ?Nat {
        switch (entries.get(userId)) {
            case null { null };
            case (?entry) {
                let leaderboard = await getLeaderboard(leaderboardType, null);
                
                for (i in leaderboard.keys()) {
                    if (Principal.equal(leaderboard[i].userId, userId)) {
                        return ?(i + 1);
                    };
                };
                null
            };
        }
    };

    public query func getTopPerformers(category: Text, limit: Nat) : async [LeaderboardEntry] {
        let allEntries = entries.vals() |> Array.fromIter(_);
        
        let filteredEntries = switch (category) {
            case ("streak") {
                Array.sort(allEntries, func(a: LeaderboardEntry, b: LeaderboardEntry) : {#less; #equal; #greater} {
                    if (a.streak > b.streak) { #less }
                    else if (a.streak < b.streak) { #greater }
                    else { #equal }
                })
            };
            case ("level") {
                Array.sort(allEntries, func(a: LeaderboardEntry, b: LeaderboardEntry) : {#less; #equal; #greater} {
                    if (a.level > b.level) { #less }
                    else if (a.level < b.level) { #greater }
                    else { #equal }
                })
            };
            case (_) {
                Array.sort(allEntries, func(a: LeaderboardEntry, b: LeaderboardEntry) : {#less; #equal; #greater} {
                    if (a.xp > b.xp) { #less }
                    else if (a.xp < b.xp) { #greater }
                    else { #equal }
                })
            };
        };
        
        Array.take(filteredEntries, limit)
    };

    // Statistics
    public query func getLeaderboardStats() : async {
        totalPlayers: Nat;
        averageLevel: Float;
        topXP: Nat;
        lastUpdate: Int;
    } {
        let allEntries = entries.vals() |> Array.fromIter(_);
        let totalPlayers = allEntries.size();
        
        if (totalPlayers == 0) {
            return {
                totalPlayers = 0;
                averageLevel = 0.0;
                topXP = 0;
                lastUpdate = lastUpdateTime;
            };
        };
        
        var totalLevels = 0;
        var maxXP = 0;
        
        for (entry in allEntries.vals()) {
            totalLevels := totalLevels + entry.level;
            if (entry.xp > maxXP) {
                maxXP := entry.xp;
            };
        };
        
        {
            totalPlayers = totalPlayers;
            averageLevel = Float.fromInt(totalLevels) / Float.fromInt(totalPlayers);
            topXP = maxXP;
            lastUpdate = lastUpdateTime;
        }
    };

    // Utility Functions
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

    // Health check
    public query func greet(name : Text) : async Text {
        "Hello, " # name # "! Leaderboard canister is running!"
    };
}