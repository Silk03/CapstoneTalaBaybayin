import React, { useState } from 'react';
import QuizListScreen from './QuizListScreen';
import QuizScreen from './QuizScreen';
import { Quiz } from '../../types/quiz';
import { useProgress } from '../../contexts/ProgressContext';
import { ActivityType } from '../../types/progress';

export default function QuizzesContainer() {
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const { trackActivity } = useProgress();

  const handleSelectQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    // Track that user started a quiz
    trackActivity(ActivityType.QUIZ_STARTED);
  };

  const handleBack = () => {
    setSelectedQuiz(null);
  };

  const handleComplete = async (score: number, totalPoints: number, timeSpent: number) => {
    if (!selectedQuiz) return;
    
    console.log('Quiz completed successfully:', {
      quiz: selectedQuiz.title,
      score,
      totalPoints,
      timeSpent
    });
    
    // Quiz completion is already handled by QuizScreen's completeQuiz call
    // This function just handles the navigation back to quiz list
    setSelectedQuiz(null);
  };

  if (selectedQuiz) {
    return (
      <QuizScreen 
        quiz={selectedQuiz}
        onBack={handleBack}
        onComplete={handleComplete}
      />
    );
  }

  return <QuizListScreen onSelectQuiz={handleSelectQuiz} />;
}
