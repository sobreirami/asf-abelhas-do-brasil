import { storageAdapter } from '@/services/storage';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from '@react-navigation/native';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { FilterProvider } from '@/contexts/FilterContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { useColorScheme } from '@/hooks/useColorScheme';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const [isReady, setIsReady] = useState(false);

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

        await SplashScreen.hideAsync();
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
