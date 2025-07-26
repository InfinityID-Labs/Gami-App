import { useCallback } from 'react';
import * as gamiBackendApi from '@/services/gamiBackendApi';
import * as tokenLedgerApi from '@/services/tokenLedgerApi';

// Hook para uso nos componentes React/React Native
export function useGamiBackend() {
  return {
    createUserProfile: useCallback(gamiBackendApi.createUserProfile, []),
    getUserProfile: useCallback(gamiBackendApi.getUserProfile, []),
    getActiveQuests: useCallback(gamiBackendApi.getActiveQuests, []),
    completeQuest: useCallback(gamiBackendApi.completeQuest, []),
    // Adicione outros endpoints conforme necessário
  };
}

export function useTokenLedger() {
  return {
    getTokenBalance: useCallback(tokenLedgerApi.getTokenBalance, []),
    transferTokens: useCallback(tokenLedgerApi.transferTokens, []),
    // Adicione outros endpoints conforme necessário
  };
}
