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
      backend: 'uxrrr-q7777-77774-qaaaq-cai',
      host: 'https://ic0.app',
      leaderboard: 'umunu-kh777-77774-qaaca-cai',
      quest_rewards: 'ulvla-h7777-77774-qaacq-cai',
      token_ledger: 'ucwa4-rx777-77774-qaada-cai',
      user_profiles: 'ufxgi-4p777-77774-qaadq-cai',
      gami_frontend: 'u6s2n-gx777-77774-qaaba-cai',
      internet_identity: 'uzt4z-lp777-77774-qaabq-cai'
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



        // Sempre usar o endpoint oficial do ICP para mobile
        // Pega o canisterId do backend dinamicamente
        const { backend } = this.getCanisterIds();
        const prodIdentityUrl = 'https://identity.ic0.app';
        // Monta a URL pública do canister para callback
        const redirectURI = `https://${backend}.icp0.io/callback`;
        const authUrl = `${prodIdentityUrl}/?canister=${backend}&redirect_uri=${encodeURIComponent(redirectURI)}`;
        console.log('DEBUG ICP LOGIN:', { authUrl, redirectURI });

        const result = await WebBrowser.openAuthSessionAsync(
          authUrl,
          redirectURI,
          {
            showInRecents: false,
          }
        );

        console.log('WebBrowser result:', result);

        if (result.type === 'success' && result.url) {
          // Extrai o principal da URL de retorno (deep link)
          const url = new URL(result.url);
          const principal = url.searchParams.get('principal');
          if (principal) {
            await AsyncStorage.setItem('icp_principal', principal);
            console.log('Mobile login completed with principal:', principal);
            return {
              isAuthenticated: true,
              principal,
              identity: null,
            };
          }
        }
        // Se não conseguiu autenticar
        console.log('Login was cancelled or failed');
        return {
          isAuthenticated: false,
          principal: null,
          identity: null,
        };
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