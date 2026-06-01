import { useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

const light = require('../../assets/splash/lottie-light.json');
const dark = require('../../assets/splash/lottie-dark.json');

type AnimatedSplashProps = { onDone: () => void };

export function AnimatedSplash({ onDone }: AnimatedSplashProps) {
  const scheme = useColorScheme();
  const [fade] = useState(() => new Animated.Value(1));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: scheme === 'dark' ? '#141814' : '#F5B800', opacity: fade, zIndex: 999 },
      ]}
    >
      <LottieView
        source={scheme === 'dark' ? dark : light}
        autoPlay
        loop={false}
        speed={0.625}
        resizeMode="cover"
        style={StyleSheet.absoluteFill}
        onAnimationFinish={() => {
          Animated.timing(fade, { toValue: 0, duration: 320, useNativeDriver: true }).start(onDone);
        }}
      />
    </Animated.View>
  );
}
