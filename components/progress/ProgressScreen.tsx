import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useProgress } from '../../contexts/ProgressContext';

export default function ProgressScreen() {
  const { userProgress, loading } = useProgress();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading progress...</Text>
      </View>
    );
  }

  if (!userProgress) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No progress data available</Text>
      </View>
    );
  }

  const progressPercentage = Math.min((userProgress.experience % 100), 100);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Progress</Text>
      </View>

      {/* Level and Experience */}
      <View style={styles.levelCard}>
        <View style={styles.levelHeader}>
          <Text style={styles.levelTitle}>Level {userProgress.level}</Text>
          <Text style={styles.experienceText}>
            {userProgress.experience} XP
          </Text>
        </View>
        
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${progressPercentage}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {progressPercentage}/100 XP to next level
          </Text>
        </View>
      </View>

      {/* Statistics */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{userProgress.completedLessons.length}</Text>
          <Text style={styles.statLabel}>Lessons Completed</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{userProgress.streak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{Math.round(userProgress.totalScore)}</Text>
          <Text style={styles.statLabel}>Total Score</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{userProgress.totalTimeSpent}</Text>
          <Text style={styles.statLabel}>Minutes Learned</Text>
        </View>
      </View>

      {/* Recent Achievements */}
      <View style={styles.achievementsSection}>
        <Text style={styles.sectionTitle}>Recent Achievements</Text>
        {userProgress.achievements.length === 0 ? (
          <View style={styles.noAchievements}>
            <Text style={styles.noAchievementsText}>
              Complete lessons to unlock achievements!
            </Text>
          </View>
        ) : (
          <View style={styles.achievementsList}>
            {userProgress.achievements
              .slice(-3)
              .reverse()
              .map((achievement, index) => (
                <View key={achievement.id} style={styles.achievementCard}>
                  <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                  <View style={styles.achievementContent}>
                    <Text style={styles.achievementTitle}>{achievement.title}</Text>
                    <Text style={styles.achievementDescription}>
                      {achievement.description}
                    </Text>
                  </View>
                </View>
              ))}
          </View>
        )}
      </View>

      {/* Lesson Progress */}
      <View style={styles.lessonProgressSection}>
        <Text style={styles.sectionTitle}>Lesson Scores</Text>
        {Object.keys(userProgress.lessonScores).length === 0 ? (
          <View style={styles.noProgress}>
            <Text style={styles.noProgressText}>
              Start learning to see your lesson scores!
            </Text>
          </View>
        ) : (
          <View style={styles.lessonScoresList}>
            {Object.entries(userProgress.lessonScores)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([lessonId, score]) => (
                <View key={lessonId} style={styles.lessonScoreCard}>
                  <Text style={styles.lessonId}>Lesson {lessonId}</Text>
                  <View style={styles.scoreContainer}>
                    <Text style={styles.score}>{Math.round(score)}</Text>
                    <Text style={styles.scoreLabel}>points</Text>
                  </View>
                </View>
              ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    backgroundColor: '#8B4513',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  levelCard: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  levelTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  experienceText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  progressBarContainer: {
    marginTop: 10,
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#8B4513',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: 'white',
    width: '48%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  achievementsSection: {
    margin: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  noAchievements: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  noAchievementsText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  achievementsList: {
    gap: 10,
  },
  achievementCard: {
    backgroundColor: 'white',
    flexDirection: 'row',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  achievementIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  lessonProgressSection: {
    margin: 15,
    marginBottom: 30,
  },
  noProgress: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  noProgressText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  lessonScoresList: {
    gap: 10,
  },
  lessonScoreCard: {
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  lessonId: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  score: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#666',
    marginLeft: 3,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
