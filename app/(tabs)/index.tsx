import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import {
  Trophy,
  Star,
  Target,
  Zap,
  TrendingUp,
  Gift,
  Award,
  ChevronRight,
  Coins,
} from 'lucide-react-native';
import { useBlockchain } from '@/contexts/BlockchainContext';
import BlockchainIntegration from '@/components/BlockchainIntegration';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface UserStats {
  xp: number;
  level: number;
  xpToNextLevel: number;
  totalRewards: number;
  completedQuests: number;
  globalRank: number;
}

interface RecentActivity {
  id: string;
  type: 'quest_completed' | 'reward_earned' | 'level_up';
  title: string;
  xp: number;
  timestamp: string;
}

export default function HomeScreen() {
  const { wallet, getUserStats } = useBlockchain();
  const [stats, setStats] = useState<UserStats>({
    xp: 2847,
    level: 12,
    xpToNextLevel: 3000,
    totalRewards: 156.75,
    completedQuests: 23,
    globalRank: 1247,
  });

  const [recentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'quest_completed',
      title: 'Complete 10K Steps Challenge',
      xp: 150,
      timestamp: '2h ago',
    },
    {
      id: '2',
      type: 'reward_earned',
      title: 'Starbucks Loyalty Points',
      xp: 75,
      timestamp: '4h ago',
    },
    {
      id: '3',
      type: 'level_up',
      title: 'Reached Level 12!',
      xp: 200,
      timestamp: '1d ago',
    },
  ]);

  const [progressAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadLiveStats();
    Animated.timing(progressAnim, {
      toValue: (stats.xp / stats.xpToNextLevel) * 100,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, [stats.xp]);

  const loadLiveStats = async () => {
    try {
      const userStats = await getUserStats();
      const storedLiveStats = await AsyncStorage.getItem('liveStats');
      const liveStats = storedLiveStats ? JSON.parse(storedLiveStats) : { totalEarned: 0, questsCompleted: 0 };
      
      setStats(prev => ({
        ...prev,
        xp: userStats.xp,
        level: userStats.level,
        totalRewards: liveStats.totalEarned,
        completedQuests: liveStats.questsCompleted,
      }));
    } catch (error) {
      console.error('Failed to load live stats:', error);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'quest_completed':
        return <Target size={20} color="#10B981" />;
      case 'reward_earned':
        return <Gift size={20} color="#F59E0B" />;
      case 'level_up':
        return <Award size={20} color="#8B5CF6" />;
      default:
        return <Star size={20} color="#6B7280" />;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back!</Text>
          <Text style={styles.username}>GameMaster Alex</Text>
        </View>
        <TouchableOpacity style={styles.rewardsBadge}>
          <Zap size={16} color="#F59E0B" />
          <Text style={styles.rewardsText}>{stats.totalRewards}</Text>
        </TouchableOpacity>
      </View>

      {/* Level Progress Card */}
      <View style={styles.levelCard}>
        <View style={styles.levelHeader}>
          <Text style={styles.levelTitle}>Level {stats.level}</Text>
          <Text style={styles.xpText}>{stats.xp} / {stats.xpToNextLevel} XP</Text>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round((stats.xp / stats.xpToNextLevel) * 100)}%
          </Text>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Trophy size={24} color="#F59E0B" />
          <Text style={styles.statNumber}>{stats.globalRank}</Text>
          <Text style={styles.statLabel}>Global Rank</Text>
        </View>
        
        <View style={styles.statCard}>
          <Target size={24} color="#10B981" />
          <Text style={styles.statNumber}>{stats.completedQuests}</Text>
          <Text style={styles.statLabel}>Quests Done</Text>
        </View>
        
        <View style={styles.statCard}>
          <TrendingUp size={24} color="#8B5CF6" />
          <Text style={styles.statNumber}>+{stats.xp % 100}</Text>
          <Text style={styles.statLabel}>XP Today</Text>
        </View>
      </View>

      {/* Featured Quest */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Featured Quest</Text>
        <TouchableOpacity style={styles.featuredQuest}>
          <View style={styles.questIcon}>
            <Target size={24} color="#FFFFFF" />
          </View>
          <View style={styles.questInfo}>
            <Text style={styles.questTitle}>Coffee Shop Champion</Text>
            <Text style={styles.questDescription}>
              Visit 3 local coffee shops this week
            </Text>
            <View style={styles.questReward}>
              <Zap size={16} color="#F59E0B" />
              <Text style={styles.questRewardText}>+300 XP • $5 Reward</Text>
            </View>
          </View>
          <ChevronRight size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Recent Activity */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {recentActivity.map((activity) => (
          <View key={activity.id} style={styles.activityItem}>
            <View style={styles.activityIcon}>
              {getActivityIcon(activity.type)}
            </View>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <Text style={styles.activityTime}>{activity.timestamp}</Text>
            </View>
            <View style={styles.activityXP}>
              <Text style={styles.xpGain}>+{activity.xp} XP</Text>
            </View>
          </View>
        ))}
      </View>

      {/* ICP Integration Notice */}
      <BlockchainIntegration />

      {wallet && (
        <View style={styles.onChainStatsCard}>
          <View style={styles.onChainHeader}>
            <Coins size={20} color="#8B5CF6" />
            <Text style={styles.onChainTitle}>On-Chain Portfolio</Text>
          </View>
          <Text style={styles.portfolioValue}>${wallet.balance.toFixed(2)}</Text>
          <Text style={styles.portfolioLabel}>Total Value</Text>
          
          <View style={styles.tokensList}>
            {wallet.tokens.slice(0, 3).map((token) => (
              <View key={token.symbol} style={styles.tokenRow}>
                <Text style={styles.tokenSymbol}>{token.symbol}</Text>
                <Text style={styles.tokenBalance}>{token.balance.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 16,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
  },
  username: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: 'Inter-Bold',
  },
  rewardsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  rewardsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D97706',
    fontFamily: 'Inter-SemiBold',
  },
  levelCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: 'Inter-Bold',
  },
  xpText: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Inter-Medium',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5CF6',
    fontFamily: 'Inter-SemiBold',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 8,
    fontFamily: 'Inter-Bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
    fontFamily: 'Inter-Medium',
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
    fontFamily: 'Inter-Bold',
  },
  featuredQuest: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  questIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#8B5CF6',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  questInfo: {
    flex: 1,
  },
  questTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
    fontFamily: 'Inter-SemiBold',
  },
  questDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
    fontFamily: 'Inter-Regular',
  },
  questReward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  questRewardText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
    fontFamily: 'Inter-SemiBold',
  },
  activityItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
    fontFamily: 'Inter-SemiBold',
  },
  activityTime: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
  },
  activityXP: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  xpGain: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
    fontFamily: 'Inter-SemiBold',
  },
  blockchainCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  blockchainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  blockchainTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: 'Inter-Bold',
  },
  blockchainDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
  },
  connectButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  connectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  onChainStatsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  onChainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  onChainTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: 'Inter-Bold',
  },
  portfolioValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#8B5CF6',
    fontFamily: 'Inter-Bold',
  },
  portfolioLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
    fontFamily: 'Inter-Medium',
  },
  tokensList: {
    gap: 8,
  },
  tokenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tokenSymbol: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: 'Inter-SemiBold',
  },
  tokenBalance: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Inter-Medium',
  },
});