import { createGamiBackendActor } from './icpActors';
import { icpService } from './icpService';

// Exemplo de chamada para criar perfil no backend
export async function createUserProfile(username: string) {
  const auth = await icpService.getStoredAuth();
  if (!auth.identity) throw new Error('Usuário não autenticado');
  const backend = createGamiBackendActor(auth.identity);
  return backend.createUserProfile(username);
}

export async function getUserProfile(userId?: string) {
  const auth = await icpService.getStoredAuth();
  if (!auth.identity) throw new Error('Usuário não autenticado');
  const backend = createGamiBackendActor(auth.identity);
  return backend.getUserProfile(userId ? [userId] : []);
}

export async function getActiveQuests() {
  const auth = await icpService.getStoredAuth();
  if (!auth.identity) throw new Error('Usuário não autenticado');
  const backend = createGamiBackendActor(auth.identity);
  return backend.getActiveQuests();
}

export async function completeQuest(questId: string) {
  const auth = await icpService.getStoredAuth();
  if (!auth.identity) throw new Error('Usuário não autenticado');
  const backend = createGamiBackendActor(auth.identity);
  return backend.completeQuest(questId);
}

// Adicione funções para outros endpoints conforme necessário
