import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import HamburgerMenu from '@/components/common/HamburgerMenu';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0B4CA7',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#0B4CA7',
          borderTopWidth: 1,
        },
        headerStyle: {
          backgroundColor: '#C67C4E',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          headerLeft: () => <HamburgerMenu currentTab="index" />,
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="info-circle"
                    size={25}
                    color="#ffffff"
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Lessons',
          tabBarIcon: ({ color }) => <TabBarIcon name="book" color={color} />,
          headerLeft: () => <HamburgerMenu currentTab="two" />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color }) => <TabBarIcon name="bar-chart" color={color} />,
          headerLeft: () => <HamburgerMenu currentTab="progress" />,
        }}
      />
      <Tabs.Screen
        name="quizzes"
        options={{
          title: 'Quizzes',
          tabBarIcon: ({ color }) => <TabBarIcon name="question-circle" color={color} />,
          headerLeft: () => <HamburgerMenu currentTab="quizzes" />,
        }}
      />
      <Tabs.Screen
        name="handwriting"
        options={{
          title: 'Handwriting',
          tabBarIcon: ({ color }) => <TabBarIcon name="edit" color={color} />,
          headerLeft: () => <HamburgerMenu currentTab="handwriting" />,
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Leaderboard',
          tabBarIcon: ({ color }) => <TabBarIcon name="trophy" color={color} />,
          headerLeft: () => <HamburgerMenu currentTab="leaderboard" />,
        }}
      />
      <Tabs.Screen
        name="translation"
        options={{
          title: 'Translate',
          tabBarIcon: ({ color }) => <TabBarIcon name="language" color={color} />,
          headerLeft: () => <HamburgerMenu currentTab="translation" />,
        }}
      />
      <Tabs.Screen
        name="nativewind"
        options={{
          title: 'Styles',
          tabBarIcon: ({ color }) => <TabBarIcon name="paint-brush" color={color} />,
          headerLeft: () => <HamburgerMenu currentTab="nativewind" />,
        }}
      />
    </Tabs>
  );
}
