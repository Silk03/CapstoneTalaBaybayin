export interface UserProgress {
  userId: string;
  displayName?: string;
  completedLessons: string[]; // lesson IDs
  lessonScores: { [lessonId: string]: number }; // scores out of 100
  completedQuizzes: string[]; // quiz IDs
  quizScores: { [quizId: string]: number }; // scores out of 100
  totalScore: number;
  streak: number; // consecutive days of learning
  lastLearningDate: Date;
  lastActivityDate: Date; // last time user was actually active (not just opened app)
  dailyActivities: DailyActivity[]; // track what activities were done each day
  achievements: Achievement[];
  badges: Badge[]; // earned badges
  level: number;
  experience: number;
  totalTimeSpent: number; // in minutes
}

export interface DailyActivity {
  date: string; // YYYY-MM-DD format
  activities: ActivityType[];
  lessonsStarted: number;
  lessonsCompleted: number;
  quizzesStarted: number;
  quizzesCompleted: number;
  handwritingPracticed: boolean;
  translationUsed: boolean;
  totalActiveTime: number; // in minutes
}

export enum ActivityType {
  LESSON_STARTED = 'lesson_started',
  LESSON_COMPLETED = 'lesson_completed', 
  QUIZ_STARTED = 'quiz_started',
  QUIZ_COMPLETED = 'quiz_completed',
  HANDWRITING_PRACTICED = 'handwriting_practiced',
  TRANSLATION_USED = 'translation_used'
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: 'lesson' | 'quiz' | 'streak' | 'mastery' | 'cultural';
  requirement: string;
  earnedAt?: Date;
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
