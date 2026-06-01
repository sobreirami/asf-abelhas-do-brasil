const { config } = require('dotenv');

config(); // carrega .env → process.env

/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  expo: {
    name: 'AbelhasDoBrasil',
    slug: 'asf-abelhas-do-brasil',
    version: '1.0.0-rc1',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'asfabelhasdobrasil',
    userInterfaceStyle: 'automatic',
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.sobreirami.asfabelhasdobrasil',
      icon: './assets/images/icon.png',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon-foreground.png',
        backgroundImage: './assets/images/adaptive-icon-background.png',
        backgroundColor: '#F5B800',
      },
      primaryColor: '#F5B800',
      predictiveBackGestureEnabled: false,
      package: 'com.sobreirami.asfabelhasdobrasil',
    },
    plugins: [
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon-light.png',
          imageWidth: 250,
          resizeMode: 'contain',
          backgroundColor: '#F5B800',
          dark: {
            image: './assets/images/splash-icon-dark.png',
            backgroundColor: '#141814',
          },
        },
      ],
      ['expo-status-bar', { style: 'auto' }],
      [
        'expo-build-properties',
        {
          android: {
            usePrecompiledHeaders: true,
          },
        },
      ],
      '@react-native-vector-icons/ionicons',
      'expo-router',
      'expo-image',
      'expo-font',
      'expo-web-browser',
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    updates: {
      url: 'https://u.expo.dev/a0d5f249-00a0-4622-98ca-e79a4ba16f4c',
      enableBsdiffPatchSupport: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: 'a0d5f249-00a0-4622-98ca-e79a4ba16f4c',
      },
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.FIREBASE_APP_ID,
    },
    owner: 'sobreirami',
  },
};
