export const idlFactory = ({ IDL }) => {
  const LeaderboardType = IDL.Variant({
    'Local' : IDL.Null,
    'Weekly' : IDL.Null,
    'Monthly' : IDL.Null,
    'Global' : IDL.Null,
  });
  const UserId = IDL.Principal;
  const LeaderboardEntry = IDL.Record({
    'xp' : IDL.Nat,
    'streak' : IDL.Nat,
    'username' : IDL.Text,
    'userId' : UserId,
    'rank' : IDL.Nat,
    'level' : IDL.Nat,
    'change' : IDL.Int,
    'lastActive' : IDL.Int,
  });
  const Result = IDL.Variant({ 'ok' : LeaderboardEntry, 'err' : IDL.Text });
  return IDL.Service({
    'getLeaderboard' : IDL.Func(
        [LeaderboardType, IDL.Opt(IDL.Nat)],
        [IDL.Vec(LeaderboardEntry)],
        ['query'],
      ),
    'getLeaderboardStats' : IDL.Func(
        [],
        [
          IDL.Record({
            'topXP' : IDL.Nat,
            'totalPlayers' : IDL.Nat,
            'lastUpdate' : IDL.Int,
            'averageLevel' : IDL.Float64,
          }),
        ],
        ['query'],
      ),
    'getTopPerformers' : IDL.Func(
        [IDL.Text, IDL.Nat],
        [IDL.Vec(LeaderboardEntry)],
        ['query'],
      ),
    'getUserRank' : IDL.Func(
        [UserId, LeaderboardType],
        [IDL.Opt(IDL.Nat)],
        ['query'],
      ),
    'greet' : IDL.Func([IDL.Text], [IDL.Text], ['query']),
    'updateRankings' : IDL.Func([], [], []),
    'updateUserEntry' : IDL.Func(
        [UserId, IDL.Text, IDL.Nat, IDL.Nat, IDL.Nat],
        [Result],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
