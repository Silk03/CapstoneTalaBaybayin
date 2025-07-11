import { TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import { useAuth } from '@/contexts/AuthContext';
import { useProgress } from '@/contexts/ProgressContext';
import ProfileSettings from '@/components/auth/ProfileSettings';

export default function TabOneScreen() {
  const { user, logout } = useAuth();
  const { userProgress } = useProgress();
  const [showProfileSettings, setShowProfileSettings] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout }
      ]
    );
  };

  if (showProfileSettings) {
    return (
      <ProfileSettings onBack={() => setShowProfileSettings(false)} />
    );
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="items-center justify-center p-5">
        <View className="flex-row justify-between items-center w-full mb-3">
          <View>
            <Text className="text-xl font-bold text-primary">Welcome to TalaBaybayin!</Text>
            <Text className="text-base text-gray-600 mt-2">Hello, {user?.displayName || user?.email}</Text>
          </View>
          <TouchableOpacity onPress={() => setShowProfileSettings(true)} className="p-1">
            <Ionicons name="person-circle" size={32} color="#C67C4E" />
          </TouchableOpacity>
        </View>
        <View className="my-8 h-px w-4/5 bg-gray-200" />
        
        {/* Debug Progress Info */}
        <View className="bg-white p-4 rounded-lg my-3 w-full border border-gray-200">
          <Text className="text-lg font-bold mb-3 text-gray-800">Debug: User Progress</Text>
          <Text className="text-xs text-gray-600 mb-1 font-mono">
            Completed Lessons: {userProgress?.completedLessons?.join(', ') || 'None'}
          </Text>
          <Text className="text-xs text-gray-600 mb-1 font-mono">
            Lesson Scores: {userProgress?.lessonScores ? JSON.stringify(userProgress.lessonScores) : 'None'}
          </Text>
          <Text className="text-xs text-gray-600 mb-1 font-mono">
            Total Score: {userProgress?.totalScore || 0}
          </Text>
          <Text className="text-xs text-gray-600 mb-1 font-mono">
            Experience: {userProgress?.experience || 0}
          </Text>
          <Text className="text-xs text-gray-600 mb-1 font-mono">
            Level: {userProgress?.level || 1}
          </Text>
        </View>
        
        <TouchableOpacity className="bg-primary px-5 py-3 rounded-lg mb-5" onPress={handleLogout}>
          <Text className="text-white text-lg font-bold">Logout</Text>
        </TouchableOpacity>
        
        <EditScreenInfo path="app/(tabs)/index.tsx" />
      </View>
    </ScrollView>
  );
}
