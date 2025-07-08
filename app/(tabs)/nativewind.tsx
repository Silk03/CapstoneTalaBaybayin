import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function NativeWindExamples() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-4 py-6">
        {/* Header */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-800 mb-2">
            NativeWind Examples
          </Text>
          <Text className="text-lg text-gray-600">
            Tailwind CSS for React Native
          </Text>
        </View>

        {/* Basic Layout Example */}
        <View className="mb-6">
          <Text className="text-xl font-semibold text-gray-700 mb-3">
            Basic Layout
          </Text>
          <View className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-medium">Flex Layout</Text>
              <View className="bg-blue-500 rounded-full w-3 h-3" />
            </View>
            <View className="flex-row space-x-3">
              <View className="flex-1 h-20 bg-red-200 rounded-md" />
              <View className="flex-1 h-20 bg-green-200 rounded-md" />
              <View className="flex-1 h-20 bg-blue-200 rounded-md" />
            </View>
          </View>
        </View>

        {/* Button Examples */}
        <View className="mb-6">
          <Text className="text-xl font-semibold text-gray-700 mb-3">
            Button Styles
          </Text>
          <View className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 space-y-3">
            <TouchableOpacity className="bg-blue-500 py-3 px-6 rounded-lg">
              <Text className="text-white text-center font-semibold">
                Primary Button
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="bg-transparent border-2 border-blue-500 py-3 px-6 rounded-lg">
              <Text className="text-blue-500 text-center font-semibold">
                Outline Button
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="bg-gray-800 py-3 px-6 rounded-full">
              <Text className="text-white text-center font-semibold">
                Rounded Button
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Cards Example */}
        <View className="mb-6">
          <Text className="text-xl font-semibold text-gray-700 mb-3">
            Cards & Shadows
          </Text>
          <View className="space-y-4">
            <View className="bg-white rounded-xl p-5 shadow-lg">
              <View className="flex-row items-center mb-3">
                <View className="bg-green-500 rounded-full p-2 mr-3">
                  <Ionicons name="checkmark" size={20} color="white" />
                </View>
                <Text className="text-lg font-semibold text-gray-800">
                  Success Card
                </Text>
              </View>
              <Text className="text-gray-600">
                This is an example of a success card with shadow and rounded corners.
              </Text>
            </View>

            <View className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-5">
              <Text className="text-white text-lg font-bold mb-2">
                Gradient Card
              </Text>
              <Text className="text-white opacity-90">
                Beautiful gradient backgrounds with NativeWind.
              </Text>
            </View>
          </View>
        </View>

        {/* Grid Example */}
        <View className="mb-6">
          <Text className="text-xl font-semibold text-gray-700 mb-3">
            Grid Layout
          </Text>
          <View className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <View className="flex-row flex-wrap -mx-1">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <View key={item} className="w-1/3 px-1 mb-2">
                  <View className="bg-indigo-100 rounded-lg p-4 items-center">
                    <Text className="text-indigo-600 font-semibold">
                      {item}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Typography Example */}
        <View className="mb-6">
          <Text className="text-xl font-semibold text-gray-700 mb-3">
            Typography
          </Text>
          <View className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 space-y-2">
            <Text className="text-4xl font-bold text-gray-800">
              Heading 1
            </Text>
            <Text className="text-2xl font-semibold text-gray-700">
              Heading 2
            </Text>
            <Text className="text-lg font-medium text-gray-600">
              Heading 3
            </Text>
            <Text className="text-base text-gray-600">
              Regular paragraph text with proper spacing and color.
            </Text>
            <Text className="text-sm text-gray-500">
              Small text for captions and metadata.
            </Text>
          </View>
        </View>

        {/* Color Palette */}
        <View className="mb-6">
          <Text className="text-xl font-semibold text-gray-700 mb-3">
            Color Palette
          </Text>
          <View className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <View className="flex-row flex-wrap -mx-1">
              {[
                'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500',
                'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500'
              ].map((color, index) => (
                <View key={index} className="w-1/4 px-1 mb-2">
                  <View className={`${color} rounded-lg h-16`} />
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Baybayin-themed Example */}
        <View className="mb-8">
          <Text className="text-xl font-semibold text-gray-700 mb-3">
            Baybayin Theme Example
          </Text>
          <View className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
            <View className="flex-row items-center mb-4">
              <View className="bg-amber-600 rounded-full p-3 mr-4">
                <Text className="text-white text-xl font-bold">ᜊ</Text>
              </View>
              <View className="flex-1">
                <Text className="text-amber-800 text-lg font-bold">
                  Baybayin Character
                </Text>
                <Text className="text-amber-600">
                  Learn the ancient Filipino script
                </Text>
              </View>
            </View>
            <TouchableOpacity className="bg-amber-600 py-3 rounded-lg">
              <Text className="text-white text-center font-semibold">
                Start Learning
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
