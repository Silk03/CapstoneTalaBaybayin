import { Quiz, QuizQuestion, QuestionType, QuizCategory, DifficultyLevel } from '../types/quiz';

// Sample quiz questions
const beginnerQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    type: QuestionType.CHARACTER_RECOGNITION,
    question: 'What is the romanized form of this Baybayin character?',
    baybayinCharacter: 'ᜀ',
    options: ['A', 'E', 'O', 'I'],
    correctAnswer: 'A',
    explanation: 'ᜀ represents the vowel sound "A" in Baybayin.',
    difficulty: DifficultyLevel.BEGINNER,
    points: 10
  },
  {
    id: 'q2',
    type: QuestionType.ROMANIZED_TO_BAYBAYIN,
    question: 'Which Baybayin character represents "BA"?',
    romanizedCharacter: 'BA',
    options: ['ᜊ', 'ᜃ', 'ᜇ', 'ᜄ'],
    correctAnswer: 'ᜊ',
    explanation: 'ᜊ is the Baybayin character for "BA".',
    difficulty: DifficultyLevel.BEGINNER,
    points: 10
  },
  {
    id: 'q3',
    type: QuestionType.MULTIPLE_CHOICE,
    question: 'How many basic vowel sounds are there in Baybayin?',
    options: ['2', '3', '4', '5'],
    correctAnswer: '3',
    explanation: 'Baybayin has 3 basic vowel sounds: A, E/I, and O/U.',
    difficulty: DifficultyLevel.BEGINNER,
    points: 10
  },
  {
    id: 'q4',
    type: QuestionType.CHARACTER_RECOGNITION,
    question: 'What sound does this character make?',
    baybayinCharacter: 'ᜋ',
    options: ['MA', 'NA', 'LA', 'SA'],
    correctAnswer: 'MA',
    explanation: 'ᜋ represents the "MA" sound in Baybayin.',
    difficulty: DifficultyLevel.BEGINNER,
    points: 10
  },
  {
    id: 'q5',
    type: QuestionType.TRUE_FALSE,
    question: 'Baybayin is read from left to right.',
    options: ['True', 'False'],
    correctAnswer: 'True',
    explanation: 'Modern Baybayin is typically written and read from left to right.',
    difficulty: DifficultyLevel.BEGINNER,
    points: 10
  }
];

const intermediateQuestions: QuizQuestion[] = [
  {
    id: 'q6',
    type: QuestionType.CHARACTER_RECOGNITION,
    question: 'Which character represents "NGA"?',
    baybayinCharacter: 'ᜅ',
    options: ['NA', 'NGA', 'GA', 'HA'],
    correctAnswer: 'NGA',
    explanation: 'ᜅ represents the "NGA" sound, which is unique to Filipino languages.',
    difficulty: DifficultyLevel.INTERMEDIATE,
    points: 15
  },
  {
    id: 'q7',
    type: QuestionType.ROMANIZED_TO_BAYBAYIN,
    question: 'How would you write "TALA" in Baybayin?',
    romanizedCharacter: 'TALA',
    options: ['ᜆᜎ', 'ᜆᜀᜎᜀ', 'ᜆᜎᜀ', 'ᜆᜁᜎᜁ'],
    correctAnswer: 'ᜆᜎ',
    explanation: 'In traditional Baybayin, consonants have an inherent "A" sound, so TALA is written as TA-LA (ᜆᜎ).',
    difficulty: DifficultyLevel.INTERMEDIATE,
    points: 20
  },
  {
    id: 'q8',
    type: QuestionType.MULTIPLE_CHOICE,
    question: 'What is the traditional direction of writing Baybayin?',
    options: ['Left to right', 'Right to left', 'Top to bottom', 'Bottom to top'],
    correctAnswer: 'Bottom to top',
    explanation: 'Traditional Baybayin was written from bottom to top, then left to right in columns.',
    difficulty: DifficultyLevel.INTERMEDIATE,
    points: 15
  }
];

const advancedQuestions: QuizQuestion[] = [
  {
    id: 'q9',
    type: QuestionType.ROMANIZED_TO_BAYBAYIN,
    question: 'How would you write "BAYBAYIN" in traditional Baybayin script?',
    romanizedCharacter: 'BAYBAYIN',
    options: ['ᜊᜌ᜔ᜊᜌᜒᜈ᜔', 'ᜊᜌᜊᜌᜒᜈ', 'ᜊᜌ᜔ᜊᜌᜈ᜔', 'ᜊᜌᜊᜌᜈ'],
    correctAnswer: 'ᜊᜌ᜔ᜊᜌᜒᜈ᜔',
    explanation: 'BAYBAYIN uses the virama (᜔) to cancel the inherent "A" sound and kudlit (ᜒ) for "I" sound.',
    difficulty: DifficultyLevel.ADVANCED,
    points: 25
  },
  {
    id: 'q10',
    type: QuestionType.CHARACTER_RECOGNITION,
    question: 'What does this character with a kudlit represent?',
    baybayinCharacter: 'ᜃᜓ',
    options: ['KA', 'KI', 'KU', 'KO'],
    correctAnswer: 'KU',
    explanation: 'The kudlit above (ᜓ) changes the inherent "A" sound to "U/O", making this "KU".',
    difficulty: DifficultyLevel.ADVANCED,
    points: 20
  },
  {
    id: 'q11',
    type: QuestionType.MULTIPLE_CHOICE,
    question: 'Which Spanish colonial period policy significantly impacted the use of Baybayin?',
    options: ['Doctrina Christiana', 'Polo y servicios', 'Reduccion policy', 'All of the above'],
    correctAnswer: 'All of the above',
    explanation: 'Multiple Spanish policies affected Baybayin: Doctrina Christiana introduced Latin script, Polo y servicios disrupted education, and Reduccion centralized communities away from traditional practices.',
    difficulty: DifficultyLevel.ADVANCED,
    points: 30
  },
  {
    id: 'q12',
    type: QuestionType.TRUE_FALSE,
    question: 'The virama (᜔) symbol in Baybayin was introduced during the Spanish period.',
    options: ['True', 'False'],
    correctAnswer: 'True',
    explanation: 'The virama (᜔) was adopted from the Indian scripts during Spanish colonization to help transcribe Spanish words that ended in consonants.',
    difficulty: DifficultyLevel.ADVANCED,
    points: 20
  },
  {
    id: 'q13',
    type: QuestionType.ROMANIZED_TO_BAYBAYIN,
    question: 'How would you write "PILIPINAS" using traditional Baybayin?',
    romanizedCharacter: 'PILIPINAS',
    options: ['ᜉᜒᜎᜒᜉᜒᜈᜐ᜔', 'ᜉᜒᜎᜒᜉᜒᜈᜐ', 'ᜉᜎᜉᜈᜐ', 'ᜉᜒᜎᜉᜒᜈᜐ'],
    correctAnswer: 'ᜉᜒᜎᜒᜉᜒᜈᜐ᜔',
    explanation: 'PILIPINAS requires kudlit (ᜒ) for "I" sounds and virama (᜔) to end with the "S" consonant.',
    difficulty: DifficultyLevel.ADVANCED,
    points: 25
  },
  {
    id: 'q14',
    type: QuestionType.MULTIPLE_CHOICE,
    question: 'In pre-colonial Philippines, Baybayin was primarily written on what material?',
    options: ['Bamboo', 'Tree bark', 'Palm leaves', 'All of the above'],
    correctAnswer: 'All of the above',
    explanation: 'Pre-colonial Filipinos wrote Baybayin on various organic materials including bamboo, tree bark, and palm leaves using pointed tools.',
    difficulty: DifficultyLevel.ADVANCED,
    points: 20
  },
  {
    id: 'q15',
    type: QuestionType.CHARACTER_RECOGNITION,
    question: 'What sound does this character combination make?',
    baybayinCharacter: 'ᜈ᜔ᜌ',
    options: ['NA-YA', 'NYA', 'N-YA', 'NAYA'],
    correctAnswer: 'NYA',
    explanation: 'When consonants are combined with virama (᜔), they can form consonant clusters like "NYA".',
    difficulty: DifficultyLevel.ADVANCED,
    points: 25
  }
];

// Sample quizzes
export const quizzes: Quiz[] = [
  {
    id: 'quiz_1',
    title: 'Baybayin Basics Quiz',
    description: 'Test your knowledge of basic Baybayin vowels and consonants',
    questions: beginnerQuestions,
    timeLimit: 300, // 5 minutes
    passingScore: 70, // 70% to pass
    category: QuizCategory.CHARACTER_RECOGNITION,
    difficulty: DifficultyLevel.BEGINNER,
    prerequisiteLessons: ['lesson_1', 'lesson_2'],
    badge: {
      id: 'quiz_beginner',
      name: 'Character Scholar',
      description: 'Passed the beginner character recognition quiz',
      icon: '📖',
      color: '#4CAF50',
      category: 'quiz',
      requirement: 'Score 70% or higher on Baybayin Basics Quiz'
    }
  },
  {
    id: 'quiz_2',
    title: 'Intermediate Baybayin Quiz',
    description: 'Advanced character recognition and writing concepts',
    questions: intermediateQuestions,
    timeLimit: 240, // 4 minutes
    passingScore: 75,
    category: QuizCategory.MIXED,
    difficulty: DifficultyLevel.INTERMEDIATE,
    prerequisiteLessons: ['lesson_1', 'lesson_2', 'lesson_3'],
    badge: {
      id: 'quiz_intermediate',
      name: 'Script Warrior',
      description: 'Mastered intermediate Baybayin concepts',
      icon: '⚔️',
      color: '#FF9800',
      category: 'quiz',
      requirement: 'Score 75% or higher on Intermediate Baybayin Quiz'
    }
  },
  {
    id: 'quiz_3',
    title: 'Quick Character Recognition',
    description: 'Fast-paced character identification quiz',
    questions: beginnerQuestions.slice(0, 3),
    timeLimit: 120, // 2 minutes
    passingScore: 80,
    category: QuizCategory.CHARACTER_RECOGNITION,
    difficulty: DifficultyLevel.BEGINNER,
    prerequisiteLessons: ['lesson_1'],
    badge: {
      id: 'quiz_speed',
      name: 'Lightning Reader',
      description: 'Quickly recognized Baybayin characters',
      icon: '⚡',
      color: '#FFEB3B',
      category: 'quiz',
      requirement: 'Score 80% or higher on Quick Character Recognition'
    }
  },
  {
    id: 'quiz_4',
    title: 'Advanced Baybayin Mastery',
    description: 'Master-level quiz covering complex writing, historical context, and advanced character combinations',
    questions: advancedQuestions,
    timeLimit: 480, // 8 minutes
    passingScore: 85, // 85% to pass
    category: QuizCategory.COMPREHENSIVE,
    difficulty: DifficultyLevel.ADVANCED,
    prerequisiteLessons: ['lesson_1', 'lesson_2', 'lesson_3', 'lesson_4'],
    badge: {
      id: 'quiz_master',
      name: 'Baybayin Master',
      description: 'Achieved mastery of Baybayin script',
      icon: '👑',
      color: '#9C27B0',
      category: 'quiz',
      requirement: 'Score 85% or higher on Advanced Baybayin Mastery'
    }
  }
];

export const getQuizById = (id: string): Quiz | undefined => {
  return quizzes.find(quiz => quiz.id === id);
};

export const getQuizzesByDifficulty = (difficulty: DifficultyLevel): Quiz[] => {
  return quizzes.filter(quiz => quiz.difficulty === difficulty);
};

export const getQuizzesByCategory = (category: QuizCategory): Quiz[] => {
  return quizzes.filter(quiz => quiz.category === category);
};
