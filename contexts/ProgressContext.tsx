
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import { UserProgress, LessonProgress, Achievement, ActivityType, DailyActivity, Badge } from '../types/progress';

interface ProgressContextType {
  userProgress: UserProgress | null;
  completeLesson: (lessonId: string, score: number, timeSpent: number) => Promise<void>;
  completeQuiz: (quizId: string, score: number, totalPoints: number, timeSpent: number, answers: { [questionId: string]: string }, questionData: { id: string; correctAnswer: string; points: number }[]) => Promise<number>;
  trackActivity: (activityType: ActivityType) => Promise<void>;
  addExperience: (points: number) => Promise<void>;
  unlockAchievement: (achievement: Achievement) => Promise<void>;
  awardBadge: (badgeId: string, badgeName: string, description: string, icon: string, color: string, category: 'lesson' | 'quiz' | 'streak' | 'mastery' | 'cultural', requirement: string) => Promise<Badge | null>;
  getLessonProgress: (lessonId: string) => LessonProgress | null;
  isLessonCompleted: (lessonId: string) => boolean;
  isQuizCompleted: (quizId: string) => boolean;
  getQuizScore: (quizId: string) => number;
  getQuizAttempts: (quizId: string) => number;
  getQuestionPoints: (questionId: string) => number;
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
            // Migration: Add new fields if they don't exist
            lastActivityDate: data.lastActivityDate?.toDate ? data.lastActivityDate.toDate() : (data.lastLearningDate?.toDate ? data.lastLearningDate.toDate() : new Date()),
            dailyActivities: data.dailyActivities || [],
            badges: data.badges || [],
            quizAttempts: data.quizAttempts || {},
            questionPoints: data.questionPoints || {},
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
            quizAttempts: {},
            questionPoints: {},
            totalScore: 0,
            streak: 0,
            lastLearningDate: new Date(),
            lastActivityDate: new Date(),
            dailyActivities: [],
            achievements: [],
            badges: [],
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
    if (!user) {
      console.error('saveProgress: No user logged in');
      return;
    }
    
    try {
      // Ensure display name is included
      const progressToSave = {
        ...progress,
        displayName: progress.displayName || user.displayName || user.email?.split('@')[0] || 'Anonymous User'
      };
      
      console.log('saveProgress: About to save progress:', {
        userId: user.uid,
        completedLessons: progressToSave.completedLessons,
        lessonScores: progressToSave.lessonScores,
        badges: progressToSave.badges,
        experience: progressToSave.experience,
        level: progressToSave.level
      });
      
      // Update local state immediately for better UX
      setUserProgress(progressToSave);
      
      // Then update Firestore using setDoc to replace the entire document
      await setDoc(doc(db, 'userProgress', user.uid), progressToSave);
      
      console.log('Progress saved successfully to Firestore:', {
        completedLessons: progressToSave.completedLessons,
        lessonScores: progressToSave.lessonScores,
        saveTimestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving progress - DETAILED:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        userId: user.uid
      });
      throw error; // Re-throw so calling function knows it failed
    }
  };

  const completeLesson = async (lessonId: string, score: number, timeSpent: number) => {
    if (!userProgress || !user) {
      console.error('completeLesson: Missing userProgress or user:', { userProgress: !!userProgress, user: !!user });
      return;
    }

    console.log('=== COMPLETING LESSON ===');
    console.log('Lesson ID:', lessonId);
    console.log('Score:', score);
    console.log('Time spent:', timeSpent);
    console.log('Current completed lessons:', userProgress.completedLessons);
    console.log('Is already completed?', userProgress.completedLessons?.includes(lessonId));

    // Track the lesson completion activity (this will also update streak if needed)
    await trackActivity(ActivityType.LESSON_COMPLETED);

    const isFirstCompletion = !userProgress.completedLessons?.includes(lessonId);
    
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
        ? [...(userProgress.completedLessons || []), lessonId]
        : userProgress.completedLessons || [],
      lessonScores: {
        ...(userProgress.lessonScores || {}),
        [lessonId]: Math.max(userProgress.lessonScores?.[lessonId] || 0, score)
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
    try {
      await saveProgress(updatedProgress);
      
      console.log('=== LESSON COMPLETION SAVED ===');
      console.log('Final lesson completion state:', {
        lessonId,
        completedLessons: updatedProgress.completedLessons,
        isNowCompleted: updatedProgress.completedLessons.includes(lessonId),
        experience: updatedProgress.experience,
        level: updatedProgress.level
      });
      console.log('=== END SAVE CONFIRMATION ===');
    } catch (error) {
      console.error('Failed to save lesson completion:', error);
      throw error; // Let calling component know it failed
    }
  };

  const completeQuiz = async (quizId: string, score: number, totalPoints: number, timeSpent: number, answers: { [questionId: string]: string }, questionData: { id: string; correctAnswer: string; points: number }[]): Promise<number> => {
    if (!userProgress || !user) return 0;
    
    console.log('=== QUIZ COMPLETION DEBUG START ===');
    console.log('Quiz ID:', quizId);
    console.log('Score:', score);
    console.log('User answers:', answers);
    console.log('Question data:', questionData);
    
    // Safety check for questionData
    if (!questionData || !Array.isArray(questionData)) {
      console.error('completeQuiz: questionData is undefined or not an array', {
        questionData,
        type: typeof questionData,
        isArray: Array.isArray(questionData)
      });
      return 0;
    }

    // Track the quiz completion activity (this will also update streak if needed)
    await trackActivity(ActivityType.QUIZ_COMPLETED);

    // Track attempts - increment even if quiz was already completed
    const currentAttempts = (userProgress.quizAttempts?.[quizId] || 0) + 1;
    const isFirstCompletion = !userProgress.completedQuizzes?.includes(quizId);
    
    console.log('Current attempts:', currentAttempts);
    console.log('Is first completion:', isFirstCompletion);
    console.log('Current questionPoints:', userProgress.questionPoints);

    // Calculate new points earned this attempt (only for questions not previously answered correctly)
    let newPointsEarned = 0;
    const updatedQuestionPoints = { ...(userProgress.questionPoints || {}) };

    questionData.forEach(question => {
      const userAnswer = answers[question.id];
      const isCorrect = userAnswer === question.correctAnswer;
      const alreadyEarned = updatedQuestionPoints[question.id] || 0;
      
      console.log(`Question ${question.id}:`, {
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        questionPoints: question.points,
        alreadyEarned
      });

      // Only award points if correct and haven't earned points for this question before
      if (isCorrect && alreadyEarned === 0) {
        updatedQuestionPoints[question.id] = question.points;
        newPointsEarned += question.points;
        console.log(`✅ Awarded ${question.points} points for question ${question.id}`);
      } else if (!isCorrect) {
        console.log(`❌ Wrong answer for question ${question.id}`);
      } else if (alreadyEarned > 0) {
        console.log(`⚠️ Already earned ${alreadyEarned} points for question ${question.id}`);
      }
    });

    const experienceGained = isFirstCompletion ? Math.floor(newPointsEarned / 2) : Math.floor(newPointsEarned / 4);
    
    console.log('Points calculation:', {
      newPointsEarned,
      experienceGained,
      isFirstCompletion,
      currentTotalScore: userProgress.totalScore,
      currentExperience: userProgress.experience
    });

    const updatedProgress: UserProgress = {
      ...userProgress,
      completedQuizzes: isFirstCompletion 
        ? [...(userProgress.completedQuizzes || []), quizId]
        : userProgress.completedQuizzes || [],
      quizScores: {
        ...(userProgress.quizScores || {}),
        [quizId]: Math.max(userProgress.quizScores?.[quizId] || 0, score)
      },
      quizAttempts: {
        ...(userProgress.quizAttempts || {}),
        [quizId]: currentAttempts
      },
      questionPoints: updatedQuestionPoints,
      totalScore: userProgress.totalScore + newPointsEarned,
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
    
    console.log('=== QUIZ COMPLETION FINAL RESULTS ===');
    console.log('New points earned:', newPointsEarned);
    console.log('Experience gained:', experienceGained);
    console.log('Updated total score:', updatedProgress.totalScore);
    console.log('Updated experience:', updatedProgress.experience);
    console.log('Updated question points:', updatedProgress.questionPoints);
    console.log('=== QUIZ COMPLETION DEBUG END ===');
    
    // Return the new points earned for UI feedback
    return newPointsEarned;
  };

  const updateStreak = async () => {
    // This function is now integrated into completeLesson to avoid race conditions
    // Keeping it for backward compatibility but it will just refetch the latest state
    console.log('updateStreak called - but streak is now updated within lesson completion');
  };

  // Track user activity and update daily streak
  const trackActivity = async (activityType: ActivityType) => {
    if (!userProgress || !user) return;

    const today = new Date();
    const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Check if this is the first activity of the day
    const lastActivityDate = userProgress.lastActivityDate ? new Date(userProgress.lastActivityDate) : new Date(0);
    const lastActivityString = lastActivityDate.toISOString().split('T')[0];
    
    const isFirstActivityToday = todayString !== lastActivityString;
    
    // Update or create today's activity record
    let dailyActivities = [...(userProgress.dailyActivities || [])];
    let todayActivity = dailyActivities.find(activity => activity.date === todayString);
    
    if (!todayActivity) {
      todayActivity = {
        date: todayString,
        activities: [],
        lessonsStarted: 0,
        lessonsCompleted: 0,
        quizzesStarted: 0,
        quizzesCompleted: 0,
        handwritingPracticed: false,
        translationUsed: false,
        totalActiveTime: 0
      };
      dailyActivities.push(todayActivity);
    }
    
    // Update activity counts
    if (!todayActivity.activities.includes(activityType)) {
      todayActivity.activities.push(activityType);
    }
    
    switch (activityType) {
      case ActivityType.LESSON_STARTED:
        todayActivity.lessonsStarted += 1;
        break;
      case ActivityType.LESSON_COMPLETED:
        todayActivity.lessonsCompleted += 1;
        break;
      case ActivityType.QUIZ_STARTED:
        todayActivity.quizzesStarted += 1;
        break;
      case ActivityType.QUIZ_COMPLETED:
        todayActivity.quizzesCompleted += 1;
        break;
      case ActivityType.HANDWRITING_PRACTICED:
        todayActivity.handwritingPracticed = true;
        break;
      case ActivityType.TRANSLATION_USED:
        todayActivity.translationUsed = true;
        break;
    }
    
    // Update daily activities array
    const activityIndex = dailyActivities.findIndex(activity => activity.date === todayString);
    dailyActivities[activityIndex] = todayActivity;
    
    // Keep only last 30 days of activities
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    dailyActivities = dailyActivities.filter(activity => 
      new Date(activity.date) >= thirtyDaysAgo
    );
    
    // Calculate new streak only if this is the first activity of the day
    let newStreak = userProgress.streak;
    if (isFirstActivityToday) {
      const diffTime = today.getTime() - lastActivityDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        // Continue streak - user was active yesterday and is active today
        newStreak += 1;
      } else if (diffDays > 1) {
        // Reset streak - there was a gap in activity
        newStreak = 1;
      }
      // If same day (diffDays === 0), keep current streak
    }
    
    const updatedProgress: UserProgress = {
      ...userProgress,
      lastActivityDate: today,
      dailyActivities,
      streak: newStreak,
    };
    
    await saveProgress(updatedProgress);
  };

  const addExperience = async (points: number) => {
    if (!userProgress || !user) return;

    console.log('=== ADD EXPERIENCE DEBUG ===');
    console.log('Adding experience points:', points);
    console.log('Current experience:', userProgress.experience);
    console.log('Current level:', userProgress.level);

    const updatedProgress: UserProgress = {
      ...userProgress,
      experience: userProgress.experience + points,
    };

    const newLevel = Math.floor(updatedProgress.experience / 100) + 1;
    if (newLevel > userProgress.level) {
      updatedProgress.level = newLevel;
      console.log('Level up! New level:', newLevel);
    }
    
    console.log('Final experience:', updatedProgress.experience);
    console.log('Final level:', updatedProgress.level);
    console.log('=== END ADD EXPERIENCE DEBUG ===');

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
      isCompleted: userProgress.completedLessons?.includes(lessonId) || false,
      score: userProgress.lessonScores?.[lessonId] || 0,
      timeSpent: 0, // This would need to be tracked separately
      attempts: 1, // This would need to be tracked separately
      completedAt: userProgress.completedLessons?.includes(lessonId) 
        ? userProgress.lastLearningDate 
        : undefined
    };
  };

  const isLessonCompleted = (lessonId: string): boolean => {
    return userProgress?.completedLessons?.includes(lessonId) || false;
  };

  const isQuizCompleted = (quizId: string): boolean => {
    return userProgress?.completedQuizzes?.includes(quizId) || false;
  };

  const getQuizScore = (quizId: string): number => {
    return userProgress?.quizScores[quizId] || 0;
  };

  const getQuizAttempts = (quizId: string): number => {
    return userProgress?.quizAttempts?.[quizId] || 0;
  };

  const getQuestionPoints = (questionId: string): number => {
    return userProgress?.questionPoints?.[questionId] || 0;
  };

  const getUserLevel = (): number => {
    return userProgress?.level || 1;
  };

  const awardBadge = async (badgeId: string, badgeName: string, description: string, icon: string, color: string, category: 'lesson' | 'quiz' | 'streak' | 'mastery' | 'cultural', requirement: string): Promise<Badge | null> => {
    if (!userProgress || !user) return null;

    // Check if badge already earned
    const existingBadge = userProgress.badges?.find(b => b.id === badgeId);
    if (existingBadge) return null;

    const newBadge: Badge = {
      id: badgeId,
      name: badgeName,
      description,
      icon,
      color,
      category,
      requirement,
      earnedAt: new Date()
    };

    const updatedProgress: UserProgress = {
      ...userProgress,
      badges: [...(userProgress.badges || []), newBadge]
    };

    await saveProgress(updatedProgress);
    return newBadge;
  };

  const value = {
    userProgress,
    completeLesson,
    completeQuiz,
    trackActivity,
    addExperience,
    unlockAchievement,
    awardBadge,
    getLessonProgress,
    isLessonCompleted,
    isQuizCompleted,
    getQuizScore,
    getQuizAttempts,
    getQuestionPoints,
    getUserLevel,
    loading,
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};
