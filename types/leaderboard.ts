export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  totalScore: number;
  level: number;
  streak: number;
  rank: number;
  experience: number;
  completedLessons: number;
  completedQuizzes: number;
}

export interface LeaderboardFilter {
  period: 'all-time' | 'weekly' | 'monthly';
  category: 'total-score' | 'level' | 'streak' | 'lessons' | 'quizzes';
}
