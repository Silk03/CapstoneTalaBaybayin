import React, { useState } from 'react';
import { View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import AuthContainer from '../auth/AuthContainer';
import TranslationScreen from './TranslationScreen';

export default function TranslationContainer() {
  const { user } = useAuth();

  if (!user) {
    return <AuthContainer />;
  }

  return (
    <View style={{ flex: 1 }}>
      <TranslationScreen onBack={() => {}} />
    </View>
  );
}
