import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useProgress } from '../../contexts/ProgressContext';
import LoadingIndicator from '../common/LoadingIndicator';

export default function ProgressScreen() {
  const { userProgress, loading } = useProgress();

  if (loading) {
    return <LoadingIndicator text="Naglo-load ng progreso..." />;
  }

  if (!userProgress) {
    return (
      <View className="flex-1 bg-background">
        <Text className="text-red-500 text-center mt-10">Walang makitang datos ng progreso</Text>
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
            {progressPercentage}/100 XP para sa susunod na level
          </Text>
        </View>
      </View>

      {/* Statistics */}
      <View className="flex-row flex-wrap mx-4 mb-4">
        <View className="w-1/2 p-2">
          <View className="bg-white p-4 rounded-lg shadow-sm items-center border-l-4 border-primary">
            <Text className="text-2xl font-bold text-primary">{userProgress.completedLessons.length}</Text>
            <Text className="text-sm text-gray-600 text-center">Natapos na Aralin</Text>
          </View>
        </View>
        
        <View className="w-1/2 p-2">
          <View className="bg-secondary-50 p-4 rounded-lg shadow-sm items-center border-l-4 border-secondary">
            <Text className="text-2xl font-bold text-secondary">{userProgress.streak}</Text>
            <Text className="text-sm text-secondary-600 text-center">Dagdag pang Araw</Text>
          </View>
        </View>
        
        <View className="w-1/2 p-2">
          <View className="bg-white p-4 rounded-lg shadow-sm items-center border-l-4 border-primary">
            <Text className="text-2xl font-bold text-primary">{Math.round(userProgress.totalScore)}</Text>
            <Text className="text-sm text-gray-600 text-center">Kabuuang Puntos</Text>
          </View>
        </View>
        
        <View className="w-1/2 p-2">
          <View className="bg-secondary-50 p-4 rounded-lg shadow-sm items-center border-l-4 border-secondary">
            <Text className="text-2xl font-bold text-secondary">{userProgress.totalTimeSpent}</Text>
            <Text className="text-sm text-secondary-600 text-center">Minutong Nag-aral</Text>
          </View>
        </View>
      </View>

      {/* Recent Achievements */}
      <View className="mx-4 mb-4">
        <Text className="text-xl font-bold text-gray-800 mb-3">Bagong Nakamit</Text>
        {userProgress.achievements.length === 0 ? (
          <View className="bg-white p-5 rounded-lg shadow-sm">
            <Text className="text-gray-500 text-center">
              Tapusin ang mga aralin para makakuha ng mga parangal!
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
