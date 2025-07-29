import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Quest {
  'id' : QuestId,
  'title' : string,
  'participants' : bigint,
  'active' : boolean,
  'timeLimit' : string,
  'xpReward' : bigint,
  'difficulty' : string,
  'moneyReward' : [] | [number],
  'description' : string,
  'sponsor' : string,
  'category' : string,
}
export type QuestId = string;
export type Result = { 'ok' : UserProfile } |
  { 'err' : string };
export type Result_1 = { 'ok' : Quest } |
  { 'err' : string };
export type UserId = Principal;
export interface UserProfile {
  'id' : UserId,
  'xp' : bigint,
  'username' : string,
  'joinDate' : bigint,
  'globalRank' : bigint,
  'totalRewards' : number,
  'level' : bigint,
}
export interface _SERVICE {
  'createQuest' : ActorMethod<
    [
      QuestId,
      string,
      string,
      string,
      bigint,
      [] | [number],
      string,
      string,
      string,
    ],
    Result_1
  >,
  'createUserProfile' : ActorMethod<[string], Result>,
  'getLeaderboard' : ActorMethod<[[] | [bigint]], Array<UserProfile>>,
  'getQuests' : ActorMethod<[], Array<Quest>>,
  'getUserProfile' : ActorMethod<[[] | [UserId]], [] | [UserProfile]>,
  'greet' : ActorMethod<[string], string>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
