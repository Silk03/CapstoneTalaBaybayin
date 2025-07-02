import { StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import { useAuth } from '@/contexts/AuthContext';
import { useProgress } from '@/contexts/ProgressContext';

export default function TabOneScreen() {
  const { user, logout } = useAuth();
  const { userProgress } = useProgress();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to TalaBaybayin!</Text>
        <Text style={styles.welcomeText}>Hello, {user?.email}</Text>
        <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
        
        {/* Debug Progress Info */}
        <View style={styles.debugContainer}>
          <Text style={styles.debugTitle}>Debug: User Progress</Text>
          <Text style={styles.debugText}>
            Completed Lessons: {userProgress?.completedLessons?.join(', ') || 'None'}
          </Text>
          <Text style={styles.debugText}>
            Lesson Scores: {userProgress?.lessonScores ? JSON.stringify(userProgress.lessonScores) : 'None'}
          </Text>
          <Text style={styles.debugText}>
            Total Score: {userProgress?.totalScore || 0}
          </Text>
          <Text style={styles.debugText}>
            Experience: {userProgress?.experience || 0}
          </Text>
          <Text style={styles.debugText}>
            Level: {userProgress?.level || 1}
          </Text>
        </View>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
        
        <EditScreenInfo path="app/(tabs)/index.tsx" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  debugContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  logoutButton: {
    backgroundColor: '#8B4513',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
