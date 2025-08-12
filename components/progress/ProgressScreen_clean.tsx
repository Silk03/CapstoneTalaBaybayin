import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useProgress } from '../../contexts/ProgressContext';

export default function ProgressScreen() {
  const { userProgress, loading } = useProgress();

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-base text-gray-600">Loading progress...</Text>
      </View>
    );
  }

  if (!userProgress) {
    return (
      <View className="flex-1 bg-background">
        <Text className="text-red-500 text-center mt-10">No progress data available</Text>
      </View>
    );
  }

  const progressPercentage = Math.min((userProgress.experience % 100), 100);

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-5 bg-primary">
        <Text className="text-2xl font-bold text-white text-center">Your Progress</Text>
      </View>

      {/* Level and Experience */}
      <View className="m-4 p-5 bg-white rounded-xl shadow-sm">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold text-gray-800">Level {userProgress.level}</Text>
          <Text className="text-lg text-primary font-semibold">
            {userProgress.experience} XP
          </Text>
        </View>
        
        <View>
          <View className="bg-gray-200 rounded-full h-3 mb-2">
            <View 
              className="bg-primary rounded-full h-3" 
              style={{ width: `${progressPercentage}%` }}
            />
          </View>
          <Text className="text-sm text-gray-600 text-center">
            {progressPercentage}/100 XP to next level
          </Text>
        </View>
      </View>

      {/* Stats Cards */}
      <View className="mx-4 mb-6 flex-row justify-between">
        <View className="bg-white p-4 rounded-lg shadow-sm flex-1 mr-2">
          <Text className="text-2xl font-bold text-primary text-center">
            {userProgress.completedLessons.length}
          </Text>
          <Text className="text-sm text-gray-600 text-center">Lessons</Text>
          <Text className="text-sm text-gray-600 text-center">Completed</Text>
        </View>
        
        <View className="bg-white p-4 rounded-lg shadow-sm flex-1 ml-2">
          <Text className="text-2xl font-bold text-primary text-center">
            {userProgress.quizScores ? Object.keys(userProgress.quizScores).length : 0}
          </Text>
          <Text className="text-sm text-gray-600 text-center">Quizzes</Text>
          <Text className="text-sm text-gray-600 text-center">Taken</Text>
        </View>
      </View>

      {/* Badges */}
      <View className="mx-4 mb-6">
        <Text className="text-xl font-bold text-gray-800 mb-3">Badges Earned</Text>
        {!userProgress.badges || userProgress.badges.length === 0 ? (
          <View className="bg-white p-5 rounded-lg shadow-sm">
            <Text className="text-gray-500 text-center">
              Complete lessons and quizzes to earn badges!
            </Text>
          </View>
        ) : (
          <View className="bg-white p-4 rounded-lg shadow-sm">
            <View className="flex-row flex-wrap">
              {userProgress.badges.map((badge, index) => (
                <View 
                  key={badge.id} 
                  className="bg-gray-50 p-3 rounded-lg shadow-sm mb-3 mr-3 items-center"
                  style={{ width: '45%' }}
                >
                  <Text className="text-2xl mb-2">{badge.icon}</Text>
                  <Text className="text-sm font-semibold text-gray-800 text-center">{badge.name}</Text>
                  <Text className="text-xs text-gray-600 text-center mt-1">{badge.description}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Achievements */}
      <View className="mx-4 mb-6">
        <Text className="text-xl font-bold text-gray-800 mb-3">Recent Achievements</Text>
        {!userProgress.achievements || userProgress.achievements.length === 0 ? (
          <View className="bg-white p-5 rounded-lg shadow-sm">
            <Text className="text-gray-500 text-center">
              Complete lessons to unlock achievements!
            </Text>
          </View>
        ) : (
          <View>
            {userProgress.achievements
              .slice(-3)
              .reverse()
              .map((achievement, index) => (
                <View key={achievement.id} className="bg-white p-4 rounded-lg shadow-sm mb-3 flex-row items-center">
                  <Text className="text-3xl mr-4">{achievement.icon}</Text>
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-800">{achievement.title}</Text>
                    <Text className="text-sm text-gray-600">
                      {achievement.description}
                    </Text>
                  </View>
                </View>
              ))}
          </View>
        )}
      </View>

      {/* Lesson Progress */}
      <View className="mx-4 mb-6">
        <Text className="text-xl font-bold text-gray-800 mb-3">Lesson Scores</Text>
        {Object.keys(userProgress.lessonScores).length === 0 ? (
          <View className="bg-white p-5 rounded-lg shadow-sm">
            <Text className="text-gray-500 text-center">
              Start learning to see your lesson scores!
            </Text>
          </View>
        ) : (
          <View>
            {Object.entries(userProgress.lessonScores)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([lessonId, score]) => (
                <View key={lessonId} className="bg-secondary-50 p-4 rounded-lg shadow-sm mb-3 flex-row justify-between items-center border-l-4 border-secondary">
                  <Text className="text-base font-medium text-secondary-700">Lesson {lessonId}</Text>
                  <View className="items-end">
                    <Text className="text-xl font-bold text-primary">{Math.round(score)}</Text>
                    <Text className="text-sm text-secondary-500">points</Text>
                  </View>
                </View>
              ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
