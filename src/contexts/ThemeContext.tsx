import {
  AccentColor,
  TextScale,
  getAccentColor,
  getShowScientificNames,
  getTextScale,
  getThemePreference,
  saveAccentColor,
  saveShowScientificNames,
  saveTextScale,
  saveThemePreference,
  ThemePreference,
} from '@/services/preferencesService';
import React, { createContext, use, useCallback, useEffect, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

const ACCENT_PRIMARIES: Record<AccentColor, { light: string; dark: string }> = {
  mel: { light: '#F5B800', dark: '#FFC53D' },
  oliva: { light: '#6B8E23', dark: '#A8CE6C' },
  laranja: { light: '#FF9500', dark: '#FF9F45' },
};

const TEXT_SCALE_VALUES: Record<TextScale, number> = {
  small: 0.88,
  normal: 1,
  large: 1.16,
};

type ThemeContextType = {
  colorScheme: 'light' | 'dark';
  themePreference: ThemePreference;
  setThemePreference: (theme: ThemePreference) => void;
  accentColor: AccentColor;
  setAccentColor: (accent: AccentColor) => void;
  primaryColor: string;
  textScale: TextScale;
  setTextScale: (scale: TextScale) => void;
  textScaleValue: number;
  showScientificNames: boolean;
  setShowScientificNames: (show: boolean) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useSystemColorScheme();
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>('auto');
  const [accentColor, setAccentColorState] = useState<AccentColor>('mel');
  const [textScale, setTextScaleState] = useState<TextScale>('normal');
  const [showScientificNames, setShowScientificNamesState] = useState(true);

  const colorScheme: 'light' | 'dark' =
    themePreference === 'auto'
      ? systemColorScheme === 'dark'
        ? 'dark'
        : 'light'
      : themePreference;

  const primaryColor = ACCENT_PRIMARIES[accentColor][colorScheme];

  useEffect(() => {
    Promise.all([
      getThemePreference(),
      getAccentColor(),
      getTextScale(),
      getShowScientificNames(),
    ]).then(([theme, accent, scale, scientificNames]) => {
      setThemePreferenceState(theme);
      setAccentColorState(accent);
      setTextScaleState(scale);
      setShowScientificNamesState(scientificNames);
    });
  }, []);

  const setThemePreference = useCallback((theme: ThemePreference) => {
    setThemePreferenceState(theme);
    saveThemePreference(theme);
  }, []);

  const setAccentColor = useCallback((accent: AccentColor) => {
    setAccentColorState(accent);
    saveAccentColor(accent);
  }, []);

  const setTextScale = useCallback((scale: TextScale) => {
    setTextScaleState(scale);
    saveTextScale(scale);
  }, []);

  const setShowScientificNames = useCallback((show: boolean) => {
    setShowScientificNamesState(show);
    saveShowScientificNames(show);
  }, []);

  return (
    <ThemeContext
      value={{
        colorScheme,
        themePreference,
        setThemePreference,
        accentColor,
        setAccentColor,
        primaryColor,
        textScale,
        setTextScale,
        textScaleValue: TEXT_SCALE_VALUES[textScale],
        showScientificNames,
        setShowScientificNames,
      }}
    >
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
