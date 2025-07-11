import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

interface LoginScreenProps {
  onSwitchToSignup: () => void;
}

export default function LoginScreen({ onSwitchToSignup }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
    } catch (error: any) {
      Alert.alert('Login Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-gray-50" 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}>
        <View className="items-center mb-10">
          <Text className="text-4xl font-bold text-primary mb-2">TalaBaybayin</Text>
          <Text className="text-base text-gray-600 text-center">Learn the Ancient Filipino Script</Text>
        </View>

        <View className="bg-white p-8 rounded-2xl shadow-sm">
          <Text className="text-2xl font-bold text-center mb-8 text-gray-800">Welcome Back!</Text>
          
          <TextInput
            className="border border-gray-300 p-4 rounded-lg mb-4 text-base bg-gray-50"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#777"
          />

          <TextInput
            className="border border-gray-300 p-4 rounded-lg mb-4 text-base bg-gray-50"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#777"
          />

          <TouchableOpacity 
            className={`p-4 rounded-lg items-center mt-3 ${loading ? 'bg-gray-300' : 'bg-primary'}`}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text className="text-white text-lg font-bold">
              {loading ? 'Signing In...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <View className="flex-row justify-center mt-5">
            <Text className="text-gray-600 text-base">Don't have an account? </Text>
            <TouchableOpacity onPress={onSwitchToSignup}>
              <Text className="text-primary text-lg font-bold">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
