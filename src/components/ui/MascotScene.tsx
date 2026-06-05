import { Image } from 'expo-image';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/useColorScheme';

export type MascotVariant = 'default' | 'explore' | 'protect';

const SOURCES: Record<MascotVariant, number> = {
  default: require('../../../assets/images/bee-default.png'),
  explore: require('../../../assets/images/bee-explore.png'),
  protect: require('../../../assets/images/bee-guardian.png'),
};

type Props = {
  variant: MascotVariant;
  size?: number;
};

export default function MascotScene({ variant, size = 200 }: Props) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const reducedMotion = useReducedMotion();

  const translateY = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) return;

    translateY.value = withRepeat(
      withSequence(
        withTiming(-7, { duration: 2250, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2250, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [reducedMotion, translateY]);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      {/* radial glow behind the mascot */}
      <View
        style={[
          styles.glow,
          {
            width: size * 0.85,
            height: size * 0.85,
            borderRadius: size,
            backgroundColor: colors.primary + '28',
          },
        ]}
      />
      <Animated.View style={[StyleSheet.absoluteFill, floatStyle]}>
        <Image
          source={SOURCES[variant]}
          style={styles.image}
          contentFit="contain"
          accessibilityLabel=""
          accessibilityRole="image"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
