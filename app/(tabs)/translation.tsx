import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProgressProvider } from '@/contexts/ProgressContext';
import TranslationContainer from '@/components/translation/TranslationContainer';

export default function TranslationTab() {
  return (
    <AuthProvider>
      <ProgressProvider>
        <TranslationContainer />
      </ProgressProvider>
    </AuthProvider>
  );
}
