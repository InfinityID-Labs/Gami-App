export const idlFactory = ({ IDL }) => {
  const QuestId = IDL.Text;
  const Quest = IDL.Record({
    'id': QuestId,
    'title': IDL.Text,
    'participants': IDL.Nat,
    'active': IDL.Bool,
    'timeLimit': IDL.Text,
    'xpReward': IDL.Nat,
    'difficulty': IDL.Text,
    'moneyReward': IDL.Opt(IDL.Float64),
    'description': IDL.Text,
    'sponsor': IDL.Text,
    'category': IDL.Text,
  });
  const Result_1 = IDL.Variant({ 'ok': Quest, 'err': IDL.Text });
  const UserId = IDL.Principal;
  const UserProfile = IDL.Record({
    'id': UserId,
    'xp': IDL.Nat,
    'username': IDL.Text,
    'joinDate': IDL.Int,
    'globalRank': IDL.Nat,
    'totalRewards': IDL.Float64,
    'level': IDL.Nat,
  });
  const Result = IDL.Variant({ 'ok': UserProfile, 'err': IDL.Text });
  return IDL.Service({
    'createQuest': IDL.Func(
      [
        QuestId,
        IDL.Text,
        IDL.Text,
        IDL.Text,
        IDL.Nat,
        IDL.Opt(IDL.Float64),
        IDL.Text,
        IDL.Text,
        IDL.Text,
      ],
      [Result_1],
      [],
    ),
    'createUserProfile': IDL.Func([IDL.Text], [Result], []),
    'getLeaderboard': IDL.Func(
      [IDL.Opt(IDL.Nat)],
      [IDL.Vec(UserProfile)],
      ['query'],
    ),
    'getQuests': IDL.Func([], [IDL.Vec(Quest)], ['query']),
    'getUserProfile': IDL.Func(
      [IDL.Opt(UserId)],
      [IDL.Opt(UserProfile)],
      ['query'],
    ),
    'greet': IDL.Func([IDL.Text], [IDL.Text], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
