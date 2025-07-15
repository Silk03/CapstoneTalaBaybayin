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
  const menuItemAnimations = useRef(
    Array.from({ length: 7 }, () => ({
      opacity: new Animated.Value(0),
      translateX: new Animated.Value(-30),
      scale: new Animated.Value(0.8),
    }))
  ).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerScale = useRef(new Animated.Value(0.9)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;
  const footerTranslateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (isMenuOpen) {
      // Reset animations
      slideAnim.setValue(-300);
      overlayOpacity.setValue(0);
      menuItemAnimations.forEach(anim => {
        anim.opacity.setValue(0);
        anim.translateX.setValue(-30);
        anim.scale.setValue(0.8);
      });
      headerOpacity.setValue(0);
      headerScale.setValue(0.9);
      footerOpacity.setValue(0);
      footerTranslateY.setValue(20);

      // Start animations with improved easing
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]).start();

      // Header animation with scale
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(headerOpacity, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(headerScale, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.back(1.1)),
            useNativeDriver: true,
          }),
        ]).start();
      }, 150);

      // Staggered menu item animations with scale
      menuItemAnimations.forEach((anim, index) => {
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(anim.opacity, {
              toValue: 1,
              duration: 250,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(anim.translateX, {
              toValue: 0,
              duration: 250,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(anim.scale, {
              toValue: 1,
              duration: 250,
              easing: Easing.out(Easing.back(1.2)),
              useNativeDriver: true,
            }),
          ]).start();
        }, 250 + index * 40);
      });

      // Footer animation with slide up
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(footerOpacity, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(footerTranslateY, {
            toValue: 0,
            duration: 300,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start();
      }, 700);
    }
  }, [isMenuOpen]);

  const closeMenu = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 250,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 250,
        easing: Easing.ease,
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
    closeMenu();
    setTimeout(() => {
      router.push(route as any);
    }, 200);
  };

  const handleProfileSettings = () => {
    closeMenu();
    setTimeout(() => {
      setShowProfileSettings(true);
    }, 200);
  };

  const handleLogout = async () => {
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
                    opacity: headerOpacity,
                    transform: [{ scale: headerScale }],
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
                          { scale: menuItemAnimations[index].scale },
                        ],
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => handleMenuItemPress(item.route)}
                        className={`flex-row items-center p-4 rounded-lg mb-2 ${
                          currentTab === item.tab ? 'bg-secondary-50 border-l-4 border-secondary' : 'bg-transparent'
                        }`}
                        activeOpacity={0.7}
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
                    opacity: footerOpacity,
                    transform: [{ translateY: footerTranslateY }],
                  }}
                >
                  <TouchableOpacity
                    onPress={handleProfileSettings}
                    className="flex-row items-center p-4 bg-secondary-50 rounded-lg mb-2"
                    activeOpacity={0.7}
                  >
                    <Ionicons name="settings-outline" size={22} color="#0B4CA7" />
                    <Text className="ml-4 text-base font-medium text-secondary">
                      Profile Settings
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={handleLogout}
                    className="flex-row items-center p-4 bg-red-50 rounded-lg"
                    activeOpacity={0.7}
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
