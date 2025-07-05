// Utility for converting Tagalog/Filipino text to Baybayin script
// Based on the traditional Baybayin writing system

// Baybayin character mappings
export const BAYBAYIN_CHARACTERS: Record<string, string> = {
  // Vowels
  'a': 'ᜀ',
  'i': 'ᜁ',
  'u': 'ᜂ',
  
  // Consonants with inherent 'a' sound
  'ka': 'ᜃ', 'ki': 'ᜃᜒ', 'ku': 'ᜃᜓ', 'k': 'ᜃ᜔',
  'ga': 'ᜄ', 'gi': 'ᜄᜒ', 'gu': 'ᜄᜓ', 'g': 'ᜄ᜔',
  'nga': 'ᜅ', 'ngi': 'ᜅᜒ', 'ngu': 'ᜅᜓ', 'ng': 'ᜅ᜔',
  'ta': 'ᜆ', 'ti': 'ᜆᜒ', 'tu': 'ᜆᜓ', 't': 'ᜆ᜔',
  'da': 'ᜇ', 'di': 'ᜇᜒ', 'du': 'ᜇᜓ', 'd': 'ᜇ᜔',
  'na': 'ᜈ', 'ni': 'ᜈᜒ', 'nu': 'ᜈᜓ', 'n': 'ᜈ᜔',
  'pa': 'ᜉ', 'pi': 'ᜉᜒ', 'pu': 'ᜉᜓ', 'p': 'ᜉ᜔',
  'ba': 'ᜊ', 'bi': 'ᜊᜒ', 'bu': 'ᜊᜓ', 'b': 'ᜊ᜔',
  'ma': 'ᜋ', 'mi': 'ᜋᜒ', 'mu': 'ᜋᜓ', 'm': 'ᜋ᜔',
  'ya': 'ᜌ', 'yi': 'ᜌᜒ', 'yu': 'ᜌᜓ', 'y': 'ᜌ᜔',
  'ra': 'ᜍ', 'ri': 'ᜍᜒ', 'ru': 'ᜍᜓ', 'r': 'ᜍ᜔',
  'la': 'ᜎ', 'li': 'ᜎᜒ', 'lu': 'ᜎᜓ', 'l': 'ᜎ᜔',
  'wa': 'ᜏ', 'wi': 'ᜏᜒ', 'wu': 'ᜏᜓ', 'w': 'ᜏ᜔',
  'sa': 'ᜐ', 'si': 'ᜐᜒ', 'su': 'ᜐᜓ', 's': 'ᜐ᜔',
  'ha': 'ᜑ', 'hi': 'ᜑᜒ', 'hu': 'ᜑᜓ', 'h': 'ᜑ᜔',
};

// Common Tagalog to Baybayin syllable patterns
export const SYLLABLE_PATTERNS = [
  // Three-letter patterns (consonant + ng + vowel)
  { pattern: /nga/g, replacement: 'ᜅ' },
  { pattern: /ngi/g, replacement: 'ᜅᜒ' },
  { pattern: /ngu/g, replacement: 'ᜅᜓ' },
  { pattern: /ng(?![aeiou])/g, replacement: 'ᜅ᜔' }, // ng at end or before consonant
  
  // Two-letter consonant + vowel patterns
  { pattern: /ka/g, replacement: 'ᜃ' },
  { pattern: /ki/g, replacement: 'ᜃᜒ' },
  { pattern: /ku/g, replacement: 'ᜃᜓ' },
  { pattern: /ga/g, replacement: 'ᜄ' },
  { pattern: /gi/g, replacement: 'ᜄᜒ' },
  { pattern: /gu/g, replacement: 'ᜄᜓ' },
  { pattern: /ta/g, replacement: 'ᜆ' },
  { pattern: /ti/g, replacement: 'ᜆᜒ' },
  { pattern: /tu/g, replacement: 'ᜆᜓ' },
  { pattern: /da/g, replacement: 'ᜇ' },
  { pattern: /di/g, replacement: 'ᜇᜒ' },
  { pattern: /du/g, replacement: 'ᜇᜓ' },
  { pattern: /na/g, replacement: 'ᜈ' },
  { pattern: /ni/g, replacement: 'ᜈᜒ' },
  { pattern: /nu/g, replacement: 'ᜈᜓ' },
  { pattern: /pa/g, replacement: 'ᜉ' },
  { pattern: /pi/g, replacement: 'ᜉᜒ' },
  { pattern: /pu/g, replacement: 'ᜉᜓ' },
  { pattern: /ba/g, replacement: 'ᜊ' },
  { pattern: /bi/g, replacement: 'ᜊᜒ' },
  { pattern: /bu/g, replacement: 'ᜊᜓ' },
  { pattern: /ma/g, replacement: 'ᜋ' },
  { pattern: /mi/g, replacement: 'ᜋᜒ' },
  { pattern: /mu/g, replacement: 'ᜋᜓ' },
  { pattern: /ya/g, replacement: 'ᜌ' },
  { pattern: /yi/g, replacement: 'ᜌᜒ' },
  { pattern: /yu/g, replacement: 'ᜌᜓ' },
  { pattern: /ra/g, replacement: 'ᜍ' },
  { pattern: /ri/g, replacement: 'ᜍᜒ' },
  { pattern: /ru/g, replacement: 'ᜍᜓ' },
  { pattern: /la/g, replacement: 'ᜎ' },
  { pattern: /li/g, replacement: 'ᜎᜒ' },
  { pattern: /lu/g, replacement: 'ᜎᜓ' },
  { pattern: /wa/g, replacement: 'ᜏ' },
  { pattern: /wi/g, replacement: 'ᜏᜒ' },
  { pattern: /wu/g, replacement: 'ᜏᜓ' },
  { pattern: /sa/g, replacement: 'ᜐ' },
  { pattern: /si/g, replacement: 'ᜐᜒ' },
  { pattern: /su/g, replacement: 'ᜐᜓ' },
  { pattern: /ha/g, replacement: 'ᜑ' },
  { pattern: /hi/g, replacement: 'ᜑᜒ' },
  { pattern: /hu/g, replacement: 'ᜑᜓ' },
  
  // Single consonants at word end or before other consonants (with virama)
  { pattern: /k(?![aeiou])/g, replacement: 'ᜃ᜔' },
  { pattern: /g(?![aeiou])/g, replacement: 'ᜄ᜔' },
  { pattern: /t(?![aeiou])/g, replacement: 'ᜆ᜔' },
  { pattern: /d(?![aeiou])/g, replacement: 'ᜇ᜔' },
  { pattern: /n(?![aeiou])/g, replacement: 'ᜈ᜔' },
  { pattern: /p(?![aeiou])/g, replacement: 'ᜉ᜔' },
  { pattern: /b(?![aeiou])/g, replacement: 'ᜊ᜔' },
  { pattern: /m(?![aeiou])/g, replacement: 'ᜋ᜔' },
  { pattern: /y(?![aeiou])/g, replacement: 'ᜌ᜔' },
  { pattern: /r(?![aeiou])/g, replacement: 'ᜍ᜔' },
  { pattern: /l(?![aeiou])/g, replacement: 'ᜎ᜔' },
  { pattern: /w(?![aeiou])/g, replacement: 'ᜏ᜔' },
  { pattern: /s(?![aeiou])/g, replacement: 'ᜐ᜔' },
  { pattern: /h(?![aeiou])/g, replacement: 'ᜑ᜔' },
  
  // Standalone vowels
  { pattern: /(?:^|[^a-z])a(?![a-z])/g, replacement: 'ᜀ' },
  { pattern: /(?:^|[^a-z])i(?![a-z])/g, replacement: 'ᜁ' },
  { pattern: /(?:^|[^a-z])u(?![a-z])/g, replacement: 'ᜂ' },
];

// Common Tagalog words with their Baybayin equivalents
export const COMMON_WORDS: Record<string, string> = {
  // Greetings
  'kumusta': 'ᜃᜓᜋᜓᜐ᜔ᜆ',
  'maligayang': 'ᜋᜎᜒᜄᜌᜅ᜔',
  'umaga': 'ᜂᜋᜄ',
  'hapon': 'ᜑᜉᜓᜈ᜔',
  'gabi': 'ᜄᜊᜒ',
  
  // Common words
  'ako': 'ᜀᜃᜓ',
  'ikaw': 'ᜁᜃᜏ᜔',
  'siya': 'ᜐᜒᜌ',
  'tayo': 'ᜆᜌᜓ',
  'kami': 'ᜃᜋᜒ',
  'kayo': 'ᜃᜌᜓ',
  'sila': 'ᜐᜒᜎ',
  
  'salamat': 'ᜐᜎᜋᜆ᜔',
  'pakisuyo': 'ᜉᜃᜒᜐᜓᜌᜓ',
  'oo': 'ᜂᜂ',
  'hindi': 'ᜑᜒᜈ᜔ᜇᜒ',
  
  // Family
  'pamilya': 'ᜉᜋᜒᜎ᜔ᜌ',
  'ama': 'ᜀᜋ',
  'ina': 'ᜁᜈ',
  'anak': 'ᜀᜈᜃ᜔',
  'kuya': 'ᜃᜓᜌ',
  'ate': 'ᜀᜆᜒ',
  
  // Basic verbs
  'kain': 'ᜃᜁᜈ᜔',
  'inom': 'ᜁᜈᜓᜋ᜔',
  'tulog': 'ᜆᜓᜎᜓᜄ᜔',
  'gising': 'ᜄᜒᜐᜒᜅ᜔',
  'lakad': 'ᜎᜃᜇ᜔',
  'takbo': 'ᜆᜃ᜔ᜊᜓ',
  
  // Colors
  'puti': 'ᜉᜓᜆᜒ',
  'itim': 'ᜁᜆᜒᜋ᜔',
  'pula': 'ᜉᜓᜎ',
  'dilaw': 'ᜇᜒᜎᜏ᜔',
  'berde': 'ᜊᜒᜍ᜔ᜇᜒ',
  'asul': 'ᜀᜐᜓᜎ᜔',
  
  // Numbers
  'isa': 'ᜁᜐ',
  'dalawa': 'ᜇᜎᜏ',
  'tatlo': 'ᜆᜆ᜔ᜎᜓ',
  'apat': 'ᜀᜉᜆ᜔',
  'lima': 'ᜎᜒᜋ',
  'anim': 'ᜀᜈᜒᜋ᜔',
  'pito': 'ᜉᜒᜆᜓ',
  'walo': 'ᜏᜎᜓ',
  'siyam': 'ᜐᜒᜌᜋ᜔',
  'sampu': 'ᜐᜋ᜔ᜉᜓ',
};

/**
 * Converts Tagalog/Filipino text to Baybayin script
 * @param tagalogText - The Tagalog text to convert
 * @param useWordMapping - Whether to use common word mappings (default: true)
 * @returns The converted Baybayin text
 */
export function tagalogToBaybayin(tagalogText: string, useWordMapping: boolean = true): string {
  if (!tagalogText.trim()) return '';

  // Convert to lowercase for processing
  let text = tagalogText.toLowerCase().trim();
  
  // First, try to match common whole words if enabled
  if (useWordMapping) {
    const words = text.split(/\s+/);
    const convertedWords = words.map(word => {
      // Remove punctuation for matching
      const cleanWord = word.replace(/[.,!?;:]/g, '');
      if (COMMON_WORDS[cleanWord]) {
        // Preserve punctuation
        const punctuation = word.slice(cleanWord.length);
        return COMMON_WORDS[cleanWord] + punctuation;
      }
      return word;
    });
    text = convertedWords.join(' ');
  }

  // Apply syllable patterns for words not found in common words
  let result = text;
  
  // Split by spaces to process word by word
  const words = result.split(/(\s+)/);
  const processedWords = words.map(word => {
    if (/\s/.test(word)) return word; // Keep whitespace as is
    
    // Skip if already converted to Baybayin
    if (/[ᜀ-ᜟ]/.test(word)) return word;
    
    let processedWord = word;
    
    // Apply syllable patterns in order (longer patterns first)
    SYLLABLE_PATTERNS.forEach(({ pattern, replacement }) => {
      processedWord = processedWord.replace(pattern, replacement);
    });
    
    return processedWord;
  });
  
  result = processedWords.join('');
  
  // Clean up any remaining Latin characters that couldn't be converted
  // This is a fallback - in practice, most Filipino words should convert
  result = result.replace(/[a-z]/g, (char) => {
    if (BAYBAYIN_CHARACTERS[char]) {
      return BAYBAYIN_CHARACTERS[char];
    }
    return char; // Keep unconvertable characters as is
  });
  
  return result;
}

/**
 * Converts Baybayin script back to romanized text (approximation)
 * @param baybayinText - The Baybayin text to convert
 * @returns The romanized text
 */
export function baybayinToTagalog(baybayinText: string): string {
  if (!baybayinText.trim()) return '';

  let result = baybayinText;
  
  // Reverse mapping from Baybayin to Latin
  const reverseMapping: Record<string, string> = {};
  Object.entries(BAYBAYIN_CHARACTERS).forEach(([latin, baybayin]) => {
    reverseMapping[baybayin] = latin;
  });
  
  // Also add common word reverse mappings
  Object.entries(COMMON_WORDS).forEach(([tagalog, baybayin]) => {
    reverseMapping[baybayin] = tagalog;
  });
  
  // Sort by length (longest first) to avoid partial replacements
  const sortedBaybayin = Object.keys(reverseMapping).sort((a, b) => b.length - a.length);
  
  sortedBaybayin.forEach(baybayin => {
    const regex = new RegExp(baybayin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    result = result.replace(regex, reverseMapping[baybayin]);
  });
  
  return result;
}

/**
 * Validates if text contains valid Baybayin characters
 * @param text - The text to validate
 * @returns True if text contains only Baybayin characters and spaces/punctuation
 */
export function isValidBaybayin(text: string): boolean {
  // Baybayin Unicode range: U+1700–U+171F
  const baybayinRegex = /^[ᜀ-ᜟ\s.,!?;:\-()'"]*$/;
  return baybayinRegex.test(text);
}

/**
 * Gets suggestions for improving Baybayin text conversion
 * @param originalText - The original Tagalog text
 * @param convertedText - The converted Baybayin text
 * @returns Array of suggestion objects
 */
export function getConversionSuggestions(originalText: string, convertedText: string): Array<{
  type: 'warning' | 'info' | 'error';
  message: string;
}> {
  const suggestions: Array<{ type: 'warning' | 'info' | 'error'; message: string }> = [];
  
  // Check for unconverted Latin characters
  const latinChars = convertedText.match(/[a-zA-Z]/g);
  if (latinChars && latinChars.length > 0) {
    suggestions.push({
      type: 'warning',
      message: `Some characters could not be converted: ${[...new Set(latinChars)].join(', ')}`
    });
  }
  
  // Check for mixed script
  const hasBaybayin = /[ᜀ-ᜟ]/.test(convertedText);
  const hasLatin = /[a-zA-Z]/.test(convertedText);
  if (hasBaybayin && hasLatin) {
    suggestions.push({
      type: 'info',
      message: 'Text contains both Baybayin and Latin characters'
    });
  }
  
  // Check for common spelling variations
  const commonVariations = [
    { from: 'ng', to: 'ᜅ', message: 'Use ᜅ for "ng" sound' },
    { from: 'c', to: 'k/s', message: 'Letter "c" should be written as "k" or "s" in traditional Baybayin' },
    { from: 'f', to: 'p', message: 'Letter "f" is traditionally written as "p" in Baybayin' },
    { from: 'j', to: 'dy', message: 'Letter "j" should be written as "dy" in traditional Baybayin' },
    { from: 'q', to: 'k', message: 'Letter "q" should be written as "k" in traditional Baybayin' },
    { from: 'v', to: 'b', message: 'Letter "v" is traditionally written as "b" in Baybayin' },
    { from: 'x', to: 'ks', message: 'Letter "x" should be written as "ks" in traditional Baybayin' },
    { from: 'z', to: 's', message: 'Letter "z" is traditionally written as "s" in Baybayin' },
  ];
  
  commonVariations.forEach(variation => {
    if (originalText.toLowerCase().includes(variation.from)) {
      suggestions.push({
        type: 'info',
        message: variation.message
      });
    }
  });
  
  return suggestions;
}
