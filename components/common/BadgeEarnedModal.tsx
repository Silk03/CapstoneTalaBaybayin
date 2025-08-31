import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '../../types/progress';
import '../../global.css';

interface BadgeEarnedModalProps {
  visible: boolean;
  badge: Badge | null;
  onClose: () => void;
}

const { width } = Dimensions.get('window');

export default function BadgeEarnedModal({ visible, badge, onClose }: BadgeEarnedModalProps) {
  if (!badge) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-5">
        <View className="bg-white rounded-2xl p-6 items-center max-w-sm w-full shadow-lg">
          {/* Celebration Icon */}
          <View className="mb-4">
            <Ionicons name="trophy" size={40} color="#FFD700" />
          </View>

          {/* Badge Title */}
          <Text className="text-2xl font-bold text-gray-800 mb-2 text-center">
            Nakuha ang Badge!
          </Text>

          {/* Badge Image */}
          <View 
            className="w-24 h-24 mb-4 rounded-full items-center justify-center shadow-md border-4"
            style={{ 
              backgroundColor: badge.color + '20',
              borderColor: badge.color
            }}
          >
            <Text className="text-4xl">{badge.icon}</Text>
          </View>

          {/* Badge Name */}
          <Text className="text-xl font-semibold text-gray-800 mb-2 text-center">
            {badge.name}
          </Text>

          {/* Badge Description */}
          <Text className="text-sm text-gray-600 mb-4 text-center leading-5">
            {badge.description}
          </Text>

          {/* Badge Category */}
          <View 
            className="px-3 py-1 rounded-full mb-6"
            style={{ backgroundColor: badge.color + '20' }}
          >
            <Text 
              className="text-xs font-medium"
              style={{ color: badge.color }}
            >
              {badge.category.toUpperCase()}
            </Text>
          </View>

          {/* Close Button */}
          <TouchableOpacity
            className="bg-primary px-8 py-3 rounded-lg w-full"
            onPress={onClose}
          >
            <Text className="text-white text-center font-semibold text-base">
              Magpatuloy
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
