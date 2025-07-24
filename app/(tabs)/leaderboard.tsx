import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  Trophy,
  Medal,
  Crown,
  TrendingUp,
  MapPin,
  Globe,
  Building,
  ChevronDown,
} from 'lucide-react-native';
import { Alert } from 'react-native';

interface LeaderboardEntry {
  id: string;
  rank: number;
  username: string;
  avatar: string;
  xp: number;
  level: number;
  streak: number;
  change: number;
}

interface LeaderboardCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
}

export default function LeaderboardScreen() {
  const [selectedCategory, setSelectedCategory] = useState('global');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const categories: LeaderboardCategory[] = [
    {
      id: 'global',
      title: 'Global Rankings',
      icon: <Globe size={20} color="#8B5CF6" />,
      description: 'Compete with players worldwide',
    },
    {
      id: 'local',
      title: 'Local Community',
      icon: <MapPin size={20} color="#10B981" />,
      description: 'Your neighborhood leaderboard',
    },
    {
      id: 'platform',
      title: 'Platform Champions',
      icon: <Building size={20} color="#F59E0B" />,
      description: 'Top performers by app/platform',
    },
  ];

  const leaderboardData: LeaderboardEntry[] = [
    {
      id: '1',
      rank: 1,
      username: 'QuestMaster99',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
      xp: 15847,
      level: 28,
      streak: 47,
      change: 2,
    },
    {
      id: '2',
      rank: 2,
      username: 'FitnessGuru',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
      xp: 14523,
      level: 26,
      streak: 23,
      change: -1,
    },
    {
      id: '3',
      rank: 3,
      username: 'LocalExplorer',
      avatar: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg',
      xp: 13891,
      level: 25,
      streak: 34,
      change: 1,
    },
    {
      id: '4',
      rank: 4,
      username: 'ProductivePro',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg',
      xp: 12456,
      level: 23,
      streak: 18,
      change: 0,
    },
    {
      id: '5',
      rank: 5,
      username: 'RewardHunter',
      avatar: 'https://images.pexels.com/photos/1438081/pexels-photo-1438081.jpeg',
      xp: 11234,
      level: 21,
      streak: 29,
      change: 3,
    },
    {
      id: '6',
      rank: 6,
      username: 'GamerAlex',
      avatar: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg',
      xp: 10987,
      level: 20,
      streak: 12,
      change: -2,
    },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown size={24} color="#FFD700" />;
      case 2:
        return <Medal size={24} color="#C0C0C0" />;
      case 3:
        return <Medal size={24} color="#CD7F32" />;
      default:
        return <Text style={styles.rankNumber}>{rank}</Text>;
    }
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) {
      return <TrendingUp size={16} color="#10B981" />;
    } else if (change < 0) {
      return <TrendingUp size={16} color="#EF4444" style={{ transform: [{ rotate: '180deg' }] }} />;
    }
    return null;
  };

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);

  const handleViewProfile = (username: string) => {
    Alert.alert(
      `${username}'s Profile`,
      'View detailed stats, achievements, and recent activity for this player.',
      [
        { text: 'View Profile', onPress: () => {} },
        { text: 'Challenge', onPress: () => Alert.alert('Challenge Sent!', `You've challenged ${username} to a friendly competition!`) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
        <Text style={styles.subtitle}>See how you rank against others</Text>
      </View>

      {/* Category Selector */}
      <View style={styles.categoryContainer}>
        <TouchableOpacity
          style={styles.categorySelector}
          onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
        >
          <View style={styles.categorySelectorContent}>
            {selectedCategoryData?.icon}
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryTitle}>{selectedCategoryData?.title}</Text>
              <Text style={styles.categoryDescription}>{selectedCategoryData?.description}</Text>
            </View>
          </View>
          <ChevronDown size={20} color="#6B7280" />
        </TouchableOpacity>

        {showCategoryDropdown && (
          <View style={styles.dropdown}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.dropdownItem,
                  category.id === selectedCategory && styles.dropdownItemActive,
                ]}
                onPress={() => {
                  setSelectedCategory(category.id);
                  setShowCategoryDropdown(false);
                }}
              >
                {category.icon}
                <View style={styles.categoryInfo}>
                  <Text style={styles.dropdownTitle}>{category.title}</Text>
                  <Text style={styles.dropdownDescription}>{category.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Your Rank Card */}
      <View style={styles.yourRankCard}>
        <View style={styles.yourRankHeader}>
          <Text style={styles.yourRankTitle}>Your Rank</Text>
          <View style={styles.rankBadge}>
            <Text style={styles.rankBadgeText}>#1247</Text>
          </View>
        </View>
        <View style={styles.yourRankStats}>
          <View style={styles.yourStat}>
            <Text style={styles.yourStatNumber}>2,847</Text>
            <Text style={styles.yourStatLabel}>XP</Text>
          </View>
          <View style={styles.yourStat}>
            <Text style={styles.yourStatNumber}>12</Text>
            <Text style={styles.yourStatLabel}>Level</Text>
          </View>
          <View style={styles.yourStat}>
            <Text style={styles.yourStatNumber}>8</Text>
            <Text style={styles.yourStatLabel}>Streak</Text>
          </View>
        </View>
      </View>

      {/* Leaderboard List */}
      <ScrollView style={styles.leaderboardList} showsVerticalScrollIndicator={false}>
        <Text style={styles.listTitle}>Top Performers</Text>
        {leaderboardData.map((entry) => (
          <TouchableOpacity 
            key={entry.id} 
            style={styles.leaderboardItem}
            onPress={() => handleViewProfile(entry.username)}
          >
            <View style={styles.rankContainer}>
              {getRankIcon(entry.rank)}
            </View>

            <Image source={{ uri: entry.avatar }} style={styles.avatar} />

            <View style={styles.userInfo}>
              <Text style={styles.username}>{entry.username}</Text>
              <View style={styles.userStats}>
                <Text style={styles.userLevel}>Level {entry.level}</Text>
                <Text style={styles.userXP}>{entry.xp.toLocaleString()} XP</Text>
              </View>
            </View>

            <View style={styles.streakContainer}>
              <Text style={styles.streakNumber}>{entry.streak}</Text>
              <Text style={styles.streakLabel}>day streak</Text>
            </View>

            <View style={styles.changeContainer}>
              {getChangeIcon(entry.change)}
              {entry.change !== 0 && (
                <Text
                  style={[
                    styles.changeText,
                    { color: entry.change > 0 ? '#10B981' : '#EF4444' },
                  ]}
                >
                  {Math.abs(entry.change)}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
  },
  categoryContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
    position: 'relative',
  },
  categorySelector: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  categorySelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: 'Inter-SemiBold',
  },
  categoryDescription: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
  },
  dropdown: {
    position: 'absolute',
    top: 70,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1000,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  dropdownItemActive: {
    backgroundColor: '#F1F5F9',
  },
  dropdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: 'Inter-SemiBold',
  },
  dropdownDescription: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
  },
  yourRankCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#8B5CF6',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  yourRankHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  yourRankTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: 'Inter-Bold',
  },
  rankBadge: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  rankBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  yourRankStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  yourStat: {
    alignItems: 'center',
  },
  yourStatNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: 'Inter-Bold',
  },
  yourStatLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    fontFamily: 'Inter-Medium',
  },
  leaderboardList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
    fontFamily: 'Inter-Bold',
  },
  leaderboardItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#475569',
    fontFamily: 'Inter-Bold',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
    fontFamily: 'Inter-SemiBold',
  },
  userStats: {
    flexDirection: 'row',
    gap: 8,
  },
  userLevel: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  userXP: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Inter-Medium',
  },
  streakContainer: {
    alignItems: 'center',
    marginRight: 12,
  },
  streakNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F59E0B',
    fontFamily: 'Inter-Bold',
  },
  streakLabel: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    width: 30,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
});