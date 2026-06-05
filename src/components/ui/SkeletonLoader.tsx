import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';
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

const CAROUSEL_CARD_WIDTH = 256;
const CAROUSEL_CARD_HEIGHT = 168;

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

export function SkeletonFeaturedCarousel() {
  return (
    <View style={skeletonCarouselStyles.row}>
      <SkeletonLoader width={CAROUSEL_CARD_WIDTH} height={CAROUSEL_CARD_HEIGHT} borderRadius={22} />
      <SkeletonLoader width={CAROUSEL_CARD_WIDTH} height={CAROUSEL_CARD_HEIGHT} borderRadius={22} />
    </View>
  );
}

export function SkeletonSpeciesDetail() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SkeletonLoader height={320} borderRadius={0} />
      <View style={{ padding: Spacing.lg }}>
        <SkeletonLoader width="70%" height={28} borderRadius={6} />
        <SkeletonLoader width="50%" height={16} borderRadius={4} style={{ marginTop: 6 }} />
        <SkeletonLoader height={64} borderRadius={8} style={{ marginTop: Spacing.md }} />
        <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md }}>
          <SkeletonLoader height={72} borderRadius={BorderRadius.md} style={{ flex: 1 }} />
          <SkeletonLoader height={72} borderRadius={BorderRadius.md} style={{ flex: 1 }} />
          <SkeletonLoader height={72} borderRadius={BorderRadius.md} style={{ flex: 1 }} />
        </View>
        {[...Array(3)].map((_, i) => (
          <SkeletonLoader
            key={i}
            height={80}
            borderRadius={BorderRadius.md}
            style={{ marginTop: Spacing.md }}
          />
        ))}
      </View>
    </View>
  );
}

export function SkeletonSpeciesCard() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[skeletonCardStyles.container, { backgroundColor: colors.card }, Shadows.md]}>
      <SkeletonLoader height={124} borderRadius={0} />
      <View style={skeletonCardStyles.infoBar}>
        <SkeletonLoader width="65%" height={17} borderRadius={4} />
        <SkeletonLoader width="50%" height={13} borderRadius={4} style={{ marginTop: 4 }} />
        <SkeletonLoader
          width="45%"
          height={13}
          borderRadius={4}
          style={{ marginTop: Spacing.xs }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});

const skeletonCarouselStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 13,
    paddingBottom: 6,
  },
});

const skeletonCardStyles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  infoBar: {
    padding: Spacing.sm + 3,
    paddingTop: Spacing.sm,
  },
});
