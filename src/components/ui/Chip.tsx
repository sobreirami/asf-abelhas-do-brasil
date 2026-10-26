import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ImpactFeedbackStyle, triggerHaptic } from '@/utils/haptics';

type ChipProps = {
  label: string;
  onPress: () => void;
  selected?: boolean;
  prefix?: string;
  disabled?: boolean;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function Chip({
  label,
  onPress,
  selected = false,
  prefix,
  disabled = false,
}: ChipProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const onPrimary = colors.onPrimary;

  const backgroundColor = selected ? colors.primary : colors.card;
  const borderColor = selected ? colors.primary : colors.border;
  const textColor = selected ? onPrimary : colors.text;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
    opacity: opacity.get(),
  }));

  const handlePressIn = () => {
    scale.set(withSpring(0.94, { damping: 15, stiffness: 400 }));
    opacity.set(withTiming(0.75, { duration: 80 }));
  };

  const handlePressOut = () => {
    scale.set(withSpring(1, { damping: 15, stiffness: 300 }));
    opacity.set(withTiming(1, { duration: 150 }));
  };

  const handlePress = async () => {
    await triggerHaptic(ImpactFeedbackStyle.Light);
    onPress();
  };

  const displayLabel = prefix ? `${prefix}${label}` : label;

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={displayLabel}
      accessibilityState={{ selected, disabled }}
      style={[
        styles.chip,
        { backgroundColor, borderColor },
        disabled && styles.disabled,
        animatedStyle,
      ]}
    >
      <Text style={[styles.label, { color: textColor }]}>{displayLabel}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    minHeight: 36,
    justifyContent: 'center',
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  disabled: {
    opacity: 0.4,
  },
});
