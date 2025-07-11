import React, { useState } from 'react';
import { View, TouchableOpacity, Modal, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text } from '@/components/Themed';
import { useAuth } from '@/contexts/AuthContext';
import ProfileSettings from '@/components/auth/ProfileSettings';
import '../../global.css';

interface HamburgerMenuProps {
  currentTab?: string;
}

export default function HamburgerMenu({ currentTab }: HamburgerMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const { user, logout } = useAuth();

  const menuItems = [
    { title: 'Dashboard', icon: 'home-outline', route: '/(tabs)/', tab: 'index' },
    { title: 'Lessons', icon: 'book-outline', route: '/(tabs)/two', tab: 'two' },
    { title: 'Progress', icon: 'bar-chart-outline', route: '/(tabs)/progress', tab: 'progress' },
    { title: 'Quizzes', icon: 'help-circle-outline', route: '/(tabs)/quizzes', tab: 'quizzes' },
    { title: 'Handwriting', icon: 'create-outline', route: '/(tabs)/handwriting', tab: 'handwriting' },
    { title: 'Leaderboard', icon: 'trophy-outline', route: '/(tabs)/leaderboard', tab: 'leaderboard' },
    { title: 'Translate', icon: 'language-outline', route: '/(tabs)/translation', tab: 'translation' },
  ];

  const handleMenuItemPress = (route: string) => {
    setIsMenuOpen(false);
    router.push(route as any);
  };

  const handleProfileSettings = () => {
    setIsMenuOpen(false);
    setShowProfileSettings(true);
  };

  const handleLogout = async () => {
    setIsMenuOpen(false);
    await logout();
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setIsMenuOpen(true)}
        className="p-2"
      >
        <Ionicons name="menu" size={24} color="white" />
      </TouchableOpacity>

      <Modal
        visible={isMenuOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsMenuOpen(false)}
      >
        <SafeAreaView className="flex-1 bg-black/50">
          <View className="flex-1 bg-white w-4/5 shadow-2xl">
            {/* Header */}
            <View className="bg-primary p-6 pb-4">
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-white text-xl font-bold">TalaBaybayin</Text>
                  <Text className="text-orange-100 text-sm">
                    {user?.displayName || user?.email || 'Guest'}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setIsMenuOpen(false)}>
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Menu Items */}
            <ScrollView className="flex-1 p-4">
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.tab}
                  onPress={() => handleMenuItemPress(item.route)}
                  className={`flex-row items-center p-4 rounded-lg mb-2 ${
                    currentTab === item.tab ? 'bg-secondary-50 border-l-4 border-secondary' : 'bg-transparent'
                  }`}
                >
                  <Ionicons 
                    name={item.icon as any} 
                    size={22} 
                    color={currentTab === item.tab ? '#0B4CA7' : '#6B7280'} 
                  />
                  <Text className={`ml-4 text-base font-medium ${
                    currentTab === item.tab ? 'text-secondary' : 'text-gray-700'
                  }`}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Footer */}
            <View className="p-4 border-t border-gray-200">
              <TouchableOpacity
                onPress={handleProfileSettings}
                className="flex-row items-center p-4 bg-secondary-50 rounded-lg mb-2"
              >
                <Ionicons name="settings-outline" size={22} color="#0B4CA7" />
                <Text className="ml-4 text-base font-medium text-secondary">
                  Profile Settings
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleLogout}
                className="flex-row items-center p-4 bg-red-50 rounded-lg"
              >
                <Ionicons name="log-out-outline" size={22} color="#DC2626" />
                <Text className="ml-4 text-base font-medium text-red-600">
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Profile Settings Modal */}
      <Modal
        visible={showProfileSettings}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowProfileSettings(false)}
      >
        <ProfileSettings onBack={() => setShowProfileSettings(false)} />
      </Modal>
    </>
  );
}
