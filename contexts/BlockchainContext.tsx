import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { icpService, ICPAuthState } from '@/services/icpService';
import { UserWallet, BlockchainTransaction } from '@/types/blockchain';

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
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

export function BlockchainProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    principal: null,
    identity: null,
  });
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

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

  const loadWalletData = async (principal: string) => {
    try {
      const mockWallet: UserWallet = {
        principal,
        address: principal.slice(0, 8) + '...',
        balance: 156.75,
        network: 'ICP',
        connected: true,
        tokens: [
          { symbol: 'GAMI', name: 'Gami Token', balance: 250, value: 0.50, canisterId: 'gami-token' },
          { symbol: 'QUEST', name: 'Quest Token', balance: 100, value: 0.25, canisterId: 'quest-token' },
          { symbol: 'LOCAL', name: 'Local Rewards', balance: 75, value: 0.10, canisterId: 'local-token' },
        ],
      };
      
      const mockTransactions: BlockchainTransaction[] = [
        {
          id: '1',
          type: 'reward_earned',
          amount: 50,
          token: 'GAMI',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          status: 'completed',
          blockHeight: 12345,
        },
        {
          id: '2',
          type: 'quest_completed',
          amount: 25,
          token: 'QUEST',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          status: 'completed',
          blockHeight: 12344,
        },
      ];
      
      setWallet(mockWallet);
      setTransactions(mockTransactions);
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
      setAuthState({
        isAuthenticated: false,
        principal: null,
        identity: null,
      });
      setWallet(null);
      setTransactions([]);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const connectWallet = async (): Promise<boolean> => {
    setIsConnecting(true);
    try {
      const authResult = await icpService.login();
      setAuthState(authResult);
      
      if (authResult.isAuthenticated && authResult.principal) {
        await loadWalletData(authResult.principal);
        return true;
      }
      return false;
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
        setTransactions(prev => [newTransaction, ...prev]);
        
        await loadWalletData(wallet.principal);
      }
      return result.success;
    } catch (error) {
      console.error('Failed to complete quest on chain:', error);
      return false;
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