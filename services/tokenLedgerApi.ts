import { createTokenLedgerActor } from './icpActors';
import { icpService } from './icpService';

export async function getTokenBalance(token: string) {
  const auth = await icpService.getStoredAuth();
  if (!auth.identity) {
    throw new Error('No identity found in auth');
  }
  const ledger = createTokenLedgerActor(auth.identity);
  return ledger.balanceOf(auth.identity.getPrincipal(), token);
}

export async function transferTokens(to: string, amount: number, token: string) {
  const auth = await icpService.getStoredAuth();
  if (!auth.identity) {
    throw new Error('No identity found in auth');
  }
  const ledger = createTokenLedgerActor(auth.identity);
  return ledger.transfer({ to, token, amount, memo: [] });
}

// Adicione outras funções conforme necessário
