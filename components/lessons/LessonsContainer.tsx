import React, { useState } from 'react';
import LessonListScreen from './LessonListScreen';
import LessonScreen from './LessonScreen';
import { Lesson } from '../../types/lesson';
import { useProgress } from '../../contexts/ProgressContext';
import { ActivityType } from '../../types/progress';

export default function LessonsContainer() {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const { trackActivity } = useProgress();

  const handleSelectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    // Track that user started a lesson
    trackActivity(ActivityType.LESSON_STARTED);
  };

  const handleBack = () => {
    setSelectedLesson(null);
  };

  const handleComplete = () => {
    // TODO: Update lesson progress in Firebase
    console.log('Lesson completed:', selectedLesson?.title);
    setSelectedLesson(null);
  };

  if (selectedLesson) {
    return (
      <LessonScreen 
        lesson={selectedLesson}
        onBack={handleBack}
        onComplete={handleComplete}
      />
    );
  }

  return <LessonListScreen onSelectLesson={handleSelectLesson} />;
}
