import { ThemeOption } from '@/components/preferences/ThemeOption';
import { ThemePreference } from '@/services/preferencesService';
import React from 'react';
import { View } from 'react-native';
import { styles } from './styles';

interface ThemeSelectorProps {
  selectedTheme: ThemePreference;
  isDark: boolean;
  primaryColor: string;
  labels: {
    light: string;
    dark: string;
    auto: string;
  };
  onThemeChange: (theme: ThemePreference) => void;
}

export function ThemeSelector({
  selectedTheme,
  isDark,
  primaryColor,
  labels,
  onThemeChange,
}: ThemeSelectorProps) {
  const themes: ThemePreference[] = ['light', 'dark', 'auto'];

  return (
    <View style={styles.optionsContainer}>
      {themes.map((theme) => (
        <ThemeOption
          key={theme}
          value={theme}
          label={labels[theme]}
          isSelected={selectedTheme === theme}
          isDark={isDark}
          primaryColor={primaryColor}
          onPress={onThemeChange}
        />
      ))}
    </View>
  );
}
