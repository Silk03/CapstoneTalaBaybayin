import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Lesson, BaybayinCharacter } from '../../types/lesson';
import { useProgress } from '../../contexts/ProgressContext';

interface LessonScreenProps {
  lesson: Lesson;
  onBack: () => void;
  onComplete: () => void;
}

const { width } = Dimensions.get('window');

export default function LessonScreen({ lesson, onBack, onComplete }: LessonScreenProps) {
  const [currentCharacterIndex, setCurrentCharacterIndex] = useState(0);
  const [completedCharacters, setCompletedCharacters] = useState<Set<number>>(new Set());
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [isCompleting, setIsCompleting] = useState(false);
  const { completeLesson, isLessonCompleted } = useProgress();

  const currentCharacter = lesson.characters[currentCharacterIndex];
  const isLastCharacter = currentCharacterIndex === lesson.characters.length - 1;
  const allCharactersCompleted = completedCharacters.size === lesson.characters.length;
  const wasAlreadyCompleted = isLessonCompleted(lesson.id);

  useEffect(() => {
    setStartTime(new Date());
  }, []);

  const handleComplete = async () => {
    // Prevent multiple completions
    if (isCompleting) {
      console.log('Lesson completion already in progress, ignoring duplicate call');
      return;
    }

    setIsCompleting(true);
    
    try {
      const endTime = new Date();
      const timeSpent = Math.floor((endTime.getTime() - startTime.getTime()) / 1000); // in seconds
      const score = calculateScore(timeSpent);
      
      console.log('About to complete lesson:', {
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        score,
        timeSpent,
        charactersCompleted: completedCharacters.size,
        totalCharacters: lesson.characters.length
      });
      
      await completeLesson(lesson.id, score, timeSpent);
      
      Alert.alert(
        'Lesson Completed! 🎉',
        `Great job! You earned ${Math.round(score)} points${!wasAlreadyCompleted ? ' and gained experience!' : '!'}`,
        [
          {
            text: 'Continue',
            onPress: () => {
              // Small delay to ensure state updates propagate properly
              setTimeout(() => {
                onComplete();
              }, 200);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error completing lesson:', error);
      Alert.alert('Error', 'Failed to save progress. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  };

  const calculateScore = (timeSpentSeconds: number): number => {
    // Base score
    let score = 80;
    
    // Time bonus (faster completion = higher score)
    const timeBonus = Math.max(0, 20 - Math.floor(timeSpentSeconds / 30));
    score += timeBonus;
    
    // Character completion bonus
    const completionBonus = (completedCharacters.size / lesson.characters.length) * 10;
    score += completionBonus;
    
    return Math.min(100, Math.max(50, score));
  };

  const handleNext = () => {
    // Mark current character as completed
    const newCompleted = new Set(completedCharacters);
    newCompleted.add(currentCharacterIndex);
    setCompletedCharacters(newCompleted);

    if (isLastCharacter && newCompleted.size === lesson.characters.length) {
      // All characters completed
      handleComplete();
    } else if (!isLastCharacter) {
      setCurrentCharacterIndex(currentCharacterIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentCharacterIndex > 0) {
      setCurrentCharacterIndex(currentCharacterIndex - 1);
    }
  };

  const goToCharacter = (index: number) => {
    setCurrentCharacterIndex(index);
  };

  const renderCharacterDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {lesson.characters.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dot,
              index === currentCharacterIndex && styles.activeDot,
              completedCharacters.has(index) && styles.completedDot,
            ]}
            onPress={() => goToCharacter(index)}
          >
            {completedCharacters.has(index) && (
              <Ionicons name="checkmark" size={12} color="white" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{lesson.title}</Text>
          <Text style={styles.headerProgress}>
            {currentCharacterIndex + 1} of {lesson.characters.length}
          </Text>
        </View>
      </View>

      {/* Progress Dots */}
      {renderCharacterDots()}

      {/* Character Display */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.characterCard}>
          <View style={styles.characterDisplay}>
            <Text style={styles.baybayinCharacter}>{currentCharacter.character}</Text>
          </View>
          
          <View style={styles.characterInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Romanized:</Text>
              <Text style={styles.infoValue}>{currentCharacter.romanized}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Pronunciation:</Text>
              <Text style={styles.infoValue}>{currentCharacter.pronunciation}</Text>
            </View>
            
            {currentCharacter.meaning && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Meaning:</Text>
                <Text style={styles.infoValue}>{currentCharacter.meaning}</Text>
              </View>
            )}
          </View>

          {/* Practice Section */}
          <View style={styles.practiceSection}>
            <Text style={styles.practiceTitle}>Practice Writing</Text>
            <View style={styles.practiceArea}>
              <Text style={styles.practiceCharacter}>{currentCharacter.character}</Text>
              <Text style={styles.practiceInstruction}>
                Trace this character to practice writing it
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity
          style={[styles.navButton, styles.previousButton]}
          onPress={handlePrevious}
          disabled={currentCharacterIndex === 0}
        >
          <Ionicons 
            name="chevron-back" 
            size={20} 
            color={currentCharacterIndex === 0 ? '#ccc' : '#8B4513'} 
          />
          <Text style={[
            styles.navButtonText,
            currentCharacterIndex === 0 && styles.disabledText
          ]}>
            Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, styles.nextButton]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {isLastCharacter ? 'Complete Lesson' : 'Next'}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#8B4513',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  headerProgress: {
    fontSize: 14,
    color: '#f0d0b4',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeDot: {
    backgroundColor: '#8B4513',
  },
  completedDot: {
    backgroundColor: '#4CAF50',
  },
  content: {
    flex: 1,
  },
  characterCard: {
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  characterDisplay: {
    alignItems: 'center',
    marginBottom: 32,
    padding: 32,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
  },
  baybayinCharacter: {
    fontSize: 120,
    color: '#8B4513',
    fontWeight: 'bold',
  },
  characterInfo: {
    marginBottom: 32,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  infoValue: {
    fontSize: 16,
    color: '#8B4513',
    fontWeight: 'bold',
  },
  practiceSection: {
    marginTop: 16,
  },
  practiceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  practiceArea: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  practiceCharacter: {
    fontSize: 80,
    color: '#ccc',
    marginBottom: 12,
  },
  practiceInstruction: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  navigation: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  previousButton: {
    backgroundColor: '#f0f0f0',
  },
  nextButton: {
    backgroundColor: '#8B4513',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
    marginLeft: 4,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginRight: 4,
  },
  disabledText: {
    color: '#ccc',
  },
});
