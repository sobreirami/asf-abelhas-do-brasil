import { Colors } from '@/constants/theme';
import { BlurView } from 'expo-blur';
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { createStyles } from './styles';

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  isDark: boolean;
  danger?: boolean;
}

export function ActionButton({ title, onPress, isDark, danger }: ActionButtonProps) {
  const colors = Colors[isDark ? 'dark' : 'light'];
  const styles = createStyles(colors);

  return (
    <TouchableOpacity style={styles.actionButton} onPress={onPress} activeOpacity={0.7}>
      <BlurView
        intensity={isDark ? 60 : 80}
        tint={isDark ? 'dark' : 'light'}
        style={[styles.actionButtonContent, danger && styles.actionButtonDanger]}
      >
        <Text style={[styles.actionButtonText, danger && styles.actionButtonTextDanger]}>
          {title}
        </Text>
      </BlurView>
    </TouchableOpacity>
  );
}
