import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
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
import '../../global.css';

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
      Alert.alert('Error', 'Hindi ma-load ang leaderboard. Subukan ulit.');
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
      <View className={`flex-row items-center bg-white p-4 mx-3 my-1 rounded-xl shadow-sm ${
        isCurrentUser ? 'bg-secondary/10 border-2 border-secondary' : ''
      } ${index < 3 ? 'border-l-4 border-l-yellow-400' : ''}`}>
        <View className="w-12 items-center">
          <Text className="text-lg font-bold" style={{ color: getRankColor(item.rank) }}>
            {getRankIcon(item.rank)}
          </Text>
        </View>
        
        <View className="flex-1 ml-3">
          <Text className={`text-lg font-semibold ${isCurrentUser ? 'text-secondary' : 'text-gray-800'}`}>
            {item.displayName}
          </Text>
          <View className="flex-row mt-1 gap-3">
            <View className="flex-row items-center gap-1">
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text className="text-xs text-gray-600">{item.totalScore}</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Ionicons name="trending-up" size={14} color="#4CAF50" />
              <Text className="text-xs text-gray-600">Lvl {item.level}</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Ionicons name="flame" size={14} color="#EF4444" />
              <Text className="text-xs text-gray-600">{item.streak}</Text>
            </View>
          </View>
        </View>
        
        <View className="items-end">
          <Text className={`text-lg font-bold ${isCurrentUser ? 'text-secondary' : 'text-gray-800'}`}>
            {item.totalScore.toLocaleString()}
          </Text>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View className="bg-white p-5 border-b border-gray-200">
      <Text className="text-2xl font-bold text-gray-800 text-center">Leaderboard</Text>
      <Text className="text-sm text-gray-600 text-center mt-1">
        {userRank ? `Inyong ranggo: #${userRank}` : 'Magpatuloy sa pag-aaral para makakuha ng ranggo!'}
      </Text>
      
      {/* Filter Options */}
      <View className="flex-row justify-center mt-4 gap-3">
        <TouchableOpacity
          className={`px-3 py-2 rounded-full ${
            filter.category === 'total-score' ? 'bg-primary' : 'bg-gray-100'
          }`}
          onPress={() => setFilter({ ...filter, category: 'total-score' })}
        >
          <Text className={`text-xs ${
            filter.category === 'total-score' ? 'text-white' : 'text-gray-600'
          }`}>
            Kabuuang Puntos
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          className={`px-3 py-2 rounded-full ${
            filter.category === 'level' ? 'bg-primary' : 'bg-gray-100'
          }`}
          onPress={() => setFilter({ ...filter, category: 'level' })}
        >
          <Text className={`text-xs ${
            filter.category === 'level' ? 'text-white' : 'text-gray-600'
          }`}>
            Level
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          className={`px-3 py-2 rounded-full ${
            filter.category === 'streak' ? 'bg-primary' : 'bg-gray-100'
          }`}
          onPress={() => setFilter({ ...filter, category: 'streak' })}
        >
          <Text className={`text-xs ${
            filter.category === 'streak' ? 'text-white' : 'text-gray-600'
          }`}>
            Dagdag pang Araw
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View className="flex-1 justify-center items-center p-10">
      <Ionicons name="trophy-outline" size={64} color="#D1D5DB" />
      <Text className="text-lg font-medium text-gray-600 mt-3">Wala pang ranggo</Text>
      <Text className="text-sm text-gray-600 text-center mt-1">Tapusin ang mga aralin at quiz para makita sa leaderboard!</Text>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg text-gray-600">Naglo-load ng leaderboard...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
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
            colors={['#C67C4E']}
          />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}


