import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Modal, SafeAreaView, ScrollView, Animated, Easing } from 'react-native';
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

  // Animation values
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const menuItemAnimations = useRef(
    Array.from({ length: 7 }, () => ({
      opacity: new Animated.Value(0),
      translateX: new Animated.Value(-15),
    }))
  ).current;

  useEffect(() => {
    if (isMenuOpen) {
      // Reset all animations to initial state
      slideAnim.setValue(-300);
      overlayOpacity.setValue(0);
      contentOpacity.setValue(0);
      menuItemAnimations.forEach(anim => {
        anim.opacity.setValue(0);
        anim.translateX.setValue(-15);
      });

      // Start menu slide and overlay
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        // After menu appears, fade in content
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }).start();

        // Simple menu items animation
        menuItemAnimations.forEach((anim, index) => {
          setTimeout(() => {
            Animated.parallel([
              Animated.timing(anim.opacity, {
                toValue: 1,
                duration: 150,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
              }),
              Animated.timing(anim.translateX, {
                toValue: 0,
                duration: 150,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
              }),
            ]).start();
          }, index * 25);
        });
      });
    }
  }, [isMenuOpen]);

  const closeMenu = () => {
    // Simple and fast close
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 200,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsMenuOpen(false);
    });
  };

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
    if (!isMenuOpen) return; // Prevent action if menu is closing
    
    closeMenu();
    setTimeout(() => {
      router.push(route as any);
    }, 200);
  };

  const handleProfileSettings = () => {
    if (!isMenuOpen) return; // Prevent action if menu is closing
    
    closeMenu();
    setTimeout(() => {
      setShowProfileSettings(true);
    }, 200);
  };

  const handleLogout = async () => {
    if (!isMenuOpen) return; // Prevent action if menu is closing
    
    closeMenu();
    setTimeout(async () => {
      await logout();
    }, 200);
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
        animationType="none"
        onRequestClose={closeMenu}
      >
        <Animated.View 
          className="flex-1 bg-black/50"
          style={{ opacity: overlayOpacity }}
        >
          <TouchableOpacity 
            className="flex-1" 
            activeOpacity={1} 
            onPress={closeMenu}
          >
            <SafeAreaView className="flex-1">
              <Animated.View 
                className="flex-1 bg-white w-4/5 shadow-2xl"
                style={{ 
                  transform: [{ translateX: slideAnim }] 
                }}
              >
                {/* Header */}
                <Animated.View 
                  className="bg-primary p-6 pb-4"
                  style={{ 
                    opacity: contentOpacity,
                  }}
                >
                  <View className="flex-row justify-between items-center">
                    <View>
                      <Text className="text-white text-xl font-bold">TalaBaybayin</Text>
                      <Text className="text-orange-100 text-sm">
                        {user?.displayName || user?.email || 'Guest'}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={closeMenu}>
                      <Ionicons name="close" size={24} color="white" />
                    </TouchableOpacity>
                  </View>
                </Animated.View>

                {/* Menu Items */}
                <ScrollView className="flex-1 p-4">
                  {menuItems.map((item, index) => (
                    <Animated.View
                      key={item.tab}
                      style={{
                        opacity: menuItemAnimations[index].opacity,
                        transform: [
                          { translateX: menuItemAnimations[index].translateX },
                        ],
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => handleMenuItemPress(item.route)}
                        className={`flex-row items-center p-4 rounded-lg mb-2 ${
                          currentTab === item.tab ? 'bg-secondary-50 border-l-4 border-secondary' : 'bg-transparent'
                        }`}
                        activeOpacity={0.8}
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
                    </Animated.View>
                  ))}
                </ScrollView>

                {/* Footer */}
                <Animated.View 
                  className="p-4 border-t border-gray-200"
                  style={{ 
                    opacity: contentOpacity,
                  }}
                >
                  <TouchableOpacity
                    onPress={handleProfileSettings}
                    className="flex-row items-center p-4 bg-secondary-50 rounded-lg mb-2"
                    activeOpacity={0.8}
                  >
                    <Ionicons name="settings-outline" size={22} color="#0B4CA7" />
                    <Text className="ml-4 text-base font-medium text-secondary">
                      Profile Settings
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={handleLogout}
                    className="flex-row items-center p-4 bg-red-50 rounded-lg"
                    activeOpacity={0.8}
                  >
                    <Ionicons name="log-out-outline" size={22} color="#DC2626" />
                    <Text className="ml-4 text-base font-medium text-red-600">
                      Logout
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              </Animated.View>
            </SafeAreaView>
          </TouchableOpacity>
        </Animated.View>
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
