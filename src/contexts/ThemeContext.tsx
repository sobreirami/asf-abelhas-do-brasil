import { getThemePreference, ThemePreference } from '@/services/preferencesService';
import React, { createContext, use, useCallback, useEffect, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

type ThemeContextType = {
  colorScheme: 'light' | 'dark';
  themePreference: ThemePreference;
  setThemePreference: (theme: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useSystemColorScheme();
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>('auto');

  const colorScheme: 'light' | 'dark' =
    themePreference === 'auto'
      ? systemColorScheme === 'dark'
        ? 'dark'
        : 'light'
      : themePreference;

  useEffect(() => {
    getThemePreference().then(setThemePreferenceState);
  }, []);

  const setThemePreference = useCallback((theme: ThemePreference) => {
    setThemePreferenceState(theme);
  }, []);

  return (
    <ThemeContext value={{ colorScheme, themePreference, setThemePreference }}>
      {children}
    </ThemeContext>
  );
}

export function useTheme() {
  const context = use(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
