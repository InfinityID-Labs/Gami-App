import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { icpService } from '@/services/icpService';
import Toast from '@/components/Toast';

export default function AuthCallbackScreen() {
  const params = useLocalSearchParams();

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Process the authentication callback
        console.log('Processing auth callback with params:', params);

        // Check if authentication was successful
        const auth = await icpService.getStoredAuth();

        if (auth.isAuthenticated) {
          // Tenta buscar o perfil do backend
          let profile = await icpService.getUserProfile();
          if (!profile) {
            // If not exists, create a profile with a default name
            const username = 'user_' + Date.now();
            profile = await icpService.createUserProfile(username);
            if (profile) {
              Toast.show({
                type: 'success',
                text1: 'Profile created!',
                text2: `Your profile was created as ${username}`,
              });
            } else {
              Toast.show({
                type: 'error',
                text1: 'Profile creation error',
                text2: 'Try again or choose another username.',
              });
              setTimeout(() => {
                router.replace('/(auth)/login');
              }, 2000);
              return;
            }
          } else {
            Toast.show({
              type: 'success',
              text1: 'Login successful! ⚡',
              text2: 'Welcome to Gami!',
            });
          }
          // Redirect to main app
          setTimeout(() => {
            router.replace('/(tabs)');
          }, 1000);
        } else {
          Toast.show({
            type: 'error',
            text1: 'Authentication failed',
            text2: 'Please try to login again.',
          });
          setTimeout(() => {
            router.replace('/(auth)/login');
          }, 2000);
        }
      } catch (error) {
        console.error('Auth callback processing failed:', error);

        Toast.show({
          type: 'error',
          text1: 'Callback error',
          text2: 'Please try to login again.',
        });

        setTimeout(() => {
          router.replace('/(auth)/login');
        }, 2000);
      }
    };

    processCallback();
  }, [params]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#8B5CF6" />
      <Text style={styles.text}>Processando autenticação...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F0F23',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
    // fontFamily removed to avoid missing font error
  },
});
