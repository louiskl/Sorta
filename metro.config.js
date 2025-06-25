const { getDefaultConfig } = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.server = {
  ...defaultConfig.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      middleware(req, res, next);
    };
  },
};

defaultConfig.watchFolders = [];
defaultConfig.resolver = {
  ...defaultConfig.resolver,
  sourceExts: ['jsx', 'js', 'ts', 'tsx', 'json'],
};

defaultConfig.transformer = {
  ...defaultConfig.transformer,
  assetPlugins: ['expo-asset/tools/hashAssetFiles'],
};

module.exports = defaultConfig;
