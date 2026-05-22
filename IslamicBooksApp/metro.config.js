const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Allow .bin and .onnx files to be bundled as assets
config.resolver.assetExts.push('bin', 'onnx');

module.exports = config;
