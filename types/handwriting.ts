export interface HandwritingStroke {
  id: string;
  points: { x: number; y: number }[];
  timestamp: number;
}

export interface HandwritingCharacter {
  id: string;
  character: string;
  romanized: string;
  imageUri?: any;
  strokes: HandwritingStroke[];
  guideStrokes?: { x: number; y: number }[][];
}

export interface HandwritingSession {
  characterId: string;
  userStrokes: HandwritingStroke[];
  startTime: Date;
  endTime?: Date;
  accuracy?: number;
  completed: boolean;
}

export interface HandwritingProgress {
  completedCharacters: string[];
  sessions: HandwritingSession[];
  totalPracticeTime: number;
  averageAccuracy: number;
}
