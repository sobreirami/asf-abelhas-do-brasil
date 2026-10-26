import Ionicons, { type IoniconsIconName } from '@react-native-vector-icons/ionicons';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ImpactFeedbackStyle, triggerHaptic } from '@/utils/haptics';

type IoniconName = IoniconsIconName;
type ButtonVariant = 'primary' | 'secondary' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  iconLeft?: IoniconName;
  iconRight?: IoniconName;
  disabled?: boolean;
  loading?: boolean;
  style?: import('react-native').StyleProp<import('react-native').ViewStyle>;
};

const SIZE_MAP = {
  sm: {
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    fontSize: FontSize.sm,
    iconSize: 16,
    minHeight: 36,
  },
  md: {
    paddingVertical: 10,
    paddingHorizontal: Spacing.lg,
    fontSize: FontSize.md,
    iconSize: 18,
    minHeight: 44,
  },
  lg: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    fontSize: FontSize.lg,
    iconSize: 20,
    minHeight: 52,
  },
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  iconLeft,
  iconRight,
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const sizing = SIZE_MAP[size];

  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const onPrimary = colors.onPrimary;

  const backgroundMap: Record<ButtonVariant, string> = {
    primary: colors.primary,
    secondary: 'transparent',
    danger: colors.error,
  };
  const textColorMap: Record<ButtonVariant, string> = {
    primary: onPrimary,
    secondary: colors.text,
    danger: '#FFFFFF',
  };
  const borderColorMap: Record<ButtonVariant, string> = {
    primary: colors.primary,
    secondary: colors.border,
    danger: colors.error,
  };

  const isDisabled = disabled || loading;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
    opacity: opacity.get(),
  }));

  const handlePressIn = () => {
    scale.set(withSpring(0.96, { damping: 15, stiffness: 400 }));
    opacity.set(withTiming(0.8, { duration: 80 }));
  };

  const handlePressOut = () => {
    scale.set(withSpring(1, { damping: 15, stiffness: 300 }));
    opacity.set(withTiming(1, { duration: 150 }));
  };

  const handlePress = async () => {
    await triggerHaptic(ImpactFeedbackStyle.Light);
    onPress();
  };

  const iconColor = textColorMap[variant];

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled }}
      style={[
        styles.base,
        {
          backgroundColor: backgroundMap[variant],
          borderColor: borderColorMap[variant],
          paddingVertical: sizing.paddingVertical,
          paddingHorizontal: sizing.paddingHorizontal,
          minHeight: sizing.minHeight,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          opacity: isDisabled ? 0.4 : 1,
        },
        style,
        animatedStyle,
      ]}
    >
      {iconLeft && !loading && (
        <Ionicons name={iconLeft} size={sizing.iconSize} color={iconColor} />
      )}

      {loading ? (
        <ActivityIndicator size="small" color={iconColor} />
      ) : (
        <Text style={[styles.label, { color: iconColor, fontSize: sizing.fontSize }]}>{label}</Text>
      )}

      {iconRight && !loading && (
        <Ionicons name={iconRight} size={sizing.iconSize} color={iconColor} />
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  label: {
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
  },
});
