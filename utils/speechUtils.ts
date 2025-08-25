import * as Speech from 'expo-speech';

// Enhanced TTS configuration for Filipino/Tagalog pronunciation
export interface FilipinoTTSOptions {
  text: string;
  isTagalog: boolean;
  onStart?: () => void;
  onDone?: () => void;
  onError?: (error: any) => void;
}

// Available Filipino language codes in order of preference with regional variants
const FILIPINO_LANGUAGE_CODES = [
  'tl-PH',    // Tagalog (Philippines) - primary
  'fil-PH',   // Filipino (Philippines) - alternative
  'tl-PH-x-fil', // Filipino variant
  'tl',       // Generic Tagalog
  'fil',      // Generic Filipino
  'en-PH',    // English (Philippines) - has Filipino accent
];

// Optimized speech settings for Filipino pronunciation with enhanced accent
const FILIPINO_SPEECH_SETTINGS = {
  pitch: 0.85,       // Lower pitch for more authentic Filipino tone
  rate: 0.8,         // Faster rate for better flow while maintaining clarity
  volume: 0.9,       // Slightly softer volume
};

const ENGLISH_SPEECH_SETTINGS = {
  pitch: 0.8,        // Even lower pitch when pronouncing Filipino words in English
  rate: 0.75,        // Faster rate for English fallback
  volume: 0.9,       // Consistent volume
};

/**
 * Optimizes text for better Filipino pronunciation
 */
const optimizeTextForFilipinoTTS = (text: string): string => {
  let optimizedText = text;
  
  // Add subtle pronunciation hints for common Filipino sounds
  const pronunciationMap: Record<string, string> = {
    // Common Filipino words that need pronunciation help
    'baybayin': 'bay-ba-yin',
    'Baybayin': 'Bay-ba-yin',
    'talabaybayin': 'ta-la-bay-ba-yin',
    'TalaBaybayin': 'Ta-la-Bay-ba-yin',
    'alakdan': 'a-lak-dan',
    'kamote': 'ka-mo-te',
    'pakbet': 'pak-bet',
    'ng': 'nang',  // Help with 'ng' pronunciation
    'mga': 'mangga',  // Common mispronunciation
  };
  
  // Apply pronunciation optimizations
  Object.entries(pronunciationMap).forEach(([original, optimized]) => {
    const regex = new RegExp(`\\b${original}\\b`, 'gi');
    optimizedText = optimizedText.replace(regex, optimized);
  });
  
  return optimizedText;
};

/**
 * Speaks text with Filipino accent/voice when possible
 */
export const speakWithFilipinoVoice = async (options: FilipinoTTSOptions): Promise<void> => {
  const { text, isTagalog, onStart, onDone, onError } = options;
  
  if (!text?.trim()) {
    onError?.(new Error('No text to speak'));
    return;
  }

  try {
    // Stop any currently playing speech
    await Speech.stop();
    
    if (onStart) onStart();

    // Optimize text for better Filipino pronunciation
    const optimizedText = isTagalog ? optimizeTextForFilipinoTTS(text) : text;

    if (isTagalog) {
      // Try Filipino language codes in order of preference
      await speakWithFallback(optimizedText, onDone, onError);
    } else {
      // For English/Baybayin, use English with Filipino-friendly settings
      await Speech.speak(optimizedText, {
        language: 'en-US',
        ...ENGLISH_SPEECH_SETTINGS,
        onDone,
        onError: (error) => {
          console.log('English TTS Error:', error);
          onError?.(error);
        }
      });
    }
  } catch (error) {
    console.log('Speech initialization error:', error);
    onError?.(error);
  }
};

/**
 * Attempts to speak with Filipino voices, falling back through language codes
 */
const speakWithFallback = async (
  text: string, 
  onDone?: () => void, 
  onError?: (error: any) => void,
  languageIndex: number = 0
): Promise<void> => {
  if (languageIndex >= FILIPINO_LANGUAGE_CODES.length) {
    // Final fallback to English with Filipino-friendly settings and accent hints
    const fallbackText = text.includes('baybayin') ? optimizeTextForFilipinoTTS(text) : text;
    
    await Speech.speak(fallbackText, {
      language: 'en-US',
      ...ENGLISH_SPEECH_SETTINGS,
      pitch: 0.8,   // Lower pitch for more Filipino-like accent
      rate: 0.8,    // Faster rate for better flow
      onDone,
      onError: (error) => {
        console.log('Final fallback TTS Error:', error);
        onError?.(error);
      }
    });
    return;
  }

  const currentLanguage = FILIPINO_LANGUAGE_CODES[languageIndex];
  
  await Speech.speak(text, {
    language: currentLanguage,
    ...FILIPINO_SPEECH_SETTINGS,
    onDone: () => {
      console.log(`✅ Successfully used ${currentLanguage} for TTS`);
      onDone?.();
    },
    onError: (error) => {
      console.log(`❌ TTS Error with ${currentLanguage}:`, error);
      // Try next language code
      speakWithFallback(text, onDone, onError, languageIndex + 1);
    }
  });
};

/**
 * Stops any currently playing speech
 */
export const stopSpeech = async (): Promise<void> => {
  try {
    await Speech.stop();
  } catch (error) {
    console.log('Error stopping speech:', error);
  }
};

/**
 * Check if speech synthesis is available
 */
export const isSpeechAvailable = async (): Promise<boolean> => {
  try {
    // Try to get available voices (this will help determine TTS capability)
    const voices = await Speech.getAvailableVoicesAsync();
    return voices.length > 0;
  } catch (error) {
    console.log('Error checking speech availability:', error);
    return false;
  }
};

/**
 * Get available voices and filter for Filipino ones
 */
export const getFilipinoVoices = async (): Promise<any[]> => {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    
    // Filter for Filipino/Tagalog voices with enhanced detection
    const filipinoVoices = voices.filter(voice => {
      const lang = voice.language?.toLowerCase() || '';
      const name = voice.name?.toLowerCase() || '';
      
      return (
        lang.includes('tl') ||
        lang.includes('fil') ||
        lang.includes('tagalog') ||
        lang.includes('filipino') ||
        lang.includes('ph') ||  // Philippines region
        name.includes('tagalog') ||
        name.includes('filipino') ||
        name.includes('philippines') ||
        name.includes('manila') ||
        name.includes('cebu')
      );
    });
    
    console.log('Available Filipino voices:', filipinoVoices);
    return filipinoVoices;
  } catch (error) {
    console.log('Error getting Filipino voices:', error);
    return [];
  }
};

/**
 * Get the best available Filipino voice for natural accent
 */
export const getBestFilipinoVoice = async (): Promise<string | null> => {
  try {
    const filipinoVoices = await getFilipinoVoices();
    
    if (filipinoVoices.length === 0) {
      console.log('No Filipino voices found, will use fallback');
      return null;
    }
    
    // Prioritize voices by quality and authenticity
    const voicePriority = [
      'tl-PH',
      'fil-PH', 
      'en-PH',  // English with Filipino accent
      'tl',
      'fil'
    ];
    
    // Find the best available voice
    for (const preferredLang of voicePriority) {
      const matchingVoice = filipinoVoices.find(voice => 
        voice.language?.toLowerCase().includes(preferredLang.toLowerCase())
      );
      if (matchingVoice) {
        console.log(`✅ Selected best Filipino voice: ${matchingVoice.language} - ${matchingVoice.name}`);
        return matchingVoice.language;
      }
    }
    
    // If no exact match, return the first Filipino voice found
    const firstVoice = filipinoVoices[0];
    console.log(`✅ Using first available Filipino voice: ${firstVoice.language} - ${firstVoice.name}`);
    return firstVoice.language;
    
  } catch (error) {
    console.log('Error getting best Filipino voice:', error);
    return null;
  }
};

/**
 * Enhanced speech function with automatic best voice selection and Filipino accent optimization
 */
export const speakWithOptimalFilipinoAccent = async (
  text: string,
  isTagalog: boolean = true,
  options?: {
    onStart?: () => void;
    onDone?: () => void;
    onError?: (error: any) => void;
  }
): Promise<void> => {
  try {
    await Speech.stop();
    
    options?.onStart?.();
    
    // Get the best Filipino voice available
    const bestVoice = await getBestFilipinoVoice();
    
    // Optimize text for pronunciation
    const optimizedText = isTagalog ? optimizeTextForFilipinoTTS(text) : text;
    
    const speechSettings: Speech.SpeechOptions = {
      language: bestVoice || (isTagalog ? 'tl-PH' : 'en-US'),
      pitch: isTagalog ? 0.85 : 0.8,      // Lower pitch for more authentic Filipino tone
      rate: isTagalog ? 0.85 : 0.8,       // Faster rate for better flow
      volume: 0.9,
      ...(bestVoice ? { voice: bestVoice } : {}),
      onDone: () => {
        console.log(`🎯 TTS completed with voice: ${bestVoice || 'fallback'}`);
        options?.onDone?.();
      },
      onError: (error: any) => {
        console.log('🔴 TTS Error:', error);
        options?.onError?.(error);
      }
    };
    
    console.log(`🗣️ Speaking with settings:`, speechSettings);
    await Speech.speak(optimizedText, speechSettings);
    
  } catch (error) {
    console.log('Enhanced TTS Error:', error);
    options?.onError?.(error);
  }
};

/**
 * Enhanced speech function with better error handling and voice selection
 */
export const enhancedSpeak = async (
  text: string,
  isTagalog: boolean = true,
  customOptions?: Partial<Speech.SpeechOptions>
): Promise<void> => {
  try {
    await Speech.stop();
    
    const defaultOptions: Speech.SpeechOptions = {
      language: isTagalog ? 'tl-PH' : 'en-US',
      pitch: isTagalog ? 0.9 : 0.9,
      rate: isTagalog ? 0.7 : 0.6,
      ...customOptions
    };

    await Speech.speak(text, defaultOptions);
  } catch (error) {
    console.log('Enhanced speak error:', error);
    throw error;
  }
};
