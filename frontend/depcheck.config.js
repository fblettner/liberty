const path = require('path');

module.exports = {
  ignorePatterns: [
    'node_modules',
    'dist',
  ],
  alias: {
    '@ly_types': path.resolve(__dirname, 'src/types'),
    '@ly_services': path.resolve(__dirname, 'src/services'),
    '@ly_utils': path.resolve(__dirname, 'src/utils'),
    '@ly_features': path.resolve(__dirname, 'src/features'),
    '@ly_app': path.resolve(__dirname, 'src/app'),
    '@ly_components': path.resolve(__dirname, 'src/components'),
    '@ly_styles': path.resolve(__dirname, 'src/styles'),
    '@ly_translations': path.resolve(__dirname, 'src/translations'),
  },
};