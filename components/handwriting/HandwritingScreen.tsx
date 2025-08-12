import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { doc, setDoc, getDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { useProgress } from '../../contexts/ProgressContext';
import { ActivityType } from '../../types/progress';
import { db } from '../../config/firebase';
import { Ionicons } from '@expo/vector-icons';
import { DrawingCanvas } from './DrawingCanvas';
import { handwritingCharacters } from '../../data/handwriting';
import { HandwritingStroke, HandwritingCharacter } from '../../types/handwriting';
import '../../global.css';

const { width: screenWidth } = Dimensions.get('window');
const canvasSize = Math.min(screenWidth - 30, 350);
const minStrokeWidth = 2;
const maxStrokeWidth = 12;

export default function HandwritingScreen() {
  const [selectedCharacter, setSelectedCharacter] = useState<HandwritingCharacter>(handwritingCharacters[0]);
  const [userStrokes, setUserStrokes] = useState<HandwritingStroke[]>([]);
  const [showCharacterMenu, setShowCharacterMenu] = useState(false);
  const [strokeWidth, setStrokeWidth] = useState(5);
  const [charactersWithProgress, setCharactersWithProgress] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [hasTrackedActivity, setHasTrackedActivity] = useState(false); // Track if we've already logged activity
  
  const { user } = useAuth();
  const { trackActivity } = useProgress();

  // Early return if no user authenticated
  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-gray-600 text-center mx-5">Please log in to save your handwriting progress</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Save progress to Firebase
  const saveProgress = async (characterId: string, strokes: HandwritingStroke[]) => {
    if (!user) return;
    
    try {
      const progressRef = doc(db, 'handwritingProgress', user.uid, 'characters', characterId);
      await setDoc(progressRef, {
        strokes,
        lastModified: new Date(),
        strokeCount: strokes.length,
        characterId // Add this to help debug
      });
      console.log(`✅ SAVED progress for character: ${characterId}, strokes: ${strokes.length}`);
      console.log(`Document path: handwritingProgress/${user.uid}/characters/${characterId}`);
    } catch (error) {
      console.error('❌ Error saving progress to Firebase:', error);
    }
  };

  // Load progress from Firebase
  const loadProgress = async (characterId: string): Promise<HandwritingStroke[]> => {
    if (!user) return [];
    
    try {
      const progressRef = doc(db, 'handwritingProgress', user.uid, 'characters', characterId);
      const docSnap = await getDoc(progressRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const strokes = data.strokes || [];
        console.log(`📖 LOADED progress for character: ${characterId}, strokes: ${strokes.length}`);
        console.log(`Document path: handwritingProgress/${user.uid}/characters/${characterId}`);
        console.log(`Document data characterId: ${data.characterId || 'undefined'}`);
        return strokes;
      }
      console.log(`📭 NO progress found for character: ${characterId}`);
      return [];
    } catch (error) {
      console.error('❌ Error loading progress from Firebase:', error);
      return [];
    }
  };

  // Refresh progress tracking for a specific character
  const refreshCharacterProgress = async (characterId: string) => {
    if (!user) return;
    
    try {
      const progressRef = doc(db, 'handwritingProgress', user.uid, 'characters', characterId);
      const docSnap = await getDoc(progressRef);
      
      setCharactersWithProgress(prev => {
        const newSet = new Set(prev);
        const hasProgress = docSnap.exists() && docSnap.data()?.strokes?.length > 0;
        
        console.log(`Refreshing progress for ${characterId}: ${hasProgress ? 'HAS PROGRESS' : 'NO PROGRESS'}`);
        console.log(`Current progress set:`, Array.from(prev));
        
        if (hasProgress) {
          newSet.add(characterId);
        } else {
          newSet.delete(characterId);
        }
        
        console.log(`New progress set:`, Array.from(newSet));
        return newSet;
      });
    } catch (error) {
      console.error('Error refreshing character progress:', error);
    }
  };

  // Load progress when character changes
  useEffect(() => {
    const loadCharacterProgress = async () => {
      if (!user) return;
      
      console.log(`🔍 Loading progress for character: ${selectedCharacter.id}`);
      setIsLoading(true);
      
      // Clear current strokes first to prevent any issues
      setUserStrokes([]);
      
      const savedStrokes = await loadProgress(selectedCharacter.id);
      setUserStrokes(savedStrokes);
      
      setIsLoading(false);
      console.log(`✅ Set ${savedStrokes.length} strokes for character: ${selectedCharacter.id}`);
    };
    
    loadCharacterProgress();
  }, [selectedCharacter.id, user]);

  // Check which characters have saved progress on component mount
  useEffect(() => {
    const checkAllProgress = async () => {
      if (!user) return;
      
      const progressSet = new Set<string>();
      console.log('Checking progress for all characters...');
      
      try {
        // Check each character individually to ensure accuracy
        for (const character of handwritingCharacters) {
          const progressRef = doc(db, 'handwritingProgress', user.uid, 'characters', character.id);
          const docSnap = await getDoc(progressRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            const strokeCount = data.strokes?.length || 0;
            console.log(`Character ${character.id}: ${strokeCount} strokes`);
            
            if (strokeCount > 0) {
              progressSet.add(character.id);
            }
          } else {
            console.log(`Character ${character.id}: no saved progress`);
          }
        }
        
        console.log('Final progress set:', Array.from(progressSet));
        setCharactersWithProgress(progressSet);
      } catch (error) {
        console.error('Error checking progress:', error);
      }
    };
    
    checkAllProgress();
  }, [user]);

  const handleStrokeComplete = (stroke: HandwritingStroke) => {
    console.log(`🖌️ Stroke completed for character: ${selectedCharacter.id}`);
    const newStrokes = [...userStrokes, stroke];
    setUserStrokes(newStrokes);
    console.log(`Total strokes for ${selectedCharacter.id}: ${newStrokes.length}`);
    
    // Track handwriting activity on first stroke
    if (newStrokes.length === 1 && !hasTrackedActivity) {
      trackActivity(ActivityType.HANDWRITING_PRACTICED);
      setHasTrackedActivity(true);
    }
    
    // Note: Progress is NOT saved automatically - user must click "Save" button
  };

  const handleClearCanvas = async () => {
    if (!user) return;
    
    setUserStrokes([]);
    // Also clear saved progress from Firebase
    try {
      const progressRef = doc(db, 'handwritingProgress', user.uid, 'characters', selectedCharacter.id);
      await deleteDoc(progressRef);
      // Remove from progress tracking immediately
      setCharactersWithProgress(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedCharacter.id);
        return newSet;
      });
      console.log(`Cleared progress for character: ${selectedCharacter.id}`);
    } catch (error) {
      console.error('Error clearing saved progress:', error);
    }
  };

  const handleNextCharacter = () => {
    const currentIndex = handwritingCharacters.findIndex(char => char.id === selectedCharacter.id);
    const nextIndex = (currentIndex + 1) % handwritingCharacters.length;
    setSelectedCharacter(handwritingCharacters[nextIndex]);
    // Don't clear canvas - let useEffect load the saved progress
  };

  const handleSelectCharacter = (character: HandwritingCharacter) => {
    console.log(`🔄 Switching from ${selectedCharacter.id} to ${character.id}`);
    setSelectedCharacter(character);
    setShowCharacterMenu(false);
    // Don't clear canvas - let useEffect load the saved progress
  };

  const handlePreviousCharacter = () => {
    const currentIndex = handwritingCharacters.findIndex(char => char.id === selectedCharacter.id);
    const prevIndex = currentIndex === 0 ? handwritingCharacters.length - 1 : currentIndex - 1;
    setSelectedCharacter(handwritingCharacters[prevIndex]);
    // Don't clear canvas - let useEffect load the saved progress
  };

  const handleIncreaseStrokeWidth = () => {
    setStrokeWidth(prev => Math.min(prev + 1, maxStrokeWidth));
  };

  const handleDecreaseStrokeWidth = () => {
    setStrokeWidth(prev => Math.max(prev - 1, minStrokeWidth));
  };
  
  // Manual save function for user-initiated saves
  const handleManualSave = async () => {
    if (!user) return;
    
    console.log(`💾 Manual save requested for character: ${selectedCharacter.id}, strokes: ${userStrokes.length}`);
    await saveProgress(selectedCharacter.id, userStrokes);
    
    // Update progress tracking based on whether there are strokes
    setCharactersWithProgress(prev => {
      const newSet = new Set(prev);
      if (userStrokes.length > 0) {
        newSet.add(selectedCharacter.id);
      } else {
        newSet.delete(selectedCharacter.id);
      }
      return newSet;
    });
    
    console.log(`✅ Manual save completed for character: ${selectedCharacter.id}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 px-4 py-2">
        {/* Header with Navigation */}
        <View className="mb-3">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity 
              className="w-11 h-11 rounded-full bg-white shadow-sm items-center justify-center"
              onPress={handlePreviousCharacter}
            >
              <Ionicons name="chevron-back" size={24} color="#C67C4E" />
            </TouchableOpacity>

            <View className="flex-1 items-center">
              <Text className="text-xl font-bold text-primary mb-1">Handwriting Practice</Text>
              <TouchableOpacity 
                className="bg-white rounded-full px-3 py-2 shadow-sm flex-row items-center"
                onPress={() => setShowCharacterMenu(!showCharacterMenu)}
              >
                <Text className="text-xs text-secondary font-medium mr-1">
                  Choose Character
                </Text>
                <Ionicons 
                  name={showCharacterMenu ? "chevron-up" : "chevron-down"} 
                  size={16} 
                  color="#0B4CA7" 
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              className="w-11 h-11 rounded-full bg-white shadow-sm items-center justify-center"
              onPress={handleNextCharacter}
            >
              <Ionicons name="chevron-forward" size={24} color="#C67C4E" />
            </TouchableOpacity>
          </View>

          {/* Character Selection Menu */}
          {showCharacterMenu && (
            <View className="bg-white rounded-2xl p-4 shadow-sm">
              <Text className="text-sm font-bold text-primary mb-4 text-center">Select a Character to Practice:</Text>
              <View className="flex-row flex-wrap justify-between gap-2">
                {handwritingCharacters.map((character) => (
                  <TouchableOpacity
                    key={character.id}
                    className={`w-[30%] aspect-square rounded-xl items-center justify-center p-2 border-2 ${
                      selectedCharacter.id === character.id 
                        ? 'bg-secondary/10 border-secondary' 
                        : charactersWithProgress.has(character.id)
                          ? 'bg-gray-50 border-green-500'
                          : 'bg-gray-50 border-transparent'
                    }`}
                    onPress={() => handleSelectCharacter(character)}
                  >
                    {charactersWithProgress.has(character.id) && (
                      <View className="absolute top-0.5 right-0.5 z-10">
                        <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                      </View>
                    )}
                    <Text className={`text-3xl font-bold mb-1 ${
                      selectedCharacter.id === character.id ? 'text-secondary' : 'text-primary'
                    }`}>
                      {character.character}
                    </Text>
                    <Text className={`text-xs font-medium ${
                      selectedCharacter.id === character.id 
                        ? 'text-secondary font-bold' 
                        : 'text-gray-600'
                    }`}>
                      {character.romanized}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Character Info */}
          <View className="bg-white rounded-xl p-4 shadow-sm">
            <View className="flex-row items-center justify-between">
              <Text className="text-5xl font-bold text-primary">{selectedCharacter.character}</Text>
              <View className="flex-1 ml-5 items-end">
                <Text className="text-lg text-gray-800 mb-1">"{selectedCharacter.romanized}"</Text>
                <Text className="text-xs text-gray-600 text-right">
                  {charactersWithProgress.has(selectedCharacter.id) 
                    ? 'Continue your saved progress' 
                    : 'Practice freely - progress saved manually'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Drawing Canvas - Centered */}
        <View className="flex-1 justify-center items-center my-4 min-h-[300px]">
          <Text className="text-sm font-semibold text-primary mb-4 text-center">
            {selectedCharacter.imageUri ? 'Trace over the character image' : 'Follow the guide strokes'}
          </Text>
          <View className="items-center justify-center">
            {isLoading ? (
              <View className="bg-gray-100 rounded-xl border-2 border-gray-300 justify-center items-center" style={{ width: canvasSize, height: canvasSize }}>
                <Text className="text-sm text-gray-600 font-medium">Loading progress...</Text>
              </View>
            ) : (
              <DrawingCanvas
                width={canvasSize}
                height={canvasSize}
                onStrokeComplete={handleStrokeComplete}
                showGuide={true}
                guideStrokes={selectedCharacter.guideStrokes}
                disabled={false}
                completedStrokes={userStrokes}
                backgroundImage={selectedCharacter.imageUri}
                strokeWidth={strokeWidth}
              />
            )}
          </View>
        </View>

        {/* Bottom Controls */}
        <View className="pb-3">
          {/* Stroke Width Controls */}
          <View className="items-center pt-3 border-t border-gray-200">
            <Text className="text-sm font-semibold text-gray-600 mb-3">Stroke Width</Text>
            <View className="flex-row items-center justify-center">
              <TouchableOpacity 
                className={`w-9 h-9 rounded-full items-center justify-center mx-3 shadow-sm ${
                  strokeWidth <= minStrokeWidth ? 'bg-gray-100' : 'bg-white'
                }`}
                onPress={handleDecreaseStrokeWidth}
                disabled={strokeWidth <= minStrokeWidth}
              >
                <Ionicons name="remove" size={18} color={strokeWidth <= minStrokeWidth ? "#CCC" : "#0B4CA7"} />
              </TouchableOpacity>
              
              <Text className="text-sm font-semibold text-gray-800 min-w-[40px] text-center">{strokeWidth}px</Text>
              
              <TouchableOpacity 
                className={`w-9 h-9 rounded-full items-center justify-center mx-3 shadow-sm ${
                  strokeWidth >= maxStrokeWidth ? 'bg-gray-100' : 'bg-white'
                }`}
                onPress={handleIncreaseStrokeWidth}
                disabled={strokeWidth >= maxStrokeWidth}
              >
                <Ionicons name="add" size={18} color={strokeWidth >= maxStrokeWidth ? "#CCC" : "#0B4CA7"} />
              </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <View className="flex-row justify-center gap-4 mt-4">
              <TouchableOpacity 
                className="flex-row items-center justify-center px-5 py-3 rounded-full bg-white shadow-sm min-w-[80px]"
                onPress={handleManualSave}
                disabled={userStrokes.length === 0}
              >
                <Ionicons 
                  name="save" 
                  size={18} 
                  color={userStrokes.length === 0 ? "#CCC" : "#4CAF50"} 
                />
                <Text className={`text-sm ml-1 font-semibold ${
                  userStrokes.length === 0 ? 'text-gray-400' : 'text-green-600'
                }`}>
                  Save
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                className="flex-row items-center justify-center px-5 py-3 rounded-full bg-white shadow-sm min-w-[80px]"
                onPress={handleClearCanvas}
              >
                <Ionicons name="refresh" size={18} color="#EF4444" />
                <Text className="text-sm ml-1 font-semibold text-red-500">Clear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}


