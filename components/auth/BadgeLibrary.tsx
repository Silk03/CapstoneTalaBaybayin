import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProgress } from '../../contexts/ProgressContext';
import { Badge } from '../../types/progress';
import '../../global.css';

interface BadgeLibraryProps {
  onBack: () => void;
}

const { width } = Dimensions.get('window');
const badgeSize = (width - 60) / 3; // 3 badges per row with padding

export default function BadgeLibrary({ onBack }: BadgeLibraryProps) {
  const { userProgress } = useProgress();

  // All available badges (synchronized with quiz data)
  const allBadges: Badge[] = [
    {
      id: 'quiz_beginner',
      name: 'Character Scholar',
      description: 'Passed the beginner character recognition quiz',
      icon: '📖',
      color: '#4CAF50',
      category: 'quiz',
      requirement: 'Score 70% or higher on Baybayin Basics Quiz'
    },
    {
      id: 'quiz_intermediate',
      name: 'Script Warrior',
      description: 'Mastered intermediate Baybayin concepts',
      icon: '⚔️',
      color: '#FF9800',
      category: 'quiz',
      requirement: 'Score 75% or higher on Intermediate Baybayin Quiz'
    },
    {
      id: 'quiz_speed',
      name: 'Lightning Reader',
      description: 'Quickly recognized Baybayin characters',
      icon: '⚡',
      color: '#FFEB3B',
      category: 'quiz',
      requirement: 'Score 80% or higher on Quick Character Recognition'
    },
    {
      id: 'quiz_master',
      name: 'Baybayin Master',
      description: 'Achieved mastery of Baybayin script',
      icon: '�',
      color: '#9C27B0',
      category: 'quiz',
      requirement: 'Score 85% or higher on Advanced Baybayin Mastery'
    },
    {
      id: 'vowel_master',
      name: 'Vowel Master',
      description: 'Mastered all three Baybayin vowels',
      icon: '🔤',
      color: '#FFD700',
      category: 'lesson',
      requirement: 'Complete the Introduction to Baybayin Vowels lesson'
    },
    {
      id: 'consonant_apprentice',
      name: 'Consonant Apprentice',
      description: 'Learned your first set of consonants',
      icon: '�',
      color: '#87CEEB',
      category: 'lesson',
      requirement: 'Complete Basic Consonants Part 1'
    },
    {
      id: 'consonant_scholar',
      name: 'Consonant Scholar',
      description: 'Advanced knowledge of consonants',
      icon: '🎓',
      color: '#98FB98',
      category: 'lesson',
      requirement: 'Complete Basic Consonants Part 2'
    },
    {
      id: 'baybayin_warrior',
      name: 'Baybayin Warrior',
      description: 'Completed all basic character lessons',
      icon: '⚔️',
      color: '#FF6347',
      category: 'lesson',
      requirement: 'Complete Basic Consonants Part 3'
    },
    {
      id: 'streak_7',
      name: 'Weekly Warrior',
      description: 'Maintained a 7-day learning streak',
      icon: '⚡',
      color: '#FFC107',
      category: 'streak',
      requirement: 'Learn for 7 consecutive days'
    },
    {
      id: 'streak_30',
      name: 'Monthly Master',
      description: 'Dedicated learner for 30 days straight',
      icon: '🔥',
      color: '#FF5722',
      category: 'streak',
      requirement: 'Learn for 30 consecutive days'
    },
    {
      id: 'cultural_history',
      name: 'Cultural Keeper',
      description: 'Deep appreciation for Baybayin heritage',
      icon: '🏛️',
      color: '#8BC34A',
      category: 'cultural',
      requirement: 'Complete cultural heritage lessons'
    },
    {
      id: 'mastery_perfect',
      name: 'Perfect Scholar',
      description: 'Achieved perfect scores consistently',
      icon: '⭐',
      color: '#FFD700',
      category: 'mastery',
      requirement: 'Get perfect scores on 5 quizzes'
    }
  ];

  const earnedBadgeIds = userProgress?.badges?.map(b => b.id) || [];

  // Debug logging to understand badge issues
  console.log('BadgeLibrary Debug:', {
    userProgressExists: !!userProgress,
    userBadges: userProgress?.badges,
    earnedBadgeIds,
    totalBadgesInLibrary: allBadges.length,
    userProgressData: userProgress
  });

  const categorizedBadges = {
    quiz: allBadges.filter(b => b.category === 'quiz'),
    lesson: allBadges.filter(b => b.category === 'lesson'),
    streak: allBadges.filter(b => b.category === 'streak'),
    cultural: allBadges.filter(b => b.category === 'cultural'),
    mastery: allBadges.filter(b => b.category === 'mastery'),
  };

  const categoryTitles = {
    quiz: 'Mga Quiz Badge',
    lesson: 'Mga Lesson Badge',
    streak: 'Mga Streak Badge',
    cultural: 'Mga Cultural Badge',
    mastery: 'Mga Mastery Badge',
  };

  const earnedCount = earnedBadgeIds.length;
  const totalCount = allBadges.length;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center p-5 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={onBack} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#0B4CA7" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">Badge Library</Text>
      </View>

      {/* Progress Summary */}
      <View className="bg-white mx-5 mt-5 p-4 rounded-xl shadow-sm border border-gray-200">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-lg font-semibold text-gray-800">
            Mga Nakuha na Badge
          </Text>
          <View className="bg-primary px-3 py-1 rounded-full">
            <Text className="text-white text-sm font-medium">
              {earnedCount}/{totalCount}
            </Text>
          </View>
        </View>
        <View className="bg-gray-200 h-2 rounded-full">
          <View
            className="bg-primary h-2 rounded-full"
            style={{ width: `${(earnedCount / totalCount) * 100}%` }}
          />
        </View>
        <Text className="text-xs text-gray-600 mt-1">
          {Math.round((earnedCount / totalCount) * 100)}% na nakumpleto
        </Text>
      </View>

      <ScrollView className="flex-1 px-5 pt-5">
        {Object.entries(categorizedBadges).map(([category, badges]) => (
          <View key={category} className="mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-3">
              {categoryTitles[category as keyof typeof categoryTitles]}
            </Text>
            <View className="flex-row flex-wrap justify-between">
              {badges.map(badge => (
                <View
                  key={badge.id}
                  className="items-center mb-6"
                  style={{ width: badgeSize }}
                >
                  <View
                    className={`w-20 h-20 rounded-full items-center justify-center mb-2 shadow-sm ${
                      earnedBadgeIds.includes(badge.id) ? 'bg-white border-2' : 'bg-gray-200'
                    }`}
                    style={{
                      borderColor: earnedBadgeIds.includes(badge.id) ? badge.color : 'transparent',
                      opacity: earnedBadgeIds.includes(badge.id) ? 1 : 0.5
                    }}
                  >
                    <Text className={`text-3xl ${earnedBadgeIds.includes(badge.id) ? '' : 'opacity-50'}`}>
                      {badge.icon}
                    </Text>
                  </View>
                  
                  <Text
                    className={`text-xs font-semibold text-center leading-4 ${
                      earnedBadgeIds.includes(badge.id) ? 'text-gray-800' : 'text-gray-400'
                    }`}
                    numberOfLines={2}
                  >
                    {badge.name}
                  </Text>
                  
                  {earnedBadgeIds.includes(badge.id) && (
                    <View className="flex-row items-center mt-1">
                      <Ionicons name="checkmark-circle" size={12} color={badge.color} />
                      <Text className="text-xs text-green-600 ml-1">Nakuha</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
