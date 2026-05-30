import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useEffect } from 'react';
import { DimensionValue, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface SkeletonLoaderProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export default function SkeletonLoader({
  width = '100%',
  height = 200,
  borderRadius = BorderRadius.lg,
  style,
}: SkeletonLoaderProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 1500 }), -1, false);
  }, [shimmer]);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(shimmer.value, [0, 0.5, 1], [0.3, 0.6, 0.3]);

    return { opacity };
  });

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.skeletonBase,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: colors.skeletonHighlight,
            borderRadius,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}

// Skeleton para tela de detalhe de espécie
export function SkeletonSpeciesDetail() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SkeletonLoader height={400} borderRadius={0} />
      <View style={{ padding: Spacing.lg }}>
        <SkeletonLoader width="70%" height={32} borderRadius={6} />
        <SkeletonLoader
          width="50%"
          height={18}
          borderRadius={4}
          style={{ marginTop: Spacing.sm }}
        />
        <SkeletonLoader
          width={120}
          height={34}
          borderRadius={8}
          style={{ marginTop: Spacing.md }}
        />
        <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg }}>
          <SkeletonLoader width={80} height={28} borderRadius={20} />
          <SkeletonLoader width={100} height={28} borderRadius={20} />
          <SkeletonLoader width={70} height={28} borderRadius={20} />
        </View>
        {[...Array(5)].map((_, i) => (
          <SkeletonLoader key={i} height={60} borderRadius={8} style={{ marginTop: Spacing.md }} />
        ))}
        <SkeletonLoader height={140} borderRadius={12} style={{ marginTop: Spacing.lg }} />
      </View>
    </View>
  );
}

// Skeleton para card de espécie
export function SkeletonSpeciesCard() {
  return (
    <View style={styles.cardContainer}>
      <SkeletonLoader height={200} />
      <View style={styles.infoSkeleton}>
        <SkeletonLoader width="60%" height={20} borderRadius={4} />
        <SkeletonLoader
          width="80%"
          height={16}
          borderRadius={4}
          style={{ marginTop: Spacing.sm }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  cardContainer: {
    marginBottom: Spacing.md,
  },
  infoSkeleton: {
    padding: Spacing.md,
  },
});
