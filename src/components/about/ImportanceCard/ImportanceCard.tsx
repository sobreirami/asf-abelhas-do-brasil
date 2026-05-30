import { Colors, Shadows } from '@/constants/theme';
import Ionicons, { type IoniconsIconName } from '@react-native-vector-icons/ionicons';
import React from 'react';
import { Text, View } from 'react-native';
import { styles } from './styles';

interface ImportanceCardProps {
  icon: IoniconsIconName;
  title: string;
  description: string;
  colors: (typeof Colors)['light'];
}

export function ImportanceCard({ icon, title, description, colors }: ImportanceCardProps) {
  return (
    <View style={[styles.importanceCard, { backgroundColor: colors.card }, Shadows.sm]}>
      <View style={[styles.iconCircle, { backgroundColor: colors.primary + '20' }]}>
        <Ionicons name={icon} size={24} color={colors.primary} />
      </View>
      <View style={styles.importanceContent}>
        <Text style={[styles.importanceTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.importanceDescription, { color: colors.icon }]}>{description}</Text>
      </View>
    </View>
  );
}
