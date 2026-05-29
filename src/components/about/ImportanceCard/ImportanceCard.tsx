import { Shadows } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { styles } from './styles';

interface ImportanceCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  colors: any;
}

export function ImportanceCard({ icon, title, description, colors }: ImportanceCardProps) {
  return (
    <View style={[styles.importanceCard, { backgroundColor: colors.card }, Shadows.sm]}>
      <View style={[styles.iconCircle, { backgroundColor: colors.primary + '20' }]}>
        <Ionicons name={icon as any} size={24} color={colors.primary} />
      </View>
      <View style={styles.importanceContent}>
        <Text style={[styles.importanceTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.importanceDescription, { color: colors.icon }]}>{description}</Text>
      </View>
    </View>
  );
}
