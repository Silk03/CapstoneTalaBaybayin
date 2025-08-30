import React from 'react';
import { View } from 'react-native';
import TranslationScreen from './TranslationScreen';

export default function TranslationContainer() {
  // Translation should be accessible without authentication
  // Remove auth check to prevent login popup

  return (
    <View style={{ flex: 1 }}>
      <TranslationScreen onBack={() => {}} />
    </View>
  );
}
