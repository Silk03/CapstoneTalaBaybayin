import { TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Text, View } from '@/components/Themed';
import { useAuth } from '@/contexts/AuthContext';
import { useProgress } from '@/contexts/ProgressContext';
import ProfileSettings from '@/components/auth/ProfileSettings';
import '../../global.css';

export default function TabOneScreen() {
  const { user } = useAuth();
  const { userProgress } = useProgress();
  const [showProfileSettings, setShowProfileSettings] = useState(false);

  const completedLessons = userProgress?.completedLessons?.length || 0;
  const completedQuizzes = userProgress?.completedQuizzes?.length || 0;
  const currentLevel = userProgress?.level || 1;
  const currentStreak = userProgress?.streak || 0;

  const quickActions = [
    {
      title: 'Simulang Mag-aral',
      description: 'Ipagpatuloy ang inyong paglalakbay sa Baybayin',
      icon: 'book-outline',
      color: '#C67C4E',
      action: () => router.push('/(tabs)/progress')
    },
    {
      title: 'Kumuha ng Quiz',
      description: 'Subukan ang inyong kaalaman',
      icon: 'help-circle-outline',
      color: '#0B4CA7',
      action: () => router.push('/(tabs)/quizzes')
    },
    {
      title: 'Magsanay sa Pagsusulat',
      description: 'Pahusayin ang inyong kasanayan sa pagsusulat',
      icon: 'create-outline',
      color: '#059669',
      action: () => router.push('/(tabs)/handwriting')
    },
    {
      title: 'Isalin ang Teksto',
      description: 'Mag-convert sa pagitan ng mga sulat',
      icon: 'language-outline',
      color: '#7C3AED',
      action: () => router.push('/(tabs)/translation')
    }
  ];

  if (showProfileSettings) {
    return (
      <ProfileSettings onBack={() => setShowProfileSettings(false)} />
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-primary p-6 pb-8">
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-white mb-1">
              Kumusta ka, {user?.displayName?.split(' ')[0] || 'Kaibigan'}! 👋
            </Text>
            <Text className="text-orange-100 text-base">
              Handa na ba kayong matuto ng Baybayin ngayon?
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => setShowProfileSettings(true)} 
            className="bg-white/30 rounded-full p-3 border border-white/40"
          >
            <Ionicons name="person-circle-outline" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Cards */}
      <View className="px-4 -mt-4 mb-6">
        <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <View className="flex-row justify-around">
            <View className="items-center">
              <Text className="text-2xl font-bold text-secondary">{currentLevel}</Text>
              <Text className="text-sm text-gray-600">Level</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-primary">{completedLessons}</Text>
              <Text className="text-sm text-gray-600">Aralin</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-green-600">{completedQuizzes}</Text>
              <Text className="text-sm text-gray-600">Quiz</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-orange-500">{currentStreak}</Text>
              <Text className="text-sm text-gray-600">Araw na Tuloy-tuloy</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View className="px-4 mb-6">
        <Text className="text-xl font-bold text-gray-800 mb-4">Mabibiling Aksyon</Text>
        <View className="flex-row flex-wrap justify-between">
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              className="w-[48%] bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
              onPress={action.action}
            >
              <View className="flex-row items-center mb-2">
                <View 
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: action.color + '20' }}
                >
                  <Ionicons name={action.icon as any} size={20} color={action.color} />
                </View>
              </View>
              <Text className="text-base font-semibold text-gray-800 mb-1">
                {action.title}
              </Text>
              <Text className="text-sm text-gray-600 leading-4">
                {action.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Learning Tips */}
      <View className="px-4 mb-8">
        <Text className="text-xl font-bold text-gray-800 mb-4">Mga Tip sa Pag-aaral</Text>
        <View className="bg-secondary-50 rounded-xl p-4 border border-secondary-200">
          <View className="flex-row items-center mb-3">
            <Ionicons name="bulb-outline" size={24} color="#0B4CA7" />
            <Text className="text-lg font-semibold text-secondary-700 ml-2">
              Alam niyo ba?
            </Text>
          </View>
          <Text className="text-secondary-600 leading-5">
            Ang Baybayin ay dating sinusulat mula sa ibaba papunta sa itaas, pagkatapos mula kaliwa papunta sa kanan sa mga kolum. 
            Ngayon, karaniwang sinusulat ito nang pahalang tulad ng modernong teksto!
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
