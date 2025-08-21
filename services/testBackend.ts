import { icpService } from '../services/icpService';

export const testBackendConnection = async () => {
  try {
    console.log('🔄 Testando conexão com o backend...');

    // Teste básico de health check
    const greeting = await icpService.greetBackend('Gamer');
    console.log('✅ Health check:', greeting);

    // Teste de listagem de quests
    const quests = await icpService.getQuests();
    console.log('📝 Quests disponíveis:', quests.length);

    // Teste de leaderboard
    const leaderboard = await icpService.getLeaderboard(5);
    console.log('🏆 Top 5 do leaderboard:', leaderboard.length);

    return {
      connected: icpService.isBackendConnected(),
      greeting,
      questsCount: quests.length,
      topUsersCount: leaderboard.length
    };
  } catch (error) {
    console.error('❌ Erro na conexão com backend:', error);
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
