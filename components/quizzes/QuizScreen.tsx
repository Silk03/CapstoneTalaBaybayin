import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Quiz, QuizQuestion, QuestionType } from '../../types/quiz';
import { useProgress } from '../../contexts/ProgressContext';
import '../../global.css';

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

  // Add null checks for quiz and questions
  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-lg text-gray-600">Loading quiz...</Text>
      </SafeAreaView>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const selectedAnswer = answers[currentQuestion?.id || ''];
  const isRetake = isQuizCompleted(quiz.id);

  // Calculate progress percentage for debugging
  const progressPercentage = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  
  // Debug log
  console.log('Quiz Progress:', {
    currentQuestionIndex,
    totalQuestions: quiz.questions.length,
    progressPercentage: progressPercentage.toFixed(1) + '%'
  });

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
    if (!currentQuestion) return;
    
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
    if (!currentQuestion) {
      return (
        <View className="bg-white rounded-2xl p-6 shadow-sm">
          <Text className="text-lg font-semibold text-gray-600 text-center">Loading question...</Text>
        </View>
      );
    }

    switch (currentQuestion.type) {
      case QuestionType.CHARACTER_RECOGNITION:
        return (
          <View className="bg-white rounded-2xl p-6 shadow-sm">
            <Text className="text-lg font-semibold text-gray-800 text-center mb-8 leading-7">{currentQuestion.question}</Text>
            <View className="items-center mb-8 p-8 bg-gray-50 rounded-xl">
              <Text className="text-6xl text-primary font-bold">
                {currentQuestion.baybayinCharacter}
              </Text>
            </View>
            {renderOptions()}
          </View>
        );

      case QuestionType.ROMANIZED_TO_BAYBAYIN:
        return (
          <View className="bg-white rounded-2xl p-6 shadow-sm">
            <Text className="text-lg font-semibold text-gray-800 text-center mb-8 leading-7">{currentQuestion.question}</Text>
            <View className="items-center mb-8 p-8 bg-gray-50 rounded-xl">
              <Text className="text-5xl text-primary font-bold">
                {currentQuestion.romanizedCharacter}
              </Text>
            </View>
            {renderOptions()}
          </View>
        );

      default:
        return (
          <View className="bg-white rounded-2xl p-6 shadow-sm">
            <Text className="text-lg font-semibold text-gray-800 text-center mb-8 leading-7">{currentQuestion.question}</Text>
            {renderOptions()}
          </View>
        );
    }
  };

  const renderOptions = () => {
    if (!currentQuestion || !currentQuestion.options) return null;

    const isQuestionAnswered = answeredQuestions.has(currentQuestion.id);

    return (
      <View className="gap-3">
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedAnswer === option;
          const isCorrect = option === currentQuestion.correctAnswer;
          const isWrong = isQuestionAnswered && isSelected && !isCorrect;
          const shouldShowCorrect = isQuestionAnswered && isCorrect;

          return (
            <TouchableOpacity
              key={index}
              className={`bg-gray-100 p-4 rounded-xl border-2 flex-row items-center justify-center ${
                isSelected ? 'bg-green-50 border-green-500' : 'border-transparent'
              } ${isWrong ? 'bg-red-50 border-red-500' : ''} ${
                shouldShowCorrect ? 'bg-green-50 border-green-500' : ''
              }`}
              onPress={() => handleAnswerSelect(option)}
              disabled={isQuestionAnswered}
            >
              <Text className={`text-base text-gray-800 text-center font-medium ${
                isSelected ? 'text-green-600 font-bold' : ''
              } ${isWrong ? 'text-red-600 font-bold' : ''} ${
                shouldShowCorrect ? 'text-green-600 font-bold' : ''
              }`}>
                {option}
              </Text>
              {shouldShowCorrect && (
                <Ionicons name="checkmark-circle" size={20} color="#10B981" className="absolute right-4" />
              )}
              {isWrong && (
                <Ionicons name="close-circle" size={20} color="#EF4444" className="absolute right-4" />
              )}
            </TouchableOpacity>
          );
        })}
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
          <Text className="text-lg font-bold text-white">
            {quiz.title} {isRetake && '(Retake)'}
          </Text>
          <Text className="text-sm text-orange-100">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-white text-base font-bold mb-1">
            {totalPointsEarned} pts
          </Text>
          {quiz.timeLimit && (
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={16} color="white" />
              <Text className="text-white text-base font-bold ml-1">{formatTime(timeLeft)}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Progress Bar */}
      <View className="bg-secondary-50 px-4 py-2 border-b border-secondary-200">
        <View className="h-2 bg-secondary-200 rounded-full overflow-hidden">
          <View 
            className="h-full bg-secondary rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </View>
        <Text className="text-xs text-secondary-600 text-center mt-1">
          Question {currentQuestionIndex + 1} of {quiz.questions.length}
        </Text>
      </View>

      {/* Question Content */}
      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {renderQuestion()}
        
        {/* Points Animation Overlay */}
        {showPointsGained && (
          <View className="absolute inset-0 justify-center items-center bg-black/30 z-50">
            <View className={`px-6 py-4 rounded-2xl shadow-lg ${
              showPointsGained.isCorrect ? 'bg-green-500' : 'bg-red-500'
            }`}>
              {showPointsGained.isCorrect ? (
                <>
                  <Text className="text-white text-xl font-bold text-center mb-1">
                    +{showPointsGained.points} points!
                  </Text>
                  {showPointsGained.timeBonus > 0 && (
                    <Text className="text-yellow-300 text-base font-semibold text-center">
                      ⚡ Speed bonus: +{showPointsGained.timeBonus}
                    </Text>
                  )}
                </>
              ) : (
                <Text className="text-white text-base font-semibold text-center mt-1">
                  ❌ Wrong answer
                </Text>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Navigation */}
      <View className="flex-row p-4 bg-white border-t border-gray-200">
        <TouchableOpacity
          className={`flex-1 flex-row items-center justify-center py-3 px-4 rounded-lg mx-1 ${
            currentQuestionIndex === 0 ? 'bg-gray-300 opacity-50' : 'bg-gray-100'
          }`}
          onPress={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          <Ionicons name="chevron-back" size={20} color="#C67C4E" />
          <Text className="text-primary text-base font-medium ml-1">Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 flex-row items-center justify-center py-3 px-4 rounded-lg mx-1 ${
            !selectedAnswer ? 'bg-gray-300 opacity-50' : 'bg-primary'
          }`}
          onPress={handleNext}
          disabled={!selectedAnswer}
        >
          <Text className="text-white text-base font-medium mr-1">
            {isLastQuestion ? 'Submit' : 'Next'}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}


