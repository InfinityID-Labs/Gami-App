import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Wallet, Shield, Coins, ExternalLink } from 'lucide-react-native';
import { useBlockchain } from '@/contexts/BlockchainContext';

export default function BlockchainIntegration() {
  const { wallet, isConnecting, connectWallet, disconnectWallet, refreshBalance } = useBlockchain();

  const handleConnect = async () => {
    const success = await connectWallet();
    if (success) {
      Alert.alert('Success', 'Internet Identity connected successfully!');
    } else {
      Alert.alert('Error', 'Failed to connect Internet Identity');
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    Alert.alert('Disconnected', 'Wallet has been disconnected.');
  };

  const handleRefresh = async () => {
    await refreshBalance();
    Alert.alert('Refreshed', 'Wallet balance updated');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Wallet size={24} color="#8B5CF6" />
        <Text style={styles.title}>Blockchain Wallet</Text>
      </View>
      {!wallet ? (
        <View style={styles.connectSection}>
          <Shield size={48} color="#8B5CF6" />
          <Text style={styles.connectTitle}>Connect Your Internet Identity</Text>
          <Text style={styles.connectDescription}>
            Securely store your rewards on the Internet Computer blockchain. Your tokens will be truly owned by you.
          </Text>
          <TouchableOpacity
            style={[styles.connectButton, isConnecting && styles.connectingButton]}
            onPress={handleConnect}
            disabled={isConnecting}
          >
            <Text style={styles.connectButtonText}>
              {isConnecting ? 'Connecting...' : 'Connect Internet Identity'}
            </Text>
          </TouchableOpacity>
          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>Benefits:</Text>
            <Text style={styles.benefitItem}>• True ownership of rewards</Text>
            <Text style={styles.benefitItem}>• Cross-platform compatibility</Text>
            <Text style={styles.benefitItem}>• Secure & decentralized</Text>
            <Text style={styles.benefitItem}>• Trade tokens on DEX</Text>
          </View>
        </View>
      ) : (
        <View style={styles.walletSection}>
          <View style={styles.walletInfo}>
            <Text style={styles.walletLabel}>Wallet Address</Text>
            <Text style={styles.walletAddress}>{wallet.principal}</Text>
            <Text style={styles.networkLabel}>Internet Computer Network</Text>
          </View>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Total Portfolio Value</Text>
            <Text style={styles.balanceAmount}>${wallet.balance.toFixed(2)}</Text>
          </View>
          <View style={styles.tokensSection}>
            <Text style={styles.tokensTitle}>Reward Tokens</Text>
            {wallet.tokens.map((token) => (
              <View key={token.symbol} style={styles.tokenItem}>
                <View style={styles.tokenInfo}>
                  <Text style={styles.tokenSymbol}>{token.symbol}</Text>
                  <Text style={styles.tokenName}>{token.name}</Text>
                </View>
                <View style={styles.tokenBalance}>
                  <Text style={styles.tokenAmount}>{token.balance.toFixed(2)}</Text>
                  <Text style={styles.tokenValue}>
                    ${(token.balance * token.value).toFixed(2)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={handleRefresh}>
              <Coins size={16} color="#8B5CF6" />
              <Text style={styles.actionButtonText}>Refresh</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <ExternalLink size={16} color="#8B5CF6" />
              <Text style={styles.actionButtonText}>View on Explorer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.disconnectButton}
              onPress={handleDisconnect}
            >
              <Text style={styles.disconnectButtonText}>Disconnect</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    margin: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8FAFC',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: 'Inter-Bold',
  },
  connectSection: {
    padding: 20,
    alignItems: 'center',
  },
  connectTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'Inter-Bold',
  },
  connectDescription: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    fontFamily: 'Inter-Regular',
  },
  connectButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 24,
  },
  connectingButton: {
    opacity: 0.7,
  },
  connectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  benefitsContainer: {
    alignSelf: 'stretch',
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
    fontFamily: 'Inter-SemiBold',
  },
  benefitItem: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
  },
  walletSection: {
    padding: 20,
  },
  walletInfo: {
    marginBottom: 20,
  },
  walletLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
    fontFamily: 'Inter-Medium',
  },
  walletAddress: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: 'Inter-SemiBold',
  },
  networkLabel: {
    fontSize: 12,
    color: '#8B5CF6',
    marginTop: 4,
    fontFamily: 'Inter-Medium',
  },
  balanceCard: {
    backgroundColor: '#8B5CF6',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#C4B5FD',
    marginBottom: 4,
    fontFamily: 'Inter-Medium',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  tokensSection: {
    marginBottom: 20,
  },
  tokensTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
    fontFamily: 'Inter-SemiBold',
  },
  tokenItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tokenInfo: {
    flex: 1,
  },
  tokenSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: 'Inter-SemiBold',
  },
  tokenName: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
  },
  tokenBalance: {
    alignItems: 'flex-end',
  },
  tokenAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: 'Inter-SemiBold',
  },
  tokenValue: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
    fontFamily: 'Inter-SemiBold',
  },
  disconnectButton: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  disconnectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
    fontFamily: 'Inter-SemiBold',
  },
});