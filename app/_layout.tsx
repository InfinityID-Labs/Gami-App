import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { BlockchainProvider, useBlockchain } from '@/contexts/BlockchainContext';
import { useRouter, useSegments, useRootNavigationState } from 'expo-router';

// Mock environment variables - replace with actual values
const ENV_VARS = {
  LOCAL_IP_ADDRESS: '127.0.0.1',
  DFX_NETWORK: 'local',
  CANISTER_ID_II_INTEGRATION: 'rdmx6-jaaaa-aaaah-qcaiq-cai',
  CANISTER_ID_INTERNET_IDENTITY: 'rrkah-fqaaa-aaaah-qcuiq-cai',
};

function useProtectedRoute() {
  const { isAuthenticated } = useBlockchain();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    // Wait for navigation state to be ready
    if (!navigationState?.key) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';

    if (!isAuthenticated && inTabsGroup) {
      // Redirect to splash if not authenticated and trying to access tabs
      router.replace('/(auth)/splash');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to tabs if authenticated and in auth screens
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, navigationState?.key]);
}

function AppContent() {
  useProtectedRoute();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <BlockchainProvider>
      <AppContent />
    </BlockchainProvider>
  );
}
