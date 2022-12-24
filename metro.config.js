// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push(
    'jsx', 'js', 'ts', 'tsx', 'cjs', 'mjs', 'json' 
  );

module.exports = config;


