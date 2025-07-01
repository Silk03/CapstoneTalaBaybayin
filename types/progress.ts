export interface UserProgress {
  userId: string;
  completedLessons: string[]; // lesson IDs
  lessonScores: { [lessonId: string]: number }; // scores out of 100
  totalScore: number;
  streak: number; // consecutive days of learning
  lastLearningDate: Date;
  achievements: Achievement[];
  level: number;
  experience: number;
  totalTimeSpent: number; // in minutes
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  type: 'lesson' | 'streak' | 'score' | 'time';
}

export interface LessonProgress {
  lessonId: string;
  isCompleted: boolean;
  score: number;
  timeSpent: number; // in seconds
  attempts: number;
  completedAt?: Date;
}
