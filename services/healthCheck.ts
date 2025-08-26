import { icpService } from './icpService';

export async function checkBackendHealth() {
  try {
    const result = await icpService.greetBackend('healthcheck');
    return result;
  } catch (e) {
    return 'Backend unreachable';
  }
}
