import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import { UserProgress, LessonProgress, Achievement } from '../types/progress';

interface ProgressContextType {
  userProgress: UserProgress | null;
  completeLesson: (lessonId: string, score: number, timeSpent: number) => Promise<void>;
  updateStreak: () => Promise<void>;
  addExperience: (points: number) => Promise<void>;
  unlockAchievement: (achievement: Achievement) => Promise<void>;
  getLessonProgress: (lessonId: string) => LessonProgress | null;
  isLessonCompleted: (lessonId: string) => boolean;
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
            completedLessons: [],
            lessonScores: {},
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
      await updateDoc(doc(db, 'userProgress', user.uid), { ...progress });
      setUserProgress(progress);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const completeLesson = async (lessonId: string, score: number, timeSpent: number) => {
    if (!userProgress || !user) return;

    const isFirstCompletion = !userProgress.completedLessons.includes(lessonId);
    const experienceGained = isFirstCompletion ? 50 + Math.floor(score / 2) : Math.floor(score / 4);

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
      lastLearningDate: new Date(),
    };

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

    await saveProgress(updatedProgress);
  };

  const updateStreak = async () => {
    if (!userProgress || !user) return;

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
      streak: newStreak,
      lastLearningDate: today,
    };

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

    await saveProgress(updatedProgress);
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

  const getUserLevel = (): number => {
    return userProgress?.level || 1;
  };

  const value = {
    userProgress,
    completeLesson,
    updateStreak,
    addExperience,
    unlockAchievement,
    getLessonProgress,
    isLessonCompleted,
    getUserLevel,
    loading,
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};
