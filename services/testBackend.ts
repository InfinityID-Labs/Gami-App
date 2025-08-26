import { icpService } from '../services/icpService';

export const testBackendConnection = async () => {
  try {
    console.log('🔄 Testing backend connection...');

    const greeting = await icpService.greetBackend('Gamer');
    console.log('✅ Health check:', greeting);
    const quests = await icpService.getQuests();
    console.log('📝 Quests available:', quests.length);
    const leaderboard = await icpService.getLeaderboard(5);
    console.log('🏆 Top 5 leaderboard:', leaderboard.length);
    return {
      connected: icpService.isBackendConnected(),
      greeting,
      questsCount: quests.length,
      topUsersCount: leaderboard.length
    };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
