import React from 'react';
import { ProgressProvider } from '@/contexts/ProgressContext';
import TranslationScreen from '@/components/translation/TranslationScreen';
import { View } from 'react-native';

export default function TranslationTab() {
  // Simplified structure - direct translation screen with only necessary provider
  return (
    <ProgressProvider>
      <View style={{ flex: 1 }}>
        <TranslationScreen onBack={() => {}} />
      </View>
    </ProgressProvider>
  );
}
