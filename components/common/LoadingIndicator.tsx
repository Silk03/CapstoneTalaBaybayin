import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

interface LoadingIndicatorProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  className?: string;
}

export default function LoadingIndicator({ 
  size = 'large', 
  color = '#F6A06A', // Warm coral color for loading
  text,
  className = 'flex-1 justify-center items-center bg-gray-50'
}: LoadingIndicatorProps) {
  return (
    <View className={className}>
      <ActivityIndicator size={size} color={color} />
      {text && (
        <Text className="text-base text-gray-600 mt-3 text-center">
          {text}
        </Text>
      )}
    </View>
  );
}
