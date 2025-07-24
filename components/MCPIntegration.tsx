import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bot, Zap, Link } from 'lucide-react-native';

interface MCPAgent {
  id: string;
  name: string;
  description: string;
  status: 'connected' | 'disconnected' | 'pending';
  lastActivity?: string;
}

interface MCPIntegrationProps {
  agents: MCPAgent[];
  onConnectAgent: (agentId: string) => void;
  onDisconnectAgent: (agentId: string) => void;
}

export default function MCPIntegration({ 
  agents, 
  onConnectAgent, 
  onDisconnectAgent 
}: MCPIntegrationProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return '#10B981';
      case 'disconnected':
        return '#EF4444';
      case 'pending':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Bot size={24} color="#8B5CF6" />
        <Text style={styles.title}>MCP Agents</Text>
      </View>
      
      <Text style={styles.description}>
        Connect with AI agents to automatically earn rewards from various platforms and activities.
      </Text>

      {agents.map((agent) => (
        <View key={agent.id} style={styles.agentCard}>
          <View style={styles.agentHeader}>
            <View style={styles.agentInfo}>
              <Text style={styles.agentName}>{agent.name}</Text>
              <Text style={styles.agentDescription}>{agent.description}</Text>
              {agent.lastActivity && (
                <Text style={styles.lastActivity}>Last active: {agent.lastActivity}</Text>
              )}
            </View>
            
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: getStatusColor(agent.status) },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(agent.status) },
                ]}
              >
                {agent.status}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.actionButton,
              agent.status === 'connected' && styles.disconnectButton,
            ]}
            onPress={() => 
              agent.status === 'connected' 
                ? onDisconnectAgent(agent.id)
                : onConnectAgent(agent.id)
            }
          >
            <Link size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>
              {agent.status === 'connected' ? 'Disconnect' : 'Connect'}
            </Text>
          </TouchableOpacity>
        </View>
      ))}

      <View style={styles.infoCard}>
        <Zap size={20} color="#F59E0B" />
        <Text style={styles.infoText}>
          MCP agents automatically track your activities and generate rewards based on your engagement with connected platforms.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    margin: 20,
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
    marginBottom: 12,
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: 'Inter-Bold',
  },
  description: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 20,
    fontFamily: 'Inter-Regular',
  },
  agentCard: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  agentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  agentInfo: {
    flex: 1,
    marginRight: 12,
  },
  agentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
    fontFamily: 'Inter-SemiBold',
  },
  agentDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 4,
    fontFamily: 'Inter-Regular',
  },
  lastActivity: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
    fontFamily: 'Inter-SemiBold',
  },
  actionButton: {
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 4,
  },
  disconnectButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  infoCard: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
    lineHeight: 16,
    fontFamily: 'Inter-Regular',
  },
});