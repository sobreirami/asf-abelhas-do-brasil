import { getThemePreference, ThemePreference } from '@/services/preferencesService';
import React, { createContext, use, useEffect, useState } from 'react';
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
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>(systemColorScheme ?? 'light');

  useEffect(() => {
    loadTheme();
  }, []);

  useEffect(() => {
    const scheme = themePreference === 'auto' ? (systemColorScheme ?? 'light') : themePreference;
    setColorScheme(scheme as 'light' | 'dark');
  }, [themePreference, systemColorScheme]);

  const loadTheme = async () => {
    const preference = await getThemePreference();
    setThemePreferenceState(preference);
  };

  const setThemePreference = (theme: ThemePreference) => {
    setThemePreferenceState(theme);
  };

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
