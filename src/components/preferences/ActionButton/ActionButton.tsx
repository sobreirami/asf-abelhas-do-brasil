import { BlurView } from 'expo-blur';
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { styles } from './styles';

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  isDark: boolean;
  danger?: boolean;
}

export function ActionButton({ title, onPress, isDark, danger }: ActionButtonProps) {
  return (
    <TouchableOpacity style={styles.actionButton} onPress={onPress} activeOpacity={0.7}>
      <BlurView
        intensity={isDark ? 60 : 80}
        tint={isDark ? 'dark' : 'light'}
        style={[styles.actionButtonContent, danger && { borderColor: '#FF3B30', borderWidth: 1 }]}
      >
        <Text
          style={[
            styles.actionButtonText,
            isDark && styles.actionButtonTextDark,
            danger && { color: '#FF3B30' },
          ]}
        >
          {title}
        </Text>
      </BlurView>
    </TouchableOpacity>
  );
}
