import React from 'react';
import { View } from 'react-native';
import LeaderboardScreen from './LeaderboardScreen';
import '../../global.css';

export default function LeaderboardContainer() {
  return (
    <View className="flex-1">
      <LeaderboardScreen />
    </View>
  );
}
