import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Zap, Trophy, Target, Star, Users, Gift } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const statsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start all animations immediately
    startAnimations();

    // Navigate to tutorial after animations complete
    const timer = setTimeout(() => {
      router.replace('/(auth)/tutorial');
    }, 4500); // Increased time to see full animation

    return () => clearTimeout(timer);
  }, []);

  const startAnimations = () => {
    // Main logo animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Stats animation
    Animated.timing(statsAnim, {
      toValue: 1,
      duration: 1500,
      delay: 500,
      useNativeDriver: true,
    }).start();

    // Continuous rotation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();

    // Sparkle animations
    sparkleAnims.forEach((anim, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 200),
          Animated.timing(anim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <View style={styles.backgroundGradient} />

      {/* Sparkles */}
      <Animated.View
        style={[
          styles.sparkle,
          styles.sparkle1,
          { opacity: sparkleAnims[0] },
        ]}
      >
        <Star size={16} color="#FFD700" />
      </Animated.View>
      <Animated.View
        style={[
          styles.sparkle,
          styles.sparkle2,
          { opacity: sparkleAnims[1] },
        ]}
      >
        <Star size={12} color="#FF6B9D" />
      </Animated.View>
      <Animated.View
        style={[
          styles.sparkle,
          styles.sparkle3,
          { opacity: sparkleAnims[2] },
        ]}
      >
        <Star size={20} color="#4ECDC4" />
      </Animated.View>
      <Animated.View
        style={[
          styles.sparkle,
          styles.sparkle4,
          { opacity: sparkleAnims[3] },
        ]}
      >
        <Star size={14} color="#45B7D1" />
      </Animated.View>

      {/* Main Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { rotate: spin },
            ],
          },
        ]}
      >
        <View style={styles.logoBackground}>
          <Zap size={60} color="#FFFFFF" strokeWidth={3} />
        </View>
      </Animated.View>

      {/* App Name */}
      <Animated.View
        style={[
          styles.textContainer,
          { opacity: fadeAnim },
        ]}
      >
        <Text style={styles.appName}>Gami</Text>
        <Text style={styles.tagline}>Level Up Your Life</Text>
        <Text style={styles.description}>
          Turn everyday activities into rewarding adventures
        </Text>
      </Animated.View>

      {/* Platform Stats */}
      <Animated.View
        style={[
          styles.statsContainer,
          { 
            opacity: statsAnim,
            transform: [{
              translateY: statsAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            }],
          },
        ]}
      >
        <View style={styles.statItem}>
          <Users size={20} color="#8B5CF6" />
          <Text style={styles.statNumber}>50K+</Text>
          <Text style={styles.statLabel}>Active Players</Text>
        </View>
        <View style={styles.statItem}>
          <Gift size={20} color="#10B981" />
          <Text style={styles.statNumber}>$2M+</Text>
          <Text style={styles.statLabel}>Rewards Earned</Text>
        </View>
        <View style={styles.statItem}>
          <Trophy size={20} color="#F59E0B" />
          <Text style={styles.statNumber}>1000+</Text>
          <Text style={styles.statLabel}>Daily Quests</Text>
        </View>
      </Animated.View>

      {/* Loading Indicator */}
      <Animated.View
        style={[
          styles.loadingContainer,
          { opacity: fadeAnim },
        ]}
      >
        <View style={styles.loadingBar}>
          <View style={[styles.loadingFill, { width: '75%' }]} />
        </View>
        <Text style={styles.loadingText}>Preparing your adventure...</Text>
      </Animated.View>

      {/* Features Preview */}
      <Animated.View
        style={[
          styles.featuresPreview,
          { 
            opacity: statsAnim,
            transform: [{
              translateY: statsAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            }],
          },
        ]}
      >
        <View style={styles.featureRow}>
          <Target size={16} color="#8B5CF6" />
          <Text style={styles.featureText}>Complete daily quests</Text>
        </View>
        <View style={styles.featureRow}>
          <Zap size={16} color="#F59E0B" />
          <Text style={styles.featureText}>Earn real rewards</Text>
        </View>
        <View style={styles.featureRow}>
          <Trophy size={16} color="#10B981" />
          <Text style={styles.featureText}>Compete globally</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F0F23',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0F0F23',
  },
  sparkle: {
    position: 'absolute',
  },
  sparkle1: {
    top: height * 0.2,
    left: width * 0.2,
  },
  sparkle2: {
    top: height * 0.3,
    right: width * 0.15,
  },
  sparkle3: {
    bottom: height * 0.3,
    left: width * 0.1,
  },
  sparkle4: {
    bottom: height * 0.2,
    right: width * 0.25,
  },
  logoContainer: {
    marginBottom: 30,
  },
  logoBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appName: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
    textShadowColor: '#8B5CF6',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  tagline: {
    fontSize: 18,
    color: '#A78BFA',
    fontFamily: 'Inter-Medium',
    letterSpacing: 1,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 40,
    marginBottom: 40,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
    fontFamily: 'Inter-Bold',
  },
  statLabel: {
    fontSize: 11,
    color: '#A78BFA',
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  featuresPreview: {
    alignItems: 'center',
    marginBottom: 40,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  featureText: {
    fontSize: 12,
    color: '#C4B5FD',
    fontFamily: 'Inter-Regular',
  },
  loadingContainer: {
    alignItems: 'center',
    position: 'absolute',
    bottom: 80,
    left: 40,
    right: 40,
  },
  loadingBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#1E1E3F',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 16,
  },
  loadingFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
  },
  loadingText: {
    fontSize: 14,
    color: '#A78BFA',
    fontFamily: 'Inter-Regular',
  },
});