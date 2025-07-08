import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';

const { height: screenHeight } = Dimensions.get('window');

// Baybayin character mappings
const BAYBAYIN_CHARACTERS: Record<string, string> = {
  // Vowels
  'a': 'ᜀ',
  'i': 'ᜁ',
  'u': 'ᜂ',
  
  // Consonants
  'ka': 'ᜃ', 'ki': 'ᜃᜒ', 'ku': 'ᜃᜓ',
  'ga': 'ᜄ', 'gi': 'ᜄᜒ', 'gu': 'ᜄᜓ',
  'nga': 'ᜅ', 'ngi': 'ᜅᜒ', 'ngu': 'ᜅᜓ',
  'ta': 'ᜆ', 'ti': 'ᜆᜒ', 'tu': 'ᜆᜓ',
  'da': 'ᜇ', 'di': 'ᜇᜒ', 'du': 'ᜇᜓ',
  'na': 'ᜈ', 'ni': 'ᜈᜒ', 'nu': 'ᜈᜓ',
  'pa': 'ᜉ', 'pi': 'ᜉᜒ', 'pu': 'ᜉᜓ',
  'ba': 'ᜊ', 'bi': 'ᜊᜒ', 'bu': 'ᜊᜓ',
  'ma': 'ᜋ', 'mi': 'ᜋᜒ', 'mu': 'ᜋᜓ',
  'ya': 'ᜌ', 'yi': 'ᜌᜒ', 'yu': 'ᜌᜓ',
  'ra': 'ᜍ', 'ri': 'ᜍᜒ', 'ru': 'ᜍᜓ',
  'la': 'ᜎ', 'li': 'ᜎᜒ', 'lu': 'ᜎᜓ',
  'wa': 'ᜏ', 'wi': 'ᜏᜒ', 'wu': 'ᜏᜓ',
  'sa': 'ᜐ', 'si': 'ᜐᜒ', 'su': 'ᜐᜓ',
  'ha': 'ᜑ', 'hi': 'ᜑᜒ', 'hu': 'ᜑᜓ',
  
  // Consonant endings (virama)
  'k': 'ᜃ᜔', 'g': 'ᜄ᜔', 'ng': 'ᜅ᜔',
  't': 'ᜆ᜔', 'd': 'ᜇ᜔', 'n': 'ᜈ᜔',
  'p': 'ᜉ᜔', 'b': 'ᜊ᜔', 'm': 'ᜋ᜔',
  'y': 'ᜌ᜔', 'r': 'ᜍ᜔', 'l': 'ᜎ᜔',
  'w': 'ᜏ᜔', 's': 'ᜐ᜔', 'h': 'ᜑ᜔',
};

// Keyboard layout
const KEYBOARD_LAYOUT = [
  // Vowels row
  [
    { key: 'a', baybayin: 'ᜀ', label: 'a' },
    { key: 'i', baybayin: 'ᜁ', label: 'i' },
    { key: 'u', baybayin: 'ᜂ', label: 'u' },
  ],
  // Main consonants with 'a' sound
  [
    { key: 'ka', baybayin: 'ᜃ', label: 'ka' },
    { key: 'ga', baybayin: 'ᜄ', label: 'ga' },
    { key: 'nga', baybayin: 'ᜅ', label: 'nga' },
    { key: 'ta', baybayin: 'ᜆ', label: 'ta' },
    { key: 'da', baybayin: 'ᜇ', label: 'da' },
    { key: 'na', baybayin: 'ᜈ', label: 'na' },
  ],
  [
    { key: 'pa', baybayin: 'ᜉ', label: 'pa' },
    { key: 'ba', baybayin: 'ᜊ', label: 'ba' },
    { key: 'ma', baybayin: 'ᜋ', label: 'ma' },
    { key: 'ya', baybayin: 'ᜌ', label: 'ya' },
    { key: 'ra', baybayin: 'ᜍ', label: 'ra' },
    { key: 'la', baybayin: 'ᜎ', label: 'la' },
  ],
  [
    { key: 'wa', baybayin: 'ᜏ', label: 'wa' },
    { key: 'sa', baybayin: 'ᜐ', label: 'sa' },
    { key: 'ha', baybayin: 'ᜑ', label: 'ha' },
    { key: 'space', baybayin: ' ', label: 'Space' },
    { key: 'backspace', baybayin: '', label: '⌫' },
  ],
];

const VOWEL_MODIFIERS = [
  { key: 'i', symbol: 'ᜒ', label: 'i' },
  { key: 'u', symbol: 'ᜓ', label: 'u' },
  { key: 'virama', symbol: '᜔', label: '᜔' },
];

interface BaybayinKeyboardProps {
  visible: boolean;
  onClose: () => void;
  onTextChange: (text: string) => void;
  initialText?: string;
  placeholder?: string;
}

export default function BaybayinKeyboard({
  visible,
  onClose,
  onTextChange,
  initialText = '',
  placeholder = 'Type in Baybayin...',
}: BaybayinKeyboardProps) {
  const [text, setText] = useState(initialText);
  const [romanizedText, setRomanizedText] = useState('');
  const [showVowelModifiers, setShowVowelModifiers] = useState(false);
  const [selectedConsonant, setSelectedConsonant] = useState<string | null>(null);

  // Simple TTS for character pronunciation
  const speakCharacter = async (key: string) => {
    try {
      // Convert key to a more pronounceable form
      let pronunciation = key;
      if (key.length === 2) {
        // For consonant+vowel combinations like 'ka', 'ga', etc.
        pronunciation = key;
      } else if (key === 'nga') {
        pronunciation = 'nga';
      } else if (key === 'virama') {
        pronunciation = 'virama';
      }
      
      await Speech.speak(pronunciation, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.7,
      });
    } catch (error) {
      console.log('TTS error in keyboard:', error);
    }
  };

  const handleKeyPress = (key: string, baybayin: string) => {
    if (key === 'backspace') {
      const newText = text.slice(0, -1);
      setText(newText);
      return;
    }

    if (key === 'space') {
      const newText = text + ' ';
      setText(newText);
      return;
    }

    // Check if it's a consonant that can take vowel modifiers
    const isConsonant = ['ka', 'ga', 'nga', 'ta', 'da', 'na', 'pa', 'ba', 'ma', 'ya', 'ra', 'la', 'wa', 'sa', 'ha'].includes(key);
    
    if (isConsonant) {
      setSelectedConsonant(key);
      setShowVowelModifiers(true);
      // Don't add to text yet, wait for vowel modifier selection
      return;
    }

    // For vowels and other characters, add directly
    const newText = text + baybayin;
    setText(newText);
  };

  const handleVowelModifier = (modifier: string, symbol: string) => {
    if (!selectedConsonant) return;

    let newText = text;
    if (modifier === 'virama') {
      // Add consonant with virama (consonant ending)
      const consonantChar = BAYBAYIN_CHARACTERS[selectedConsonant.charAt(0)] || selectedConsonant;
      newText += consonantChar + symbol;
    } else {
      // Add consonant with vowel modifier
      const consonantKey = selectedConsonant.charAt(0) + modifier;
      const baybayinChar = BAYBAYIN_CHARACTERS[consonantKey] || selectedConsonant;
      newText += baybayinChar;
    }

    setText(newText);
    setShowVowelModifiers(false);
    setSelectedConsonant(null);
  };

  const handleDone = () => {
    onTextChange(text);
    onClose();
  };

  const handleCancel = () => {
    setText(initialText);
    onClose();
  };

  const convertToRomanized = (baybayinText: string): string => {
    // Simple reverse mapping for demonstration
    // In a real app, this would be more sophisticated
    let romanized = baybayinText;
    
    Object.entries(BAYBAYIN_CHARACTERS).forEach(([roman, baybayin]) => {
      romanized = romanized.replace(new RegExp(baybayin, 'g'), roman);
    });
    
    return romanized;
  };

  React.useEffect(() => {
    setRomanizedText(convertToRomanized(text));
  }, [text]);

  // Don't render if not visible
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.keyboardContainer}>
      {/* Compact Header */}
      <View style={styles.compactHeader}>
        <Text style={styles.keyboardTitle}>Baybayin Keyboard</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="keypad-outline" size={20} color="#8B4513" />
        </TouchableOpacity>
      </View>

      {/* Text Preview */}
      <View style={styles.textPreview}>
          <Text style={styles.previewText} numberOfLines={2}>
            {text || placeholder}
          </Text>
          {text && (
            <TouchableOpacity onPress={handleDone} style={styles.doneButtonCompact}>
              <Ionicons name="checkmark" size={16} color="white" />
              <Text style={styles.doneTextCompact}>Done</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Keyboard */}
        <ScrollView style={styles.keyboardContent} showsVerticalScrollIndicator={false}>
          {!showVowelModifiers ? (
            <>
              <Text style={styles.sectionTitle}>Baybayin Characters</Text>
              <Text style={styles.instructionText}>
                Tap to type • Long press to hear pronunciation
              </Text>
              {KEYBOARD_LAYOUT.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.keyboardRow}>
                  {row.map((char) => (
                    <TouchableOpacity
                      key={char.key}
                      style={[
                        styles.key,
                        char.key === 'space' && styles.spaceKey,
                        char.key === 'backspace' && styles.backspaceKey,
                      ]}
                      onPress={() => handleKeyPress(char.key, char.baybayin)}
                      onLongPress={() => {
                        if (char.key !== 'space' && char.key !== 'backspace') {
                          speakCharacter(char.key);
                        }
                      }}
                      delayLongPress={500}
                    >
                      <Text style={styles.keyBaybayin}>{char.baybayin}</Text>
                      <Text style={styles.keyLabel}>{char.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </>
          ) : (
            <View style={styles.vowelModifierContainer}>
              <Text style={styles.sectionTitle}>
                Select vowel for "{selectedConsonant}"
              </Text>
              <Text style={styles.instructionText}>
                Choose how to pronounce the consonant:
              </Text>
              
              <View style={styles.modifierRow}>
                {/* Default 'a' sound */}
                <TouchableOpacity
                  style={styles.modifierKey}
                  onPress={() => {
                    setText(text + BAYBAYIN_CHARACTERS[selectedConsonant!]);
                    setShowVowelModifiers(false);
                    setSelectedConsonant(null);
                  }}
                >
                  <Text style={styles.keyBaybayin}>
                    {BAYBAYIN_CHARACTERS[selectedConsonant!]}
                  </Text>
                  <Text style={styles.keyLabel}>{selectedConsonant} (default)</Text>
                </TouchableOpacity>

                {/* Vowel modifiers */}
                {VOWEL_MODIFIERS.map((modifier) => (
                  <TouchableOpacity
                    key={modifier.key}
                    style={styles.modifierKey}
                    onPress={() => handleVowelModifier(modifier.key, modifier.symbol)}
                  >
                    <Text style={styles.keyBaybayin}>
                      {modifier.key === 'virama' 
                        ? BAYBAYIN_CHARACTERS[selectedConsonant!.charAt(0)] + modifier.symbol
                        : BAYBAYIN_CHARACTERS[selectedConsonant!.charAt(0) + modifier.key]
                      }
                    </Text>
                    <Text style={styles.keyLabel}>
                      {modifier.key === 'virama' 
                        ? `${selectedConsonant!.charAt(0)} (ending)`
                        : `${selectedConsonant!.charAt(0)}${modifier.key}`
                      }
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.cancelModifierButton}
                onPress={() => {
                  setShowVowelModifiers(false);
                  setSelectedConsonant(null);
                }}
              >
                <Text style={styles.cancelModifierText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#e8e8e8',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    maxHeight: screenHeight * 0.4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 7,
    paddingBottom: 8,
    backgroundColor: '#d4d4d4',
    borderBottomWidth: 1,
    borderBottomColor: '#bbb',
  },
  keyboardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
  },
  closeButton: {
    backgroundColor: 'rgba(139, 69, 19, 0.1)',
    borderRadius: 15,
    padding: 6,
  },
  textPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  previewText: {
    flex: 1,
    fontSize: 18,
    color: '#8B4513',
    fontWeight: 'bold',
    marginRight: 12,
  },
  doneButtonCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B4513',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  doneTextCompact: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#8B4513',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  cancelText: {
    fontSize: 16,
    color: '#f0d0b4',
  },
  doneText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  textContainer: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  textDisplay: {
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
  },
  baybayinText: {
    fontSize: 24,
    color: '#8B4513',
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 32,
  },
  romanizedDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  romanizedLabel: {
    fontSize: 14,
    color: '#777',
    fontWeight: '600',
  },
  romanizedText: {
    fontSize: 14,
    color: '#8B4513',
    fontStyle: 'italic',
  },
  keyboardContent: {
    flex: 1,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 15,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginBottom: 20,
  },
  keyboardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 4,
  },
  key: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  spaceKey: {
    minWidth: 100,
  },
  backspaceKey: {
    backgroundColor: '#ff6b6b',
  },
  keyBaybayin: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 2,
  },
  keyLabel: {
    fontSize: 10,
    color: '#777',
    textAlign: 'center',
  },
  vowelModifierContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  modifierRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  modifierKey: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cancelModifierButton: {
    backgroundColor: '#ff6b6b',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  cancelModifierText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
