import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Share,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import {
  tagalogToBaybayin,
  baybayinToTagalog,
  isValidBaybayin,
  getConversionSuggestions,
} from '../../utils/translationUtils';
import { speakWithOptimalFilipinoAccent, stopSpeech } from '../../utils/speechUtils';
import { useProgress } from '../../contexts/ProgressContext';
import { ActivityType } from '../../types/progress';
import BaybayinKeyboard from '../common/BaybayinKeyboard';
  import RomanKeyboard from '../common/RomanKeyboard';
import '../../global.css';

interface TranslationScreenProps {
  onBack: () => void;
}

export default function TranslationScreen({ onBack }: TranslationScreenProps) {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [translationMode, setTranslationMode] = useState<'tagalog-to-baybayin' | 'baybayin-to-tagalog'>('tagalog-to-baybayin');
  const [useWordMapping, setUseWordMapping] = useState(true);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [showRomanKeyboard, setShowRomanKeyboard] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ type: 'warning' | 'info' | 'error'; message: string }>>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasTrackedActivity, setHasTrackedActivity] = useState(false); // Track if we've already logged activity
  
  const { trackActivity } = useProgress();

  // Track translation activity when user starts typing
  const handleInputTextChange = (text: string) => {
    setInputText(text);
    
    // Track activity on first character input
    if (text.length === 1 && !hasTrackedActivity) {
      trackActivity(ActivityType.TRANSLATION_USED);
      setHasTrackedActivity(true);
    }
  };

  // Translate when input changes
  useEffect(() => {
    if (inputText.trim() === '') {
      setOutputText('');
      setSuggestions([]);
      return;
    }

    let translated = '';
    let newSuggestions: Array<{ type: 'warning' | 'info' | 'error'; message: string }> = [];

    if (translationMode === 'tagalog-to-baybayin') {
      translated = tagalogToBaybayin(inputText, useWordMapping);
      newSuggestions = getConversionSuggestions(inputText, translated);
    } else {
      translated = baybayinToTagalog(inputText);
      if (!isValidBaybayin(inputText)) {
        newSuggestions.push({
          type: 'warning',
          message: 'Input contains non-Baybayin characters'
        });
      }
    }

    setOutputText(translated);
    setSuggestions(newSuggestions);
  }, [inputText, translationMode, useWordMapping]);

  const handleSwapMode = () => {
    const newMode = translationMode === 'tagalog-to-baybayin' ? 'baybayin-to-tagalog' : 'tagalog-to-baybayin';
    setTranslationMode(newMode);
    
    // Close both keyboards when switching modes
    setShowKeyboard(false);
    setShowRomanKeyboard(false);
    
    // Swap input and output
    const tempText = inputText;
    setInputText(outputText);
    setOutputText(tempText);
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setSuggestions([]);
  };

  const handleCopy = async (text: string, label: string) => {
    try {
      // For React Native, we'll use the Share API as a fallback
      await Share.share({
        message: text,
        title: `${label} Text`,
      });
    } catch (error) {
      Alert.alert('Error', 'Hindi maibahagi ang text');
    }
  };

  const handleShare = async () => {
    try {
      const shareText = `Tagalog: ${translationMode === 'tagalog-to-baybayin' ? inputText : outputText}\nBaybayin: ${translationMode === 'tagalog-to-baybayin' ? outputText : inputText}`;
      await Share.share({
        message: shareText,
        title: 'Baybayin Translation',
      });
    } catch (error) {
      Alert.alert('Error', 'Hindi maibahagi ang translation');
    }
  };

  // Enhanced TTS functionality with Filipino voice support
  const speakText = async (text: string, isTagalog: boolean = true) => {
    if (!text.trim()) {
      Alert.alert('Walang Teksto', 'Mag-lagay ng teksto para marinig');
      return;
    }

    // For Baybayin text, we need to convert it back to Tagalog for pronunciation
    let textToSpeak = text;
    if (!isTagalog && translationMode === 'baybayin-to-tagalog') {
      // If it's Baybayin text, use the translated Tagalog for pronunciation
      textToSpeak = outputText || text;
    }

    await speakWithOptimalFilipinoAccent(textToSpeak, isTagalog, {
      onStart: () => setIsSpeaking(true),
      onDone: () => setIsSpeaking(false),
      onError: (error: any) => {
        console.log('Speech error:', error);
        setIsSpeaking(false);
        Alert.alert('Error sa Speech', 'Hindi ma-basa ang teksto. Subukan ulit.');
      }
    });
  };

  const stopSpeechPlayback = async () => {
    await stopSpeech();
    setIsSpeaking(false);
  };

  // Handle input field focus for Baybayin mode
  const handleInputFocus = () => {
    setIsInputFocused(true);
    // Don't auto-open keyboard here since we're using TouchableOpacity for Baybayin mode
  };

  const handleInputBlur = () => {
    setIsInputFocused(false);
  };

  // Handle Baybayin keyboard text changes
  const handleBaybayinTextChange = (newText: string) => {
    handleInputTextChange(newText);
  };

  // Handle Roman keyboard text changes
  const handleRomanTextChange = (newText: string) => {
    handleInputTextChange(newText);
  };

  // Handle regular text input changes
  const handleTextInputChange = (newText: string) => {
    handleInputTextChange(newText);
  };

  // Toggle Baybayin keyboard manually
  const toggleBaybayinKeyboard = () => {
    setShowKeyboard(!showKeyboard);
    setShowRomanKeyboard(false); // Close Roman keyboard if open
  };

  // Toggle Roman keyboard manually
  const toggleRomanKeyboard = () => {
    setShowRomanKeyboard(!showRomanKeyboard);
    setShowKeyboard(false); // Close Baybayin keyboard if open
  };

  const renderSuggestions = () => {
    if (suggestions.length === 0) return null;

    return (
      <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
        <Text className="text-lg font-semibold text-primary mb-2">Suggestions:</Text>
        {suggestions.map((suggestion, index) => (
          <View key={index} className={`flex-row items-start gap-2 p-2 rounded-lg mb-1 ${
            suggestion.type === 'info' ? 'bg-secondary/10 border-secondary/20' : 
            suggestion.type === 'warning' ? 'bg-orange-50' : 
            'bg-red-50'
          }`}>
            <Ionicons 
              name={suggestion.type === 'error' ? 'alert-circle' : suggestion.type === 'warning' ? 'warning' : 'information-circle'} 
              size={16} 
              color={suggestion.type === 'error' ? '#f44336' : suggestion.type === 'warning' ? '#ff9800' : '#0B4CA7'} 
            />
            <Text className="text-sm text-gray-700 flex-1 leading-5">{suggestion.message}</Text>
          </View>
        ))}
      </View>
    );
  };

  const placeholderText = translationMode === 'tagalog-to-baybayin' 
    ? 'Type Tagalog text here...' 
    : 'Type Baybayin text here...';

  const outputLabel = translationMode === 'tagalog-to-baybayin' ? 'Baybayin' : 'Tagalog';
  const inputLabel = translationMode === 'tagalog-to-baybayin' ? 'Tagalog' : 'Baybayin';

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-primary flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={onBack} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="flex-1 text-lg font-bold text-white text-center">Tagalog ⇄ Baybayin</Text>
        <TouchableOpacity onPress={handleShare} className="ml-3">
          <Ionicons name="share-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View className="flex-1">
        <ScrollView 
          className={`flex-1 p-4 ${showKeyboard || showRomanKeyboard ? 'mb-2' : ''}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
        {/* Translation Mode Toggle */}
        <View className="mb-5">
          <View className="bg-white rounded-xl p-4 shadow-sm flex-row items-center justify-center border border-secondary-200">
            <Text className="text-lg font-semibold text-secondary-700 flex-1 text-center">{inputLabel}</Text>
            <TouchableOpacity onPress={handleSwapMode} className="bg-secondary-100 rounded-full p-2 mx-4">
              <Ionicons name="swap-horizontal" size={24} color="#0B4CA7" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-secondary-700 flex-1 text-center">{outputLabel}</Text>
          </View>
        </View>

        {/* Options */}
        {translationMode === 'tagalog-to-baybayin' && (
          <View className="mb-5">
            <TouchableOpacity
              className="bg-white rounded-xl p-4 shadow-sm flex-row items-center"
              onPress={() => setUseWordMapping(!useWordMapping)}
            >
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-800 mb-1">Gamitin ang mga karaniwan na salita</Text>
                <Text className="text-sm text-gray-600">
                  Gumagamit ng nakatakdang Baybayin para sa mga kilalang salitang Tagalog
                </Text>
              </View>
              <View className={`w-6 h-6 rounded-full items-center justify-center ${
                useWordMapping ? 'bg-primary' : 'bg-gray-300'
              }`}>
                {useWordMapping && <Ionicons name="checkmark" size={16} color="white" />}
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Input Section */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-semibold text-primary">{inputLabel} Text</Text>
            <View className="flex-row gap-2">
              {translationMode === 'tagalog-to-baybayin' && (
                <TouchableOpacity
                  onPress={toggleRomanKeyboard}
                  className={`rounded-full p-2 ${
                    showRomanKeyboard ? 'bg-primary' : 'bg-primary/10'
                  }`}
                >
                  <Ionicons 
                    name={showRomanKeyboard ? "keypad" : "keypad-outline"} 
                    size={18} 
                    color={showRomanKeyboard ? "white" : "#C67C4E"} 
                  />
                </TouchableOpacity>
              )}
              {translationMode === 'baybayin-to-tagalog' && (
                <TouchableOpacity
                  onPress={toggleBaybayinKeyboard}
                  className={`rounded-full p-2 ${
                    showKeyboard ? 'bg-primary' : 'bg-primary/10'
                  }`}
                >
                  <Ionicons 
                    name={showKeyboard ? "keypad" : "keypad-outline"} 
                    size={18} 
                    color={showKeyboard ? "white" : "#C67C4E"} 
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          {/* Input Method Info */}
          {translationMode === 'baybayin-to-tagalog' && (
            <View className="flex-row items-center gap-1 mb-2 px-1">
              <Ionicons name="information-circle-outline" size={16} color="#9CA3AF" />
              <Text className="text-xs text-gray-500 italic">
                Pindutin ang lugar sa ibaba para gamitin ang Baybayin keyboard
              </Text>
            </View>
          )}
          {translationMode === 'tagalog-to-baybayin' && (
            <View className="flex-row items-center gap-1 mb-2 px-1">
              <Ionicons name="information-circle-outline" size={16} color="#9CA3AF" />
              <Text className="text-xs text-gray-500 italic">
                Pindutin ang lugar sa ibaba para gamitin ang built-in na Tagalog keyboard
              </Text>
            </View>
          )}

          {translationMode === 'baybayin-to-tagalog' ? (
            // Baybayin input mode - use TouchableOpacity instead of TextInput
            <TouchableOpacity
              className={`border border-gray-300 rounded-lg p-3 min-h-[100px] justify-start items-start ${
                showKeyboard ? 'bg-gray-50 border-secondary border-2' : ''
              }`}
              onPress={() => {
                setShowKeyboard(true);
                setShowRomanKeyboard(false);
              }}
              activeOpacity={0.7}
            >
              <Text className={`text-xl font-mono leading-7 ${
                inputText ? 'text-primary font-bold' : 'text-gray-400 italic font-normal'
              }`}>
                {inputText || 'Pindutin dito para mag-type sa Baybayin...'}
              </Text>
            </TouchableOpacity>
          ) : (
            // Tagalog input mode - use TouchableOpacity to trigger custom keyboard
            <TouchableOpacity
              className={`border border-gray-300 rounded-lg p-3 min-h-[100px] justify-start items-start ${
                showRomanKeyboard ? 'bg-gray-50 border-primary border-2' : ''
              }`}
              onPress={() => {
                setShowRomanKeyboard(true);
                setShowKeyboard(false);
              }}
              activeOpacity={0.7}
            >
              <Text className={`text-lg leading-6 ${
                inputText ? 'text-gray-800' : 'text-gray-400 italic'
              }`}>
                {inputText || 'Pindutin dito para mag-type sa Tagalog...'}
              </Text>
            </TouchableOpacity>
          )}
          <View className="flex-row justify-end gap-3 mt-2">
            <TouchableOpacity onPress={handleClear} className="flex-row items-center gap-1 py-2 px-2">
              <Ionicons name="trash-outline" size={16} color="#6B7280" />
              <Text className="text-sm text-gray-600">Burahin</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => handleCopy(inputText, inputLabel)} 
              className="flex-row items-center gap-1 py-2 px-2"
              disabled={!inputText}
            >
              <Ionicons name="copy-outline" size={16} color={inputText ? "#6B7280" : "#D1D5DB"} />
              <Text className={`text-sm ${inputText ? 'text-gray-600' : 'text-gray-400'}`}>Kopyahin</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => speakText(inputText, translationMode === 'tagalog-to-baybayin')} 
              className="flex-row items-center gap-1 py-2 px-2"
              disabled={!inputText || isSpeaking}
            >
              <Ionicons 
                name={isSpeaking ? "volume-high" : "volume-medium-outline"} 
                size={16} 
                color={!inputText || isSpeaking ? "#D1D5DB" : "#6B7280"} 
              />
              <Text className={`text-sm ${!inputText || isSpeaking ? 'text-gray-400' : 'text-gray-600'}`}>
                {isSpeaking ? "Nagsasalita..." : "Pakinggan"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Output Section */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-semibold text-primary">{outputLabel} Text</Text>
          </View>
          <View className={`rounded-lg p-3 min-h-[100px] justify-center ${
            translationMode === 'tagalog-to-baybayin' ? 'bg-secondary/10' : 'bg-gray-50'
          }`}>
            <Text className={`leading-6 ${
              translationMode === 'tagalog-to-baybayin' 
                ? 'text-2xl font-bold text-primary text-center leading-8' 
                : 'text-lg text-gray-800'
            }`}>
              {outputText || `Ang ${outputLabel} na salin ay lalabas dito...`}
            </Text>
          </View>
          <View className="flex-row justify-end gap-3 mt-2">
            <TouchableOpacity 
              onPress={() => handleCopy(outputText, outputLabel)} 
              className="flex-row items-center gap-1 py-2 px-2"
              disabled={!outputText}
            >
              <Ionicons name="copy-outline" size={16} color={outputText ? "#6B7280" : "#D1D5DB"} />
              <Text className={`text-sm ${outputText ? 'text-gray-600' : 'text-gray-400'}`}>Kopyahin</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => speakText(outputText, translationMode === 'baybayin-to-tagalog')} 
              className="flex-row items-center gap-1 py-2 px-2"
              disabled={!outputText || isSpeaking}
            >
              <Ionicons 
                name={isSpeaking ? "volume-high" : "volume-medium-outline"} 
                size={16} 
                color={!outputText || isSpeaking ? "#D1D5DB" : "#6B7280"} 
              />
              <Text className={`text-sm ${!outputText || isSpeaking ? 'text-gray-400' : 'text-gray-600'}`}>
                {isSpeaking ? "Nagsasalita..." : "Pakinggan"}
              </Text>
            </TouchableOpacity>
            {isSpeaking && (
              <TouchableOpacity 
                onPress={stopSpeechPlayback} 
                className="flex-row items-center gap-1 py-2 px-2 bg-red-50 rounded"
              >
                <Ionicons name="stop" size={16} color="#EF4444" />
                <Text className="text-sm text-red-500">Itigil</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Suggestions */}
        {renderSuggestions()}

        {/* Usage Tips */}
        <View className="bg-white rounded-xl p-4 shadow-sm">
          <Text className="text-lg font-semibold text-primary mb-2">Mga Paalala:</Text>
          <Text className="text-sm text-gray-600 leading-5">
            • Ang tradisyonal na Baybayin ay gumagamit ng 17 na karakter para sa mga karaniwan na tunog ng Filipino{'\n'}
            • Ang mga titik tulad ng F, C, J, V, X, Z ay inadapt sa mga katulad na tunog sa Baybayin{'\n'}
            • Gamitin ang mga built-in keyboard para sa tamang paglagay ng karakter{'\n'}
            • Tagalog keyboard: Kumpleto na QWERTY layout na may shift at caps lock{'\n'}
            • Baybayin keyboard: Tradisyonal na mga karakter na may vowel modifier{'\n'}
            • I-enable ang word mapping para sa mas magandang salin ng mga kilalang salita{'\n'}
            • Pindutin ang "Pakinggan" button para marinig ang pagbigkas ng teksto (kailangan ng internet para sa pinakamahusay na kalidad)
          </Text>
        </View>
      </ScrollView>

      {/* Custom Keyboards - positioned at bottom like native keyboard */}
      {showKeyboard && (
        <BaybayinKeyboard
          visible={showKeyboard}
          onClose={() => setShowKeyboard(false)}
          onTextChange={handleBaybayinTextChange}
          initialText={inputText}
          placeholder="Type in Baybayin..."
        />
      )}
      
      {showRomanKeyboard && (
        <RomanKeyboard
          visible={showRomanKeyboard}
          onClose={() => setShowRomanKeyboard(false)}
          onTextChange={handleRomanTextChange}
          initialText={inputText}
          placeholder="Type in Tagalog..."
        />
      )}
      </View>
    </SafeAreaView>
  );
}


