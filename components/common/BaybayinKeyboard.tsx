import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import '../../global.css';

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
    <View className="absolute bottom-0 left-0 right-0 bg-gray-200 border-t border-gray-300 shadow-lg max-h-[40vh]">
      {/* Compact Header */}
      <View className="flex-row justify-between items-center px-4 pt-2 pb-2 bg-gray-300 border-b border-gray-400">
        <Text className="text-lg font-semibold text-primary">Baybayin Keyboard</Text>
        <TouchableOpacity onPress={onClose} className="bg-primary/10 rounded-full p-2">
          <Ionicons name="keypad-outline" size={20} color="#C67C4E" />
        </TouchableOpacity>
      </View>

      {/* Text Preview */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-gray-100 border-b border-gray-200">
        <Text className="flex-1 text-lg text-primary font-bold mr-3" numberOfLines={2}>
          {text || placeholder}
        </Text>
        {text && (
          <TouchableOpacity onPress={handleDone} className="flex-row items-center bg-primary rounded-full px-3 py-2 gap-1">
            <Ionicons name="checkmark" size={16} color="white" />
            <Text className="text-white text-sm font-semibold">Done</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Keyboard */}
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {!showVowelModifiers ? (
          <>
            <Text className="text-lg font-bold text-primary mb-4 mt-2 text-center">Baybayin Characters</Text>
            <Text className="text-sm text-gray-600 text-center mb-5">
              Tap to type • Long press to hear pronunciation
            </Text>
            {KEYBOARD_LAYOUT.map((row, rowIndex) => (
              <View key={rowIndex} className="flex-row justify-center mb-2 gap-1">
                {row.map((char) => (
                  <TouchableOpacity
                    key={char.key}
                    className={`bg-white rounded-lg p-3 items-center justify-center shadow-sm ${
                      char.key === 'space' ? 'min-w-[100px]' : 
                      char.key === 'backspace' ? 'bg-red-400' : 
                      'min-w-[50px]'
                    }`}
                    onPress={() => handleKeyPress(char.key, char.baybayin)}
                    onLongPress={() => {
                      if (char.key !== 'space' && char.key !== 'backspace') {
                        speakCharacter(char.key);
                      }
                    }}
                    delayLongPress={500}
                  >
                    <Text className="text-xl font-bold text-primary mb-1">{char.baybayin}</Text>
                    <Text className="text-xs text-gray-600 text-center">{char.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </>
        ) : (
          <View className="items-center py-5">
            <Text className="text-lg font-bold text-primary mb-4">
              Select vowel for "{selectedConsonant}"
            </Text>
            <Text className="text-sm text-gray-600 text-center mb-5">
              Choose how to pronounce the consonant:
            </Text>
            
            <View className="flex-row flex-wrap justify-center gap-2 mb-5">
              {/* Default 'a' sound */}
              <TouchableOpacity
                className="bg-white rounded-lg p-4 min-w-[80px] items-center justify-center shadow-sm"
                onPress={() => {
                  setText(text + BAYBAYIN_CHARACTERS[selectedConsonant!]);
                  setShowVowelModifiers(false);
                  setSelectedConsonant(null);
                }}
              >
                <Text className="text-xl font-bold text-primary mb-1">
                  {BAYBAYIN_CHARACTERS[selectedConsonant!]}
                </Text>
                <Text className="text-xs text-gray-600 text-center">{selectedConsonant} (default)</Text>
              </TouchableOpacity>

              {/* Vowel modifiers */}
              {VOWEL_MODIFIERS.map((modifier) => (
                <TouchableOpacity
                  key={modifier.key}
                  className="bg-white rounded-lg p-4 min-w-[80px] items-center justify-center shadow-sm"
                  onPress={() => handleVowelModifier(modifier.key, modifier.symbol)}
                >
                  <Text className="text-xl font-bold text-primary mb-1">
                    {modifier.key === 'virama' 
                      ? BAYBAYIN_CHARACTERS[selectedConsonant!.charAt(0)] + modifier.symbol
                      : BAYBAYIN_CHARACTERS[selectedConsonant!.charAt(0) + modifier.key]
                    }
                  </Text>
                  <Text className="text-xs text-gray-600 text-center">
                    {modifier.key === 'virama' 
                      ? `${selectedConsonant!.charAt(0)} (ending)`
                      : `${selectedConsonant!.charAt(0)}${modifier.key}`
                    }
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              className="bg-red-400 rounded-lg py-3 px-6"
              onPress={() => {
                setShowVowelModifiers(false);
                setSelectedConsonant(null);
              }}
            >
              <Text className="text-white font-bold">Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}


