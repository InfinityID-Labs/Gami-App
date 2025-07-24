import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import {
  Target,
  Trophy,
  Zap,
  Users,
  Coins,
  Shield,
  ChevronRight,
  ChevronLeft,
  Star,
  Gift,
  MapPin,
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
  stats: { label: string; value: string }[];
}

export default function TutorialScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Reset animations when component mounts
    fadeAnim.setValue(1);
    slideAnim.setValue(0);
  }, []);

  const tutorialSteps: TutorialStep[] = [
    {
      id: 0,
      title: 'Complete Quests',
      description: 'Transform your daily routine into exciting challenges that reward you for staying active and productive.',
      icon: <Target size={80} color="#FFFFFF" strokeWidth={2} />,
      color: '#10B981',
      features: [
        'Fitness & wellness challenges',
        'Productivity & focus tasks',
        'Local business exploration',
        'Social community activities',
      ],
      stats: [
        { label: 'Daily Quests', value: '50+' },
        { label: 'Categories', value: '12' },
        { label: 'Avg Reward', value: '$8' },
      ],
    },
    {
      id: 1,
      title: 'Earn Real Rewards',
      description: 'Get actual cash, gift cards, discounts, and exclusive perks from top brands for completing activities you already do.',
      icon: <Gift size={80} color="#FFFFFF" strokeWidth={2} />,
      color: '#F59E0B',
      features: [
        'Instant cash payouts via PayPal',
        'Gift cards from 500+ retailers',
        'Exclusive brand discounts',
        'Cryptocurrency rewards',
      ],
      stats: [
        { label: 'Total Paid', value: '$2.1M' },
        { label: 'Avg Monthly', value: '$47' },
        { label: 'Top Earner', value: '$1,200' },
      ],
    },
    {
      id: 2,
      title: 'Compete & Connect',
      description: 'Join a global community of achievers. Compete on leaderboards, form teams, and celebrate victories together.',
      icon: <Trophy size={80} color="#FFFFFF" strokeWidth={2} />,
      color: '#8B5CF6',
      features: [
        'Global & local leaderboards',
        'Team challenges & competitions',
        'Achievement badges & titles',
        'Social sharing & celebrations',
      ],
      stats: [
        { label: 'Active Players', value: '127K' },
        { label: 'Teams Formed', value: '8,500' },
        { label: 'Competitions', value: '200+' },
      ],
    },
    {
      id: 3,
      title: 'Blockchain Security',
      description: 'Your rewards are secured on the Internet Computer blockchain, giving you true ownership and cross-platform access.',
      icon: <Shield size={80} color="#FFFFFF" strokeWidth={2} />,
      color: '#EF4444',
      features: [
        'True ownership of digital assets',
        'Decentralized & tamper-proof',
        'Cross-platform compatibility',
        'Trade tokens on DEX platforms',
      ],
      stats: [
        { label: 'Tokens Issued', value: '50M+' },
        { label: 'Transactions', value: '2.8M' },
        { label: 'Security', value: '100%' },
      ],
    },
  ];

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentStep(currentStep + 1);
        slideAnim.setValue(50);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else {
      router.replace('/(auth)/login');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentStep(currentStep - 1);
        slideAnim.setValue(-50);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  };

  const handleSkip = () => {
    router.replace('/(auth)/login');
  };

  const currentTutorial = tutorialSteps[currentStep];

  return (
    <View style={styles.container}>
      {/* Background */}
      <Animated.View 
        style={[
          styles.background, 
          { backgroundColor: currentTutorial.color + '15' }
        ]} 
      />

      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Content */}
      <Animated.View
        style={[
          styles.stepContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Icon */}
        <View style={styles.iconContainer}>
          <View style={[styles.iconBackground, { backgroundColor: currentTutorial.color }]}>
            {currentTutorial.icon}
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>{currentTutorial.title}</Text>

        {/* Description */}
        <Text style={styles.description}>{currentTutorial.description}</Text>

        {/* Stats */}
        <View style={styles.statsContainer}>
          {currentTutorial.stats.map((stat, statIndex) => (
            <View key={statIndex} style={styles.statCard}>
              <Text style={[styles.statValue, { color: currentTutorial.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          {currentTutorial.features.map((feature, featureIndex) => (
            <View key={featureIndex} style={styles.featureItem}>
              <View style={[styles.featureDot, { backgroundColor: currentTutorial.color }]} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Progress Indicators */}
      <View style={styles.progressContainer}>
        {tutorialSteps.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.progressDot,
              {
                backgroundColor: index === currentStep ? currentTutorial.color : '#FFFFFF40',
              },
              index === currentStep && styles.progressDotActive,
            ]}
            onPress={() => {
              setCurrentStep(index);
              scrollViewRef.current?.scrollTo({
                x: index * width,
                animated: true,
              });
            }}
          />
        ))}
      </View>

      {/* Navigation */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[
            styles.navButton,
            styles.previousButton,
            currentStep === 0 && styles.navButtonDisabled,
          ]}
          onPress={handlePrevious}
          disabled={currentStep === 0}
        >
          <ChevronLeft size={24} color={currentStep === 0 ? '#FFFFFF40' : '#FFFFFF'} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton, 
            styles.nextButton, 
            { backgroundColor: currentTutorial.color },
            currentStep === tutorialSteps.length - 1 && styles.getStartedButton,
          ]}
          onPress={handleNext}
        >
          {currentStep === tutorialSteps.length - 1 ? (
            <Text style={styles.nextButtonText}>Get Started</Text>
          ) : (
            <ChevronRight size={24} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF20',
    borderRadius: 20,
  },
  skipText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 30,
  },
  iconBackground: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Inter-Bold',
  },
  description: {
    fontSize: 16,
    color: '#A78BFA',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
    fontFamily: 'Inter-Regular',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF10',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 80,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    fontFamily: 'Inter-Bold',
  },
  statLabel: {
    fontSize: 11,
    color: '#C4B5FD',
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  featuresContainer: {
    alignSelf: 'stretch',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 16,
  },
  featureText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    gap: 8,
  },
  progressDot: {
    height: 8,
    width: 8,
    borderRadius: 4,
  },
  progressDotActive: {
    width: 24,
    height: 8,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  navButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previousButton: {
    backgroundColor: '#FFFFFF20',
  },
  nextButton: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  getStartedButton: {
    paddingHorizontal: 24,
    width: 140,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
});