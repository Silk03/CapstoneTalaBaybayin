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
  const [questionStartTime, setQuestionStartTime] = useState(new Date());
  const [questionTimes, setQuestionTimes] = useState<{ [questionId: string]: number }>({});
  const [showPointsGained, setShowPointsGained] = useState<{ points: number; timeBonus: number; isCorrect: boolean } | null>(null);
  const [totalPointsEarned, setTotalPointsEarned] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());
  const { addExperience, isQuizCompleted } = useProgress();

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const selectedAnswer = answers[currentQuestion.id];
  const isRetake = isQuizCompleted(quiz.id);

  // Show retake warning on mount
  useEffect(() => {
    if (isRetake) {
      Alert.alert(
        'Retake Quiz',
        'You have already completed this quiz. You can retake it for practice, but no points will be awarded.',
        [{ text: 'Continue', style: 'default' }]
      );
    }
  }, [isRetake]);

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

  // Reset question timer when question changes
  useEffect(() => {
    setQuestionStartTime(new Date());
  }, [currentQuestionIndex]);

  const calculateQuestionScore = (answerTime: number, basePoints: number): { points: number; timeBonus: number } => {
    // Time bonus calculation (max 10 seconds for full bonus)
    const maxTimeForBonus = 10; // seconds
    const timeBonus = Math.max(0, Math.floor((maxTimeForBonus - answerTime) * (basePoints * 0.5 / maxTimeForBonus)));
    const totalPoints = basePoints + timeBonus;
    
    return {
      points: Math.max(basePoints, totalPoints),
      timeBonus: timeBonus
    };
  };

  const showPointsAnimation = (points: number, timeBonus: number, isCorrect: boolean) => {
    setShowPointsGained({ points, timeBonus, isCorrect });
    setTimeout(() => setShowPointsGained(null), 2000);
  };

  const handleTimeUp = () => {
    Alert.alert(
      'Time\'s Up!',
      'Your time has expired. The quiz will be submitted automatically.',
      [{ text: 'OK', onPress: handleSubmitQuiz }]
    );
  };

  const handleAnswerSelect = (answer: string) => {
    // Prevent re-answering the same question
    if (answeredQuestions.has(currentQuestion.id)) {
      return;
    }

    // Calculate time taken for this question
    const answerTime = (new Date().getTime() - questionStartTime.getTime()) / 1000;
    
    // Store the answer
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));

    // Store the time taken
    setQuestionTimes(prev => ({
      ...prev,
      [currentQuestion.id]: answerTime
    }));

    // Mark question as answered
    setAnsweredQuestions(prev => new Set(prev).add(currentQuestion.id));

    // Check if answer is correct
    const isCorrect = answer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      // Correct answer: add points with time bonus
      const scoreData = calculateQuestionScore(answerTime, currentQuestion.points);
      setTotalPointsEarned(prev => prev + scoreData.points);
      showPointsAnimation(scoreData.points, scoreData.timeBonus, true);
    } else {
      // Wrong answer: just show visual feedback, no point deduction
      showPointsAnimation(0, 0, false);
    }
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
    
    // Check if this is a retake (no points for retakes)
    const isRetake = isQuizCompleted(quiz.id);

    // Calculate detailed score with time bonuses
    let correctAnswers = 0;
    let totalPossiblePoints = 0;
    let actualPointsEarned = 0;
    let totalTimeBonus = 0;

    quiz.questions.forEach(question => {
      totalPossiblePoints += question.points;
      
      if (answers[question.id] === question.correctAnswer) {
        correctAnswers++;
        const answerTime = questionTimes[question.id] || 10; // Default to 10s if no time recorded
        const scoreData = calculateQuestionScore(answerTime, question.points);
        actualPointsEarned += scoreData.points;
        totalTimeBonus += scoreData.timeBonus;
      }
    });

    const accuracy = (correctAnswers / quiz.questions.length) * 100;
    const passed = accuracy >= quiz.passingScore;

    // Add experience points only if passed and not a retake
    if (passed && !isRetake) {
      await addExperience(actualPointsEarned);
    }

    Alert.alert(
      passed ? 'Quiz Passed! 🎉' : 'Quiz Complete',
      `Accuracy: ${Math.round(accuracy)}%\n` +
      `Points Earned: ${actualPointsEarned}/${totalPossiblePoints}\n` +
      `Time Bonus: +${totalTimeBonus} points\n` +
      `${isRetake ? '⚠️ No points awarded for retakes' : ''}` +
      `${passed ? 'Congratulations on your fast answers!' : 'Keep practicing!'}`,
      [
        {
          text: 'Review Answers',
          onPress: () => showResults(accuracy, actualPointsEarned, timeSpent)
        },
        {
          text: 'Continue',
          onPress: () => onComplete(accuracy, actualPointsEarned, timeSpent)
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

    const isQuestionAnswered = answeredQuestions.has(currentQuestion.id);

    return (
      <View style={styles.optionsContainer}>
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedAnswer === option;
          const isCorrect = option === currentQuestion.correctAnswer;
          const isWrong = isQuestionAnswered && isSelected && !isCorrect;
          const shouldShowCorrect = isQuestionAnswered && isCorrect;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                isSelected && styles.selectedOption,
                isWrong && styles.wrongOption,
                shouldShowCorrect && styles.correctOption,
              ]}
              onPress={() => handleAnswerSelect(option)}
              disabled={isQuestionAnswered}
            >
              <Text style={[
                styles.optionText,
                isSelected && styles.selectedOptionText,
                isWrong && styles.wrongOptionText,
                shouldShowCorrect && styles.correctOptionText,
              ]}>
                {option}
              </Text>
              {shouldShowCorrect && (
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" style={styles.optionIcon} />
              )}
              {isWrong && (
                <Ionicons name="close-circle" size={20} color="#F44336" style={styles.optionIcon} />
              )}
            </TouchableOpacity>
          );
        })}
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
          <Text style={styles.headerTitle}>
            {quiz.title} {isRetake && '(Retake)'}
          </Text>
          <Text style={styles.headerProgress}>
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>
            {totalPointsEarned} pts
          </Text>
          {quiz.timeLimit && (
            <View style={styles.timerContainer}>
              <Ionicons name="time-outline" size={16} color="white" />
              <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
            </View>
          )}
        </View>
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
        
        {/* Points Animation Overlay */}
        {showPointsGained && (
          <View style={styles.pointsOverlay}>
            <View style={[
              styles.pointsAnimation,
              showPointsGained.isCorrect ? styles.correctPointsAnimation : styles.wrongPointsAnimation
            ]}>
              {showPointsGained.isCorrect ? (
                <>
                  <Text style={styles.pointsGainedText}>
                    +{showPointsGained.points} points!
                  </Text>
                  {showPointsGained.timeBonus > 0 && (
                    <Text style={styles.timeBonusText}>
                      ⚡ Speed bonus: +{showPointsGained.timeBonus}
                    </Text>
                  )}
                </>
              ) : (
                <Text style={styles.wrongAnswerText}>
                  ❌ Wrong answer
                </Text>
              )}
            </View>
          </View>
        )}
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
    paddingHorizontal: 15,
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
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  progressContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
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
    padding: 15,
  },
  questionContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
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
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedOption: {
    backgroundColor: '#e8f5e8',
    borderColor: '#4CAF50',
  },
  optionText: {
    fontSize: 15,
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
    padding: 15,
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
    paddingHorizontal: 15,
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
    fontSize: 15,
    fontWeight: '500',
    color: '#8B4513',
    marginLeft: 4,
  },
  nextButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: 'white',
    marginRight: 4,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  pointsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 1000,
  },
  pointsAnimation: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    transform: [{ scale: 1.1 }],
  },
  pointsGainedText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  timeBonusText: {
    color: '#FFD700',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  // New styles for correct/wrong answers
  correctOption: {
    backgroundColor: '#e8f5e8',
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  wrongOption: {
    backgroundColor: '#ffebee',
    borderColor: '#F44336',
    borderWidth: 2,
  },
  correctOptionText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  wrongOptionText: {
    color: '#F44336',
    fontWeight: 'bold',
  },
  optionIcon: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  correctPointsAnimation: {
    backgroundColor: '#4CAF50',
  },
  wrongPointsAnimation: {
    backgroundColor: '#F44336',
  },
  wrongAnswerText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
});
