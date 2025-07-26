import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type Result = { 'ok' : Transaction } |
  { 'err' : string };
export type Result_1 = { 'ok' : Array<Transaction> } |
  { 'err' : string };
export type Result_2 = { 'ok' : Token } |
  { 'err' : string };
export interface Token {
  'creator' : UserId,
  'decimals' : number,
  'name' : string,
  'createdAt' : bigint,
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
  'blockHeight' : bigint,
  'timestamp' : bigint,
  'amount' : TokenAmount,
}
export interface TransferArgs {
  'to' : UserId,
  'token' : TokenSymbol,
  'memo' : [] | [string],
  'amount' : TokenAmount,
}
export type UserId = Principal;
export interface _SERVICE {
  'balanceOf' : ActorMethod<[UserId, TokenSymbol], TokenAmount>,
  'createToken' : ActorMethod<
    [TokenSymbol, string, TokenAmount, number],
    Result_2
  >,
  'distributeQuestReward' : ActorMethod<
    [UserId, string, Array<[TokenSymbol, TokenAmount]>],
    Result_1
  >,
  'getAllTokens' : ActorMethod<[], Array<Token>>,
  'getPortfolioValue' : ActorMethod<[UserId], number>,
  'getToken' : ActorMethod<[TokenSymbol], [] | [Token]>,
  'getTokenStats' : ActorMethod<
    [TokenSymbol],
    [] | [
      {
        'circulatingSupply' : TokenAmount,
        'totalHolders' : bigint,
        'totalTransactions' : bigint,
      }
    ]
  >,
  'getTransactionHistory' : ActorMethod<
    [[] | [UserId], [] | [bigint]],
    Array<Transaction>
  >,
  'getUserBalances' : ActorMethod<[UserId], Array<[TokenSymbol, TokenAmount]>>,
  'greet' : ActorMethod<[string], string>,
  'mint' : ActorMethod<
    [UserId, TokenSymbol, TokenAmount, [] | [string]],
    Result
  >,
  'transfer' : ActorMethod<[TransferArgs], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
