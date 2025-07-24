import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
} from 'react-native';
import { Settings, Trophy, Star, Zap, Calendar, Target, Award, Shield, Bell, CircleHelp as HelpCircle, LogOut, ChevronRight, Link as LinkIcon, Coins, ExternalLink } from 'lucide-react-native';
import { useBlockchain } from '@/contexts/BlockchainContext';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress?: number;
  total?: number;
}

interface ConnectedApp {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  lastSync: string;
}

export default function ProfileScreen() {
  const { wallet, transactions, isAuthenticated, logout } = useBlockchain();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(false);

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? You can always sign back in to continue your adventure.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all stored data
              await AsyncStorage.multiRemove([
                'userXP',
                'userLevel', 
                'completedQuests',
                'liveStats',
                'icp_principal'
              ]);
              
              // Logout from blockchain
              await logout();
              
              // Navigate to splash screen
              router.replace('/(auth)/splash');
            } catch (error) {
              console.error('Sign out error:', error);
              // Force navigation even if cleanup fails
              router.replace('/(auth)/splash');
            }
          }
        }
      ]
    );
  };

  const handleConnectWallet = () => {
    router.push('/(tabs)'); // Navigate to home where BlockchainIntegration component is
  };

  const handleHelp = () => {
    Alert.alert(
      'Help & Support',
      'Need assistance? Here are your options:\n\n• Check our FAQ section\n• Contact support team\n• Join our community Discord\n• Email: support@gami.app',
      [{ text: 'Got it!', style: 'default' }]
    );
  };

  const userProfile = {
    name: 'Alex Thompson',
    username: '@gamemaster_alex',
    avatar: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg',
    level: 12,
    xp: 2847,
    joinDate: 'January 2024',
    totalRewards: 156.75,
    globalRank: 1247,
  };

  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'Early Adopter',
      description: 'Joined in the first month',
      icon: <Star size={20} color="#FFD700" />,
      unlocked: true,
    },
    {
      id: '2',
      title: 'Quest Crusher',
      description: 'Complete 25 quests',
      icon: <Target size={20} color="#10B981" />,
      unlocked: true,
    },
    {
      id: '3',
      title: 'Level Master',
      description: 'Reach level 15',
      icon: <Trophy size={20} color="#8B5CF6" />,
      unlocked: false,
      progress: 12,
      total: 15,
    },
    {
      id: '4',
      title: 'Streak Legend',
      description: 'Maintain 30-day streak',
      icon: <Zap size={20} color="#F59E0B" />,
      unlocked: false,
      progress: 8,
      total: 30,
    },
  ];

  const connectedApps: ConnectedApp[] = [
    {
      id: '1',
      name: 'Fitness Tracker',
      icon: 'https://images.pexels.com/photos/4498318/pexels-photo-4498318.jpeg',
      connected: true,
      lastSync: '2 hours ago',
    },
    {
      id: '2',
      name: 'Productivity Timer',
      icon: 'https://images.pexels.com/photos/159888/pexels-photo-159888.jpeg',
      connected: true,
      lastSync: '1 hour ago',
    },
    {
      id: '3',
      name: 'Coffee Rewards',
      icon: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg',
      connected: false,
      lastSync: 'Never',
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <Image source={{ uri: userProfile.avatar }} style={styles.profileAvatar} />
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{userProfile.name}</Text>
          <Text style={styles.profileUsername}>{userProfile.username}</Text>
          <View style={styles.profileBadge}>
            <Award size={16} color="#8B5CF6" />
            <Text style={styles.profileLevel}>Level {userProfile.level}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.settingsButton}>
          <Settings size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Blockchain Transactions */}
      {wallet && transactions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {transactions.slice(0, 5).map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionIcon}>
                <Coins size={16} color="#8B5CF6" />
              </View>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionType}>
                  {transaction.type.replace('_', ' ').toUpperCase()}
                </Text>
                <Text style={styles.transactionTime}>
                  {transaction.timestamp.toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.transactionAmount}>
                <Text style={styles.amountText}>
                  +{transaction.amount} {transaction.token}
                </Text>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: transaction.status === 'completed' ? '#10B981' : '#F59E0B' },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      )}
      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Trophy size={20} color="#F59E0B" />
          <Text style={styles.statNumber}>{userProfile.globalRank}</Text>
          <Text style={styles.statLabel}>Global Rank</Text>
        </View>
        
        <View style={styles.statCard}>
          <Zap size={20} color="#8B5CF6" />
          <Text style={styles.statNumber}>{userProfile.xp}</Text>
          <Text style={styles.statLabel}>Total XP</Text>
        </View>
        
        <View style={styles.statCard}>
          <Star size={20} color="#10B981" />
          <Text style={styles.statNumber}>${userProfile.totalRewards}</Text>
          <Text style={styles.statLabel}>Rewards</Text>
        </View>
        
        <View style={styles.statCard}>
          <Calendar size={20} color="#6B7280" />
          <Text style={styles.statNumber}>{userProfile.joinDate}</Text>
          <Text style={styles.statLabel}>Member Since</Text>
        </View>
      </View>

      {/* Achievements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.achievementsGrid}>
          {achievements.map((achievement) => (
            <View
              key={achievement.id}
              style={[
                styles.achievementCard,
                !achievement.unlocked && styles.achievementLocked,
              ]}
            >
              <View style={styles.achievementIcon}>
                {achievement.icon}
              </View>
              <Text style={styles.achievementTitle}>{achievement.title}</Text>
              <Text style={styles.achievementDescription}>{achievement.description}</Text>
              
              {!achievement.unlocked && achievement.progress && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${(achievement.progress / achievement.total!) * 100}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {achievement.progress}/{achievement.total}
                  </Text>
                </View>
              )}
              
              {achievement.unlocked && (
                <View style={styles.unlockedBadge}>
                  <Text style={styles.unlockedText}>Unlocked</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* Connected Apps */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Connected Apps</Text>
        {connectedApps.map((app) => (
          <TouchableOpacity key={app.id} style={styles.appItem}>
            <Image source={{ uri: app.icon }} style={styles.appIcon} />
            <View style={styles.appInfo}>
              <Text style={styles.appName}>{app.name}</Text>
              <Text style={styles.lastSync}>Last sync: {app.lastSync}</Text>
            </View>
            <View style={styles.connectionStatus}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: app.connected ? '#10B981' : '#EF4444' },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: app.connected ? '#10B981' : '#EF4444' },
                ]}
              >
                {app.connected ? 'Connected' : 'Disconnected'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Bell size={20} color="#6B7280" />
            <Text style={styles.settingLabel}>Push Notifications</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#E2E8F0', true: '#8B5CF6' }}
            thumbColor={notificationsEnabled ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Shield size={20} color="#6B7280" />
            <Text style={styles.settingLabel}>Privacy Mode</Text>
          </View>
          <Switch
            value={privacyMode}
            onValueChange={setPrivacyMode}
            trackColor={{ false: '#E2E8F0', true: '#8B5CF6' }}
            thumbColor={privacyMode ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <LinkIcon size={20} color="#6B7280" />
            <Text style={styles.settingLabel}>Blockchain Wallet</Text>
          </View>
          <TouchableOpacity onPress={handleConnectWallet}>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={handleHelp}>
          <View style={styles.settingInfo}>
            <HelpCircle size={20} color="#6B7280" />
            <Text style={styles.settingLabel}>Help & Support</Text>
          </View>
          <ChevronRight size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.settingItem, styles.logoutItem]} onPress={handleSignOut}>
          <View style={styles.settingInfo}>
            <LogOut size={20} color="#EF4444" />
            <Text style={[styles.settingLabel, styles.logoutText]}>Sign Out</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  profileHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
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
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
    fontFamily: 'Inter-Bold',
  },
  profileUsername: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 8,
    fontFamily: 'Inter-Regular',
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
  },
  profileLevel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5CF6',
    fontFamily: 'Inter-SemiBold',
  },
  settingsButton: {
    padding: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    width: '48%',
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
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 8,
    marginBottom: 4,
    fontFamily: 'Inter-Bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    fontFamily: 'Inter-Medium',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
    fontFamily: 'Inter-Bold',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    width: '48%',
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
  achievementLocked: {
    opacity: 0.6,
  },
  achievementIcon: {
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
  },
  achievementDescription: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Inter-Regular',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: 'Inter-Medium',
  },
  unlockedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  unlockedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#16A34A',
    fontFamily: 'Inter-SemiBold',
  },
  appItem: {
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
  appIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
    fontFamily: 'Inter-SemiBold',
  },
  lastSync: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  settingItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: 'Inter-SemiBold',
  },
  logoutItem: {
    marginTop: 12,
  },
  logoutText: {
    color: '#EF4444',
  },
  transactionItem: {
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
  transactionIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
    fontFamily: 'Inter-SemiBold',
  },
  transactionTime: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
  },
  transactionAmount: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 8,
  },
  amountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    fontFamily: 'Inter-SemiBold',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});