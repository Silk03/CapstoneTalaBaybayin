import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  BackHandler,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import '../../global.css';

const { width: screenWidth } = Dimensions.get('window');

// Android QWERTY keyboard layout (letters only)
const KEYBOARD_LAYOUT = [
  // Top row
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  // Middle row
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  // Bottom row
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
];

interface RomanKeyboardProps {
  visible: boolean;
  onClose: () => void;
  onTextChange: (text: string) => void;
  initialText?: string;
  placeholder?: string;
  cursorPosition?: number;
  onCursorPositionChange?: (position: number) => void;
}

export default function RomanKeyboard({
  visible,
  onClose,
  onTextChange,
  initialText = '',
  placeholder = '',
  cursorPosition = 0,
  onCursorPositionChange,
}: RomanKeyboardProps) {
  const [text, setText] = useState(initialText);
  const [localCursorPosition, setLocalCursorPosition] = useState(cursorPosition);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [isCapsLock, setIsCapsLock] = useState(false);

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

  const handleKeyPress = useCallback((key: string) => {
    // Add haptic feedback for every key press
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

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

    if (key === 'enter') {
      const newText = text.slice(0, localCursorPosition) + '\n' + text.slice(localCursorPosition);
      const newCursorPos = localCursorPosition + 1;
      setText(newText);
      setLocalCursorPosition(newCursorPos);
      onTextChange(newText);
      onCursorPositionChange?.(newCursorPos);
      return;
    }

    if (key === 'shift') {
      if (isShiftPressed) {
        // Double tap for caps lock
        setIsCapsLock(!isCapsLock);
        setIsShiftPressed(false);
      } else {
        setIsShiftPressed(true);
        // Auto-reset shift after typing the next character or timeout
        setTimeout(() => {
          setIsShiftPressed(false);
        }, 3000); // Give more time for user to type
      }
      return;
    }

    // Regular character input (letters only)
    let character = key;
    if (isShiftPressed || isCapsLock) {
      character = key.toUpperCase();
      // Reset shift after typing (but not caps lock)
      if (isShiftPressed && !isCapsLock) {
        setIsShiftPressed(false);
      }
    }

    const newText = text.slice(0, localCursorPosition) + character + text.slice(localCursorPosition);
    const newCursorPos = localCursorPosition + 1;
    setText(newText);
    setLocalCursorPosition(newCursorPos);
    onTextChange(newText);
    onCursorPositionChange?.(newCursorPos);
  }, [text, localCursorPosition, onTextChange, onCursorPositionChange, isShiftPressed, isCapsLock]);

  const getKeyWidth = (rowIndex: number, keyIndex: number, totalKeys: number) => {
    const availableWidth = screenWidth - 60; // Account for padding
    
    if (rowIndex === 0) {
      // Top row: 10 keys, full width available
      return availableWidth / 10;
    } else if (rowIndex === 1) {
      // Middle row: 9 keys, full width available
      return availableWidth / 9;
    } else if (rowIndex === 2) {
      // Bottom row: 7 keys + shift + backspace, need to leave space for both
      return (availableWidth - 100) / 7; // 100px for shift + backspace buttons
    }
    
    return availableWidth / totalKeys;
  };

  const getShiftButtonStyle = () => {
    if (isCapsLock) {
      return 'bg-primary border-primary-dark';
    }
    if (isShiftPressed) {
      return 'bg-primary-light border-primary';
    }
    return 'bg-gray-300 border-gray-400';
  };

  const getShiftTextStyle = () => {
    if (isCapsLock || isShiftPressed) {
      return 'text-white font-bold';
    }
    return 'text-gray-700';
  };

  // Don't render if not visible
  if (!visible) {
    return null;
  }

  return (
    <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-300 shadow-lg">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-3 bg-secondary-50 border-b border-gray-200">
        <View className="flex-row items-center gap-2">
          <Text className="text-lg font-semibold text-secondary-700">Tagalog Keyboard</Text>
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
      <View className="bg-gray-200 px-1 py-2">
        {/* Main keyboard rows */}
        {KEYBOARD_LAYOUT.map((row, rowIndex) => (
          <View key={rowIndex} className="flex-row justify-center mb-1 px-1">
            {/* Add shift key before bottom row */}
            {rowIndex === 2 && (
              <TouchableOpacity
                className={`rounded-md items-center justify-center shadow-sm border mr-1 px-2 py-3 ${getShiftButtonStyle()}`}
                onPress={() => handleKeyPress('shift')}
                activeOpacity={0.6}
                style={{ width: 50 }}
              >
                <Text className={`text-lg font-bold ${getShiftTextStyle()}`}>
                  {isCapsLock ? '⇪' : '⇧'}
                </Text>
              </TouchableOpacity>
            )}
            
            {row.map((char, keyIndex) => (
              <TouchableOpacity
                key={char}
                className="bg-white border border-gray-300 rounded-md items-center justify-center shadow-sm mx-0.5 py-3"
                style={{ 
                  width: getKeyWidth(rowIndex, keyIndex, row.length),
                  minWidth: 28
                }}
                onPress={() => handleKeyPress(char)}
                activeOpacity={0.6}
              >
                <Text className="text-lg font-semibold text-gray-800">
                  {(isShiftPressed || isCapsLock) ? char.toUpperCase() : char}
                </Text>
              </TouchableOpacity>
            ))}
            
            {/* Add backspace key after bottom row (Android style) */}
            {rowIndex === 2 && (
              <TouchableOpacity
                className="bg-gray-300 border border-gray-400 rounded-md items-center justify-center shadow-sm ml-1 px-2 py-3"
                onPress={() => handleKeyPress('backspace')}
                activeOpacity={0.6}
                style={{ width: 50 }}
              >
                <Text className="text-lg font-bold text-gray-700">⌫</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
        
        {/* Bottom row with space bar */}
        <View className="flex-row justify-center mt-1 px-1">
          {/* Space bar */}
          <TouchableOpacity
            className="bg-white border border-gray-300 rounded-md items-center justify-center shadow-sm mx-1 py-3"
            style={{ flex: 1 }}
            onPress={() => handleKeyPress('space')}
            activeOpacity={0.6}
          >
            <Text className="text-sm font-semibold text-gray-600">Space</Text>
          </TouchableOpacity>
          
          {/* Enter key */}
          <TouchableOpacity
            className="bg-primary border border-primary-dark rounded-md items-center justify-center shadow-sm ml-1 px-3 py-3"
            onPress={() => handleKeyPress('enter')}
            activeOpacity={0.6}
            style={{ width: 60 }}
          >
            <Text className="text-lg font-bold text-white">↵</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
