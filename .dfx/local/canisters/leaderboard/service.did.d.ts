import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface LeaderboardEntry {
  'xp' : bigint,
  'streak' : bigint,
  'username' : string,
  'userId' : UserId,
  'rank' : bigint,
  'level' : bigint,
  'change' : bigint,
  'lastActive' : bigint,
}
export type LeaderboardType = { 'Local' : null } |
  { 'Weekly' : null } |
  { 'Monthly' : null } |
  { 'Global' : null };
export type Result = { 'ok' : LeaderboardEntry } |
  { 'err' : string };
export type UserId = Principal;
export interface _SERVICE {
  'getLeaderboard' : ActorMethod<
    [LeaderboardType, [] | [bigint]],
    Array<LeaderboardEntry>
  >,
  'getLeaderboardStats' : ActorMethod<
    [],
    {
      'topXP' : bigint,
      'totalPlayers' : bigint,
      'lastUpdate' : bigint,
      'averageLevel' : number,
    }
  >,
  'getTopPerformers' : ActorMethod<[string, bigint], Array<LeaderboardEntry>>,
  'getUserRank' : ActorMethod<[UserId, LeaderboardType], [] | [bigint]>,
  'greet' : ActorMethod<[string], string>,
  'updateRankings' : ActorMethod<[], undefined>,
  'updateUserEntry' : ActorMethod<
    [UserId, string, bigint, bigint, bigint],
    Result
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
