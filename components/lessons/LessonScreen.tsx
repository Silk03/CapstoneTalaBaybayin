import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Lesson, BaybayinCharacter } from '../../types/lesson';
import { useProgress } from '../../contexts/ProgressContext';
import '../../global.css';

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
      
      const badgeText = lesson.badge ? `\n\n🏆 Nakuha ang Badge: ${lesson.badge.name}\n${lesson.badge.description}` : '';
      
      Alert.alert(
        'Natapos ang Aralin! 🎉',
        `Mahusay! Nakakuha kayo ng ${Math.round(score)} na puntos${!wasAlreadyCompleted ? ' at nakakuha ng experience!' : '!'}${badgeText}`,
        [
          {
            text: 'Magpatuloy',
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
      Alert.alert('Error', 'Hindi ma-save ang progreso. Subukan ulit.');
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
      <View className="flex-row justify-center py-4 bg-white">
        {lesson.characters.map((_, index) => (
          <TouchableOpacity
            key={index}
            className={`w-6 h-6 rounded-full mx-1 justify-center items-center ${
              index === currentCharacterIndex 
                ? 'bg-primary' 
                : completedCharacters.has(index)
                  ? 'bg-green-500'
                  : 'bg-gray-300'
            }`}
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
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-primary flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={onBack} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-lg font-bold text-white">{lesson.title}</Text>
          <Text className="text-sm text-orange-100">
            {currentCharacterIndex + 1} of {lesson.characters.length}
          </Text>
        </View>
      </View>

      {/* Progress Dots */}
      {renderCharacterDots()}

      {/* Character Display */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="m-4 bg-white rounded-2xl p-6 shadow-sm">
          <View className="items-center mb-8 p-8 bg-gray-50 rounded-xl">
            <Text className="text-8xl text-primary font-bold">{currentCharacter.character}</Text>
          </View>
          
          <View className="mb-8">
            <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
              <Text className="text-lg font-semibold text-gray-800">Romanized:</Text>
              <Text className="text-lg text-primary font-bold">{currentCharacter.romanized}</Text>
            </View>
            
            <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
              <Text className="text-lg font-semibold text-gray-800">Pagbigkas:</Text>
              <Text className="text-lg text-primary font-bold">{currentCharacter.pronunciation}</Text>
            </View>
            
            {currentCharacter.meaning && (
              <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
                <Text className="text-lg font-semibold text-gray-800">Kahulugan:</Text>
                <Text className="text-lg text-primary font-bold">{currentCharacter.meaning}</Text>
              </View>
            )}
          </View>

          {/* Practice Section */}
          <View className="mt-4">
            <Text className="text-xl font-bold text-gray-800 mb-4 text-center">Pagsasanay sa Pagsusulat</Text>
            <View className="bg-gray-50 rounded-xl p-6 items-center">
              <Text className="text-6xl text-gray-300 mb-3">{currentCharacter.character}</Text>
              <Text className="text-sm text-gray-600 text-center">
                I-trace ang titik na ito para magsanay sa pagsusulat
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Navigation */}
      <View className="flex-row p-4 bg-white border-t border-gray-200">
        <TouchableOpacity
          className={`flex-1 flex-row items-center justify-center py-3 px-4 rounded-lg mx-1 ${
            currentCharacterIndex === 0 ? 'bg-gray-100' : 'bg-gray-100'
          }`}
          onPress={handlePrevious}
          disabled={currentCharacterIndex === 0}
        >
          <Ionicons 
            name="chevron-back" 
            size={20} 
            color={currentCharacterIndex === 0 ? '#D1D5DB' : '#C67C4E'} 
          />
          <Text className={`text-lg font-semibold ml-1 ${
            currentCharacterIndex === 0 ? 'text-gray-400' : 'text-primary'
          }`}>
            Nauna
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center py-3 px-4 rounded-lg mx-1 bg-primary"
          onPress={handleNext}
        >
          <Text className="text-lg font-semibold text-white mr-1">
            {isLastCharacter ? 'Tapusin ang Aralin' : 'Susunod'}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}


