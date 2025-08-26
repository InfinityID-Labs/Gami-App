# Documentação GamiBackend (ICP)

## Endpoints (Funções públicas)

### Usuário
- `createUserProfile(username: Text) -> Result<UserProfile, Text>`
  - Cria um perfil para o principal autenticado. Username 3-20 caracteres, sem espaços.
- `getUserProfile(userId: ?Principal) -> ?UserProfile`
  - Consulta perfil. Se não passar userId, retorna do chamador.
- `updateUserXP(xpGain: Nat) -> Result<UserProfile, Text>`
  - Adiciona XP ao usuário autenticado.
- `getUserCompletions(userId: ?Principal) -> [QuestCompletion]`
  - Lista missões concluídas pelo usuário (ou chamador).

### Quests
- `createQuest(id, title, description, category, xpReward, moneyReward, timeLimit, difficulty, sponsor) -> Result<Quest, Text>`
  - Cria uma nova quest. Validações de tamanho e limites.
- `getQuests() -> [Quest]`
  - Lista todas as quests.
- `getActiveQuests() -> [Quest]`
  - Lista apenas quests ativas.
- `completeQuest(questId) -> Result<QuestCompletion, Text>`
  - Marca quest como concluída pelo usuário autenticado. Gera XP e recompensa (token) se houver.

### Leaderboard
- `getLeaderboard(limit: ?Nat) -> [UserProfile]`
  - Retorna ranking dos usuários por XP.

### Admin (apenas admin do canister)
- `pauseQuest(questId) -> Result<Quest, Text>`
  - Pausa quest (torna inativa).
- `reactivateQuest(questId) -> Result<Quest, Text>`
  - Reativa quest.
- `removeUser(userId) -> Result<(), Text>`
  - Remove perfil de usuário.
- `editQuest(questId, ...campos) -> Result<Quest, Text>`
  - Edita campos de uma quest.

### Auditoria/Eventos
- `getEventLog() -> [Text]`
  - Retorna log de eventos do canister (criação, conclusão, admin, etc).

### Healthcheck
- `greet(name: Text) -> Text`
  - Teste simples de funcionamento.

## Fluxos principais

### 1. Cadastro e login
- Usuário acessa frontend, autentica via Internet Identity.
- Chama `createUserProfile` se for novo.
- Consulta perfil com `getUserProfile`.

### 2. Listar e participar de quests
- Frontend chama `getActiveQuests`.
- Usuário escolhe e chama `completeQuest(questId)`.
- Se sucesso, recebe XP e (se houver) token GAMI via TokenLedger.

### 3. Ranking
- Frontend chama `getLeaderboard` para mostrar ranking global.

### 4. Administração
- Admin (primeiro principal do deploy) pode pausar, editar, remover quests/usuários.
- Todas ações admin são logadas em `getEventLog`.

### 5. Auditoria
- Qualquer usuário pode consultar `getEventLog` para ver histórico de ações relevantes.

## Observações
- Todas as funções que alteram estado usam autenticação via `msg.caller`.
- Recompensas em token são distribuídas via canister TokenLedger.
- Validações de input e proteção contra flood/duplicidade implementadas.
- Para integração frontend, use @dfinity/agent e candid.
