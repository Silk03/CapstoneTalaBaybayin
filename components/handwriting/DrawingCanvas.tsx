import React, { useState, useRef } from 'react';
import { View, PanResponder, ImageBackground } from 'react-native';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import { HandwritingStroke } from '../../types/handwriting';
import '../../global.css';

interface DrawingCanvasProps {
  width: number;
  height: number;
  onStrokeComplete: (stroke: HandwritingStroke) => void;
  showGuide?: boolean;
  guideStrokes?: { x: number; y: number }[][];
  disabled?: boolean;
  completedStrokes?: HandwritingStroke[];
  backgroundImage?: any;
  strokeWidth?: number;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  width,
  height,
  onStrokeComplete,
  showGuide = true,
  guideStrokes = [],
  disabled = false,
  completedStrokes = [],
  backgroundImage,
  strokeWidth = 5
}) => {
  const [currentStroke, setCurrentStroke] = useState<{ x: number; y: number }[]>([]);
  const [paths, setPaths] = useState<{ path: string; color: string }[]>([]);
  const isDrawing = useRef(false);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !disabled,
    onMoveShouldSetPanResponder: () => !disabled,
    
    onPanResponderGrant: (event) => {
      if (disabled) return;
      
      const { locationX, locationY } = event.nativeEvent;
      const newStroke = [{ x: locationX, y: locationY }];
      setCurrentStroke(newStroke);
      isDrawing.current = true;
    },
    
    onPanResponderMove: (event) => {
      if (disabled || !isDrawing.current) return;
      
      const { locationX, locationY } = event.nativeEvent;
      setCurrentStroke(prev => [...prev, { x: locationX, y: locationY }]);
    },
    
    onPanResponderRelease: () => {
      if (disabled || !isDrawing.current || currentStroke.length === 0) return;
      
      const completedStroke: HandwritingStroke = {
        id: Date.now().toString(),
        points: currentStroke,
        timestamp: Date.now()
      };
      
      onStrokeComplete(completedStroke);
      setCurrentStroke([]);
      isDrawing.current = false;
    }
  });

  const renderGuideStrokes = () => {
    return guideStrokes.map((stroke, index) => {
      const guidePath = Skia.Path.Make();
      if (stroke.length > 0) {
        guidePath.moveTo(stroke[0].x * (width / 100), stroke[0].y * (height / 100));
        for (let i = 1; i < stroke.length; i++) {
          guidePath.lineTo(stroke[i].x * (width / 100), stroke[i].y * (height / 100));
        }
      }
      
      return (
        <Path
          key={`guide-${index}`}
          path={guidePath}
          style="stroke"
          strokeWidth={3}
          color="rgba(200, 200, 200, 0.5)"
          strokeCap="round"
          strokeJoin="round"
        />
      );
    });
  };

  const renderCompletedStrokes = () => {
    return completedStrokes.map((stroke, index) => {
      const strokePath = Skia.Path.Make();
      if (stroke.points.length > 0) {
        strokePath.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          strokePath.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
      }
      
      return (
        <Path
          key={`completed-${stroke.id}`}
          path={strokePath}
          style="stroke"
          strokeWidth={strokeWidth}
          color="#000000"
          strokeCap="round"
          strokeJoin="round"
        />
      );
    });
  };

  const renderCurrentStroke = () => {
    if (currentStroke.length === 0) return null;
    
    const currentPath = Skia.Path.Make();
    currentPath.moveTo(currentStroke[0].x, currentStroke[0].y);
    for (let i = 1; i < currentStroke.length; i++) {
      currentPath.lineTo(currentStroke[i].x, currentStroke[i].y);
    }
    
    return (
      <Path
        path={currentPath}
        style="stroke"
        strokeWidth={strokeWidth}
        color="#000000"
        strokeCap="round"
        strokeJoin="round"
      />
    );
  };

  return (
    <View className="bg-gray-50 rounded-xl border-2 border-gray-200 overflow-hidden" style={{ width, height }} {...panResponder.panHandlers}>
      {backgroundImage ? (
        <ImageBackground 
          source={backgroundImage} 
          style={{ width, height }}
          resizeMode="contain"
          imageStyle={{ opacity: 0.3, borderRadius: 8 }}
        >
          <Canvas style={{ width, height, backgroundColor: 'transparent' }}>
            {/* Guide strokes (less opacity when image is present) */}
            {showGuide && !backgroundImage && renderGuideStrokes()}
            
            {/* Completed strokes */}
            {renderCompletedStrokes()}
            
            {/* Current drawing stroke */}
            {renderCurrentStroke()}
          </Canvas>
        </ImageBackground>
      ) : (
        <Canvas style={{ width, height, backgroundColor: 'transparent' }}>
          {/* Guide strokes */}
          {showGuide && renderGuideStrokes()}
          
          {/* Completed strokes */}
          {renderCompletedStrokes()}
          
          {/* Current drawing stroke */}
          {renderCurrentStroke()}
        </Canvas>
      )}
    </View>
  );
};
