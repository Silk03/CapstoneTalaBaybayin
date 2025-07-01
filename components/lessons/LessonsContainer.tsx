import React, { useState } from 'react';
import LessonListScreen from './LessonListScreen';
import LessonScreen from './LessonScreen';
import { Lesson } from '../../types/lesson';

export default function LessonsContainer() {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const handleSelectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
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
