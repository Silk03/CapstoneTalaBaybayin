import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Quiz, QuizQuestion, QuestionType } from '../../types/quiz';
import { useProgress } from '../../contexts/ProgressContext';

interface QuizScreenProps {
  quiz: Quiz;
  onBack: () => void;
  onComplete: (score: number, totalPoints: number, timeSpent: number) => void;
}

export default function QuizScreen({ quiz, onBack, onComplete }: QuizScreenProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: string }>({});
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit || 0);
  const [startTime] = useState(new Date());
  const { addExperience } = useProgress();

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const selectedAnswer = answers[currentQuestion.id];

  // Timer effect
  useEffect(() => {
    if (!quiz.timeLimit) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz.timeLimit]);

  const handleTimeUp = () => {
    Alert.alert(
      'Time\'s Up!',
      'Your time has expired. The quiz will be submitted automatically.',
      [{ text: 'OK', onPress: handleSubmitQuiz }]
    );
  };

  const handleAnswerSelect = (answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));
  };

  const handleNext = () => {
    if (!selectedAnswer) {
      Alert.alert('No Answer Selected', 'Please select an answer before proceeding.');
      return;
    }

    if (isLastQuestion) {
      handleSubmitQuiz();
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    const endTime = new Date();
    const timeSpent = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

    // Calculate score
    let correctAnswers = 0;
    let totalPoints = 0;

    quiz.questions.forEach(question => {
      totalPoints += question.points;
      if (answers[question.id] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = (correctAnswers / quiz.questions.length) * 100;
    const pointsEarned = Math.floor((correctAnswers / quiz.questions.length) * totalPoints);
    const passed = score >= quiz.passingScore;

    // Add experience points if passed
    if (passed) {
      await addExperience(pointsEarned);
    }

    Alert.alert(
      passed ? 'Quiz Passed! 🎉' : 'Quiz Complete',
      `Score: ${Math.round(score)}%\nPoints Earned: ${pointsEarned}/${totalPoints}\n${passed ? 'Congratulations!' : 'Keep practicing!'}`,
      [
        {
          text: 'Review Answers',
          onPress: () => showResults(score, pointsEarned, timeSpent)
        },
        {
          text: 'Continue',
          onPress: () => onComplete(score, pointsEarned, timeSpent)
        }
      ]
    );
  };

  const showResults = (score: number, pointsEarned: number, timeSpent: number) => {
    // TODO: Implement results screen
    onComplete(score, pointsEarned, timeSpent);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case QuestionType.CHARACTER_RECOGNITION:
        return (
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>{currentQuestion.question}</Text>
            <View style={styles.characterDisplay}>
              <Text style={styles.baybayinCharacter}>
                {currentQuestion.baybayinCharacter}
              </Text>
            </View>
            {renderOptions()}
          </View>
        );

      case QuestionType.ROMANIZED_TO_BAYBAYIN:
        return (
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>{currentQuestion.question}</Text>
            <View style={styles.characterDisplay}>
              <Text style={styles.romanizedCharacter}>
                {currentQuestion.romanizedCharacter}
              </Text>
            </View>
            {renderOptions()}
          </View>
        );

      default:
        return (
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>{currentQuestion.question}</Text>
            {renderOptions()}
          </View>
        );
    }
  };

  const renderOptions = () => {
    if (!currentQuestion.options) return null;

    return (
      <View style={styles.optionsContainer}>
        {currentQuestion.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionButton,
              selectedAnswer === option && styles.selectedOption
            ]}
            onPress={() => handleAnswerSelect(option)}
          >
            <Text style={[
              styles.optionText,
              selectedAnswer === option && styles.selectedOptionText
            ]}>
              {option}
            </Text>
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
          <Text style={styles.headerTitle}>{quiz.title}</Text>
          <Text style={styles.headerProgress}>
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </Text>
        </View>
        {quiz.timeLimit && (
          <View style={styles.timerContainer}>
            <Ionicons name="time-outline" size={20} color="white" />
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          </View>
        )}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }
            ]}
          />
        </View>
      </View>

      {/* Question Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderQuestion()}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity
          style={[
            styles.navButton,
            styles.previousButton,
            currentQuestionIndex === 0 && styles.disabledButton
          ]}
          onPress={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          <Ionicons name="chevron-back" size={20} color="#8B4513" />
          <Text style={styles.navButtonText}>Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton,
            styles.nextButton,
            !selectedAnswer && styles.disabledButton
          ]}
          onPress={handleNext}
          disabled={!selectedAnswer}
        >
          <Text style={styles.nextButtonText}>
            {isLastQuestion ? 'Submit' : 'Next'}
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
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  progressContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B4513',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  questionContainer: {
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
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 26,
  },
  characterDisplay: {
    alignItems: 'center',
    marginBottom: 32,
    padding: 32,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
  },
  baybayinCharacter: {
    fontSize: 80,
    color: '#8B4513',
    fontWeight: 'bold',
  },
  romanizedCharacter: {
    fontSize: 48,
    color: '#8B4513',
    fontWeight: 'bold',
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: '#e8f5e8',
    borderColor: '#4CAF50',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  selectedOptionText: {
    color: '#4CAF50',
    fontWeight: 'bold',
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
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.5,
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
});
