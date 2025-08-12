export interface BaybayinCharacter {
  id: string;
  character: string; // The Baybayin character
  romanized: string; // Roman alphabet equivalent
  pronunciation: string; // How to pronounce it
  meaning?: string; // Optional meaning/context
  audioUrl?: string; // Optional audio file URL
  strokeOrder?: string[]; // Array of stroke order descriptions
}

export interface LessonContent {
  introduction: string;
  sections: LessonSection[];
  summary: string;
  culturalNote?: string;
  practiceExercises?: PracticeExercise[];
}

export interface LessonSection {
  title: string;
  content: string;
  characters?: BaybayinCharacter[];
  examples?: Example[];
  image?: string;
}

export interface Example {
  baybayin: string;
  romanized: string;
  english: string;
  pronunciation?: string;
}

export interface PracticeExercise {
  type: 'trace' | 'match' | 'translate';
  instruction: string;
  items: any[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: 'lesson' | 'quiz' | 'streak' | 'mastery' | 'cultural';
  requirement: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  category: LessonCategory;
  difficulty: DifficultyLevel;
  characters: BaybayinCharacter[];
  content: LessonContent;
  isCompleted: boolean;
  order: number; // Lesson sequence
  estimatedTime: number; // in minutes
  prerequisites?: string[]; // lesson IDs that must be completed first
  badge?: Badge;
}

export interface LessonProgress {
  lessonId: string;
  userId: string;
  isCompleted: boolean;
  completedAt?: Date;
  score?: number;
  timeSpent?: number; // in seconds
}

export enum LessonCategory {
  BASIC_CONSONANTS = 'basic_consonants',
  BASIC_VOWELS = 'basic_vowels',
  COMBINATION = 'combination',
  ADVANCED = 'advanced',
  HISTORICAL = 'historical'
}

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}
