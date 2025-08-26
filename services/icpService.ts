import { HttpAgent, Identity, Actor } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { idlFactory as gamiBackendIdlFactory } from '../src/declarations/gami_backend/gami_backend.did.js';

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

  private getCanisterIds() {
    return {
      backend: 'uxrrr-q7777-77774-qaaaq-cai',
      host: 'http://localhost:4943/',
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
      if (Platform.OS !== 'web') {
        WebBrowser.maybeCompleteAuthSession();
      }
      if (Platform.OS === 'web') {
        this.authClient = await AuthClient.create({
          idleOptions: {
            disableIdle: true,
          },
        });
      }
      await this.createBackendActor();
    } catch (error) {
      console.warn('ICP initialization failed, using mock mode:', error);
    }
  }

  private async createBackendActor() {
    try {
      const { backend, host } = this.getCanisterIds();
      this.agent = new HttpAgent({
        host,
        identity: this.authClient?.getIdentity() || undefined,
      });
      const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
      if (isLocal) {
        try {
          await this.agent.fetchRootKey();
          console.log('Root key fetched for local development');
        } catch (e) {
          console.warn('Could not fetch root key for local IC:', e);
        }
      }
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
        const prodIdentityProvider = 'https://identity.ic0.app';
        return new Promise((resolve) => {
          this.authClient!.login({
            identityProvider: prodIdentityProvider,
            onSuccess: async () => {
              const identity = this.authClient!.getIdentity();
              const principal = identity.getPrincipal().toString();
              await AsyncStorage.setItem('icp_principal', principal);
              const { backend, host } = this.getCanisterIds();
              const agent = new HttpAgent({ host, identity });
              const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
              if (isLocal) {
                try {
                  await agent.fetchRootKey();
                  console.log('Root key fetched for local development (login)');
                } catch (e) {
                  console.warn('Could not fetch root key for local IC after login:', e);
                }
              }
              this.agent = agent;
              this.backendActor = Actor.createActor(gamiBackendIdlFactory, {
                agent: this.agent,
                canisterId: backend,
              });
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
        const { backend } = this.getCanisterIds();
        const prodIdentityUrl = 'http://localhost:4943/?canisterId=uzt4z-lp777-77774-qaabq-cai';
        const redirectURI = `http://localhost:3000/callback`;
        const authUrl = `${prodIdentityUrl}&canister=${backend}&redirect_uri=${encodeURIComponent(redirectURI)}`;
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

  isBackendConnected(): boolean {
    return this.backendActor !== null;
  }
}

export const icpService = new ICPService();