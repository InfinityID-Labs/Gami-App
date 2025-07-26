export const idlFactory = ({ IDL }) => {
  const UserId = IDL.Principal;
  const TokenSymbol = IDL.Text;
  const TokenAmount = IDL.Float64;
  const Token = IDL.Record({
    'creator' : UserId,
    'decimals' : IDL.Nat8,
    'name' : IDL.Text,
    'createdAt' : IDL.Int,
    'totalSupply' : TokenAmount,
    'symbol' : TokenSymbol,
  });
  const Result_2 = IDL.Variant({ 'ok' : Token, 'err' : IDL.Text });
  const Transaction = IDL.Record({
    'id' : IDL.Text,
    'to' : UserId,
    'token' : TokenSymbol,
    'transactionType' : IDL.Text,
    'from' : IDL.Opt(UserId),
    'blockHeight' : IDL.Nat,
    'timestamp' : IDL.Int,
    'amount' : TokenAmount,
  });
  const Result_1 = IDL.Variant({
    'ok' : IDL.Vec(Transaction),
    'err' : IDL.Text,
  });
  const Result = IDL.Variant({ 'ok' : Transaction, 'err' : IDL.Text });
  const TransferArgs = IDL.Record({
    'to' : UserId,
    'token' : TokenSymbol,
    'memo' : IDL.Opt(IDL.Text),
    'amount' : TokenAmount,
  });
  return IDL.Service({
    'balanceOf' : IDL.Func([UserId, TokenSymbol], [TokenAmount], ['query']),
    'createToken' : IDL.Func(
        [TokenSymbol, IDL.Text, TokenAmount, IDL.Nat8],
        [Result_2],
        [],
      ),
    'distributeQuestReward' : IDL.Func(
        [UserId, IDL.Text, IDL.Vec(IDL.Tuple(TokenSymbol, TokenAmount))],
        [Result_1],
        [],
      ),
    'getAllTokens' : IDL.Func([], [IDL.Vec(Token)], ['query']),
    'getPortfolioValue' : IDL.Func([UserId], [IDL.Float64], ['query']),
    'getToken' : IDL.Func([TokenSymbol], [IDL.Opt(Token)], ['query']),
    'getTokenStats' : IDL.Func(
        [TokenSymbol],
        [
          IDL.Opt(
            IDL.Record({
              'circulatingSupply' : TokenAmount,
              'totalHolders' : IDL.Nat,
              'totalTransactions' : IDL.Nat,
            })
          ),
        ],
        ['query'],
      ),
    'getTransactionHistory' : IDL.Func(
        [IDL.Opt(UserId), IDL.Opt(IDL.Nat)],
        [IDL.Vec(Transaction)],
        ['query'],
      ),
    'getUserBalances' : IDL.Func(
        [UserId],
        [IDL.Vec(IDL.Tuple(TokenSymbol, TokenAmount))],
        ['query'],
      ),
    'greet' : IDL.Func([IDL.Text], [IDL.Text], ['query']),
    'mint' : IDL.Func(
        [UserId, TokenSymbol, TokenAmount, IDL.Opt(IDL.Text)],
        [Result],
        [],
      ),
    'transfer' : IDL.Func([TransferArgs], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
