import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Achievement {
  'id' : string,
  'title' : string,
  'unlockedAt' : [] | [bigint],
  'unlocked' : boolean,
  'description' : string,
  'requirement' : bigint,
  'category' : string,
}
export type Result = { 'ok' : UserProfile } |
  { 'err' : string };
export type Result_1 = { 'ok' : Achievement } |
  { 'err' : string };
export type UserId = Principal;
export interface UserPreferences {
  'theme' : string,
  'notifications' : boolean,
  'language' : string,
  'privacy' : boolean,
}
export interface UserProfile {
  'id' : UserId,
  'xp' : bigint,
  'streak' : bigint,
  'username' : string,
  'joinDate' : bigint,
  'totalRewards' : number,
  'email' : [] | [string],
  'level' : bigint,
  'preferences' : UserPreferences,
  'achievements' : Array<string>,
  'lastActive' : bigint,
}
export interface _SERVICE {
  'createProfile' : ActorMethod<[string, [] | [string]], Result>,
  'getAllAchievements' : ActorMethod<[], Array<Achievement>>,
  'getGlobalStats' : ActorMethod<
    [],
    { 'totalXP' : bigint, 'totalUsers' : bigint, 'averageLevel' : number }
  >,
  'getProfile' : ActorMethod<[[] | [UserId]], [] | [UserProfile]>,
  'getUserAchievements' : ActorMethod<[UserId], Array<Achievement>>,
  'greet' : ActorMethod<[string], string>,
  'initializeAchievements' : ActorMethod<[], undefined>,
  'unlockAchievement' : ActorMethod<[UserId, string], Result_1>,
  'updateProfile' : ActorMethod<
    [[] | [string], [] | [string], [] | [UserPreferences]],
    Result
  >,
  'updateXP' : ActorMethod<[bigint], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
