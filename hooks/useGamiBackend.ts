import { useCallback } from 'react';
import * as gamiBackendApi from '@/services/gamiBackendApi';
import * as tokenLedgerApi from '@/services/tokenLedgerApi';

export function useGamiBackend() {
  return {
    createUserProfile: useCallback(gamiBackendApi.createUserProfile, []),
    getUserProfile: useCallback(gamiBackendApi.getUserProfile, []),
    getActiveQuests: useCallback(gamiBackendApi.getActiveQuests, []),
    completeQuest: useCallback(gamiBackendApi.completeQuest, []),
  };
}

export function useTokenLedger() {
  return {
    getTokenBalance: useCallback(tokenLedgerApi.getTokenBalance, []),
    transferTokens: useCallback(tokenLedgerApi.transferTokens, []),
  };
}
