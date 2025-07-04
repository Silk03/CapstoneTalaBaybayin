import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { useProgress } from '../../contexts/ProgressContext';
import { db } from '../../config/firebase';

interface ProfileSettingsProps {
  onBack: () => void;
}

export default function ProfileSettings({ onBack }: ProfileSettingsProps) {
  const { user } = useAuth();
  const { userProgress } = useProgress();
  const [username, setUsername] = useState(user?.displayName || '');
  const [loading, setLoading] = useState(false);

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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Profile Settings</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Enter your username"
            autoCapitalize="none"
            placeholderTextColor="#777"
          />
          <Text style={styles.hint}>This will be displayed on the leaderboard</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.emailText}>{user?.email}</Text>
          <Text style={styles.hint}>Email cannot be changed</Text>
        </View>

        <TouchableOpacity
          style={[styles.updateButton, loading && styles.buttonDisabled]}
          onPress={handleUpdateProfile}
          disabled={loading}
        >
          <Text style={styles.updateButtonText}>
            {loading ? 'Updating...' : 'Update Profile'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#fff',
  },
  emailText: {
    fontSize: 15,
    color: '#777',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  hint: {
    fontSize: 12,
    color: '#777',
    marginTop: 5,
  },
  updateButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
});
