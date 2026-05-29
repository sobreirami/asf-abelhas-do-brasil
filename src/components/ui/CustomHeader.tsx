// Header customizado com efeito glass morphism
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ImpactFeedbackStyle, triggerHaptic } from '@/utils/haptics';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CustomHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightAction?: {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
  };
}

export default function CustomHeader({
  title,
  subtitle,
  showBackButton = false,
  onBackPress,
  rightAction,
}: CustomHeaderProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handlePress = async (callback?: () => void) => {
    await triggerHaptic(ImpactFeedbackStyle.Light);
    callback?.();
  };

  return (
    <BlurView
      intensity={80}
      tint={colorScheme ?? 'light'}
      style={[styles.container, { paddingTop: insets.top + Spacing.sm }]}
    >
      <View style={styles.content}>
        {/* Botão voltar */}
        {showBackButton && (
          <Pressable
            onPress={() => handlePress(onBackPress)}
            style={[styles.iconButton, { backgroundColor: colors.card + '80' }]}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
        )}

        {/* Título e subtítulo */}
        <View style={[styles.titleContainer, showBackButton && styles.titleWithBack]}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: colors.icon }]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        {/* Ação direita */}
        {rightAction && (
          <Pressable
            onPress={() => handlePress(rightAction.onPress)}
            style={[styles.iconButton, { backgroundColor: colors.card + '80' }]}
          >
            <Ionicons name={rightAction.icon as any} size={24} color={colors.text} />
          </Pressable>
        )}
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  titleWithBack: {
    marginLeft: Spacing.md,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
  },
  subtitle: {
    fontSize: FontSize.sm,
    marginTop: Spacing.xs / 2,
  },
});
