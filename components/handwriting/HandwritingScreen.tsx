import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DrawingCanvas } from './DrawingCanvas';
import { handwritingCharacters } from '../../data/handwriting';
import { HandwritingStroke, HandwritingCharacter } from '../../types/handwriting';

const { width: screenWidth } = Dimensions.get('window');
const canvasSize = Math.min(screenWidth - 30, 350); // Larger canvas, max 350

export default function HandwritingScreen() {
  const [selectedCharacter, setSelectedCharacter] = useState<HandwritingCharacter>(handwritingCharacters[0]);
  const [userStrokes, setUserStrokes] = useState<HandwritingStroke[]>([]);
  const [showGuide, setShowGuide] = useState(true);
  const [currentStrokeIndex, setCurrentStrokeIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleStrokeComplete = (stroke: HandwritingStroke) => {
    const newStrokes = [...userStrokes, stroke];
    setUserStrokes(newStrokes);
    setCurrentStrokeIndex(newStrokes.length);

    // Check if character is completed (based on expected number of strokes)
    if (newStrokes.length >= (selectedCharacter.guideStrokes?.length || 1)) {
      setIsCompleted(true);
      Alert.alert(
        'Character Completed!',
        `Great job practicing "${selectedCharacter.character}" (${selectedCharacter.romanized})`,
        [
          { text: 'Practice Again', onPress: handleClearCanvas },
          { text: 'Next Character', onPress: handleNextCharacter }
        ]
      );
    }
  };

  const handleClearCanvas = () => {
    setUserStrokes([]);
    setCurrentStrokeIndex(0);
    setIsCompleted(false);
  };

  const handleNextCharacter = () => {
    const currentIndex = handwritingCharacters.findIndex(char => char.id === selectedCharacter.id);
    const nextIndex = (currentIndex + 1) % handwritingCharacters.length;
    setSelectedCharacter(handwritingCharacters[nextIndex]);
    handleClearCanvas();
  };

  const handlePreviousCharacter = () => {
    const currentIndex = handwritingCharacters.findIndex(char => char.id === selectedCharacter.id);
    const prevIndex = currentIndex === 0 ? handwritingCharacters.length - 1 : currentIndex - 1;
    setSelectedCharacter(handwritingCharacters[prevIndex]);
    handleClearCanvas();
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
              <Text style={styles.counterText}>
                {handwritingCharacters.findIndex(char => char.id === selectedCharacter.id) + 1} / {handwritingCharacters.length}
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.navButton}
              onPress={handleNextCharacter}
            >
              <Ionicons name="chevron-forward" size={24} color="#2196F3" />
            </TouchableOpacity>
          </View>

          {/* Character Info */}
          <View style={styles.characterInfo}>
            <View style={styles.characterRow}>
              <Text style={styles.currentCharacter}>{selectedCharacter.character}</Text>
              <View style={styles.characterDetails}>
                <Text style={styles.romanized}>"{selectedCharacter.romanized}"</Text>
                <Text style={styles.instruction}>
                  {isCompleted 
                    ? 'Completed!'
                    : `${userStrokes.length}/${selectedCharacter.guideStrokes?.length || 1} strokes`
                  }
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
            <DrawingCanvas
              width={canvasSize}
              height={canvasSize}
              onStrokeComplete={handleStrokeComplete}
              showGuide={showGuide}
              guideStrokes={selectedCharacter.guideStrokes}
              disabled={isCompleted}
              completedStrokes={userStrokes}
              backgroundImage={selectedCharacter.imageUri}
            />
          </View>
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomSection}>
          <View style={styles.controls}>
            <TouchableOpacity 
              style={[styles.controlButton, showGuide ? styles.activeButton : null]}
              onPress={() => setShowGuide(!showGuide)}
            >
              <Ionicons 
                name={showGuide ? "eye" : "eye-off"} 
                size={20} 
                color={showGuide ? "#FFF" : "#2196F3"} 
              />
              <Text style={[styles.controlText, showGuide ? styles.activeText : null]}>
                {showGuide ? 'Guide On' : 'Guide Off'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.controlButton}
              onPress={handleClearCanvas}
            >
              <Ionicons name="refresh" size={20} color="#FF5722" />
              <Text style={styles.controlText}>Clear</Text>
            </TouchableOpacity>
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
    paddingVertical: 10
  },
  topSection: {
    marginBottom: 15
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
    marginVertical: 10
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
    gap: 30
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
  }
});
