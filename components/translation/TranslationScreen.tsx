import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Share,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  tagalogToBaybayin,
  baybayinToTagalog,
  isValidBaybayin,
  getConversionSuggestions,
} from '../../utils/translationUtils';
import BaybayinKeyboard from '../common/BaybayinKeyboard';

interface TranslationScreenProps {
  onBack: () => void;
}

export default function TranslationScreen({ onBack }: TranslationScreenProps) {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [translationMode, setTranslationMode] = useState<'tagalog-to-baybayin' | 'baybayin-to-tagalog'>('tagalog-to-baybayin');
  const [useWordMapping, setUseWordMapping] = useState(true);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ type: 'warning' | 'info' | 'error'; message: string }>>([]);

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
    
    // Close keyboard when switching away from Baybayin mode
    if (newMode === 'tagalog-to-baybayin') {
      setShowKeyboard(false);
    }
    
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
      Alert.alert('Error', 'Could not share text');
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
      Alert.alert('Error', 'Could not share translation');
    }
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
    setInputText(newText);
  };

  // Handle regular text input changes
  const handleTextInputChange = (newText: string) => {
    setInputText(newText);
  };

  // Toggle Baybayin keyboard manually (now mainly for closing)
  const toggleBaybayinKeyboard = () => {
    setShowKeyboard(!showKeyboard);
  };

  const renderSuggestions = () => {
    if (suggestions.length === 0) return null;

    return (
      <View style={styles.suggestionsContainer}>
        <Text style={styles.suggestionsTitle}>Suggestions:</Text>
        {suggestions.map((suggestion, index) => (
          <View key={index} style={[
            styles.suggestion, 
            suggestion.type === 'info' && styles.suggestionInfo,
            suggestion.type === 'warning' && styles.suggestionWarning,
            suggestion.type === 'error' && styles.suggestionError,
          ]}>
            <Ionicons 
              name={suggestion.type === 'error' ? 'alert-circle' : suggestion.type === 'warning' ? 'warning' : 'information-circle'} 
              size={16} 
              color={suggestion.type === 'error' ? '#f44336' : suggestion.type === 'warning' ? '#ff9800' : '#2196f3'} 
            />
            <Text style={styles.suggestionText}>{suggestion.message}</Text>
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
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tagalog ⇄ Baybayin</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.mainContent}>
        <ScrollView 
          style={[styles.content, showKeyboard && styles.contentWithKeyboard]} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
        {/* Translation Mode Toggle */}
        <View style={styles.modeContainer}>
          <View style={styles.modeToggle}>
            <Text style={styles.modeLabel}>{inputLabel}</Text>
            <TouchableOpacity onPress={handleSwapMode} style={styles.swapButton}>
              <Ionicons name="swap-horizontal" size={24} color="#8B4513" />
            </TouchableOpacity>
            <Text style={styles.modeLabel}>{outputLabel}</Text>
          </View>
        </View>

        {/* Options */}
        {translationMode === 'tagalog-to-baybayin' && (
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.option}
              onPress={() => setUseWordMapping(!useWordMapping)}
            >
              <View style={styles.optionContent}>
                <Text style={styles.optionLabel}>Use common word mappings</Text>
                <Text style={styles.optionDescription}>
                  Uses pre-defined Baybayin for common Tagalog words
                </Text>
              </View>
              <View style={[styles.toggle, useWordMapping && styles.toggleActive]}>
                {useWordMapping && <Ionicons name="checkmark" size={16} color="white" />}
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Input Section */}
        <View style={styles.textContainer}>
          <View style={styles.textHeader}>
            <Text style={styles.textLabel}>{inputLabel} Text</Text>
            <View style={styles.textActions}>
              {translationMode === 'baybayin-to-tagalog' && (
                <TouchableOpacity
                  onPress={toggleBaybayinKeyboard}
                  style={[styles.keyboardButton, showKeyboard && styles.keyboardButtonActive]}
                >
                  <Ionicons 
                    name={showKeyboard ? "keypad" : "keypad-outline"} 
                    size={18} 
                    color={showKeyboard ? "white" : "#8B4513"} 
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          {/* Input Method Info */}
          {translationMode === 'baybayin-to-tagalog' && (
            <View style={styles.inputMethodInfo}>
              <Ionicons name="information-circle-outline" size={16} color="#777" />
              <Text style={styles.inputMethodText}>
                Tap the input area below to use the Baybayin keyboard
              </Text>
            </View>
          )}

          {translationMode === 'baybayin-to-tagalog' ? (
            // Baybayin input mode - use TouchableOpacity instead of TextInput
            <TouchableOpacity
              style={[
                styles.textInput, 
                showKeyboard && styles.textInputWithKeyboard,
                styles.touchableInput
              ]}
              onPress={() => {
                setShowKeyboard(true);
              }}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.inputText,
                !inputText && styles.placeholderStyle
              ]}>
                {inputText || 'Tap here to type in Baybayin...'}
              </Text>
            </TouchableOpacity>
          ) : (
            // Regular text input for Tagalog mode
            <TextInput
              style={[styles.textInput]}
              value={inputText}
              onChangeText={handleTextInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder={placeholderText}
              placeholderTextColor="#999"
              multiline
              textAlignVertical="top"
            />
          )}
          <View style={styles.inputActions}>
            <TouchableOpacity onPress={handleClear} style={styles.actionButton}>
              <Ionicons name="trash-outline" size={16} color="#666" />
              <Text style={styles.actionButtonText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => handleCopy(inputText, inputLabel)} 
              style={styles.actionButton}
              disabled={!inputText}
            >
              <Ionicons name="copy-outline" size={16} color={inputText ? "#666" : "#ccc"} />
              <Text style={[styles.actionButtonText, !inputText && styles.disabledText]}>Copy</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Output Section */}
        <View style={styles.textContainer}>
          <View style={styles.textHeader}>
            <Text style={styles.textLabel}>{outputLabel} Text</Text>
          </View>
          <View style={[styles.outputDisplay, translationMode === 'tagalog-to-baybayin' && styles.baybayinOutput]}>
            <Text style={[styles.outputText, translationMode === 'tagalog-to-baybayin' && styles.baybayinText]}>
              {outputText || `${outputLabel} translation will appear here...`}
            </Text>
          </View>
          <View style={styles.inputActions}>
            <TouchableOpacity 
              onPress={() => handleCopy(outputText, outputLabel)} 
              style={styles.actionButton}
              disabled={!outputText}
            >
              <Ionicons name="copy-outline" size={16} color={outputText ? "#666" : "#ccc"} />
              <Text style={[styles.actionButtonText, !outputText && styles.disabledText]}>Copy</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Suggestions */}
        {renderSuggestions()}

        {/* Usage Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Tips:</Text>
          <Text style={styles.tipText}>
            • Traditional Baybayin uses 17 characters for common Filipino sounds{'\n'}
            • Letters like F, C, J, V, X, Z are adapted to similar Baybayin sounds{'\n'}
            • Use the Baybayin keyboard for accurate character input{'\n'}
            • Enable word mappings for better translation of common words
          </Text>
        </View>
      </ScrollView>

      {/* Baybayin Keyboard - positioned at bottom like native keyboard */}
      {showKeyboard && (
        <BaybayinKeyboard
          visible={showKeyboard}
          onClose={() => setShowKeyboard(false)}
          onTextChange={handleBaybayinTextChange}
          initialText={inputText}
          placeholder="Type in Baybayin..."
        />
      )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#8B4513',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  shareButton: {
    marginLeft: 12,
  },
  mainContent: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  contentWithKeyboard: {
    marginBottom: 10, // Add space when keyboard is visible
  },
  scrollContent: {
    paddingBottom: 20,
  },
  modeContainer: {
    marginBottom: 20,
  },
  modeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
    flex: 1,
    textAlign: 'center',
  },
  swapButton: {
    backgroundColor: 'rgba(139, 69, 19, 0.1)',
    borderRadius: 20,
    padding: 8,
    marginHorizontal: 16,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  option: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#777',
  },
  toggle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#8B4513',
  },
  textContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  textHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  textLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
  },
  textActions: {
    flexDirection: 'row',
    gap: 8,
  },
  keyboardButton: {
    backgroundColor: 'rgba(139, 69, 19, 0.1)',
    borderRadius: 15,
    padding: 6,
  },
  keyboardButtonActive: {
    backgroundColor: '#8B4513',
  },
  inputMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  inputMethodText: {
    fontSize: 12,
    color: '#777',
    fontStyle: 'italic',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  textInputWithKeyboard: {
    backgroundColor: '#f8f8f8',
    borderColor: '#8B4513',
    borderWidth: 2,
  },
  touchableInput: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  inputText: {
    fontSize: 20,
    fontFamily: 'monospace',
    color: '#8B4513',
    fontWeight: 'bold',
    lineHeight: 28,
  },
  placeholderStyle: {
    color: '#999',
    fontStyle: 'italic',
    fontWeight: 'normal',
  },
  baybayinInput: {
    fontSize: 20,
    fontFamily: 'monospace',
  },
  outputDisplay: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    justifyContent: 'center',
  },
  baybayinOutput: {
    backgroundColor: '#f0f8ff',
  },
  outputText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  baybayinText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
    textAlign: 'center',
    lineHeight: 32,
  },
  inputActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#666',
  },
  disabledText: {
    color: '#ccc',
  },
  suggestionsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 8,
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 8,
    borderRadius: 6,
    marginBottom: 4,
  },
  suggestionInfo: {
    backgroundColor: '#e3f2fd',
  },
  suggestionWarning: {
    backgroundColor: '#fff3e0',
  },
  suggestionError: {
    backgroundColor: '#ffebee',
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  tipsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
});
