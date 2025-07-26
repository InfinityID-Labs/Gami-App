export const idlFactory = ({ IDL }) => {
  const UserId = IDL.Principal;
  const QuestId = IDL.Text;
  const TokenSymbol = IDL.Text;
  const TokenAmount = IDL.Float64;
  const Transaction = IDL.Record({
    'id' : IDL.Text,
    'to' : UserId,
    'token' : TokenSymbol,
    'transactionType' : IDL.Text,
    'from' : IDL.Opt(UserId),
    'timestamp' : IDL.Int,
    'amount' : TokenAmount,
  });
  const Result_1 = IDL.Variant({
    'ok' : IDL.Vec(Transaction),
    'err' : IDL.Text,
  });
  const RewardToken = IDL.Record({
    'decimals' : IDL.Nat8,
    'name' : IDL.Text,
    'totalSupply' : TokenAmount,
    'symbol' : TokenSymbol,
  });
  const Result = IDL.Variant({ 'ok' : Transaction, 'err' : IDL.Text });
  return IDL.Service({
    'awardQuestReward' : IDL.Func(
        [UserId, QuestId, IDL.Vec(IDL.Tuple(TokenSymbol, TokenAmount))],
        [Result_1],
        [],
      ),
    'getAllTokens' : IDL.Func([], [IDL.Vec(RewardToken)], ['query']),
    'getBalance' : IDL.Func([UserId, TokenSymbol], [TokenAmount], ['query']),
    'getPortfolioValue' : IDL.Func([UserId], [IDL.Float64], ['query']),
    'getToken' : IDL.Func([TokenSymbol], [IDL.Opt(RewardToken)], ['query']),
    'getUserBalances' : IDL.Func(
        [UserId],
        [IDL.Vec(IDL.Tuple(TokenSymbol, TokenAmount))],
        ['query'],
      ),
    'getUserTransactions' : IDL.Func(
        [UserId],
        [IDL.Vec(Transaction)],
        ['query'],
      ),
    'greet' : IDL.Func([IDL.Text], [IDL.Text], ['query']),
    'initializeTokens' : IDL.Func([], [], []),
    'transfer' : IDL.Func([UserId, TokenSymbol, TokenAmount], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
