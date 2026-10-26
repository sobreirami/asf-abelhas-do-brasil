import { storageAdapter } from '@/services/storage';
import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider as NavigationThemeProvider,
  router,
} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { NavigationBar } from 'expo-navigation-bar';
import { ActivityIndicator, View } from 'react-native';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { FilterProvider } from '@/contexts/FilterContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AnimatedSplash } from '@/components/AnimatedSplash';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export function SuspenseFallback() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const [isReady, setIsReady] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const hasSeenOnboarding = await storageAdapter.getItem('@onboarding_completed');

        if (!hasSeenOnboarding) {
          setIsReady(true);
          setTimeout(() => router.replace('/onboarding'), 100);

          return;
        }
      } finally {
        setIsReady(true);
      }
    };

    init();
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="filters"
          options={{
            headerShown: false,
            presentation: 'containedTransparentModal',
            animation: 'slide_from_bottom',
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="report"
          options={{
            headerShown: false,
            presentation: 'containedTransparentModal',
            animation: 'slide_from_bottom',
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            headerShown: false,
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="species/[id]"
          options={{
            headerShown: true,
            headerTransparent: true,
            gestureDirection: 'vertical',
            presentation: 'card',
          }}
        />
      </Stack>
      <StatusBar style="auto" />
      <NavigationBar style="auto" />
      {!splashDone && <AnimatedSplash onDone={() => setSplashDone(true)} />}
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <FilterProvider>
          <RootLayoutNav />
        </FilterProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
