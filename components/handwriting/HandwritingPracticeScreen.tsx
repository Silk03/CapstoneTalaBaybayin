import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  PanResponder,
  GestureResponderEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HandwritingCharacter } from './HandwritingContainer';

// Try to import Skia components with fallback
let Canvas: any = null;
let Path: any = null;
let Skia: any = null;

try {
  const SkiaModule = require('@shopify/react-native-skia');
  Canvas = SkiaModule.Canvas;
  Path = SkiaModule.Path;
  Skia = SkiaModule.Skia;
} catch (error) {
  console.log('Skia not available, using fallback rendering');
}

interface HandwritingPracticeScreenProps {
  character: HandwritingCharacter;
  onBack: () => void;
}

const { width } = Dimensions.get('window');
const canvasSize = width - 40;

export default function HandwritingPracticeScreen({ character, onBack }: HandwritingPracticeScreenProps) {
  const [currentStroke, setCurrentStroke] = useState(0);
  const [showGuide, setShowGuide] = useState(true);
  const [userPaths, setUserPaths] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState(Skia ? Skia.Path.Make() : null);
  const [fallbackPaths, setFallbackPaths] = useState<Array<{x: number, y: number}[]>>([]);
  const [currentFallbackPath, setCurrentFallbackPath] = useState<{x: number, y: number}[]>([]);

  const resetPractice = () => {
    setCurrentStroke(0);
    setUserPaths([]);
    setFallbackPaths([]);
    setCurrentFallbackPath([]);
    if (Skia) {
      setCurrentPath(Skia.Path.Make());
    }
  };

  const nextStroke = () => {
    if (currentStroke < character.strokeOrder.length - 1) {
      setCurrentStroke(prev => prev + 1);
    } else {
      Alert.alert(
        'Great Job! 🎉',
        `You've completed writing "${character.name}"!`,
        [
          { text: 'Practice Again', onPress: resetPractice },
          { text: 'Back to List', onPress: onBack },
        ]
      );
    }
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (event: GestureResponderEvent) => {
      const { locationX, locationY } = event.nativeEvent;
      
      if (Skia) {
        const newPath = Skia.Path.Make();
        newPath.moveTo(locationX, locationY);
        setCurrentPath(newPath);
      } else {
        // Fallback mode
        setCurrentFallbackPath([{ x: locationX, y: locationY }]);
      }
    },
    onPanResponderMove: (event: GestureResponderEvent) => {
      const { locationX, locationY } = event.nativeEvent;
      
      if (Skia && currentPath) {
        const updatedPath = currentPath.copy();
        updatedPath.lineTo(locationX, locationY);
        setCurrentPath(updatedPath);
      } else {
        // Fallback mode
        setCurrentFallbackPath(prev => [...prev, { x: locationX, y: locationY }]);
      }
    },
    onPanResponderRelease: () => {
      if (Skia && currentPath) {
        const pathString = currentPath.toSVGString();
        setUserPaths(prev => [...prev, pathString]);
        setCurrentPath(Skia.Path.Make());
      } else {
        // Fallback mode
        if (currentFallbackPath.length > 0) {
          setFallbackPaths(prev => [...prev, currentFallbackPath]);
          setCurrentFallbackPath([]);
        }
      }
      
      // Auto advance to next stroke after a short delay
      setTimeout(() => {
        nextStroke();
      }, 500);
    },
  });

  const getStrokeGuide = () => {
    if (!showGuide || currentStroke >= character.strokeOrder.length) return [];
    
    const strokePoints = character.strokeOrder[currentStroke];
    if (strokePoints.length === 0) return [];
    
    // Scale points to canvas size
    return strokePoints.map(point => ({
      x: (point.x / 100) * canvasSize,
      y: (point.y / 100) * canvasSize,
    }));
  };

  const renderUserPaths = () => {
    if (Skia) {
      return userPaths.map((pathString, index) => {
        const userPath = Skia.Path.MakeFromSVGString(pathString);
        return userPath ? (
          <Path
            key={index}
            path={userPath}
            color="#2196F3"
            style="stroke"
            strokeWidth={4}
            strokeCap="round"
            strokeJoin="round"
          />
        ) : null;
      });
    } else {
      // Fallback: render paths as dots
      return [...fallbackPaths, ...(currentFallbackPath.length > 0 ? [currentFallbackPath] : [])].map((path, index) => {
        return path.map((point, pointIndex) => (
          <View
            key={`${index}-${pointIndex}`}
            style={[
              styles.pathPoint,
              {
                left: point.x - 2,
                top: point.y - 2,
              }
            ]}
          />
        ));
      });
    }
  };

  const renderGuide = () => {
    const guidePoints = getStrokeGuide();
    return guidePoints.map((point, index) => (
      <View
        key={`guide-${index}`}
        style={[
          styles.guidePoint,
          {
            left: point.x - 3,
            top: point.y - 3,
          }
        ]}
      />
    ));
  };

  const getStrokeInstructions = () => {
    if (currentStroke >= character.strokeOrder.length) {
      return "Practice complete!";
    }
    return `Stroke ${currentStroke + 1} of ${character.strokeOrder.length}`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.characterSymbol}>{character.character}</Text>
          <Text style={styles.characterName}>{character.name}</Text>
          <Text style={styles.characterPronunciation}>{character.pronunciation}</Text>
        </View>
        <TouchableOpacity onPress={() => setShowGuide(!showGuide)} style={styles.guideButton}>
          <Ionicons 
            name={showGuide ? "eye" : "eye-off"} 
            size={24} 
            color={showGuide ? "#2196F3" : "#666"} 
          />
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>{getStrokeInstructions()}</Text>
        <View style={styles.progressBar}>
          {character.strokeOrder.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                {
                  backgroundColor: index < currentStroke ? '#4CAF50' : 
                                 index === currentStroke ? '#2196F3' : '#E0E0E0'
                }
              ]}
            />
          ))}
        </View>
      </View>

      {/* Drawing Canvas */}
      <View style={styles.canvasContainer}>
        <View 
          style={styles.canvas}
          {...panResponder.panHandlers}
        >
          {Skia && Canvas ? (
            // Skia-powered canvas
            <Canvas style={styles.skiaCanvas}>
              {/* Background */}
              <Path
                path={Skia.Path.Make().addRect(Skia.XYWHRect(0, 0, canvasSize, canvasSize))}
                color="#F5F5F5"
                style="fill"
              />
              
              {/* Grid lines */}
              {Array.from({ length: 5 }, (_, i) => {
                const offset = (canvasSize / 4) * i;
                const verticalLine = Skia.Path.Make();
                verticalLine.moveTo(offset, 0);
                verticalLine.lineTo(offset, canvasSize);
                
                const horizontalLine = Skia.Path.Make();
                horizontalLine.moveTo(0, offset);
                horizontalLine.lineTo(canvasSize, offset);
                
                return (
                  <React.Fragment key={i}>
                    <Path path={verticalLine} color="#E0E0E0" style="stroke" strokeWidth={1} />
                    <Path path={horizontalLine} color="#E0E0E0" style="stroke" strokeWidth={1} />
                  </React.Fragment>
                );
              })}

              {/* Stroke guide */}
              {showGuide && getStrokeGuide().length > 0 && (
                <Path
                  path={(() => {
                    const guidePoints = getStrokeGuide();
                    const guidePath = Skia.Path.Make();
                    if (guidePoints.length > 0) {
                      guidePath.moveTo(guidePoints[0].x, guidePoints[0].y);
                      for (let i = 1; i < guidePoints.length; i++) {
                        guidePath.lineTo(guidePoints[i].x, guidePoints[i].y);
                      }
                    }
                    return guidePath;
                  })()}
                  color="#FF9800"
                  style="stroke"
                  strokeWidth={3}
                  strokeCap="round"
                  strokeJoin="round"
                  opacity={0.7}
                />
              )}

              {/* User's previous paths */}
              {renderUserPaths()}

              {/* Current path being drawn */}
              {currentPath && (
                <Path
                  path={currentPath}
                  color="#2196F3"
                  style="stroke"
                  strokeWidth={4}
                  strokeCap="round"
                  strokeJoin="round"
                />
              )}
            </Canvas>
          ) : (
            // Fallback canvas without Skia
            <>
              {/* Grid lines */}
              {Array.from({ length: 5 }, (_, i) => {
                const offset = (canvasSize / 4) * i;
                return (
                  <React.Fragment key={i}>
                    <View
                      style={[
                        styles.gridLine,
                        styles.verticalLine,
                        { left: offset }
                      ]}
                    />
                    <View
                      style={[
                        styles.gridLine,
                        styles.horizontalLine,
                        { top: offset }
                      ]}
                    />
                  </React.Fragment>
                );
              })}

              {/* Stroke guide dots */}
              {showGuide && renderGuide()}

              {/* User's drawn paths */}
              {renderUserPaths()}
            </>
          )}
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={resetPractice} style={styles.controlButton}>
          <Ionicons name="refresh" size={20} color="#666" />
          <Text style={styles.controlButtonText}>Reset</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => setShowGuide(!showGuide)} 
          style={[styles.controlButton, { backgroundColor: showGuide ? '#E3F2FD' : '#F5F5F5' }]}
        >
          <Ionicons name="help-circle" size={20} color={showGuide ? "#2196F3" : "#666"} />
          <Text style={[styles.controlButtonText, { color: showGuide ? "#2196F3" : "#666" }]}>
            Guide
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  characterSymbol: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  characterName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  characterPronunciation: {
    fontSize: 14,
    color: '#666',
  },
  guideButton: {
    padding: 8,
  },
  instructionsContainer: {
    padding: 16,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  instructionsText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
  },
  progressBar: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  canvasContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  canvas: {
    width: canvasSize,
    height: canvasSize,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  skiaCanvas: {
    flex: 1,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: '#E0E0E0',
  },
  verticalLine: {
    width: 1,
    height: canvasSize,
  },
  horizontalLine: {
    height: 1,
    width: canvasSize,
  },
  pathPoint: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2196F3',
  },
  guidePoint: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF9800',
    opacity: 0.7,
  },
  svgCanvas: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    gap: 8,
  },
  controlButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  canvasPlaceholder: {
    width: canvasSize,
    height: canvasSize,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholderSubtext: {
    fontSize: 16,
    color: '#666',
  },
  nextButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
