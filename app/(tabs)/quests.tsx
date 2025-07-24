import React, { useState } from 'react';
import { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import {
  Search,
  Filter,
  Target,
  Clock,
  Zap,
  Users,
  MapPin,
  Smartphone,
  Coffee,
  Dumbbell,
  Shield,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useBlockchain } from '@/contexts/BlockchainContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Quest {
  id: string;
  title: string;
  description: string;
  category: 'fitness' | 'productivity' | 'local' | 'social';
  xpReward: number;
  moneyReward?: number;
  timeLimit: string;
  participants: number;
  difficulty: 'easy' | 'medium' | 'hard';
  sponsor: string;
  onChain?: boolean;
  blockchainRewards?: Array<{ token: string; amount: number }>;
}

export default function QuestsScreen() {
  const { wallet, completeQuestOnChain, getUserStats, updateUserStats } = useBlockchain();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [userXP, setUserXP] = useState(2847);
  const [userLevel, setUserLevel] = useState(12);
  const [completedQuests, setCompletedQuests] = useState<string[]>([]);
  const [liveStats, setLiveStats] = useState({
    totalEarned: 0,
    questsCompleted: 0,
    currentStreak: 0,
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const stats = await getUserStats();
      setUserXP(stats.xp);
      setUserLevel(stats.level);
      setCompletedQuests(stats.completedQuests);
      
      // Load live stats from storage
      const storedStats = await AsyncStorage.getItem('liveStats');
      if (storedStats) {
        setLiveStats(JSON.parse(storedStats));
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const saveLiveStats = async (newStats: typeof liveStats) => {
    try {
      await AsyncStorage.setItem('liveStats', JSON.stringify(newStats));
      setLiveStats(newStats);
    } catch (error) {
      console.error('Failed to save live stats:', error);
    }
  };
  const quests: Quest[] = [
    {
      id: '1',
      title: 'Morning Workout Streak',
      description: 'Complete a 30-minute workout for 7 consecutive days',
      category: 'fitness',
      xpReward: 500,
      moneyReward: 10,
      timeLimit: '7 days',
      participants: 1247,
      difficulty: 'medium',
      sponsor: 'FitApp Pro',
      onChain: true,
      blockchainRewards: [{ token: 'GAMI', amount: 50 }, { token: 'FIT', amount: 25 }],
    },
    {
      id: '2',
      title: 'Local Explorer',
      description: 'Visit 5 new local businesses in your neighborhood',
      category: 'local',
      xpReward: 300,
      moneyReward: 15,
      timeLimit: '2 weeks',
      participants: 856,
      difficulty: 'easy',
      sponsor: 'Local Chamber',
      onChain: true,
      blockchainRewards: [{ token: 'LOCAL', amount: 100 }],
    },
    {
      id: '3',
      title: 'Productivity Master',
      description: 'Complete 25 focused work sessions using Pomodoro technique',
      category: 'productivity',
      xpReward: 400,
      timeLimit: '1 week',
      participants: 2341,
      difficulty: 'medium',
      sponsor: 'Focus Timer',
      onChain: false,
    },
    {
      id: '4',
      title: 'Coffee Connoisseur',
      description: 'Try specialty drinks at 3 different coffee shops',
      category: 'local',
      xpReward: 250,
      moneyReward: 8,
      timeLimit: '10 days',
      participants: 634,
      difficulty: 'easy',
      sponsor: 'Starbucks',
      onChain: true,
      blockchainRewards: [{ token: 'LOCAL', amount: 50 }],
    },
    {
      id: '5',
      title: 'Team Challenge',
      description: 'Collaborate with 4 friends to reach group fitness goals',
      category: 'social',
      xpReward: 600,
      moneyReward: 20,
      timeLimit: '3 weeks',
      participants: 423,
      difficulty: 'hard',
      sponsor: 'TeamFit',
      onChain: true,
      blockchainRewards: [{ token: 'GAMI', amount: 100 }, { token: 'FIT', amount: 50 }],
    },
  ];

  const handleJoinQuest = async (quest: Quest) => {
    if (completedQuests.includes(quest.id)) {
      Alert.alert(
        'Quest Already Completed! ✅',
        `You've already completed "${quest.title}" and earned your rewards!`,
        [{ text: 'Awesome!', style: 'default' }]
      );
      return;
    }

    try {
      if (quest.onChain && wallet) {
        const success = await completeQuestOnChain(quest.id);
        if (success) {
          // Update live stats
          const newXP = userXP + quest.xpReward;
          const newLevel = Math.floor(newXP / 1000) + 1;
          setUserXP(newXP);
          setUserLevel(newLevel);
          setCompletedQuests(prev => [...prev, quest.id]);
          setLiveStats(prev => ({
            totalEarned: prev.totalEarned + (quest.moneyReward || 0),
            questsCompleted: prev.questsCompleted + 1,
            currentStreak: prev.currentStreak + 1,
          }));

          Alert.alert(
            'Quest Completed! 🎉',
            `Congratulations! You've earned:\n\n+${quest.xpReward} XP${quest.moneyReward ? `\n+$${quest.moneyReward}` : ''}\n\nTotal XP: ${newXP}\nLevel: ${newLevel}`,
            [{ text: 'Amazing!', style: 'default' }]
          );
        } else {
          Alert.alert(
            'Connection Issue',
            'Unable to join quest on blockchain. Please check your wallet connection and try again.',
            [{ text: 'Retry', onPress: () => handleJoinQuest(quest) }, { text: 'Cancel', style: 'cancel' }]
          );
        }
      } else if (quest.onChain && !wallet) {
        Alert.alert(
          'Wallet Required',
          'This quest requires a blockchain wallet. Connect your Internet Identity to participate in on-chain quests.',
          [
            { text: 'Connect Wallet', onPress: () => router.push('/(tabs)/profile') },
            { text: 'Skip', style: 'cancel' }
          ]
        );
      } else {
        // Simulate quest completion for non-blockchain quests
        const newXP = userXP + quest.xpReward;
        const newLevel = Math.floor(newXP / 1000) + 1;
        const newLiveStats = {
          totalEarned: liveStats.totalEarned + (quest.moneyReward || 0),
          questsCompleted: liveStats.questsCompleted + 1,
          currentStreak: liveStats.currentStreak + 1,
        };
        
        setUserXP(newXP);
        setUserLevel(newLevel);
        setCompletedQuests(prev => [...prev, quest.id]);
        
        // Save all data
        await updateUserStats(newXP, newLevel, [...completedQuests, quest.id]);
        await saveLiveStats(newLiveStats);
        Alert.alert(
          'Quest Completed! ⚡',
          `Excellent work! You've earned:\n\n+${quest.xpReward} XP${quest.moneyReward ? `\n+$${quest.moneyReward}` : ''}\n\nTotal XP: ${newXP}\nLevel: ${newLevel}`,
          [{ text: 'Keep Going!', style: 'default' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Oops!',
        'Something went wrong while joining the quest. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'fitness':
        return <Dumbbell size={20} color="#10B981" />;
      case 'productivity':
        return <Smartphone size={20} color="#2563EB" />;
      case 'local':
        return <MapPin size={20} color="#F59E0B" />;
      case 'social':
        return <Users size={20} color="#8B5CF6" />;
      default:
        return <Target size={20} color="#6B7280" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '#10B981';
      case 'medium':
        return '#F59E0B';
      case 'hard':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const filteredQuests = quests.filter(quest => {
    const matchesSearch = quest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         quest.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || quest.category === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'fitness', label: 'Fitness' },
    { id: 'productivity', label: 'Productivity' },
    { id: 'local', label: 'Local' },
    { id: 'social', label: 'Social' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Quests & Challenges</Text>
        <View style={styles.liveStatsHeader}>
          <Text style={styles.subtitle}>Level {userLevel} • {userXP.toLocaleString()} XP</Text>
          <View style={styles.statsRow}>
            <Text style={styles.statItem}>${liveStats.totalEarned.toFixed(2)} earned</Text>
            <Text style={styles.statItem}>{liveStats.questsCompleted} completed</Text>
            <Text style={styles.statItem}>{liveStats.currentStreak} streak</Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search quests..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterChip,
              selectedFilter === filter.id && styles.filterChipActive,
            ]}
            onPress={() => setSelectedFilter(filter.id)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedFilter === filter.id && styles.filterChipTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Quests List */}
      <ScrollView style={styles.questsList} showsVerticalScrollIndicator={false}>
        {filteredQuests.map((quest) => (
          <TouchableOpacity key={quest.id} style={styles.questCard}>
            <View style={styles.questHeader}>
              <View style={styles.categoryBadge}>
                {getCategoryIcon(quest.category)}
                <Text style={styles.categoryText}>{quest.category}</Text>
              </View>
              <View
                style={[
                  styles.difficultyBadge,
                  { backgroundColor: getDifficultyColor(quest.difficulty) + '20' },
                ]}
              >
                <Text
                  style={[
                    styles.difficultyText,
                    { color: getDifficultyColor(quest.difficulty) },
                  ]}
                >
                  {quest.difficulty}
                </Text>
              </View>
            </View>

            <Text style={styles.questTitle}>{quest.title}</Text>
            <Text style={styles.questDescription}>{quest.description}</Text>

            <View style={styles.questMeta}>
              <View style={styles.metaItem}>
                <Clock size={16} color="#64748B" />
                <Text style={styles.metaText}>{quest.timeLimit}</Text>
              </View>
              <View style={styles.metaItem}>
                <Users size={16} color="#64748B" />
                <Text style={styles.metaText}>{quest.participants} joined</Text>
              </View>
            </View>

            <View style={styles.questFooter}>
              <View style={styles.rewardContainer}>
                <View style={styles.xpReward}>
                  <Zap size={16} color="#F59E0B" />
                  <Text style={styles.xpRewardText}>+{quest.xpReward} XP</Text>
                </View>
                {quest.moneyReward && (
                  <Text style={styles.moneyReward}>${quest.moneyReward}</Text>
                )}
                {quest.onChain && (
                  <View style={styles.blockchainBadge}>
                    <Shield size={12} color="#8B5CF6" />
                    <Text style={styles.blockchainText}>On-Chain</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity 
                style={styles.joinButton}
                onPress={() => handleJoinQuest(quest)}
              >
                <Text style={styles.joinButtonText}>Join Quest</Text>
              </TouchableOpacity>
            </View>

            {quest.blockchainRewards && quest.blockchainRewards.length > 0 && (
              <View style={styles.blockchainRewards}>
                <Text style={styles.blockchainRewardsTitle}>Blockchain Rewards:</Text>
                {quest.blockchainRewards.map((reward, index) => (
                  <Text key={index} style={styles.blockchainRewardItem}>
                    +{reward.amount} {reward.token}
                  </Text>
                ))}
              </View>
            )}

            <Text style={styles.sponsor}>Sponsored by {quest.sponsor}</Text>
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
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    fontFamily: 'Inter-Regular',
  },
  filterButton: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filtersContainer: {
    marginBottom: 20,
  },
  filtersContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    fontFamily: 'Inter-SemiBold',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  questsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  questCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  questHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    textTransform: 'capitalize',
    fontFamily: 'Inter-SemiBold',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
    fontFamily: 'Inter-SemiBold',
  },
  questTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    fontFamily: 'Inter-Bold',
  },
  questDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 16,
    fontFamily: 'Inter-Regular',
  },
  questMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Inter-Medium',
  },
  questFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  xpReward: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  xpRewardText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D97706',
    fontFamily: 'Inter-SemiBold',
  },
  moneyReward: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
    fontFamily: 'Inter-Bold',
  },
  joinButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  sponsor: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    fontFamily: 'Inter-Regular',
  },
  blockchainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  blockchainText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8B5CF6',
    fontFamily: 'Inter-SemiBold',
  },
  completedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16A34A',
    fontFamily: 'Inter-SemiBold',
  },
  blockchainRewards: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  blockchainRewardsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
    fontFamily: 'Inter-SemiBold',
  },
  blockchainRewardItem: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
});