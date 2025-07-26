export const idlFactory = ({ IDL }) => {
  const UserId = IDL.Principal;
  const UserPreferences = IDL.Record({
    'theme' : IDL.Text,
    'notifications' : IDL.Bool,
    'language' : IDL.Text,
    'privacy' : IDL.Bool,
  });
  const UserProfile = IDL.Record({
    'id' : UserId,
    'xp' : IDL.Nat,
    'streak' : IDL.Nat,
    'username' : IDL.Text,
    'joinDate' : IDL.Int,
    'totalRewards' : IDL.Float64,
    'email' : IDL.Opt(IDL.Text),
    'level' : IDL.Nat,
    'preferences' : UserPreferences,
    'achievements' : IDL.Vec(IDL.Text),
    'lastActive' : IDL.Int,
  });
  const Result = IDL.Variant({ 'ok' : UserProfile, 'err' : IDL.Text });
  const Achievement = IDL.Record({
    'id' : IDL.Text,
    'title' : IDL.Text,
    'unlockedAt' : IDL.Opt(IDL.Int),
    'unlocked' : IDL.Bool,
    'description' : IDL.Text,
    'requirement' : IDL.Nat,
    'category' : IDL.Text,
  });
  const Result_1 = IDL.Variant({ 'ok' : Achievement, 'err' : IDL.Text });
  return IDL.Service({
    'createProfile' : IDL.Func([IDL.Text, IDL.Opt(IDL.Text)], [Result], []),
    'getAllAchievements' : IDL.Func([], [IDL.Vec(Achievement)], ['query']),
    'getGlobalStats' : IDL.Func(
        [],
        [
          IDL.Record({
            'totalXP' : IDL.Nat,
            'totalUsers' : IDL.Nat,
            'averageLevel' : IDL.Float64,
          }),
        ],
        ['query'],
      ),
    'getProfile' : IDL.Func(
        [IDL.Opt(UserId)],
        [IDL.Opt(UserProfile)],
        ['query'],
      ),
    'getUserAchievements' : IDL.Func(
        [UserId],
        [IDL.Vec(Achievement)],
        ['query'],
      ),
    'greet' : IDL.Func([IDL.Text], [IDL.Text], ['query']),
    'initializeAchievements' : IDL.Func([], [], []),
    'unlockAchievement' : IDL.Func([UserId, IDL.Text], [Result_1], []),
    'updateProfile' : IDL.Func(
        [IDL.Opt(IDL.Text), IDL.Opt(IDL.Text), IDL.Opt(UserPreferences)],
        [Result],
        [],
      ),
    'updateXP' : IDL.Func([IDL.Nat], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
