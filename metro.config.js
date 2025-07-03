const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolver to handle Skia imports
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Exclude problematic DOM types from bundling
config.resolver.blockList = [
  /node_modules\/@shopify\/react-native-skia\/lib\/.*\/dom\/.*/,
];

// Add platform-specific extensions
config.resolver.sourceExts = [...config.resolver.sourceExts, 'tsx', 'ts'];

module.exports = config;
