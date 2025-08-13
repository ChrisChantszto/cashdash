// Load environment variables from .env at build time
require('dotenv').config();

/**
 * Using a JS config lets us easily inject env vars (EXPO_PUBLIC_*) into the build.
 * We return the same config as app.json to preserve your existing settings.
 */
module.exports = ({ config }) => ({
  expo: {
    name: 'Cashly',
    slug: 'Cashly',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'cashly',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      'expo-web-browser',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    // Optionally expose variables in extra if you want to access them via expo-constants
    extra: {
      // Not required for EXPO_PUBLIC_* vars, but available if needed elsewhere
      apiUrl: process.env.EXPO_PUBLIC_API_URL || null,
    },
  },
});
