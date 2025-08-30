import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, Animated, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';

interface TextWithCursorProps {
  text: string;
  placeholder: string;
  isActive: boolean;
  textStyle?: any;
  placeholderStyle?: any;
  cursorColor?: string;
  cursorPosition?: number;
  onCursorPositionChange?: (position: number) => void;
}

const TextWithCursor = React.memo(function TextWithCursor({
  text,
  placeholder,
  isActive,
  textStyle,
  placeholderStyle,
  cursorColor = '#0B4CA7',
  cursorPosition = text.length,
  onCursorPositionChange
}: TextWithCursorProps) {
  const [cursorOpacity] = useState(new Animated.Value(1));
  const [localCursorPosition, setLocalCursorPosition] = useState(cursorPosition);

  // Update cursor position when prop changes
  useEffect(() => {
    setLocalCursorPosition(cursorPosition);
  }, [cursorPosition]);

  // Keep cursor within text bounds
  useEffect(() => {
    if (localCursorPosition > text.length) {
      setLocalCursorPosition(text.length);
    } else if (localCursorPosition < 0) {
      setLocalCursorPosition(0);
    }
  }, [text.length, localCursorPosition]);

  // Blinking cursor animation - always active when component is active
  useEffect(() => {
    if (!isActive) {
      cursorOpacity.setValue(0);
      return;
    }

    // Make sure cursor starts visible
    cursorOpacity.setValue(1);
    
    // Create a continuous blinking animation
    const blinkAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, {
          toValue: 1,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.timing(cursorOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(cursorOpacity, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(cursorOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      { iterations: -1 } // Infinite loop
    );

    blinkAnimation.start();

    return () => {
      blinkAnimation.stop();
      // Ensure cursor is visible when animation stops
      cursorOpacity.setValue(1);
    };
  }, [isActive, cursorOpacity]);

  // Handle character press - position cursor after clicked character
  const handleCharacterPress = useCallback((position: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Position cursor after the clicked character
    const newPosition = position + 1;
    setLocalCursorPosition(newPosition);
    onCursorPositionChange?.(newPosition);
  }, [onCursorPositionChange]);

  // Handle click at beginning to position cursor at start
  const handleBeginningPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLocalCursorPosition(0);
    onCursorPositionChange?.(0);
  }, [onCursorPositionChange]);

  // Handle click at end to position cursor at end
  const handleEndPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLocalCursorPosition(text.length);
    onCursorPositionChange?.(text.length);
  }, [text.length, onCursorPositionChange]);

  // Render text with cursor positioning support
  const renderTextWithCursor = useCallback(() => {
    if (!text && !isActive) {
      return (
        <Text style={placeholderStyle}>
          {placeholder}
        </Text>
      );
    }

    if (!text && isActive) {
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Animated.View 
            style={{
              opacity: cursorOpacity,
              width: 2,
              height: textStyle?.fontSize ? textStyle.fontSize + 4 : 24,
              backgroundColor: cursorColor,
              marginRight: 4,
            }}
          />
          <Text style={placeholderStyle}>
            {placeholder}
          </Text>
        </View>
      );
    }

    // Split text into characters for individual positioning
    const characters = text.split('');
    
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Always show cursor at beginning if position is 0 */}
        {isActive && localCursorPosition === 0 && (
          <Animated.View 
            style={{
              opacity: cursorOpacity,
              width: 2,
              height: textStyle?.fontSize ? textStyle.fontSize + 4 : 24,
              backgroundColor: cursorColor,
            }}
          />
        )}
        
        {/* Render each character with cursor after it */}
        {characters.map((char, index) => {
          const showCursorAfter = isActive && localCursorPosition === index + 1;
          
          return (
            <React.Fragment key={index}>
              <TouchableOpacity
                onPress={() => handleCharacterPress(index)}
                activeOpacity={0.7}
                style={{ flexDirection: 'row', alignItems: 'center' }}
              >
                <Text style={textStyle}>
                  {char}
                </Text>
              </TouchableOpacity>
              
              {/* Cursor after this character */}
              {showCursorAfter && (
                <Animated.View 
                  style={{
                    opacity: cursorOpacity,
                    width: 2,
                    height: textStyle?.fontSize ? textStyle.fontSize + 4 : 24,
                    backgroundColor: cursorColor,
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
        
        {/* Emergency fallback - always show cursor at end if position >= text length */}
        {isActive && localCursorPosition >= text.length && (
          <Animated.View 
            style={{
              opacity: cursorOpacity,
              width: 2,
              height: textStyle?.fontSize ? textStyle.fontSize + 4 : 24,
              backgroundColor: cursorColor,
              marginLeft: characters.length > 0 ? 1 : 0,
            }}
          />
        )}
        
        {/* Clickable areas for positioning */}
        <TouchableOpacity
          onPress={handleBeginningPress}
          activeOpacity={0.7}
          style={{ position: 'absolute', left: -10, top: 0, width: 10, height: '100%' }}
        >
          <View />
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={handleEndPress}
          activeOpacity={0.7}
          style={{ minWidth: 10, minHeight: textStyle?.fontSize || 20 }}
        >
          <View />
        </TouchableOpacity>
      </View>
    );
  }, [
    text, 
    isActive, 
    placeholderStyle, 
    placeholder, 
    cursorOpacity, 
    textStyle, 
    cursorColor, 
    localCursorPosition,
    handleCharacterPress,
    handleBeginningPress,
    handleEndPress
  ]);

  return (
    <View>
      {renderTextWithCursor()}
    </View>
  );
});

export default TextWithCursor;
