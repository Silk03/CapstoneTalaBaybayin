import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { doc, setDoc, getDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../config/firebase';
import { Ionicons } from '@expo/vector-icons';
import { DrawingCanvas } from './DrawingCanvas';
import { handwritingCharacters } from '../../data/handwriting';
import { HandwritingStroke, HandwritingCharacter } from '../../types/handwriting';

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
  
  const { user } = useAuth();

  // Early return if no user authenticated
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.content, styles.centeredContent]}>
          <Text style={styles.noAuthText}>Please log in to save your handwriting progress</Text>
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
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header with Navigation */}
        <View style={styles.topSection}>
          <View style={styles.headerWithNav}>
            <TouchableOpacity 
              style={styles.navButton}
              onPress={handlePreviousCharacter}
            >
              <Ionicons name="chevron-back" size={24} color="#2196F3" />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={styles.title}>Handwriting Practice</Text>
              <TouchableOpacity 
                style={styles.menuButton}
                onPress={() => setShowCharacterMenu(!showCharacterMenu)}
              >
                <Text style={styles.menuButtonText}>
                  Choose Character
                </Text>
                <Ionicons 
                  name={showCharacterMenu ? "chevron-up" : "chevron-down"} 
                  size={16} 
                  color="#2196F3" 
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.navButton}
              onPress={handleNextCharacter}
            >
              <Ionicons name="chevron-forward" size={24} color="#2196F3" />
            </TouchableOpacity>
          </View>

          {/* Character Selection Menu */}
          {showCharacterMenu && (
            <View style={styles.characterMenu}>
              <Text style={styles.menuTitle}>Select a Character to Practice:</Text>
              <View style={styles.characterGrid}>
                {handwritingCharacters.map((character) => (
                  <TouchableOpacity
                    key={character.id}
                    style={[
                      styles.characterOption,
                      selectedCharacter.id === character.id && styles.selectedCharacter,
                      charactersWithProgress.has(character.id) && styles.characterWithProgress
                    ]}
                    onPress={() => handleSelectCharacter(character)}
                  >
                    {charactersWithProgress.has(character.id) && (
                      <View style={styles.progressIndicator}>
                        <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                      </View>
                    )}
                    <Text style={[
                      styles.characterText,
                      selectedCharacter.id === character.id && styles.selectedCharacterText
                    ]}>
                      {character.character}
                    </Text>
                    <Text style={[
                      styles.characterLabel,
                      selectedCharacter.id === character.id && styles.selectedLabel
                    ]}>
                      {character.romanized}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Character Info */}
          <View style={styles.characterInfo}>
            <View style={styles.characterRow}>
              <Text style={styles.currentCharacter}>{selectedCharacter.character}</Text>
              <View style={styles.characterDetails}>
                <Text style={styles.romanized}>"{selectedCharacter.romanized}"</Text>
                <Text style={styles.instruction}>
                  {charactersWithProgress.has(selectedCharacter.id) 
                    ? 'Continue your saved progress' 
                    : 'Practice freely - progress saved automatically'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Drawing Canvas - Centered */}
        <View style={styles.canvasSection}>
          <Text style={styles.canvasTitle}>
            {selectedCharacter.imageUri ? 'Trace over the character image' : 'Follow the guide strokes'}
          </Text>
          <View style={styles.canvasWrapper}>
            {isLoading ? (
              <View style={[styles.loadingContainer, { width: canvasSize, height: canvasSize }]}>
                <Text style={styles.loadingText}>Loading progress...</Text>
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
        <View style={styles.bottomSection}>
          {/* Stroke Width Controls */}
          <View style={styles.sizeControls}>
            <Text style={styles.sizeLabel}>Stroke Width</Text>
            <View style={styles.sizeButtonsRow}>
              <TouchableOpacity 
                style={[styles.sizeButton, strokeWidth <= minStrokeWidth && styles.disabledButton]}
                onPress={handleDecreaseStrokeWidth}
                disabled={strokeWidth <= minStrokeWidth}
              >
                <Ionicons name="remove" size={18} color={strokeWidth <= minStrokeWidth ? "#CCC" : "#2196F3"} />
              </TouchableOpacity>
              
              <Text style={styles.sizeText}>{strokeWidth}px</Text>
              
              <TouchableOpacity 
                style={[styles.sizeButton, strokeWidth >= maxStrokeWidth && styles.disabledButton]}
                onPress={handleIncreaseStrokeWidth}
                disabled={strokeWidth >= maxStrokeWidth}
              >
                <Ionicons name="add" size={18} color={strokeWidth >= maxStrokeWidth ? "#CCC" : "#2196F3"} />
              </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.saveButton]}
                onPress={handleManualSave}
                disabled={userStrokes.length === 0}
              >
                <Ionicons 
                  name="save" 
                  size={18} 
                  color={userStrokes.length === 0 ? "#CCC" : "#4CAF50"} 
                />
                <Text style={[
                  styles.actionButtonText, 
                  styles.saveButtonText,
                  userStrokes.length === 0 && styles.disabledButtonText
                ]}>
                  Save
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, styles.clearButton]}
                onPress={handleClearCanvas}
              >
                <Ionicons name="refresh" size={18} color="#FF5722" />
                <Text style={[styles.actionButtonText, styles.clearButtonText]}>Clear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5'
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 8
  },
  topSection: {
    marginBottom: 10
  },
  headerWithNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 5
  },
  counterText: {
    fontSize: 12,
    color: '#777',
    fontWeight: '500'
  },
  characterInfo: {
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  characterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  currentCharacter: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#8B4513'
  },
  characterDetails: {
    flex: 1,
    marginLeft: 20,
    alignItems: 'flex-end'
  },
  romanized: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5
  },
  instruction: {
    fontSize: 12,
    color: '#777',
    textAlign: 'right'
  },
  canvasSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 15,
    minHeight: 300
  },
  canvasTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 15,
    textAlign: 'center'
  },
  canvasWrapper: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  bottomSection: {
    paddingBottom: 10
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 80,
    flexDirection: 'row'
  },
  activeButton: {
    backgroundColor: '#2196F3'
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginTop: 5
  },
  menuButtonText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
    marginRight: 5
  },
  characterMenu: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 15,
    textAlign: 'center'
  },
  characterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8
  },
  characterOption: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderWidth: 2,
    borderColor: 'transparent'
  },
  selectedCharacter: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3'
  },
  characterWithProgress: {
    borderColor: '#4CAF50',
    borderWidth: 2
  },
  progressIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    zIndex: 1
  },
  characterText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 4
  },
  selectedCharacterText: {
    color: '#2196F3'
  },
  characterLabel: {
    fontSize: 10,
    color: '#777',
    fontWeight: '500'
  },
  selectedLabel: {
    color: '#2196F3',
    fontWeight: 'bold'
  },
  controlText: {
    fontSize: 12,
    color: '#333',
    marginLeft: 5,
    fontWeight: '500'
  },
  activeText: {
    color: '#FFF'
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    width: 45,
    height: 45,
    borderRadius: 22.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  sizeControls: {
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0'
  },
  sizeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 10
  },
  sizeButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  sizeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    width: 34,
    height: 34,
    borderRadius: 17,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  disabledButton: {
    backgroundColor: '#F5F5F5'
  },
  sizeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    minWidth: 40,
    textAlign: 'center'
  },
  clearButton: {
    backgroundColor: 'white'
  },
  clearButtonText: {
    color: '#FF5722'
  },
  centeredContent: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  noAuthText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginHorizontal: 20
  },
  loadingContainer: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500'
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginTop: 15
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 80
  },
  saveButton: {
    backgroundColor: 'white'
  },
  actionButtonText: {
    fontSize: 13,
    marginLeft: 5,
    fontWeight: '600'
  },
  saveButtonText: {
    color: '#4CAF50'
  },
  disabledButtonText: {
    color: '#CCC'
  }
});
