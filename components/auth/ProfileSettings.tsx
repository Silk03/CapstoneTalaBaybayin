import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { useProgress } from '../../contexts/ProgressContext';
import { db } from '../../config/firebase';
import '../../global.css';

interface ProfileSettingsProps {
  onBack: () => void;
}

export default function ProfileSettings({ onBack }: ProfileSettingsProps) {
  const { user, logout } = useAuth();
  const { userProgress } = useProgress();
  const [username, setUsername] = useState(user?.displayName || '');
  const [loading, setLoading] = useState(false);

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

  const handleUpdateProfile = async () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Username cannot be empty');
      return;
    }

    if (username.length < 3) {
      Alert.alert('Error', 'Username must be at least 3 characters');
      return;
    }

    if (!user) return;

    try {
      setLoading(true);
      
      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: username.trim()
      });

      // Update user document in Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        username: username.trim(),
        displayName: username.trim(),
        updatedAt: new Date(),
      });

      // Update progress document with new display name
      if (userProgress) {
        await updateDoc(doc(db, 'userProgress', user.uid), {
          displayName: username.trim()
        });
      }

      Alert.alert('Success', 'Profile updated successfully!');
      onBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center p-5 bg-white border-b border-secondary-200">
        <TouchableOpacity onPress={onBack} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#0B4CA7" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-secondary-700">Profile Settings</Text>
      </View>

      <ScrollView className="flex-1">
        <View className="p-5">
          <View className="mb-6">
            <Text className="text-base font-semibold text-secondary-700 mb-2">Username</Text>
            <TextInput
              className="border border-secondary-300 rounded-lg p-3 text-base bg-white focus:border-secondary-500"
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your username"
              autoCapitalize="none"
              placeholderTextColor="#777"
            />
            <Text className="text-xs text-secondary-500 mt-1">This will be displayed on the leaderboard</Text>
          </View>

          <View className="mb-6">
            <Text className="text-base font-semibold text-secondary-700 mb-2">Email</Text>
            <Text className="text-base text-secondary-600 p-3 bg-secondary-50 rounded-lg border border-secondary-200">
              {user?.email}
            </Text>
            <Text className="text-xs text-secondary-500 mt-1">Email cannot be changed</Text>
          </View>

          <TouchableOpacity
            className={`rounded-lg p-4 items-center mt-5 ${
              loading ? 'bg-gray-300' : 'bg-primary'
            }`}
            onPress={handleUpdateProfile}
            disabled={loading}
          >
            <Text className="text-white text-base font-medium">
              {loading ? 'Updating...' : 'Update Profile'}
            </Text>
          </TouchableOpacity>

          {/* Logout Section */}
          <View className="mt-8 pt-6 border-t border-gray-200">
            <TouchableOpacity
              className="bg-red-500 rounded-lg p-4 items-center"
              onPress={handleLogout}
            >
              <View className="flex-row items-center">
                <Ionicons name="log-out-outline" size={20} color="white" />
                <Text className="text-white text-base font-medium ml-2">
                  Logout
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
