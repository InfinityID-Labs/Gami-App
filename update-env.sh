#!/bin/bash

# Script para atualizar variáveis de ambiente com IDs dos canisters
echo "🔄 Atualizando variáveis de ambiente..."

# Verifica se o DFX está rodando
if ! dfx ping; then
  echo "❌ DFX não está rodando. Execute 'dfx start' primeiro."
  exit 1
fi

# Função para obter ID do canister
get_canister_id() {
  local canister_name=$1
  local canister_id=$(dfx canister id $canister_name 2>/dev/null)
  if [ $? -eq 0 ]; then
    echo $canister_id
  else
    echo "Erro ao obter ID do canister $canister_name" >&2
    return 1
  fi
}

# Cria/atualiza arquivo .env
cat > .env << EOF
# Variáveis de ambiente geradas automaticamente
DFX_VERSION=$(dfx --version | cut -d' ' -f2)
DFX_NETWORK=local

# IDs dos Canisters
CANISTER_ID_GAMI_BACKEND=$(get_canister_id gami_backend)
CANISTER_ID_GAMI_FRONTEND=$(get_canister_id gami_frontend)
CANISTER_ID_USER_PROFILES=$(get_canister_id user_profiles)
CANISTER_ID_TOKEN_LEDGER=$(get_canister_id token_ledger)
CANISTER_ID_QUEST_REWARDS=$(get_canister_id quest_rewards)
CANISTER_ID_LEADERBOARD=$(get_canister_id leaderboard)

# Para compatibilidade
CANISTER_ID=\$CANISTER_ID_GAMI_BACKEND
CANISTER_CANDID_PATH=src/declarations/gami_backend/gami_backend.did

# URLs dos Canisters (local)
REACT_APP_GAMI_BACKEND_CANISTER_ID=\$CANISTER_ID_GAMI_BACKEND
REACT_APP_DFX_NETWORK=local
REACT_APP_IC_HOST=http://localhost:4943

# Internet Identity
REACT_APP_INTERNET_IDENTITY_URL=http://localhost:4943/?canister=rdmx6-jaaaa-aaaaa-aaadq-cai
EOF

echo "✅ Arquivo .env atualizado com sucesso!"
echo "📋 IDs dos Canisters:"
echo "   - gami_backend: $(get_canister_id gami_backend)"
echo "   - gami_frontend: $(get_canister_id gami_frontend)" 
echo "   - user_profiles: $(get_canister_id user_profiles)"
echo "   - token_ledger: $(get_canister_id token_ledger)"
echo "   - quest_rewards: $(get_canister_id quest_rewards)"
echo "   - leaderboard: $(get_canister_id leaderboard)"
