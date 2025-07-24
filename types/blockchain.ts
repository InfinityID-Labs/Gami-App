export interface RewardToken {
  symbol: string;
  name: string;
  balance: number;
  value: number;
  canisterId: string;
}

export interface UserWallet {
  principal: string;
  address: string;
  balance: number;
  network: 'ICP';
  connected: boolean;
  tokens: RewardToken[];
}

export interface BlockchainTransaction {
  id: string;
  type: 'reward_earned' | 'quest_completed' | 'token_transfer';
  amount: number;
  token: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
  blockHeight?: number;
}

export interface QuestReward {
  tokenSymbol: string;
  amount: number;
  canisterId: string;
}

export interface OnChainQuest {
  id: string;
  title: string;
  description: string;
  rewards: QuestReward[];
  completionCriteria: string;
  active: boolean;
  participants: number;
}