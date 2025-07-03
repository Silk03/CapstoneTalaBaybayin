import React, { useState } from 'react';
import HandwritingListScreen from './HandwritingListScreen';
import HandwritingPracticeScreen from './HandwritingPracticeScreen';

export interface HandwritingCharacter {
  id: string;
  character: string;
  name: string;
  pronunciation: string;
  strokeOrder: Array<{ x: number; y: number }[]>;
  difficulty: 'easy' | 'medium' | 'hard';
}

export default function HandwritingContainer() {
  const [selectedCharacter, setSelectedCharacter] = useState<HandwritingCharacter | null>(null);

  const handleSelectCharacter = (character: HandwritingCharacter) => {
    setSelectedCharacter(character);
  };

  const handleBack = () => {
    setSelectedCharacter(null);
  };

  if (selectedCharacter) {
    return (
      <HandwritingPracticeScreen 
        character={selectedCharacter}
        onBack={handleBack}
      />
    );
  }

  return <HandwritingListScreen onSelectCharacter={handleSelectCharacter} />;
}
