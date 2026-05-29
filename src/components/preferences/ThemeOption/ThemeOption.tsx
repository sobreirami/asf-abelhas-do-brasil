import { ThemePreference } from '@/services/preferencesService';
import { BlurView } from 'expo-blur';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { styles } from './styles';

interface ThemeOptionProps {
  value: ThemePreference;
  label: string;
  isSelected: boolean;
  isDark: boolean;
  primaryColor: string;
  onPress: (value: ThemePreference) => void;
}

export function ThemeOption({
  value,
  label,
  isSelected,
  isDark,
  primaryColor,
  onPress,
}: ThemeOptionProps) {
  return (
    <TouchableOpacity
      style={styles.optionButton}
      onPress={() => onPress(value)}
      activeOpacity={0.7}
    >
      <BlurView
        intensity={isDark ? 60 : 80}
        tint={isDark ? 'dark' : 'light'}
        style={[
          styles.optionContent,
          isSelected && {
            borderColor: primaryColor,
            borderWidth: 2,
          },
        ]}
      >
        <View style={styles.radioOuter}>
          {isSelected && <View style={[styles.radioInner, { backgroundColor: primaryColor }]} />}
        </View>
        <Text style={[styles.optionText, isDark && styles.optionTextDark]}>{label}</Text>
      </BlurView>
    </TouchableOpacity>
  );
}
