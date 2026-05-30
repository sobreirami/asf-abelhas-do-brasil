import { Colors } from '@/constants/theme';
import { LanguageCode } from '@/services/languageService';
import { BlurView } from 'expo-blur';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { createStyles } from './styles';

interface LanguageOptionProps {
  value: LanguageCode;
  label: string;
  isSelected: boolean;
  isDark: boolean;
  onPress: (value: LanguageCode) => void;
}

export function LanguageOption({ value, label, isSelected, isDark, onPress }: LanguageOptionProps) {
  const colors = Colors[isDark ? 'dark' : 'light'];
  const styles = createStyles(colors);

  return (
    <TouchableOpacity
      style={styles.optionButton}
      onPress={() => onPress(value)}
      activeOpacity={0.7}
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected }}
      accessibilityLabel={label}
    >
      <BlurView
        intensity={isDark ? 60 : 80}
        tint={isDark ? 'dark' : 'light'}
        style={[
          styles.optionContent,
          isSelected && { borderColor: colors.primary, borderWidth: 2 },
        ]}
      >
        <View style={styles.radioOuter}>
          {isSelected && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
        </View>
        <Text style={styles.optionText}>{label}</Text>
      </BlurView>
    </TouchableOpacity>
  );
}
