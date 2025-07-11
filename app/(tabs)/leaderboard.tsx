import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import LeaderboardContainer from '../../components/leaderboard/LeaderboardContainer';
import '../../global.css';

export default function LeaderboardTab() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <LeaderboardContainer />
    </SafeAreaView>
  );
}
