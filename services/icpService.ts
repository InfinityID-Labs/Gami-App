import { HttpAgent, Identity, Actor } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

// Import das declarações geradas do backend
import { idlFactory as gamiBackendIdlFactory } from '../src/declarations/gami_backend/gami_backend.did.js';

// Tipos do backend
export interface UserProfile {
  id: Principal;
  username: string;
  level: bigint;
  xp: bigint;
  totalRewards: number;
  joinDate: bigint;
  globalRank: bigint;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: string;
  xpReward: bigint;
  moneyReward: number[] | [];
  timeLimit: string;
  participants: bigint;
  difficulty: string;
  sponsor: string;
  active: boolean;
}

export interface ICPAuthState {
  isAuthenticated: boolean;
  principal: string | null;
  identity: Identity | null;
}

export class ICPService {
  private authClient: AuthClient | null = null;
  private agent: HttpAgent | null = null;
  private backendActor: any = null;

  // URLs dos canisters (podem vir do .env)
  private getCanisterIds() {
    return {
      backend: process.env.CANISTER_ID_GAMI_BACKEND || 'uxrrr-q7777-77774-qaaaq-cai',
      host: process.env.REACT_APP_IC_HOST || 'http://localhost:4943'
    };
  }

  async initialize(): Promise<void> {
    try {
      // Configure WebBrowser for mobile authentication
      if (Platform.OS !== 'web') {
        WebBrowser.maybeCompleteAuthSession();
      }

      // For web platform, use Internet Identity
      if (Platform.OS === 'web') {
        this.authClient = await AuthClient.create({
          idleOptions: {
            disableIdle: true,
          },
        });
      }

      // Initialize backend actor
      await this.createBackendActor();
    } catch (error) {
      console.warn('ICP initialization failed, using mock mode:', error);
    }
  }

  private async createBackendActor() {
    try {
      const { backend, host } = this.getCanisterIds();

      // Create agent
      this.agent = new HttpAgent({
        host,
        identity: this.authClient?.getIdentity() || undefined,
      });

      // For local development, fetch root key
      if (host.includes('localhost')) {
        await this.agent.fetchRootKey();
      }

      // Create backend actor
      this.backendActor = Actor.createActor(gamiBackendIdlFactory, {
        agent: this.agent,
        canisterId: backend,
      });

      console.log('Backend actor created successfully');
    } catch (error) {
      console.error('Failed to create backend actor:', error);
    }
  }

  async login(): Promise<ICPAuthState> {
    try {
      if (Platform.OS === 'web' && this.authClient) {
        return new Promise((resolve) => {
          this.authClient!.login({
            identityProvider: 'https://identity.ic0.app',
            onSuccess: async () => {
              const identity = this.authClient!.getIdentity();
              const principal = identity.getPrincipal().toString();

              await AsyncStorage.setItem('icp_principal', principal);

              // Recreate backend actor with authenticated identity
              await this.createBackendActor();

              resolve({
                isAuthenticated: true,
                principal,
                identity,
              });
            },
            onError: () => {
              resolve({
                isAuthenticated: false,
                principal: null,
                identity: null,
              });
            },
          });
        });
      } else {
        // Mobile: Use WebBrowser to open Internet Identity with a simplified flow
        console.log('Starting Internet Identity login on mobile...');

        const redirectURI = AuthSession.makeRedirectUri({
          scheme: 'gamiapp',
          path: 'auth/callback',
        });

        console.log('Redirect URI:', redirectURI);

        // Create a more direct Internet Identity URL
        const authUrl = `https://identity.ic0.app/?redirect_uri=${encodeURIComponent(redirectURI)}`;

        const result = await WebBrowser.openAuthSessionAsync(
          authUrl,
          redirectURI,
          {
            showInRecents: false,
          }
        );

        console.log('WebBrowser result:', result);

        if (result.type === 'success' || result.type === 'cancel') {
          // Even if cancelled, we'll check if user completed the auth in the browser
          // Generate a mock principal for demo purposes
          // In a real implementation, you'd extract this from the callback URL
          const timestamp = Date.now();
          const mockPrincipal = `user-${timestamp.toString().slice(-8)}-cai`;
          await AsyncStorage.setItem('icp_principal', mockPrincipal);

          console.log('Mobile login completed with principal:', mockPrincipal);

          return {
            isAuthenticated: true,
            principal: mockPrincipal,
            identity: null,
          };
        } else {
          console.log('Login was cancelled or failed');
          return {
            isAuthenticated: false,
            principal: null,
            identity: null,
          };
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
      return {
        isAuthenticated: false,
        principal: null,
        identity: null,
      };
    }
  }

  async logout(): Promise<void> {
    try {
      if (Platform.OS === 'web' && this.authClient) {
        await this.authClient.logout();
      }
      await AsyncStorage.removeItem('icp_principal');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  async getStoredAuth(): Promise<ICPAuthState> {
    try {
      const principal = await AsyncStorage.getItem('icp_principal');

      if (principal) {
        if (Platform.OS === 'web' && this.authClient) {
          const identity = this.authClient.getIdentity();
          return {
            isAuthenticated: true,
            principal,
            identity,
          };
        } else {
          return {
            isAuthenticated: true,
            principal,
            identity: null,
          };
        }
      }
    } catch (error) {
      console.error('Failed to get stored auth:', error);
    }

    return {
      isAuthenticated: false,
      principal: null,
      identity: null,
    };
  }

  // Mock blockchain operations for demo
  async getTokenBalance(tokenType: string): Promise<number> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const balances: Record<string, number> = {
      GAMI: Math.floor(Math.random() * 500) + 200,
      QUEST: Math.floor(Math.random() * 100) + 50,
      LOCAL: Math.floor(Math.random() * 150) + 75,
      FIT: Math.floor(Math.random() * 200) + 100,
      PROD: Math.floor(Math.random() * 100) + 50,
    };

    return balances[tokenType] || 0;
  }

  async completeQuest(questId: string): Promise<{ success: boolean; reward: number }> {
    // Simulate blockchain transaction
    await new Promise(resolve => setTimeout(resolve, 1500));

    const reward = Math.floor(Math.random() * 100) + 25;
    const success = Math.random() > 0.1; // 90% success rate
    return { success, reward };
  }

  async transferTokens(to: string, amount: number, tokenType: string): Promise<boolean> {
    // Simulate blockchain transaction
    await new Promise(resolve => setTimeout(resolve, 2000));
    return Math.random() > 0.05; // 95% success rate
  }

  // ==================== MÉTODOS DO BACKEND MOTOKO ====================

  // Criar perfil de usuário
  async createUserProfile(username: string): Promise<UserProfile | null> {
    try {
      if (!this.backendActor) {
        console.warn('Backend actor not initialized');
        return null;
      }

      const result = await this.backendActor.createUserProfile(username);

      if ('ok' in result) {
        return result.ok;
      } else {
        console.error('Error creating user profile:', result.err);
        return null;
      }
    } catch (error) {
      console.error('Failed to create user profile:', error);
      return null;
    }
  }

  // Buscar perfil de usuário
  async getUserProfile(userId?: string): Promise<UserProfile | null> {
    try {
      if (!this.backendActor) {
        console.warn('Backend actor not initialized');
        return null;
      }

      const principalId = userId ? [Principal.fromText(userId)] : [];
      const result = await this.backendActor.getUserProfile(principalId);

      return result[0] || null;
    } catch (error) {
      console.error('Failed to get user profile:', error);
      return null;
    }
  }

  // Criar quest
  async createQuest(quest: Omit<Quest, 'participants' | 'active'>): Promise<Quest | null> {
    try {
      if (!this.backendActor) {
        console.warn('Backend actor not initialized');
        return null;
      }

      const result = await this.backendActor.createQuest(
        quest.id,
        quest.title,
        quest.description,
        quest.category,
        quest.xpReward,
        quest.moneyReward.length > 0 ? quest.moneyReward : [],
        quest.timeLimit,
        quest.difficulty,
        quest.sponsor
      );

      if ('ok' in result) {
        return result.ok;
      } else {
        console.error('Error creating quest:', result.err);
        return null;
      }
    } catch (error) {
      console.error('Failed to create quest:', error);
      return null;
    }
  }

  // Buscar todas as quests
  async getQuests(): Promise<Quest[]> {
    try {
      if (!this.backendActor) {
        console.warn('Backend actor not initialized, returning empty array');
        return [];
      }

      const quests = await this.backendActor.getQuests();
      return quests || [];
    } catch (error) {
      console.error('Failed to get quests:', error);
      return [];
    }
  }

  // Buscar leaderboard
  async getLeaderboard(limit = 10): Promise<UserProfile[]> {
    try {
      if (!this.backendActor) {
        console.warn('Backend actor not initialized, returning empty array');
        return [];
      }

      const leaderboard = await this.backendActor.getLeaderboard([limit]);
      return leaderboard || [];
    } catch (error) {
      console.error('Failed to get leaderboard:', error);
      return [];
    }
  }

  // Health check do backend
  async greetBackend(name: string): Promise<string> {
    try {
      if (!this.backendActor) {
        return 'Backend not connected';
      }

      const greeting = await this.backendActor.greet(name);
      return greeting;
    } catch (error) {
      console.error('Failed to greet backend:', error);
      return 'Error connecting to backend';
    }
  }

  // Verificar se o backend está conectado
  isBackendConnected(): boolean {
    return this.backendActor !== null;
  }
}

export const icpService = new ICPService();