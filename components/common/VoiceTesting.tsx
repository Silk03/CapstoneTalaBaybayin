import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  getFilipinoVoices, 
  speakWithOptimalFilipinoAccent,
  stopSpeech,
  isSpeechAvailable,
  getBestFilipinoVoice
} from '../../utils/speechUtils';
import LoadingIndicator from './LoadingIndicator';
import '../../global.css';

interface VoiceTestingProps {
  visible: boolean;
  onClose: () => void;
}

const SAMPLE_TEXTS = [
  { tagalog: "Kumusta ka?", baybayin: "ᜃᜓᜋᜓᜐ᜔ᜆ ᜃ?", english: "How are you?" },
  { tagalog: "Salamat po", baybayin: "ᜐᜎᜋᜆ᜔ ᜉᜓ", english: "Thank you" },
  { tagalog: "Magandang umaga", baybayin: "ᜋᜄᜈ᜔ᜇᜅ᜔ ᜂᜋᜄ", english: "Good morning" },
  { tagalog: "Baybayin", baybayin: "ᜊᜌ᜔ᜊᜌᜒᜈ᜔", english: "Baybayin script" },
  { tagalog: "Ang mga bayani ng bayan", baybayin: "ᜀᜅ᜔ ᜋᜅ ᜊᜌᜈᜒ ᜈᜅ᜔ ᜊᜌᜈ᜔", english: "The heroes of the nation" },
  { tagalog: "Pakikipagkapwa", baybayin: "ᜉᜃᜒᜃᜒᜉᜄ᜔ᜃᜉ᜔ᜏ", english: "Shared identity" }
];

export default function VoiceTesting({ visible, onClose }: VoiceTestingProps) {
  const [voices, setVoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechAvailable, setSpeechAvailable] = useState(false);

  useEffect(() => {
    if (visible) {
      loadVoices();
    }
  }, [visible]);

  const loadVoices = async () => {
    setIsLoading(true);
    try {
      const available = await isSpeechAvailable();
      setSpeechAvailable(available);
      
      if (available) {
        const filipinoVoices = await getFilipinoVoices();
        setVoices(filipinoVoices);
      }
    } catch (error) {
      console.log('Error loading voices:', error);
      Alert.alert('Error', 'Hindi ma-load ang mga boses');
    }
    setIsLoading(false);
  };

  const testVoice = async (text: string, isTagalog: boolean = true) => {
    if (isSpeaking) {
      await stopSpeech();
      setIsSpeaking(false);
      return;
    }

    try {
      setIsSpeaking(true);
      await speakWithOptimalFilipinoAccent(text, isTagalog, {
        onStart: () => setIsSpeaking(true),
        onDone: () => setIsSpeaking(false),
        onError: (error: any) => {
          console.log('Voice test error:', error);
          setIsSpeaking(false);
        }
      });
    } catch (error) {
      console.log('Test speak error:', error);
      setIsSpeaking(false);
    }
  };

  if (!visible) return null;

  return (
    <View className="absolute inset-0 bg-black/50 justify-center items-center z-50">
      <View className="bg-white rounded-2xl p-6 mx-4 max-h-[80%] w-[90%]">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold text-primary">Subukan ang mga Boses</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {isLoading ? (
            <LoadingIndicator 
              size="small" 
              text="Naglo-load ng mga boses..." 
              className="py-8 items-center" 
            />
          ) : !speechAvailable ? (
            <View className="py-8 items-center">
              <Text className="text-red-600 text-center">
                Hindi available ang text-to-speech sa device na ito
              </Text>
            </View>
          ) : (
            <>
              {/* Voice Information */}
              <View className="mb-6 p-4 bg-blue-50 rounded-lg">
                <Text className="text-sm font-semibold text-blue-800 mb-2">
                  Enhanced Filipino Accent na Features:
                </Text>
                <Text className="text-xs text-blue-700 leading-4">
                  • Nakita ang {voices.length} Filipino/Tagalog na boses{'\n'}
                  • Automatic na pipili ng pinakamahusay na boses{'\n'}
                  • Optimized pronunciation para sa mga Tagalog na salita{'\n'}
                  • Mas mababang pitch at rate para sa natural na Filipino accent{'\n'}
                  • Fallback sa English na may Filipino-style na pronunciation
                </Text>
              </View>

              {/* Sample Text Testing */}
              <View className="mb-4">
                <Text className="text-lg font-semibold text-gray-800 mb-3">
                  Mga Halimbawang Teksto:
                </Text>
                
                {SAMPLE_TEXTS.map((sample, index) => (
                  <View key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <View className="flex-row justify-between items-start mb-2">
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-gray-800">
                          {sample.tagalog}
                        </Text>
                        <Text className="text-sm text-gray-600">
                          {sample.english}
                        </Text>
                        <Text className="text-lg text-primary font-bold mt-1">
                          {sample.baybayin}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => testVoice(sample.tagalog, true)}
                        className="ml-3 bg-primary rounded-full p-2"
                        disabled={isSpeaking}
                      >
                        <Ionicons 
                          name={isSpeaking ? "stop" : "play"} 
                          size={20} 
                          color="white" 
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>

              {/* Available Voices List */}
              {voices.length > 0 && (
                <View className="mb-4">
                  <Text className="text-lg font-semibold text-gray-800 mb-3">
                    Mga Available na Filipino Voices:
                  </Text>
                  {voices.map((voice, index) => (
                    <View key={index} className="mb-2 p-3 bg-green-50 rounded-lg">
                      <Text className="text-sm font-semibold text-green-800">
                        {voice.name || 'Unknown Voice'}
                      </Text>
                      <Text className="text-xs text-green-600">
                        Language: {voice.language || 'Unknown'}
                      </Text>
                      {voice.quality && (
                        <Text className="text-xs text-green-600">
                          Quality: {voice.quality}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              )}

              {/* Enhanced Accent Info */}
              <View className="mb-4 p-4 bg-green-50 rounded-lg">
                <Text className="text-sm font-semibold text-green-800 mb-2">
                  🎯 Enhanced Filipino Accent Features:
                </Text>
                <Text className="text-xs text-green-700 leading-4">
                  • Mas mababang pitch (0.85) para sa natural na Filipino tone{'\n'}
                  • Optimized na rate (0.8-0.85) para sa malinaw at natural na speed{'\n'}
                  • Automatic na pronunciation optimization para sa mga Tagalog na salita{'\n'}
                  • Smart fallback system na may Filipino-style accent kahit sa English voices
                </Text>
              </View>

              {/* Custom Text Testing */}
              <View className="mb-4 p-4 bg-yellow-50 rounded-lg">
                <Text className="text-sm font-semibold text-yellow-800 mb-2">
                  Paalala:
                </Text>
                <Text className="text-xs text-yellow-700 leading-4">
                  Ang kalidad ng pronunciation ay depende sa device at available na voices. 
                  Ang mga iOS device ay karaniwang may mas magandang Filipino TTS support 
                  kaysa sa Android devices.
                </Text>
              </View>
            </>
          )}
        </ScrollView>

        <TouchableOpacity
          onPress={onClose}
          className="mt-4 bg-primary rounded-full py-3"
        >
          <Text className="text-white text-center font-semibold">Isara</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
