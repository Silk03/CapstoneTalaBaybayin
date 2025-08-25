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
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

interface SignupScreenProps {
  onSwitchToLogin: () => void;
}

export default function SignupScreen({ onSwitchToLogin }: SignupScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword || !username) {
      Alert.alert('Error', 'Pakipunan ang lahat ng patlang');
      return;
    }

    if (username.length < 3) {
      Alert.alert('Error', 'Ang username ay dapat hindi bababa sa 3 na titik');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Hindi magkatugma ang mga password');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Ang password ay dapat hindi bababa sa 6 na titik');
      return;
    }

    try {
      setLoading(true);
      await signup(email, password, username);
      Alert.alert('Tagumpay', 'Matagumpay na nagawa ang account!');
    } catch (error: any) {
      Alert.alert('Error sa Pag-signup', error.message);
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
          <Text className="text-base text-gray-600 text-center">Sumama sa Paglalakbay ng Pag-aaral</Text>
        </View>

        <View className="bg-white p-8 rounded-2xl shadow-sm">
          <Text className="text-2xl font-bold text-center mb-8 text-gray-800">Gumawa ng Account</Text>
          
          <TextInput
            className="border border-gray-300 p-4 rounded-lg mb-4 text-base bg-gray-50"
            placeholder="Pangalan ng user"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            placeholderTextColor="#666"
          />
          
          <TextInput
            className="border border-gray-300 p-4 rounded-lg mb-4 text-base bg-gray-50"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#700"
          />

          <TextInput
            className="border border-gray-300 p-4 rounded-lg mb-4 text-base bg-gray-50"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#777"
          />

          <TextInput
            className="border border-gray-300 p-4 rounded-lg mb-4 text-base bg-gray-50"
            placeholder="Ulitin ang Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholderTextColor="#777"
          />

          <TouchableOpacity 
            className={`p-4 rounded-lg items-center mt-3 ${loading ? 'bg-gray-300' : 'bg-primary'}`}
            onPress={handleSignup}
            disabled={loading}
          >
            <Text className="text-white text-lg font-bold">
              {loading ? 'Ginagawa ang Account...' : 'Mag-signup'}
            </Text>
          </TouchableOpacity>

          <View className="flex-row justify-center mt-5">
            <Text className="text-gray-600 text-base">May account na? </Text>
            <TouchableOpacity onPress={onSwitchToLogin}>
              <Text className="text-primary text-lg font-bold">Mag-login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
