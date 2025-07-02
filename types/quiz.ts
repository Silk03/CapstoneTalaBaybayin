export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[]; // For multiple choice
  correctAnswer: string;
  explanation?: string;
  baybayinCharacter?: string; // The Baybayin character being tested
  romanizedCharacter?: string; // The romanized equivalent
  difficulty: DifficultyLevel;
  points: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  timeLimit?: number; // in seconds, optional
  passingScore: number; // percentage needed to pass
  category: QuizCategory;
  difficulty: DifficultyLevel;
  prerequisiteLessons?: string[]; // lesson IDs that must be completed first
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  answers: { [questionId: string]: string };
  score: number;
  totalPoints: number;
  timeSpent: number; // in seconds
  completedAt: Date;
  passed: boolean;
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  CHARACTER_RECOGNITION = 'character_recognition', // Show Baybayin, pick romanized
  ROMANIZED_TO_BAYBAYIN = 'romanized_to_baybayin', // Show romanized, pick Baybayin
  TRUE_FALSE = 'true_false',
  FILL_IN_BLANK = 'fill_in_blank'
}

export enum QuizCategory {
  CHARACTER_RECOGNITION = 'character_recognition',
  PRONUNCIATION = 'pronunciation',
  WRITING = 'writing',
  MIXED = 'mixed',
  COMPREHENSIVE = 'comprehensive'
}

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}
