import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { icpService, ICPAuthState } from '@/services/icpService';
import { UserWallet, BlockchainTransaction } from '@/types/blockchain';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface BlockchainContextType {
  isAuthenticated: boolean;
  principal: string | null;
  identity: any | null;
  wallet: UserWallet | null;
  transactions: BlockchainTransaction[];
  isConnecting: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  connectWallet: () => Promise<boolean>;
  disconnectWallet: () => void;
  refreshBalance: () => Promise<void>;
  completeQuestOnChain: (questId: string) => Promise<boolean>;
  getUserStats: () => Promise<{ xp: number; level: number; completedQuests: string[] }>;
  updateUserStats: (xp: number, level: number, completedQuests: string[]) => Promise<void>;
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

export function BlockchainProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<ICPAuthState>({
    isAuthenticated: false,
    principal: null,
    identity: null,
  });
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [userStats, setUserStats] = useState({
    xp: 2847,
    level: 12,
    completedQuests: [] as string[],
  });

  const loadUserStats = async () => {
    try {
      const [xpStr, levelStr, questsStr] = await AsyncStorage.multiGet([
        'userXP',
        'userLevel',
        'completedQuests'
      ]);

      const xp = xpStr[1] ? parseInt(xpStr[1]) : 2847;
      const level = levelStr[1] ? parseInt(levelStr[1]) : 12;
      const completedQuests = questsStr[1] ? JSON.parse(questsStr[1]) : [];

      setUserStats({ xp, level, completedQuests });
    } catch (error) {
      console.error('Failed to load user stats:', error);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await icpService.initialize();
        const storedAuth = await icpService.getStoredAuth();
        setAuthState(storedAuth);

        if (storedAuth.isAuthenticated) {
          await loadWalletData(storedAuth.principal!);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      }
    };

    initializeAuth();
    loadUserStats();
  }, []);


  const saveUserStats = async (xp: number, level: number, completedQuests: string[]) => {
    try {
      await AsyncStorage.multiSet([
        ['userXP', xp.toString()],
        ['userLevel', level.toString()],
        ['completedQuests', JSON.stringify(completedQuests)]
      ]);
      setUserStats({ xp, level, completedQuests });
    } catch (error) {
      console.error('Failed to save user stats:', error);
    }
  };
  const loadWalletData = async (principal: string) => {
    try {
      // Generate dynamic token balances based on user progress
      const baseBalance = userStats.xp * 0.05; // 5 cents per XP
      const tokenMultiplier = userStats.level * 10;

      const liveWallet: UserWallet = {
        principal,
        address: principal.slice(0, 8) + '...',
        balance: baseBalance + (userStats.completedQuests.length * 5),
        network: 'ICP',
        connected: true,
        tokens: [
          {
            symbol: 'GAMI',
            name: 'Gami Token',
            balance: tokenMultiplier + (userStats.completedQuests.length * 10),
            value: 0.50,
            canisterId: 'gami-token'
          },
          {
            symbol: 'QUEST',
            name: 'Quest Token',
            balance: userStats.completedQuests.length * 5,
            value: 0.25,
            canisterId: 'quest-token'
          },
          {
            symbol: 'LOCAL',
            name: 'Local Rewards',
            balance: Math.floor(userStats.xp / 100),
            value: 0.10,
            canisterId: 'local-token'
          },
        ],
      };

      // Load real transaction history from storage
      const storedTransactions = await AsyncStorage.getItem('blockchain_transactions');
      const liveTransactions = storedTransactions
        ? JSON.parse(storedTransactions).map((tx: any) => ({
          ...tx,
          timestamp: new Date(tx.timestamp)
        }))
        : [];

      setWallet(liveWallet);
      setTransactions(liveTransactions);
    } catch (error) {
      console.error('Failed to load wallet data:', error);
    }
  };
  const login = async () => {
    setIsConnecting(true);
    try {
      const newAuthState = await icpService.login();
      setAuthState(newAuthState);

      if (newAuthState.isAuthenticated && newAuthState.principal) {
        await loadWalletData(newAuthState.principal);
      }
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const logout = async () => {
    setIsConnecting(true);
    try {
      await icpService.logout();

      // Clear all stored data
      await AsyncStorage.multiRemove([
        'userXP',
        'userLevel',
        'completedQuests',
        'liveStats',
        'blockchain_transactions',
        'icp_principal'
      ]);

      // Reset all state
      setAuthState({
        isAuthenticated: false,
        principal: null,
        identity: null,
      });
      setWallet(null);
      setTransactions([]);
      setUserStats({
        xp: 2847,
        level: 12,
        completedQuests: [],
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const connectWallet = async (): Promise<boolean> => {
    setIsConnecting(true);
    try {
      console.log('Starting wallet connection...');
      const authResult = await icpService.login();
      console.log('Auth result:', authResult);

      setAuthState(authResult);

      if (authResult.isAuthenticated && authResult.principal) {
        await loadWalletData(authResult.principal);
        console.log('Wallet connected successfully');
        return true;
      } else {
        console.log('Wallet connection failed');
        return false;
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAuthState({
      isAuthenticated: false,
      principal: null,
      identity: null,
    });
    setWallet(null);
    setTransactions([]);
  };

  const refreshBalance = async () => {
    if (wallet) {
      await loadWalletData(wallet.principal);
    }
  };

  const completeQuestOnChain = async (questId: string): Promise<boolean> => {
    try {
      // Simulate blockchain transaction delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const result = await icpService.completeQuest(questId);
      if (result.success && wallet) {
        // Add new transaction to the list
        const newTransaction: BlockchainTransaction = {
          id: Date.now().toString(),
          type: 'quest_completed',
          amount: result.reward,
          token: 'GAMI',
          timestamp: new Date(),
          status: 'completed',
          blockHeight: Math.floor(Math.random() * 10000) + 50000,
        };

        const updatedTransactions = [newTransaction, ...transactions];
        setTransactions(updatedTransactions);

        // Save transactions to storage
        await AsyncStorage.setItem('blockchain_transactions', JSON.stringify(updatedTransactions));

        await loadWalletData(wallet.principal);
      }
      return result.success;
    } catch (error) {
      console.error('Failed to complete quest on chain:', error);
      return false;
    }
  };

  const getUserStats = async () => {
    await loadUserStats();
    return userStats;
  };

  const updateUserStats = async (xp: number, level: number, completedQuests: string[]) => {
    await saveUserStats(xp, level, completedQuests);
    if (wallet) {
      await loadWalletData(wallet.principal);
    }
  };
  const value: BlockchainContextType = {
    ...authState,
    wallet,
    transactions,
    isConnecting,
    login,
    logout,
    connectWallet,
    disconnectWallet,
    refreshBalance,
    completeQuestOnChain,
    getUserStats,
    updateUserStats,
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
}

export function useBlockchain() {
  const context = useContext(BlockchainContext);
  if (context === undefined) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
}