import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

export default function NativeWindExamples() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        {/* Test Section */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginBottom: 8 }}>
            NativeWind Test
          </Text>
          <Text style={{ fontSize: 16, color: '#6b7280', marginBottom: 16 }}>
            If you see styling below, NativeWind is working!
          </Text>
          
          {/* Simple Test with className */}
          <View className="bg-blue-500 p-4 rounded-lg mb-4">
            <Text className="text-white text-center font-bold">
              ✅ This should be BLUE with white text
            </Text>
          </View>

          <View className="bg-green-500 p-4 rounded-lg mb-4">
            <Text className="text-white text-center font-bold">
              ✅ This should be GREEN with white text
            </Text>
          </View>

          <TouchableOpacity className="bg-red-500 py-3 px-6 rounded-lg">
            <Text className="text-white text-center font-bold">
              ✅ RED Button - Tap me!
            </Text>
          </TouchableOpacity>
        </View>

        {/* Fallback styling for comparison */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 20, fontWeight: '600', color: '#1f2937', marginBottom: 16 }}>
            Regular React Native Styling (for comparison)
          </Text>
          
          <View style={{ backgroundColor: '#3b82f6', padding: 16, borderRadius: 8, marginBottom: 16 }}>
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
              Regular Blue Styling
            </Text>
          </View>
        </View>

        {/* Instructions */}
        <View style={{ backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
            Troubleshooting:
          </Text>
          <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>
            • If colors don't show: NativeWind setup issue
          </Text>
          <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>
            • Check Metro config and restart with --clear
          </Text>
          <Text style={{ fontSize: 14, color: '#6b7280' }}>
            • Ensure global.css is imported in _layout.tsx
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
