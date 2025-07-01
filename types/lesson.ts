export interface BaybayinCharacter {
  id: string;
  character: string; // The Baybayin character
  romanized: string; // Roman alphabet equivalent
  pronunciation: string; // How to pronounce it
  meaning?: string; // Optional meaning/context
  audioUrl?: string; // Optional audio file URL
  strokeOrder?: string[]; // Array of stroke order descriptions
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  category: LessonCategory;
  difficulty: DifficultyLevel;
  characters: BaybayinCharacter[];
  isCompleted: boolean;
  order: number; // Lesson sequence
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
