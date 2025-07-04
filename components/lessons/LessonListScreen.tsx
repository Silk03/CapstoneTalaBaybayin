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
        style={[styles.lessonCard, isCompleted && styles.completedCard]}
        onPress={() => onSelectLesson(item)}
      >
        <View style={styles.lessonHeader}>
          <View style={styles.lessonInfo}>
            <Text style={styles.lessonTitle}>{item.title}</Text>
            <Text style={styles.lessonDescription}>{item.description}</Text>
            {isCompleted && lessonProgress && (
              <Text style={styles.scoreText}>
                Score: {Math.round(lessonProgress.score)} points
              </Text>
            )}
          </View>
          
          <View style={styles.lessonMeta}>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) }]}>
              <Ionicons 
                name={getDifficultyIcon(item.difficulty) as any} 
                size={16} 
                color="white" 
              />
              <Text style={styles.difficultyText}>
                {item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1)}
              </Text>
            </View>
            
            {isCompleted && (
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            )}
          </View>
        </View>
        
        <View style={styles.lessonFooter}>
          <Text style={styles.characterCount}>
            {item.characters.length} characters
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#8B4513" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Baybayin Lessons</Text>
        <Text style={styles.headerSubtitle}>Master the ancient Filipino script</Text>
      </View>

      <FlatList
        data={lessons}
        renderItem={renderLessonItem}
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
    fontSize: 15,
    color: '#f0d0b4',
  },
  listContainer: {
    padding: 15,
  },
  lessonCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
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
  completedCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  lessonInfo: {
    flex: 1,
    marginRight: 12,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  lessonDescription: {
    fontSize: 14,
    color: '#777',
    lineHeight: 20,
  },
  scoreText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    marginTop: 4,
  },
  lessonMeta: {
    alignItems: 'flex-end',
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  difficultyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  lessonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  characterCount: {
    fontSize: 14,
    color: '#777',
    fontWeight: '500',
  },
});
