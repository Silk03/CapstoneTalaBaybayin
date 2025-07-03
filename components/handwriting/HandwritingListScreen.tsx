import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HandwritingCharacter } from './HandwritingContainer';

interface HandwritingListScreenProps {
  onSelectCharacter: (character: HandwritingCharacter) => void;
}

// Sample Baybayin characters for handwriting practice
const handwritingCharacters: HandwritingCharacter[] = [
  {
    id: 'a',
    character: 'ᜀ',
    name: 'A',
    pronunciation: '/a/',
    strokeOrder: [
      [{ x: 50, y: 20 }, { x: 50, y: 80 }], // Vertical line
      [{ x: 30, y: 50 }, { x: 70, y: 50 }], // Horizontal line
    ],
    difficulty: 'easy',
  },
  {
    id: 'i',
    character: 'ᜁ',
    name: 'I',
    pronunciation: '/i/',
    strokeOrder: [
      [{ x: 50, y: 20 }, { x: 50, y: 80 }], // Vertical line
      [{ x: 40, y: 30 }, { x: 60, y: 30 }], // Top horizontal
      [{ x: 40, y: 70 }, { x: 60, y: 70 }], // Bottom horizontal
    ],
    difficulty: 'easy',
  },
  {
    id: 'u',
    character: 'ᜂ',
    name: 'U',
    pronunciation: '/u/',
    strokeOrder: [
      [{ x: 30, y: 20 }, { x: 30, y: 60 }, { x: 70, y: 60 }, { x: 70, y: 20 }], // U shape
    ],
    difficulty: 'easy',
  },
  {
    id: 'ba',
    character: 'ᜊ',
    name: 'BA',
    pronunciation: '/ba/',
    strokeOrder: [
      [{ x: 50, y: 20 }, { x: 50, y: 80 }], // Vertical line
      [{ x: 30, y: 40 }, { x: 70, y: 40 }], // Horizontal line
      [{ x: 30, y: 60 }, { x: 60, y: 60 }], // Bottom line
    ],
    difficulty: 'medium',
  },
  {
    id: 'ka',
    character: 'ᜃ',
    name: 'KA',
    pronunciation: '/ka/',
    strokeOrder: [
      [{ x: 50, y: 20 }, { x: 50, y: 80 }], // Vertical line
      [{ x: 50, y: 30 }, { x: 70, y: 50 }], // Top diagonal
      [{ x: 50, y: 70 }, { x: 70, y: 50 }], // Bottom diagonal
    ],
    difficulty: 'medium',
  },
];

export default function HandwritingListScreen({ onSelectCharacter }: HandwritingListScreenProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#F44336';
      default: return '#757575';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'leaf';
      case 'medium': return 'flash';
      case 'hard': return 'flame';
      default: return 'help';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Handwriting Practice</Text>
        <Text style={styles.subtitle}>Practice writing Baybayin characters</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.charactersGrid}>
          {handwritingCharacters.map((character) => (
            <TouchableOpacity
              key={character.id}
              style={styles.characterCard}
              onPress={() => onSelectCharacter(character)}
              activeOpacity={0.7}
            >
              <View style={styles.characterHeader}>
                <Text style={styles.characterSymbol}>{character.character}</Text>
                <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(character.difficulty) }]}>
                  <Ionicons
                    name={getDifficultyIcon(character.difficulty) as any}
                    size={12}
                    color="white"
                  />
                </View>
              </View>
              
              <Text style={styles.characterName}>{character.name}</Text>
              <Text style={styles.characterPronunciation}>{character.pronunciation}</Text>
              
              <View style={styles.practiceButton}>
                <Ionicons name="create" size={16} color="#2196F3" />
                <Text style={styles.practiceText}>Practice</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>How to Practice</Text>
          <Text style={styles.helpText}>
            • Tap on a character to start practicing{'\n'}
            • Follow the stroke order guides{'\n'}
            • Draw the character on the practice area{'\n'}
            • Get feedback on your writing
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  charactersGrid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  characterCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  characterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  characterSymbol: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    flex: 1,
  },
  difficultyBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  characterName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  characterPronunciation: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  practiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2FD',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  practiceText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
    marginLeft: 4,
  },
  helpSection: {
    margin: 16,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
