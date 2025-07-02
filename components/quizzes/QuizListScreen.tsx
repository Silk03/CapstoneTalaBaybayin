import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
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
        style={[
          styles.quizCard,
          !isUnlocked && styles.lockedCard
        ]}
        onPress={() => isUnlocked && onSelectQuiz(item)}
        disabled={!isUnlocked}
      >
        <View style={styles.quizHeader}>
          <View style={styles.quizInfo}>
            <Text style={[
              styles.quizTitle,
              !isUnlocked && styles.lockedText
            ]}>
              {item.title}
            </Text>
            <Text style={[
              styles.quizDescription,
              !isUnlocked && styles.lockedText
            ]}>
              {item.description}
            </Text>
          </View>
          
          <View style={styles.quizMeta}>
            {!isUnlocked ? (
              <Ionicons name="lock-closed" size={24} color="#ccc" />
            ) : (
              <View style={[
                styles.difficultyBadge,
                { backgroundColor: getDifficultyColor(item.difficulty) }
              ]}>
                <Ionicons 
                  name={getDifficultyIcon(item.difficulty) as any} 
                  size={16} 
                  color="white" 
                />
                <Text style={styles.difficultyText}>
                  {item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1)}
                </Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.quizDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="help-circle-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{item.questions.length} questions</Text>
          </View>
          
          {item.timeLimit && (
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.detailText}>
                {Math.floor(item.timeLimit / 60)}:{(item.timeLimit % 60).toString().padStart(2, '0')} min
              </Text>
            </View>
          )}
          
          <View style={styles.detailItem}>
            <Ionicons name="checkmark-circle-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{item.passingScore}% to pass</Text>
          </View>
        </View>

        {!isUnlocked && item.prerequisiteLessons && (
          <View style={styles.prerequisiteInfo}>
            <Text style={styles.prerequisiteText}>
              Complete lessons {item.prerequisiteLessons.join(', ')} to unlock
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Baybayin Quizzes</Text>
        <Text style={styles.headerSubtitle}>Test your knowledge and earn points!</Text>
      </View>

      <FlatList
        data={quizzes}
        renderItem={renderQuizItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#8B4513',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#f0d0b4',
  },
  listContainer: {
    padding: 16,
  },
  quizCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  lockedCard: {
    backgroundColor: '#f8f8f8',
    opacity: 0.7,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  quizInfo: {
    flex: 1,
    marginRight: 12,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  quizDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  lockedText: {
    color: '#aaa',
  },
  quizMeta: {
    alignItems: 'flex-end',
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  quizDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  prerequisiteInfo: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#fff3cd',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#ffc107',
  },
  prerequisiteText: {
    fontSize: 12,
    color: '#856404',
    fontStyle: 'italic',
  },
});
