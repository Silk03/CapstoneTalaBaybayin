import React, { useState } from 'react';
import QuizListScreen from './QuizListScreen';
import QuizScreen from './QuizScreen';
import { Quiz } from '../../types/quiz';
import { useProgress } from '../../contexts/ProgressContext';

export default function QuizzesContainer() {
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const { completeQuiz } = useProgress();

  const handleSelectQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
  };

  const handleBack = () => {
    setSelectedQuiz(null);
  };

  const handleComplete = async (score: number, totalPoints: number, timeSpent: number) => {
    if (!selectedQuiz) return;
    
    try {
      // For now, we'll pass empty answers object since we need to modify QuizScreen to return answers
      await completeQuiz(selectedQuiz.id, score, totalPoints, timeSpent, {});
      console.log('Quiz completed successfully:', {
        quiz: selectedQuiz.title,
        score,
        totalPoints,
        timeSpent
      });
    } catch (error) {
      console.error('Error completing quiz:', error);
    }
    
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
