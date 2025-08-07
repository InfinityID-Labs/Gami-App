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
          Toast.show({
            type: 'success',
            text1: 'Login realizado com sucesso! ⚡',
            text2: 'Bem-vindo ao Gami!',
          });

          // Redirect to main app
          setTimeout(() => {
            router.replace('/(tabs)');
          }, 1000);
        } else {
          Toast.show({
            type: 'error',
            text1: 'Falha na autenticação',
            text2: 'Tente fazer login novamente.',
          });

          // Return to login screen
          setTimeout(() => {
            router.replace('/(auth)/login');
          }, 2000);
        }
      } catch (error) {
        console.error('Auth callback processing failed:', error);

        Toast.show({
          type: 'error',
          text1: 'Erro no callback',
          text2: 'Tente fazer login novamente.',
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
    fontFamily: 'Inter-Regular',
  },
});
