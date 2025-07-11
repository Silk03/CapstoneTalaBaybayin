import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { lessons } from '../../data/lessons';
import { Lesson, DifficultyLevel } from '../../types/lesson';
import { useProgress } from '../../contexts/ProgressContext';

interface LessonListScreenProps {
  onSelectLesson: (lesson: Lesson) => void;
}

export default function LessonListScreen({ onSelectLesson }: LessonListScreenProps) {
  const { isLessonCompleted, getLessonProgress, userProgress } = useProgress();

  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case DifficultyLevel.BEGINNER:
        return '#4CAF50';
      case DifficultyLevel.INTERMEDIATE:
        return '#FF9800';
      case DifficultyLevel.ADVANCED:
        return '#F44336';
      default:
        return '#757575';
    }
  };

  const getDifficultyIcon = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case DifficultyLevel.BEGINNER:
        return 'leaf-outline';
      case DifficultyLevel.INTERMEDIATE:
        return 'star-half-outline';
      case DifficultyLevel.ADVANCED:
        return 'flame-outline';
      default:
        return 'help-outline';
    }
  };

  const renderLessonItem = ({ item }: { item: Lesson }) => {
    const isCompleted = isLessonCompleted(item.id);
    const lessonProgress = getLessonProgress(item.id);
    
    // Debug for specific lessons that aren't working
    if (item.id === 'lesson_2' || item.id === 'lesson_3' || item.id === 'lesson_4') {
      console.log(`=== LESSON ${item.id} DEBUG ===`);
      console.log('Lesson title:', item.title);
      console.log('Is completed:', isCompleted);
      console.log('Lesson progress:', lessonProgress);
      console.log('User completed lessons:', userProgress?.completedLessons);
      console.log('User lesson scores:', userProgress?.lessonScores);
      console.log('=== END LESSON DEBUG ===');
    }
    
    return (
      <TouchableOpacity
        className={`bg-white rounded-xl p-4 mb-3 shadow-sm border ${isCompleted ? 'border-l-4 border-green-500 bg-green-50' : 'border-secondary-200'}`}
        onPress={() => onSelectLesson(item)}
      >
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1 mr-3">
            <Text className="text-lg font-bold text-secondary-700 mb-1">{item.title}</Text>
            <Text className="text-sm text-secondary-600 leading-5">{item.description}</Text>
            {isCompleted && lessonProgress && (
              <Text className="text-xs text-green-600 font-semibold mt-1">
                Score: {Math.round(lessonProgress.score)} points
              </Text>
            )}
          </View>
          
          <View className="items-end">
            <View className="flex-row items-center px-2 py-1 rounded-full mb-2" style={{ backgroundColor: getDifficultyColor(item.difficulty) }}>
              <Ionicons 
                name={getDifficultyIcon(item.difficulty) as any} 
                size={16} 
                color="white" 
              />
              <Text className="text-white text-xs font-bold ml-1">
                {item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1)}
              </Text>
            </View>
            
            {isCompleted && (
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            )}
          </View>
        </View>
        
        <View className="flex-row justify-between items-center pt-3 border-t border-secondary-200">
          <Text className="text-sm text-secondary-600 font-medium">
            {item.characters.length} characters
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#0B4CA7" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="p-5 bg-primary">
        <Text className="text-3xl font-bold text-white mb-1">Baybayin Lessons</Text>
        <Text className="text-base text-orange-100">Master the ancient Filipino script</Text>
      </View>

      <FlatList
        data={lessons}
        renderItem={renderLessonItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 15 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
