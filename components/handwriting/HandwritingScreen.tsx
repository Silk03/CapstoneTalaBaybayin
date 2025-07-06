import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
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
  const [showCharacterMenu, setShowCharacterMenu] = useState(false);

  const handleStrokeComplete = (stroke: HandwritingStroke) => {
    const newStrokes = [...userStrokes, stroke];
    setUserStrokes(newStrokes);
  };

  const handleClearCanvas = () => {
    setUserStrokes([]);
  };

  const handleNextCharacter = () => {
    const currentIndex = handwritingCharacters.findIndex(char => char.id === selectedCharacter.id);
    const nextIndex = (currentIndex + 1) % handwritingCharacters.length;
    setSelectedCharacter(handwritingCharacters[nextIndex]);
    handleClearCanvas();
  };

  const handleSelectCharacter = (character: HandwritingCharacter) => {
    setSelectedCharacter(character);
    setShowCharacterMenu(false);
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
                      selectedCharacter.id === character.id && styles.selectedCharacter
                    ]}
                    onPress={() => handleSelectCharacter(character)}
                  >
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
                  Practice freely
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
              disabled={false}
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
  }
});
