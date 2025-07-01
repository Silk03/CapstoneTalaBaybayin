import { Lesson, LessonCategory, DifficultyLevel, BaybayinCharacter } from '../types/lesson';

// Basic Baybayin Characters Data
const basicVowels: BaybayinCharacter[] = [
  {
    id: 'vowel_a',
    character: 'ᜀ',
    romanized: 'A',
    pronunciation: 'ah',
    meaning: 'The first vowel in Baybayin'
  },
  {
    id: 'vowel_e',
    character: 'ᜁ',
    romanized: 'E/I',
    pronunciation: 'eh/ee',
    meaning: 'The second vowel sound'
  },
  {
    id: 'vowel_o',
    character: 'ᜂ',
    romanized: 'O/U',
    pronunciation: 'oh/oo',
    meaning: 'The third vowel sound'
  }
];

const basicConsonants: BaybayinCharacter[] = [
  {
    id: 'consonant_ba',
    character: 'ᜊ',
    romanized: 'BA',
    pronunciation: 'bah',
    meaning: 'B sound with inherent A'
  },
  {
    id: 'consonant_ka',
    character: 'ᜃ',
    romanized: 'KA',
    pronunciation: 'kah',
    meaning: 'K sound with inherent A'
  },
  {
    id: 'consonant_da',
    character: 'ᜇ',
    romanized: 'DA',
    pronunciation: 'dah',
    meaning: 'D sound with inherent A'
  },
  {
    id: 'consonant_ga',
    character: 'ᜄ',
    romanized: 'GA',
    pronunciation: 'gah',
    meaning: 'G sound with inherent A'
  },
  {
    id: 'consonant_ha',
    character: 'ᜑ',
    romanized: 'HA',
    pronunciation: 'hah',
    meaning: 'H sound with inherent A'
  },
  {
    id: 'consonant_la',
    character: 'ᜎ',
    romanized: 'LA',
    pronunciation: 'lah',
    meaning: 'L sound with inherent A'
  },
  {
    id: 'consonant_ma',
    character: 'ᜋ',
    romanized: 'MA',
    pronunciation: 'mah',
    meaning: 'M sound with inherent A'
  },
  {
    id: 'consonant_na',
    character: 'ᜈ',
    romanized: 'NA',
    pronunciation: 'nah',
    meaning: 'N sound with inherent A'
  },
  {
    id: 'consonant_nga',
    character: 'ᜅ',
    romanized: 'NGA',
    pronunciation: 'ngah',
    meaning: 'NG sound with inherent A'
  },
  {
    id: 'consonant_pa',
    character: 'ᜉ',
    romanized: 'PA',
    pronunciation: 'pah',
    meaning: 'P sound with inherent A'
  },
  {
    id: 'consonant_ra',
    character: 'ᜇ',
    romanized: 'RA',
    pronunciation: 'rah',
    meaning: 'R sound with inherent A'
  },
  {
    id: 'consonant_sa',
    character: 'ᜐ',
    romanized: 'SA',
    pronunciation: 'sah',
    meaning: 'S sound with inherent A'
  },
  {
    id: 'consonant_ta',
    character: 'ᜆ',
    romanized: 'TA',
    pronunciation: 'tah',
    meaning: 'T sound with inherent A'
  },
  {
    id: 'consonant_wa',
    character: 'ᜏ',
    romanized: 'WA',
    pronunciation: 'wah',
    meaning: 'W sound with inherent A'
  },
  {
    id: 'consonant_ya',
    character: 'ᜌ',
    romanized: 'YA',
    pronunciation: 'yah',
    meaning: 'Y sound with inherent A'
  }
];

// Lesson Data
export const lessons: Lesson[] = [
  {
    id: 'lesson_1',
    title: 'Introduction to Baybayin Vowels',
    description: 'Learn the three basic vowel sounds in Baybayin script',
    category: LessonCategory.BASIC_VOWELS,
    difficulty: DifficultyLevel.BEGINNER,
    characters: basicVowels,
    isCompleted: false,
    order: 1
  },
  {
    id: 'lesson_2',
    title: 'Basic Consonants Part 1',
    description: 'Learn the first set of Baybayin consonants (Ba, Ka, Da, Ga, Ha)',
    category: LessonCategory.BASIC_CONSONANTS,
    difficulty: DifficultyLevel.BEGINNER,
    characters: basicConsonants.slice(0, 5),
    isCompleted: false,
    order: 2
  },
  {
    id: 'lesson_3',
    title: 'Basic Consonants Part 2',
    description: 'Learn more Baybayin consonants (La, Ma, Na, Nga, Pa)',
    category: LessonCategory.BASIC_CONSONANTS,
    difficulty: DifficultyLevel.BEGINNER,
    characters: basicConsonants.slice(5, 10),
    isCompleted: false,
    order: 3
  },
  {
    id: 'lesson_4',
    title: 'Basic Consonants Part 3',
    description: 'Complete the basic consonant set (Ra, Sa, Ta, Wa, Ya)',
    category: LessonCategory.BASIC_CONSONANTS,
    difficulty: DifficultyLevel.BEGINNER,
    characters: basicConsonants.slice(10),
    isCompleted: false,
    order: 4
  }
];

export const getLessonById = (id: string): Lesson | undefined => {
  return lessons.find(lesson => lesson.id === id);
};

export const getLessonsByCategory = (category: LessonCategory): Lesson[] => {
  return lessons.filter(lesson => lesson.category === category);
};

export const getLessonsByDifficulty = (difficulty: DifficultyLevel): Lesson[] => {
  return lessons.filter(lesson => lesson.difficulty === difficulty);
};
