import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory as gami_backend_idl } from '../src/declarations/gami_backend/gami_backend.did.js';
import { idlFactory as token_ledger_idl } from '../src/declarations/token_ledger/token_ledger.did.js';
import type { Identity } from '@dfinity/agent';
import type { ActorSubclass, ActorMethod } from '@dfinity/agent';

export const gami_backend_id = 'uxrrr-q7777-77774-qaaaq-cai';
export const token_ledger_id = 'ucwa4-rx777-77774-qaada-cai';

export interface GamiBackendActorInterface extends ActorSubclass<Record<string, ActorMethod>> { }

export function createGamiBackendActor(identity: Identity): GamiBackendActorInterface {
  const agent = new HttpAgent({ identity });
  return Actor.createActor(gami_backend_idl, {
    agent,
    canisterId: gami_backend_id,
  }) as GamiBackendActorInterface;
}

export function createTokenLedgerActor(identity: Identity) {
  const agent = new HttpAgent({ identity });
  return Actor.createActor(token_ledger_idl, {
    agent,
    canisterId: token_ledger_id,
  });
}
