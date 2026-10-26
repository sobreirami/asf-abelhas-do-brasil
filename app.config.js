const { config } = require('dotenv');

config(); // load .env into process.env

/** @type {{ expo: import('expo/config').ExpoConfig }} */
module.exports = {
  expo: {
    name: 'AbelhasDoBrasil',
    slug: 'asf-abelhas-do-brasil',
    version: '1.0.0-rc1',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'asfabelhasdobrasil',
    userInterfaceStyle: 'automatic',
    primaryColor: '#F5B800',
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.sobreirami.asfabelhasdobrasil',
      icon: './assets/images/icon.png',
      // Universal Links: substitua TEAMID pelo seu Apple Team ID
      // (developer.apple.com → Account → Membership)
      associatedDomains: ['applinks:asfabelhasdobrasil.com.br'],
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon-foreground.png',
        backgroundImage: './assets/images/adaptive-icon-background.png',
        backgroundColor: '#F5B800',
      },
      predictiveBackGestureEnabled: false,
      package: 'com.sobreirami.asfabelhasdobrasil',
      // App Links: autoVerify requer assetlinks.json válido no servidor
      // SHA-256: obter via `eas credentials --platform android`
      intentFilters: [
        {
          action: 'VIEW',
          autoVerify: true,
          data: [
            {
              scheme: 'https',
              host: 'asfabelhasdobrasil.com.br',
              pathPrefix: '/species',
            },
          ],
          category: ['BROWSABLE', 'DEFAULT'],
        },
      ],
    },
    plugins: [
      [
        'expo-splash-screen',
        {
          backgroundColor: '#F5B800',
          image: './assets/images/splash-icon-light.png',
          imageWidth: 200,
          dark: {
            backgroundColor: '#141814',
            image: './assets/images/splash-icon-dark.png',
          },
        },
      ],
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
