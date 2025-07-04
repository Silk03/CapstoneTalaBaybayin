import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { LeaderboardEntry, LeaderboardFilter } from '../../types/leaderboard';

export default function LeaderboardScreen() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<LeaderboardFilter>({
    period: 'all-time',
    category: 'total-score'
  });
  const { user } = useAuth();

  const fetchLeaderboard = async () => {
    try {
      let orderField = 'totalScore';
      
      // Determine sort field based on filter
      switch (filter.category) {
        case 'level':
          orderField = 'level';
          break;
        case 'streak':
          orderField = 'streak';
          break;
        case 'lessons':
          orderField = 'completedLessons';
          break;
        case 'quizzes':
          orderField = 'completedQuizzes';
          break;
        default:
          orderField = 'totalScore';
      }
      
      const progressQuery = query(
        collection(db, 'userProgress'),
        orderBy(orderField, 'desc'),
        limit(100)
      );
      
      const querySnapshot = await getDocs(progressQuery);
      const entries: LeaderboardEntry[] = [];
      let currentUserRank = null;

      querySnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        const entry: LeaderboardEntry = {
          userId: doc.id,
          displayName: data.displayName || 'Anonymous User',
          totalScore: data.totalScore || 0,
          level: data.level || 1,
          streak: data.streak || 0,
          rank: index + 1,
          experience: data.experience || 0,
          completedLessons: data.completedLessons?.length || 0,
          completedQuizzes: data.completedQuizzes?.length || 0,
        };

        if (doc.id === user?.uid) {
          currentUserRank = entry.rank;
        }

        entries.push(entry);
      });

      setLeaderboard(entries);
      setUserRank(currentUserRank);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      Alert.alert('Error', 'Failed to load leaderboard. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [filter]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLeaderboard();
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return '#FFD700';
      case 2:
        return '#C0C0C0';
      case 3:
        return '#CD7F32';
      default:
        return '#777';
    }
  };

  const renderLeaderboardItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    const isCurrentUser = item.userId === user?.uid;
    
    return (
      <View style={[
        styles.leaderboardItem,
        isCurrentUser && styles.currentUserItem,
        index < 3 && styles.topThreeItem
      ]}>
        <View style={styles.rankContainer}>
          <Text style={[
            styles.rankText,
            { color: getRankColor(item.rank) }
          ]}>
            {getRankIcon(item.rank)}
          </Text>
        </View>
        
        <View style={styles.userInfo}>
          <Text style={[
            styles.displayName,
            isCurrentUser && styles.currentUserText
          ]}>
            {item.displayName}
          </Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.statText}>{item.totalScore}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="trending-up" size={14} color="#4CAF50" />
              <Text style={styles.statText}>Lvl {item.level}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="flame" size={14} color="#FF5722" />
              <Text style={styles.statText}>{item.streak}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.scoreContainer}>
          <Text style={[
            styles.scoreText,
            isCurrentUser && styles.currentUserText
          ]}>
            {item.totalScore.toLocaleString()}
          </Text>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Leaderboard</Text>
      <Text style={styles.headerSubtitle}>
        {userRank ? `Your rank: #${userRank}` : 'Keep learning to get ranked!'}
      </Text>
      
      {/* Filter Options */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter.category === 'total-score' && styles.activeFilter
          ]}
          onPress={() => setFilter({ ...filter, category: 'total-score' })}
        >
          <Text style={[
            styles.filterText,
            filter.category === 'total-score' && styles.activeFilterText
          ]}>
            Total Score
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter.category === 'level' && styles.activeFilter
          ]}
          onPress={() => setFilter({ ...filter, category: 'level' })}
        >
          <Text style={[
            styles.filterText,
            filter.category === 'level' && styles.activeFilterText
          ]}>
            Level
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter.category === 'streak' && styles.activeFilter
          ]}
          onPress={() => setFilter({ ...filter, category: 'streak' })}
        >
          <Text style={[
            styles.filterText,
            filter.category === 'streak' && styles.activeFilterText
          ]}>
            Streak
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="trophy-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>No rankings yet</Text>
      <Text style={styles.emptySubtext}>Complete lessons and quizzes to appear on the leaderboard!</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading leaderboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={leaderboard}
        renderItem={renderLeaderboardItem}
        keyExtractor={(item) => item.userId}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2196F3']}
          />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginTop: 5,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
    gap: 10,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
  },
  activeFilter: {
    backgroundColor: '#2196F3',
  },
  filterText: {
    fontSize: 12,
    color: '#777',
  },
  activeFilterText: {
    color: '#fff',
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  currentUserItem: {
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  topThreeItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  rankContainer: {
    width: 50,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
    marginLeft: 10,
  },
  displayName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  currentUserText: {
    color: '#2196F3',
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 5,
    gap: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  statText: {
    fontSize: 12,
    color: '#777',
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#777',
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginTop: 5,
  },
});
