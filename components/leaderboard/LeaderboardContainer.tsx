import React from 'react';
import { View, StyleSheet } from 'react-native';
import LeaderboardScreen from './LeaderboardScreen';

export default function LeaderboardContainer() {
  return (
    <View style={styles.container}>
      <LeaderboardScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
