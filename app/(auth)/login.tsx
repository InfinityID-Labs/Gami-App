import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Toast from '@/components/Toast';
import { router } from 'expo-router';
import { Zap, Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react-native';
import { useBlockchain } from '@/contexts/BlockchainContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { connectWallet } = useBlockchain();

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const isMounted = useRef(true);

  React.useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      // Shake animation for validation
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]).start();

      Alert.alert(
        'Missing Information',
        'Please enter both your email and password to continue.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert(
        'Invalid Email',
        'Please enter a valid email address.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    setIsLoading(true);

    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(buttonScaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    // Simulate login process
    setTimeout(() => {
      if (isMounted.current) {
        setIsLoading(false);
        Toast.show({
          type: 'success',
          text1: 'Welcome Back, Champion! 🎉',
          text2: 'Ready to continue your quest for rewards?',
          onHide: () => router.replace('/(tabs)'),
        });
      }
    }, 2000);
  };

  const handleBlockchainLogin = async () => {
    setIsLoading(true);
    const success = await connectWallet();
    if (isMounted.current) {
      setIsLoading(false);
    }

    if (success) {
      Toast.show({
        type: 'success',
        text1: 'Blockchain Connected! ⚡',
        text2: 'Your Internet Identity is now linked. Your rewards are secured on-chain!',
        onHide: () => router.replace('/(tabs)'),
      });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Connection Failed',
        text2: 'Please try connecting your Internet Identity again.'
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Zap size={40} color="#8B5CF6" strokeWidth={3} />
        </View>
        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Ready to level up your life?</Text>
      </View>

      {/* Login Form */}
      <Animated.View style={[styles.formContainer, { transform: [{ translateX: shakeAnim }] }]}>
        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Mail size={20} color="#8B5CF6" />
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Lock size={20} color="#8B5CF6" />
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            {showPassword ? (
              <EyeOff size={20} color="#9CA3AF" />
            ) : (
              <Eye size={20} color="#9CA3AF" />
            )}
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonLoading]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? 'Logging In...' : 'Start Your Quest'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Blockchain Login */}
        <TouchableOpacity
          style={styles.blockchainButton}
          onPress={handleBlockchainLogin}
          disabled={isLoading}
        >
          <Shield size={20} color="#FFFFFF" />
          <Text style={styles.blockchainButtonText}>Connect Internet Identity</Text>
        </TouchableOpacity>

        {/* Sign Up Link */}
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>New to Gami? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
            <Text style={styles.signupLink}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Fun Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>10K+</Text>
          <Text style={styles.statLabel}>Active Players</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>$50K+</Text>
          <Text style={styles.statLabel}>Rewards Earned</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>500+</Text>
          <Text style={styles.statLabel}>Partner Brands</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1E1E3F',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#A78BFA',
    fontFamily: 'Inter-Regular',
  },
  formContainer: {
    paddingHorizontal: 32,
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E3F',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2D2D5F',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 12,
    fontFamily: 'Inter-Regular',
  },
  loginButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonLoading: {
    opacity: 0.7,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#2D2D5F',
  },
  dividerText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginHorizontal: 16,
    fontFamily: 'Inter-Regular',
  },
  blockchainButton: {
    backgroundColor: '#1E1E3F',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#8B5CF6',
    marginBottom: 32,
    gap: 8,
  },
  blockchainButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  signupLink: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#8B5CF6',
    marginBottom: 4,
    fontFamily: 'Inter-Bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#A78BFA',
    fontFamily: 'Inter-Regular',
  },
});