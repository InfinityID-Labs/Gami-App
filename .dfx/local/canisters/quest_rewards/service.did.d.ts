import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type QuestId = string;
export type Result = { 'ok' : Transaction } |
  { 'err' : string };
export type Result_1 = { 'ok' : Array<Transaction> } |
  { 'err' : string };
export interface RewardToken {
  'decimals' : number,
  'name' : string,
  'totalSupply' : TokenAmount,
  'symbol' : TokenSymbol,
}
export type TokenAmount = number;
export type TokenSymbol = string;
export interface Transaction {
  'id' : string,
  'to' : UserId,
  'token' : TokenSymbol,
  'transactionType' : string,
  'from' : [] | [UserId],
  'timestamp' : bigint,
  'amount' : TokenAmount,
}
export type UserId = Principal;
export interface _SERVICE {
  'awardQuestReward' : ActorMethod<
    [UserId, QuestId, Array<[TokenSymbol, TokenAmount]>],
    Result_1
  >,
  'getAllTokens' : ActorMethod<[], Array<RewardToken>>,
  'getBalance' : ActorMethod<[UserId, TokenSymbol], TokenAmount>,
  'getPortfolioValue' : ActorMethod<[UserId], number>,
  'getToken' : ActorMethod<[TokenSymbol], [] | [RewardToken]>,
  'getUserBalances' : ActorMethod<[UserId], Array<[TokenSymbol, TokenAmount]>>,
  'getUserTransactions' : ActorMethod<[UserId], Array<Transaction>>,
  'greet' : ActorMethod<[string], string>,
  'initializeTokens' : ActorMethod<[], undefined>,
  'transfer' : ActorMethod<[UserId, TokenSymbol, TokenAmount], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
