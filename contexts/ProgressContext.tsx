import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import { UserProgress, LessonProgress, Achievement } from '../types/progress';

interface ProgressContextType {
  userProgress: UserProgress | null;
  completeLesson: (lessonId: string, score: number, timeSpent: number) => Promise<void>;
  completeQuiz: (quizId: string, score: number, totalPoints: number, timeSpent: number, answers: { [questionId: string]: string }) => Promise<void>;
  updateStreak: () => Promise<void>;
  addExperience: (points: number) => Promise<void>;
  unlockAchievement: (achievement: Achievement) => Promise<void>;
  getLessonProgress: (lessonId: string) => LessonProgress | null;
  isLessonCompleted: (lessonId: string) => boolean;
  isQuizCompleted: (quizId: string) => boolean;
  getQuizScore: (quizId: string) => number;
  getUserLevel: () => number;
  loading: boolean;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};

interface ProgressProviderProps {
  children: ReactNode;
}

export const ProgressProvider: React.FC<ProgressProviderProps> = ({ children }) => {
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load user progress from Firestore
  useEffect(() => {
    const loadUserProgress = async () => {
      if (!user) {
        setUserProgress(null);
        setLoading(false);
        return;
      }

      try {
        const progressDoc = await getDoc(doc(db, 'userProgress', user.uid));
        
        if (progressDoc.exists()) {
          const data = progressDoc.data() as any;
          // Convert Firestore timestamps back to Date objects
          const progressData: UserProgress = {
            ...data,
            displayName: data.displayName || user.displayName || user.email?.split('@')[0] || 'Anonymous User',
            lastLearningDate: data.lastLearningDate?.toDate ? data.lastLearningDate.toDate() : new Date(data.lastLearningDate || Date.now()),
            achievements: (data.achievements || []).map((achievement: any) => ({
              ...achievement,
              unlockedAt: achievement.unlockedAt?.toDate ? achievement.unlockedAt.toDate() : new Date(achievement.unlockedAt || Date.now())
            }))
          };
          setUserProgress(progressData);
        } else {
          // Create initial progress document
          const initialProgress: UserProgress = {
            userId: user.uid,
            displayName: user.displayName || user.email?.split('@')[0] || 'Anonymous User',
            completedLessons: [],
            lessonScores: {},
            completedQuizzes: [],
            quizScores: {},
            totalScore: 0,
            streak: 0,
            lastLearningDate: new Date(),
            achievements: [],
            level: 1,
            experience: 0,
            totalTimeSpent: 0,
          };
          
          await setDoc(doc(db, 'userProgress', user.uid), initialProgress);
          setUserProgress(initialProgress);
        }
      } catch (error) {
        console.error('Error loading user progress:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserProgress();
  }, [user]);

  const saveProgress = async (progress: UserProgress) => {
    if (!user) return;
    
    try {
      // Ensure display name is included
      const progressToSave = {
        ...progress,
        displayName: progress.displayName || user.displayName || user.email?.split('@')[0] || 'Anonymous User'
      };
      
      // Update local state immediately for better UX
      setUserProgress(progressToSave);
      
      // Then update Firestore using setDoc to replace the entire document
      await setDoc(doc(db, 'userProgress', user.uid), progressToSave);
      
      console.log('Progress saved successfully to Firestore:', {
        completedLessons: progressToSave.completedLessons,
        lessonScores: progressToSave.lessonScores
      });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const completeLesson = async (lessonId: string, score: number, timeSpent: number) => {
    if (!userProgress || !user) return;

    console.log('=== COMPLETING LESSON ===');
    console.log('Lesson ID:', lessonId);
    console.log('Current completed lessons:', userProgress.completedLessons);
    console.log('Is already completed?', userProgress.completedLessons.includes(lessonId));

    const isFirstCompletion = !userProgress.completedLessons.includes(lessonId);
    
    // If it's not the first completion and the score isn't better, skip the update
    const currentScore = userProgress.lessonScores[lessonId] || 0;
    if (!isFirstCompletion && score <= currentScore) {
      console.log('Lesson already completed with equal or better score, skipping update');
      return;
    }

    const experienceGained = isFirstCompletion ? 50 + Math.floor(score / 2) : Math.floor(score / 4);

    // Update streak logic (integrated here to avoid race conditions)
    const today = new Date();
    const lastDate = new Date(userProgress.lastLearningDate);
    const diffTime = Math.abs(today.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let newStreak = userProgress.streak;
    
    if (diffDays === 1) {
      // Continue streak
      newStreak += 1;
    } else if (diffDays > 1) {
      // Reset streak
      newStreak = 1;
    }
    // If same day, keep current streak

    const updatedProgress: UserProgress = {
      ...userProgress,
      completedLessons: isFirstCompletion 
        ? [...userProgress.completedLessons, lessonId]
        : userProgress.completedLessons,
      lessonScores: {
        ...userProgress.lessonScores,
        [lessonId]: Math.max(userProgress.lessonScores[lessonId] || 0, score)
      },
      totalScore: userProgress.totalScore + (isFirstCompletion ? score : 0),
      experience: userProgress.experience + experienceGained,
      totalTimeSpent: userProgress.totalTimeSpent + Math.floor(timeSpent / 60),
      lastLearningDate: today,
      streak: newStreak,
    };

    console.log('Updated completed lessons:', updatedProgress.completedLessons);
    console.log('Updated lesson scores:', updatedProgress.lessonScores);
    console.log('=== END LESSON COMPLETION ===');

    // Check for level up
    const newLevel = Math.floor(updatedProgress.experience / 100) + 1;
    if (newLevel > userProgress.level) {
      updatedProgress.level = newLevel;
      // Add level up achievement
      const levelAchievement: Achievement = {
        id: `level_${newLevel}`,
        title: `Level ${newLevel}`,
        description: `Reached level ${newLevel}!`,
        icon: '🏆',
        unlockedAt: new Date(),
        type: 'score'
      };
      updatedProgress.achievements = [...updatedProgress.achievements, levelAchievement];
    }

    // Check for lesson completion achievements
    if (isFirstCompletion) {
      const completedCount = updatedProgress.completedLessons.length;
      
      if (completedCount === 1) {
        const firstLessonAchievement: Achievement = {
          id: 'first_lesson',
          title: 'First Steps',
          description: 'Completed your first lesson!',
          icon: '🌟',
          unlockedAt: new Date(),
          type: 'lesson'
        };
        updatedProgress.achievements = [...updatedProgress.achievements, firstLessonAchievement];
      }
      
      if (completedCount === 5) {
        const fiveLessonsAchievement: Achievement = {
          id: 'five_lessons',
          title: 'Learning Path',
          description: 'Completed 5 lessons!',
          icon: '📚',
          unlockedAt: new Date(),
          type: 'lesson'
        };
        updatedProgress.achievements = [...updatedProgress.achievements, fiveLessonsAchievement];
      }
    }

    // Check for streak achievements
    if (newStreak === 3 && userProgress.streak < 3) {
      const streakAchievement: Achievement = {
        id: 'streak_3',
        title: '3-Day Streak',
        description: 'Learned for 3 consecutive days!',
        icon: '🔥',
        unlockedAt: new Date(),
        type: 'streak'
      };
      updatedProgress.achievements = [...updatedProgress.achievements, streakAchievement];
    }

    if (newStreak === 7 && userProgress.streak < 7) {
      const weekStreakAchievement: Achievement = {
        id: 'streak_7',
        title: 'Week Warrior',
        description: 'Learned for 7 consecutive days!',
        icon: '🏅',
        unlockedAt: new Date(),
        type: 'streak'
      };
      updatedProgress.achievements = [...updatedProgress.achievements, weekStreakAchievement];
    }

    // Single save operation with all updates
    await saveProgress(updatedProgress);
    
    console.log('=== LESSON COMPLETION SAVED ===');
    console.log('Final lesson completion state:', {
      lessonId,
      completedLessons: updatedProgress.completedLessons,
      isNowCompleted: updatedProgress.completedLessons.includes(lessonId)
    });
    console.log('=== END SAVE CONFIRMATION ===');
  };

  const completeQuiz = async (quizId: string, score: number, totalPoints: number, timeSpent: number, answers: { [questionId: string]: string }) => {
    if (!userProgress || !user) return;

    const isFirstCompletion = !userProgress.completedQuizzes.includes(quizId);
    const experienceGained = isFirstCompletion ? Math.floor(score / 2) : Math.floor(score / 4);

    const updatedProgress: UserProgress = {
      ...userProgress,
      completedQuizzes: isFirstCompletion 
        ? [...userProgress.completedQuizzes, quizId]
        : userProgress.completedQuizzes,
      quizScores: {
        ...userProgress.quizScores,
        [quizId]: Math.max(userProgress.quizScores[quizId] || 0, score)
      },
      totalScore: userProgress.totalScore + (isFirstCompletion ? score : 0),
      experience: userProgress.experience + experienceGained,
      totalTimeSpent: userProgress.totalTimeSpent + Math.floor(timeSpent / 60),
      lastLearningDate: new Date(),
    };

    // Check for quiz achievements
    if (isFirstCompletion) {
      const completedQuizCount = updatedProgress.completedQuizzes.length;
      
      if (completedQuizCount === 1) {
        const firstQuizAchievement: Achievement = {
          id: 'first_quiz',
          title: 'Quiz Master',
          description: 'Completed your first quiz!',
          icon: '🧠',
          unlockedAt: new Date(),
          type: 'lesson'
        };
        updatedProgress.achievements = [...updatedProgress.achievements, firstQuizAchievement];
      }

      if (score >= 95) {
        const perfectScoreAchievement: Achievement = {
          id: `perfect_${quizId}`,
          title: 'Perfect Score!',
          description: 'Scored 95% or higher on a quiz!',
          icon: '💯',
          unlockedAt: new Date(),
          type: 'score'
        };
        updatedProgress.achievements = [...updatedProgress.achievements, perfectScoreAchievement];
      }
    }

    await saveProgress(updatedProgress);
  };

  const updateStreak = async () => {
    // This function is now integrated into completeLesson to avoid race conditions
    // Keeping it for backward compatibility but it will just refetch the latest state
    console.log('updateStreak called - but streak is now updated within lesson completion');
  };

  const addExperience = async (points: number) => {
    if (!userProgress || !user) return;

    const updatedProgress: UserProgress = {
      ...userProgress,
      experience: userProgress.experience + points,
    };

    const newLevel = Math.floor(updatedProgress.experience / 100) + 1;
    if (newLevel > userProgress.level) {
      updatedProgress.level = newLevel;
    }

    await saveProgress(updatedProgress);
  };

  const unlockAchievement = async (achievement: Achievement) => {
    if (!userProgress || !user) return;

    const updatedProgress: UserProgress = {
      ...userProgress,
      achievements: [...userProgress.achievements, achievement],
    };

    await saveProgress(updatedProgress);
  };

  const getLessonProgress = (lessonId: string): LessonProgress | null => {
    if (!userProgress) return null;

    return {
      lessonId,
      isCompleted: userProgress.completedLessons.includes(lessonId),
      score: userProgress.lessonScores[lessonId] || 0,
      timeSpent: 0, // This would need to be tracked separately
      attempts: 1, // This would need to be tracked separately
      completedAt: userProgress.completedLessons.includes(lessonId) 
        ? userProgress.lastLearningDate 
        : undefined
    };
  };

  const isLessonCompleted = (lessonId: string): boolean => {
    return userProgress?.completedLessons.includes(lessonId) || false;
  };

  const isQuizCompleted = (quizId: string): boolean => {
    return userProgress?.completedQuizzes.includes(quizId) || false;
  };

  const getQuizScore = (quizId: string): number => {
    return userProgress?.quizScores[quizId] || 0;
  };

  const getUserLevel = (): number => {
    return userProgress?.level || 1;
  };

  const value = {
    userProgress,
    completeLesson,
    completeQuiz,
    updateStreak,
    addExperience,
    unlockAchievement,
    getLessonProgress,
    isLessonCompleted,
    isQuizCompleted,
    getQuizScore,
    getUserLevel,
    loading,
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};
