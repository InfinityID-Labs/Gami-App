import { checkBackendHealth } from '../../services/healthCheck';
const [backendHealth, setBackendHealth] = useState<string | null>(null);
// Health check do backend
useEffect(() => {
  (async () => {
    const health = await checkBackendHealth();
    setBackendHealth(health);
  })();
}, []);
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  ActivityIndicator,
} from 'react-native';
import Toast from '@/components/Toast';
import { Settings, Trophy, Star, Zap, Calendar, Target, Award, Shield, Bell, CircleHelp as HelpCircle, LogOut, ChevronRight, Link as LinkIcon, Coins } from 'lucide-react-native';
import { useBlockchain } from '@/contexts/BlockchainContext';
import { useGamiBackend } from '@/hooks/useGamiBackend';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const { wallet, transactions, isAuthenticated, logout } = useBlockchain();
  const { getUserProfile } = useGamiBackend();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(false);

  const handleSignOut = async () => {
    const { icpService } = require('../../services/icpService');
    await icpService.logout();
    await AsyncStorage.multiRemove([
      'userXP',
      'userLevel',
      'completedQuests',
      'liveStats',
      'icp_principal'
    ]);
    await logout();
    Toast.show({
      type: 'success',
      text1: 'Logged out from ICP',
      text2: 'You have signed out from your Internet Identity account.'
    });
    router.replace('/(auth)/login');
  };

  const handleConnectWallet = () => {
    router.push('/(tabs)'); // Navigate to home where BlockchainIntegration component is
  };

  const handleHelp = () => {
    Toast.show({
      type: 'info',
      text1: 'Help & Support',
      text2: 'Need assistance? Check our FAQ, contact support, join our Discord, or email support@gami.app.'
    });
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const profile = await getUserProfile();
        setUserProfile(profile);
      } catch (e) {
        setUserProfile(null);
        Toast.show({
          type: 'error',
          text1: 'Profile loading error',
          text2: 'Could not load your profile from backend.'
        });
      }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={{ marginTop: 16, fontSize: 18, color: '#8B5CF6', fontWeight: 'bold' }}>Loading profile...</Text>
      </View>
    );
  }
  if (!userProfile) {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={{ padding: 24, alignItems: 'center' }}>
          <Text style={{ color: '#EF4444', fontWeight: 'bold', marginBottom: 16 }}>Could not load your profile.</Text>
          {backendHealth && (
            <Text style={{ color: backendHealth.includes('gami') ? '#22C55E' : '#EF4444', marginTop: 8, fontSize: 12 }}>
              Backend health: {backendHealth}
            </Text>
          )}
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

  // Exemplo: função para cadastrar um novo perfil no backend Motoko
  const handleCreateProfile = async (username: string) => {
    try {
      const { icpService } = require('../../services/icpService');
      const result = await icpService.createUserProfile(username);
      if (result) {
        Toast.show({ type: 'success', text1: 'Profile created!', text2: 'Your profile was created in the backend.' });
        setUserProfile(result);
      } else {
        Toast.show({ type: 'error', text1: 'Profile creation error', text2: 'Check if the username already exists.' });
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Could not create the profile.' });
    }
  };

  // ...removido mock de connectedApps...

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
  // statusDot removido
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
  // statusDot duplicado removido
});