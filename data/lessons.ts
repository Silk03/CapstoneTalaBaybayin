import { Lesson, LessonCategory, DifficultyLevel, BaybayinCharacter, LessonContent, Badge } from '../types/lesson';

// Basic Baybayin Characters Data
const basicVowels: BaybayinCharacter[] = [
  {
    id: 'vowel_a',
    character: 'ᜀ',
    romanized: 'A',
    pronunciation: 'ah',
    meaning: 'The first vowel in Baybayin, representing the open "ah" sound',
    strokeOrder: ['Start from the top', 'Draw a curved line down', 'Add the horizontal line at the bottom']
  },
  {
    id: 'vowel_i',
    character: 'ᜁ',
    romanized: 'I/E',
    pronunciation: 'ee/eh',
    meaning: 'The second vowel sound, can represent both "i" and "e" sounds',
    strokeOrder: ['Draw the main vertical line', 'Add the two dots at the top']
  },
  {
    id: 'vowel_u',
    character: 'ᜂ',
    romanized: 'U/O',
    pronunciation: 'oo/oh',
    meaning: 'The third vowel sound, can represent both "u" and "o" sounds',
    strokeOrder: ['Draw the curved main body', 'Add the dot at the top']
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
    title: 'Chapter 1: The Three Sacred Vowels',
    description: 'Discover the foundation of Baybayin - the three vowel sounds that form the heart of ancient Filipino writing.',
    category: LessonCategory.BASIC_VOWELS,
    difficulty: DifficultyLevel.BEGINNER,
    characters: basicVowels,
    estimatedTime: 15,
    content: {
      introduction: "Welcome to your journey into Baybayin, the ancient script of our ancestors! Before we can write words, we must first learn the three sacred vowels that form the foundation of all Baybayin writing. These three characters represent the most fundamental sounds in human speech.",
      sections: [
        {
          title: "The First Vowel: ᜀ (A)",
          content: "The character ᜀ represents the vowel sound 'A' (pronounced 'ah'). This is the most open vowel sound and appears in many Filipino words. Notice how the character resembles a person with arms outstretched - this symbolizes openness and welcome, much like the sound itself.",
          characters: [basicVowels[0]],
          examples: [
            { baybayin: 'ᜀ', romanized: 'A', english: 'ah sound', pronunciation: 'ah' },
            { baybayin: 'ᜀᜋ', romanized: 'AMA', english: 'father', pronunciation: 'ah-mah' }
          ]
        },
        {
          title: "The Second Vowel: ᜁ (I/E)",
          content: "The character ᜁ represents both the 'I' and 'E' sounds. In traditional Baybayin, these sounds were not distinguished as they are similar. The two dots at the top represent the dual nature of this vowel.",
          characters: [basicVowels[1]],
          examples: [
            { baybayin: 'ᜁ', romanized: 'I/E', english: 'ee/eh sound', pronunciation: 'ee/eh' },
            { baybayin: 'ᜁᜈ', romanized: 'INA', english: 'mother', pronunciation: 'ee-nah' }
          ]
        },
        {
          title: "The Third Vowel: ᜂ (O/U)",
          content: "The character ᜂ represents both 'O' and 'U' sounds. The single dot above the curved line represents the rounded nature of these vowel sounds.",
          characters: [basicVowels[2]],
          examples: [
            { baybayin: 'ᜂ', romanized: 'O/U', english: 'oh/oo sound', pronunciation: 'oh/oo' },
            { baybayin: 'ᜂᜎᜓ', romanized: 'ULO', english: 'head', pronunciation: 'oo-loh' }
          ]
        }
      ],
      summary: "You have now learned the three fundamental vowels of Baybayin! These three characters - ᜀ (A), ᜁ (I/E), and ᜂ (O/U) - are the building blocks of all Baybayin words.",
      culturalNote: "In pre-colonial Philippines, these vowel sounds were considered sacred. They represent the breath of life - the very essence of human communication."
    },
    isCompleted: false,
    order: 1,
    badge: {
      id: 'vowel_master',
      name: 'Vowel Master',
      description: 'Mastered all three Baybayin vowels',
      icon: '🔤',
      color: '#FFD700',
      category: 'lesson',
      requirement: 'Complete the Introduction to Baybayin Vowels lesson'
    }
  },
  {
    id: 'lesson_2',
    title: 'Chapter 2: The First Consonant Warriors',
    description: 'Meet the first group of consonant characters - Ba, Ka, Da, Ga, and Ha. These powerful symbols carried the voices of our ancestors.',
    category: LessonCategory.BASIC_CONSONANTS,
    difficulty: DifficultyLevel.BEGINNER,
    characters: basicConsonants.slice(0, 5),
    estimatedTime: 20,
    prerequisites: ['lesson_1'],
    content: {
      introduction: "Now that you know the three sacred vowels, it's time to meet the consonant warriors! Each consonant character in Baybayin has an inherent 'A' sound. This means when you see ᜊ, it's pronounced 'BA', not just 'B'.",
      sections: [
        {
          title: "Understanding Inherent Vowels",
          content: "In Baybayin, every consonant character comes with a built-in 'A' sound. This is called an 'inherent vowel.' So ᜊ is 'BA', ᜃ is 'KA', and so on.",
          examples: [
            { baybayin: 'ᜊ', romanized: 'BA', english: 'not just B, but BA!', pronunciation: 'bah' },
            { baybayin: 'ᜃ', romanized: 'KA', english: 'not just K, but KA!', pronunciation: 'kah' }
          ]
        },
        {
          title: "The Five Warriors",
          content: "Learn the first five consonant characters: ᜊ (BA), ᜃ (KA), ᜇ (DA), ᜄ (GA), and ᜑ (HA). Each carries the power of ancient Filipino writing.",
          characters: basicConsonants.slice(0, 5),
          examples: [
            { baybayin: 'ᜊᜆ', romanized: 'BATA', english: 'child', pronunciation: 'bah-tah' },
            { baybayin: 'ᜃᜐ', romanized: 'KASA', english: 'companion', pronunciation: 'kah-sah' },
            { baybayin: 'ᜇᜆ', romanized: 'DATA', english: 'elder', pronunciation: 'dah-tah' },
            { baybayin: 'ᜄᜎ', romanized: 'GALA', english: 'wander', pronunciation: 'gah-lah' },
            { baybayin: 'ᜑᜎ', romanized: 'HALA', english: 'come on!', pronunciation: 'hah-lah' }
          ]
        }
      ],
      summary: "You've learned your first five consonant characters: ᜊ (BA), ᜃ (KA), ᜇ (DA), ᜄ (GA), and ᜑ (HA). These form the backbone of countless Filipino words.",
      culturalNote: "These five consonants were among the most frequently used in ancient Filipino epics and legends. Scribes would spend years perfecting their forms."
    },
    isCompleted: false,
    order: 2,
    badge: {
      id: 'consonant_apprentice',
      name: 'Consonant Apprentice',
      description: 'Learned your first set of consonants',
      icon: '📝',
      color: '#87CEEB',
      category: 'lesson',
      requirement: 'Complete Basic Consonants Part 1'
    }
  },
  {
    id: 'lesson_3',
    title: 'Chapter 3: The Second Circle of Power',
    description: 'Continue your journey with La, Ma, Na, Nga, and Pa - the second group of consonant guardians.',
    category: LessonCategory.BASIC_CONSONANTS,
    difficulty: DifficultyLevel.BEGINNER,
    characters: basicConsonants.slice(5, 10),
    estimatedTime: 25,
    prerequisites: ['lesson_2'],
    content: {
      introduction: "Welcome to the second circle of power! These five characters - La, Ma, Na, Nga, and Pa - each carry unique spiritual significance in our ancestral writing system.",
      sections: [
        {
          title: "The Second Five Warriors",
          content: "Learn ᜎ (LA), ᜋ (MA), ᜈ (NA), ᜅ (NGA), and ᜉ (PA). Notice how ᜅ (NGA) represents a sound unique to Filipino languages!",
          characters: basicConsonants.slice(5, 10),
          examples: [
            { baybayin: 'ᜎᜑᜆ', romanized: 'LAHAT', english: 'all', pronunciation: 'lah-haht' },
            { baybayin: 'ᜋᜑᜎ', romanized: 'MAHAL', english: 'love', pronunciation: 'mah-hahl' },
            { baybayin: 'ᜈᜋᜈ', romanized: 'NAMAN', english: 'also', pronunciation: 'nah-mahn' },
            { baybayin: 'ᜅᜌᜓ', romanized: 'NGAYO', english: 'now', pronunciation: 'ngah-yoh' },
            { baybayin: 'ᜉᜎᜄ', romanized: 'PALAG', english: 'resist', pronunciation: 'pah-lahg' }
          ]
        }
      ],
      summary: "You now know ten consonant characters! The 'NGA' sound (ᜅ) is special to our Filipino heritage - it's a sound that makes our language unique.",
      culturalNote: "The 'NGA' sound was considered mystical by our ancestors. They believed it connected the physical and spiritual worlds."
    },
    isCompleted: false,
    order: 3,
    badge: {
      id: 'consonant_scholar',
      name: 'Consonant Scholar',
      description: 'Advanced knowledge of consonants',
      icon: '🎓',
      color: '#98FB98',
      category: 'lesson',
      requirement: 'Complete Basic Consonants Part 2'
    }
  },
  {
    id: 'lesson_4',
    title: 'Chapter 4: The Final Circle - Completion of Power',
    description: 'Complete your basic consonant mastery with Ra, Sa, Ta, Wa, and Ya - the final guardians of Baybayin.',
    category: LessonCategory.BASIC_CONSONANTS,
    difficulty: DifficultyLevel.BEGINNER,
    characters: basicConsonants.slice(10),
    estimatedTime: 25,
    prerequisites: ['lesson_3'],
    content: {
      introduction: "You stand at the threshold of mastery! These final five consonants complete the traditional Baybayin alphabet.",
      sections: [
        {
          title: "The Final Five",
          content: "Master ᜍ (RA), ᜐ (SA), ᜆ (TA), ᜏ (WA), and ᜌ (YA) to complete your knowledge of all basic Baybayin characters.",
          characters: basicConsonants.slice(10),
          examples: [
            { baybayin: 'ᜍᜋ', romanized: 'RAMA', english: 'father (respectful)', pronunciation: 'rah-mah' },
            { baybayin: 'ᜐᜋ', romanized: 'SAMA', english: 'together', pronunciation: 'sah-mah' },
            { baybayin: 'ᜆᜂ', romanized: 'TAO', english: 'person', pronunciation: 'tah-oh' },
            { baybayin: 'ᜏᜎ', romanized: 'WALA', english: 'nothing', pronunciation: 'wah-lah' },
            { baybayin: 'ᜌᜋ', romanized: 'YAMAN', english: 'wealth', pronunciation: 'yah-mahn' }
          ]
        }
      ],
      summary: "Congratulations! You have mastered all seventeen basic characters of Baybayin - 3 vowels and 14 consonants.",
      culturalNote: "Completing all basic consonants was traditionally marked by ceremony. You are now part of an unbroken chain of knowledge."
    },
    isCompleted: false,
    order: 4,
    badge: {
      id: 'baybayin_warrior',
      name: 'Baybayin Warrior',
      description: 'Completed all basic character lessons',
      icon: '⚔️',
      color: '#FF6347',
      category: 'lesson',
      requirement: 'Complete Basic Consonants Part 3'
    }
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
