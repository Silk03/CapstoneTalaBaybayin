import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HandwritingContainer from '../../components/handwriting/HandwritingContainer';

export default function HandwritingTab() {
  return (
    <SafeAreaView style={styles.container}>
      <HandwritingContainer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
