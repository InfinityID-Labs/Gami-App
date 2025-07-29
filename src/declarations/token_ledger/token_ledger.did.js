
export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'balanceOf': IDL.Func([IDL.Principal, IDL.Text], [IDL.Nat], ['query']),
    'transfer': IDL.Func([
      IDL.Record({
        'to': IDL.Principal,
        'token': IDL.Text,
        'amount': IDL.Nat,
        'memo': IDL.Vec(IDL.Nat8),
      })
    ], [IDL.Bool], []),
    // Adicione outros métodos conforme necessário
  });
};
export const init = ({ IDL }) => { return []; };
