import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LeaderboardContainer from '../../components/leaderboard/LeaderboardContainer';

export default function LeaderboardTab() {
  return (
    <SafeAreaView style={styles.container}>
      <LeaderboardContainer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
