import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { quizzes } from '../../data/quizzes';
import { Quiz, DifficultyLevel } from '../../types/quiz';
import { useProgress } from '../../contexts/ProgressContext';

interface QuizListScreenProps {
  onSelectQuiz: (quiz: Quiz) => void;
}

export default function QuizListScreen({ onSelectQuiz }: QuizListScreenProps) {
  const { userProgress } = useProgress();

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

  const isQuizUnlocked = (quiz: Quiz): boolean => {
    if (!quiz.prerequisiteLessons || !userProgress) return true;
    
    return quiz.prerequisiteLessons.every(lessonId => 
      userProgress.completedLessons.includes(lessonId)
    );
  };

  const renderQuizItem = ({ item }: { item: Quiz }) => {
    const isUnlocked = isQuizUnlocked(item);
    
    return (
      <TouchableOpacity
        className={`bg-white rounded-xl p-4 mb-4 shadow-sm ${!isUnlocked ? 'opacity-50' : ''}`}
        onPress={() => isUnlocked && onSelectQuiz(item)}
        disabled={!isUnlocked}
      >
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1 mr-3">
            <Text className={`text-lg font-bold mb-1 ${!isUnlocked ? 'text-gray-400' : 'text-gray-800'}`}>
              {item.title}
            </Text>
            <Text className={`text-sm leading-5 ${!isUnlocked ? 'text-gray-400' : 'text-gray-600'}`}>
              {item.description}
            </Text>
          </View>
          
          <View className="items-end">
            {!isUnlocked ? (
              <Ionicons name="lock-closed" size={24} color="#ccc" />
            ) : (
              <View className="flex-row items-center px-2 py-1 rounded-full" style={{ backgroundColor: getDifficultyColor(item.difficulty) }}>
                <Ionicons 
                  name={getDifficultyIcon(item.difficulty) as any} 
                  size={16} 
                  color="white" 
                />
                <Text className="text-white text-xs font-bold ml-1">
                  {item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1)}
                </Text>
              </View>
            )}
          </View>
        </View>
        
        <View className="flex-row justify-between items-center mb-2">
          <View className="flex-row items-center">
            <Ionicons name="help-circle-outline" size={16} color="#777" />
            <Text className="text-sm text-gray-600 ml-1">{item.questions.length} questions</Text>
          </View>
          
          {item.timeLimit && (
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={16} color="#777" />
              <Text className="text-sm text-gray-600 ml-1">
                {Math.floor(item.timeLimit / 60)}:{(item.timeLimit % 60).toString().padStart(2, '0')} min
              </Text>
            </View>
          )}
          
          <View className="flex-row items-center">
            <Ionicons name="checkmark-circle-outline" size={16} color="#777" />
            <Text className="text-sm text-gray-600 ml-1">{item.passingScore}% to pass</Text>
          </View>
        </View>

        {!isUnlocked && item.prerequisiteLessons && (
          <View className="bg-orange-50 p-3 rounded-lg mt-2">
            <Text className="text-sm text-orange-600 text-center">
              Complete lessons {item.prerequisiteLessons.join(', ')} to unlock
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="p-5 bg-primary">
        <Text className="text-3xl font-bold text-white mb-1">Baybayin Quizzes</Text>
        <Text className="text-base text-orange-100">Test your knowledge and earn points!</Text>
      </View>

      <FlatList
        data={quizzes}
        renderItem={renderQuizItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 15 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
