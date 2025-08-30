import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  BackHandler,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
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

// Android-style keyboard layout with Baybayin characters
const KEYBOARD_LAYOUT = [
  // Top row - A / E-I / O-U / B / K / D / G / H / L
  [
    { key: 'a', baybayin: 'ᜀ', label: 'a' },
    { key: 'i', baybayin: 'ᜁ', label: 'i' },
    { key: 'u', baybayin: 'ᜂ', label: 'u' },
    { key: 'ba', baybayin: 'ᜊ', label: 'ba' },
    { key: 'ka', baybayin: 'ᜃ', label: 'ka' },
    { key: 'da', baybayin: 'ᜇ', label: 'da' },
    { key: 'ga', baybayin: 'ᜄ', label: 'ga' },
    { key: 'ha', baybayin: 'ᜑ', label: 'ha' },
    { key: 'la', baybayin: 'ᜎ', label: 'la' },
  ],
  // Middle row - M / N / Ng / P / (R) / S / T / W / Y
  [
    { key: 'ma', baybayin: 'ᜋ', label: 'ma' },
    { key: 'na', baybayin: 'ᜈ', label: 'na' },
    { key: 'nga', baybayin: 'ᜅ', label: 'nga' },
    { key: 'pa', baybayin: 'ᜉ', label: 'pa' },
    { key: 'ra', baybayin: 'ᜍ', label: 'ra' },
    { key: 'sa', baybayin: 'ᜐ', label: 'sa' },
    { key: 'ta', baybayin: 'ᜆ', label: 'ta' },
    { key: 'wa', baybayin: 'ᜏ', label: 'wa' },
    { key: 'ya', baybayin: 'ᜌ', label: 'ya' },
  ],
  // Bottom row - Space and backspace
  [
    { key: 'space', baybayin: ' ', label: 'Space' },
    { key: 'backspace', baybayin: '⌫', label: 'Del' },
  ],
];

interface BaybayinKeyboardProps {
  visible: boolean;
  onClose: () => void;
  onTextChange: (text: string) => void;
  initialText?: string;
  placeholder?: string;
  cursorPosition?: number;
  onCursorPositionChange?: (position: number) => void;
}

export default function BaybayinKeyboard({
  visible,
  onClose,
  onTextChange,
  initialText = '',
  placeholder = '',
  cursorPosition = 0,
  onCursorPositionChange,
}: BaybayinKeyboardProps) {
  const [text, setText] = useState(initialText);
  const [localCursorPosition, setLocalCursorPosition] = useState(cursorPosition);
  const [romanizedText, setRomanizedText] = useState('');
  const [showVariants, setShowVariants] = useState(false);
  const [variantKey, setVariantKey] = useState<string | null>(null);
  const [variantPosition, setVariantPosition] = useState<{ x: number; y: number } | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  // Sync cursor position when prop changes
  useEffect(() => {
    setLocalCursorPosition(cursorPosition);
  }, [cursorPosition]);

  // Sync text when initialText changes
  useEffect(() => {
    setText(initialText);
  }, [initialText]);

  // Handle Android back button to close keyboard
  useEffect(() => {
    const backAction = () => {
      if (visible) {
        onClose();
        return true; // Prevent default back action
      }
      return false; // Allow default back action
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [visible, onClose]);

  // Get consonant variants (vowel modifiers + virama)
  const getConsonantVariants = (consonantKey: string) => {
    if (!consonantKey) return [];
    
    const baseConsonant = consonantKey.charAt(0); // Get first letter (k, g, ng, etc.)
    const variants = [];
    
    // Add default 'a' sound
    variants.push({
      key: consonantKey,
      baybayin: BAYBAYIN_CHARACTERS[consonantKey],
      label: `${consonantKey} (default)`
    });
    
    // Add 'i' variant
    const iVariant = baseConsonant + 'i';
    if (BAYBAYIN_CHARACTERS[iVariant]) {
      variants.push({
        key: iVariant,
        baybayin: BAYBAYIN_CHARACTERS[iVariant],
        label: iVariant
      });
    }
    
    // Add 'u' variant
    const uVariant = baseConsonant + 'u';
    if (BAYBAYIN_CHARACTERS[uVariant]) {
      variants.push({
        key: uVariant,
        baybayin: BAYBAYIN_CHARACTERS[uVariant],
        label: uVariant
      });
    }
    
    // Add virama variant (consonant ending)
    if (BAYBAYIN_CHARACTERS[baseConsonant]) {
      variants.push({
        key: baseConsonant + '_virama',
        baybayin: BAYBAYIN_CHARACTERS[baseConsonant] + '᜔',
        label: `${baseConsonant} (ending)`
      });
    }
    
    return variants;
  };

  const handleLongPress = (key: string, event?: any) => {
    if (key === 'space' || key === 'backspace') return;
    
    // Check if it's a consonant that has variants
    const isConsonant = ['ka', 'ga', 'nga', 'ta', 'da', 'na', 'pa', 'ba', 'ma', 'ya', 'ra', 'la', 'wa', 'sa', 'ha'].includes(key);
    
    if (isConsonant) {
      setVariantKey(key);
      setShowVariants(true);
      
      // Animate popup appearance
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
    // Removed speech for vowels - no action on long press for vowels
  };

  const handleVariantSelect = useCallback((variant: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (variant.key.includes('_virama')) {
      // Handle virama variant - insert at cursor position
      const newText = text.slice(0, localCursorPosition) + variant.baybayin + text.slice(localCursorPosition);
      const newCursorPos = localCursorPosition + variant.baybayin.length;
      setText(newText);
      setLocalCursorPosition(newCursorPos);
      onTextChange(newText);
      onCursorPositionChange?.(newCursorPos);
    } else {
      // Handle regular variant - insert at cursor position
      const newText = text.slice(0, localCursorPosition) + variant.baybayin + text.slice(localCursorPosition);
      const newCursorPos = localCursorPosition + variant.baybayin.length;
      setText(newText);
      setLocalCursorPosition(newCursorPos);
      onTextChange(newText);
      onCursorPositionChange?.(newCursorPos);
    }
    
    // Animate popup disappearance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowVariants(false);
      setVariantKey(null);
      setVariantPosition(null);
    });
  }, [text, localCursorPosition, onTextChange, onCursorPositionChange, fadeAnim, scaleAnim]);
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

  const handleKeyPress = useCallback((key: string, baybayin: string) => {
    // Add haptic feedback for every key press
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Close variants popup if open
    if (showVariants) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowVariants(false);
        setVariantKey(null);
        setVariantPosition(null);
      });
      return;
    }

    if (key === 'backspace') {
      if (localCursorPosition > 0) {
        const newText = text.slice(0, localCursorPosition - 1) + text.slice(localCursorPosition);
        const newCursorPos = localCursorPosition - 1;
        setText(newText);
        setLocalCursorPosition(newCursorPos);
        onTextChange(newText);
        onCursorPositionChange?.(newCursorPos);
      }
      return;
    }

    if (key === 'space') {
      const newText = text.slice(0, localCursorPosition) + ' ' + text.slice(localCursorPosition);
      const newCursorPos = localCursorPosition + 1;
      setText(newText);
      setLocalCursorPosition(newCursorPos);
      onTextChange(newText);
      onCursorPositionChange?.(newCursorPos);
      return;
    }

    // For all characters, insert at cursor position
    const newText = text.slice(0, localCursorPosition) + baybayin + text.slice(localCursorPosition);
    const newCursorPos = localCursorPosition + baybayin.length;
    setText(newText);
    setLocalCursorPosition(newCursorPos);
    onTextChange(newText);
    onCursorPositionChange?.(newCursorPos);
  }, [showVariants, fadeAnim, scaleAnim, text, localCursorPosition, onTextChange, onCursorPositionChange]);

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
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-300 shadow-lg">
        {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-3 bg-secondary-50 border-b border-gray-200">
        <View className="flex-row items-center gap-2">
          <Text className="text-lg font-semibold text-secondary-700">Baybayin Keyboard</Text>
          {text.length > 0 && (
            <View className="bg-secondary-200 rounded-full px-2 py-1">
              <Text className="text-xs text-secondary-700 font-medium">{text.length} karakter</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={onClose} className="bg-secondary-100 rounded-full p-2">
          <Ionicons name="close" size={20} color="#0B4CA7" />
        </TouchableOpacity>
      </View>

      {/* Keyboard Layout */}
      <View className="bg-gray-200 px-1 py-2 relative">
        {KEYBOARD_LAYOUT.map((row, rowIndex) => (
          <View key={rowIndex} className={`flex-row mb-1 ${
            rowIndex === 0 ? 'justify-center gap-1' : 
            rowIndex === 1 ? 'justify-center gap-1 px-2' : 
            'justify-center gap-2 px-4'
          }`}>
            {row.map((char) => (
              <TouchableOpacity
                key={char.key}
                className={`rounded-md items-center justify-center shadow-sm border ${
                  char.key === 'space' ? 'bg-white border-gray-300 flex-1 py-4 mx-2' : 
                  char.key === 'backspace' ? 'bg-gray-300 border-gray-400 px-8 py-3' : 
                  'bg-white border-gray-300 flex-1 py-3 min-w-[35px]'
                }`}
                onPress={() => handleKeyPress(char.key, char.baybayin)}
                onLongPress={() => handleLongPress(char.key)}
                delayLongPress={500}
                activeOpacity={0.6}
              >
                <Text className={`text-xl font-bold mb-1 ${
                  char.key === 'backspace' ? 'text-gray-600' : 'text-primary'
                }`}>
                  {char.baybayin}
                </Text>
                <Text className="text-xs text-gray-600 text-center">{char.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
        
        {/* Variants popup - Android style with smooth transitions */}
        {showVariants && variantKey && (
          <Animated.View 
            className="absolute bottom-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg mx-4 mb-2 p-2"
            style={{
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }}
          >
            <View className="flex-row justify-center flex-wrap gap-1">
              {getConsonantVariants(variantKey).map((variant, index) => (
                <TouchableOpacity
                  key={index}
                  className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 min-w-[50px] items-center justify-center"
                  onPress={() => handleVariantSelect(variant)}
                >
                  <Text className="text-xl font-bold text-primary mb-1">
                    {variant.baybayin}
                  </Text>
                  <Text className="text-xs text-gray-600 text-center">{variant.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )}
      </View>  
    </View>
  );
}


