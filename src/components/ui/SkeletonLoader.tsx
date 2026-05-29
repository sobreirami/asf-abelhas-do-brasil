// Skeleton loader para estados de carregamento
import { BorderRadius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export default function SkeletonLoader({
  width = '100%',
  height = 200,
  borderRadius = BorderRadius.lg,
  style,
}: SkeletonLoaderProps) {
  const colorScheme = useColorScheme();

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
          backgroundColor: colorScheme === 'dark' ? '#2A2F2A' : '#E0E5DE',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: colorScheme === 'dark' ? '#3A4A3A' : '#F0F0F0',
            borderRadius,
          },
          animatedStyle,
        ]}
      />
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
