import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { Zap } from 'lucide-react-native';
import { icpService } from '@/services/icpService';
import Toast from '@/components/Toast';

export default function HomeScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        let userProfile = await icpService.getUserProfile();
        if (!userProfile) {
          // Cria perfil automaticamente se não existir
          const username = 'user_' + Date.now();
          userProfile = await icpService.createUserProfile(username);
          if (!userProfile) {
            setError('Could not create your profile.');
            setLoading(false);
            return;
          } else {
            Toast.show({ type: 'success', text1: 'Profile created!', text2: `Your profile was created as ${username}` });
          }
        }
        setProfile(userProfile);
      } catch (e) {
        setError('Could not load your profile.');
      }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <Text style={{ fontSize: 18, color: '#8B5CF6', fontWeight: 'bold' }}>Loading profile...</Text>
      </View>
    );
  }
  if (error || !profile) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <Text style={{ color: '#EF4444', fontWeight: 'bold', marginBottom: 16 }}>{error || 'Could not load your profile.'}</Text>
      </View>
    );
  }

  // Exibe dados reais do backend
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1E293B' }}>Welcome back!</Text>
      <Text style={{ fontSize: 18, color: '#8B5CF6', marginTop: 8 }}>{profile.username}</Text>
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginTop: 8 }}>Level: {profile.level ?? 1}</Text>
      <Text style={{ fontSize: 16, color: '#64748B', marginTop: 4 }}>XP: {profile.xp ?? 0}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}>
        <Zap size={16} color="#F59E0B" />
        <Text style={{ fontSize: 16, color: '#D97706', fontWeight: '600' }}> {profile.totalRewards ?? 0} Rewards</Text>
      </View>
    </View>
  );
}