import { storageAdapter } from '@/services/storage';
import { ImpactFeedbackStyle, triggerHaptic } from '@/utils/haptics';
import Ionicons, { type IoniconsIconName } from '@react-native-vector-icons/ionicons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, ViewToken } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import HoneycombPattern from '@/components/ui/HoneycombPattern';
import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';
import { useColorScheme } from '@/hooks/useColorScheme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type OnboardingSlide = {
  id: string;
  icon: IoniconsIconName;
  badge: string;
  title: string;
  description: string;
};

export default function OnboardingScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const nextScale = useSharedValue(1);
  const skipScale = useSharedValue(1);

  const nextAnimatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: nextScale.value }] }));
  const skipAnimatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: skipScale.value }] }));

  const onNextPressIn = useCallback(() => {
    nextScale.value = withSpring(0.96, { duration: 100 }); // eslint-disable-line react-hooks/immutability
  }, [nextScale]);
  const onNextPressOut = useCallback(() => {
    nextScale.value = withSpring(1, { duration: 100 }); // eslint-disable-line react-hooks/immutability
  }, [nextScale]);
  const onSkipPressIn = useCallback(() => {
    skipScale.value = withSpring(0.96, { duration: 100 }); // eslint-disable-line react-hooks/immutability
  }, [skipScale]);
  const onSkipPressOut = useCallback(() => {
    skipScale.value = withSpring(1, { duration: 100 }); // eslint-disable-line react-hooks/immutability
  }, [skipScale]);

  const slides: OnboardingSlide[] = [
    {
      id: '1',
      icon: 'leaf',
      badge: t.onboarding.badge1,
      title: t.onboarding.slide1Title,
      description: t.onboarding.slide1Description,
    },
    {
      id: '2',
      icon: 'search',
      badge: t.onboarding.badge2,
      title: t.onboarding.slide2Title,
      description: t.onboarding.slide2Description,
    },
    {
      id: '3',
      icon: 'shield-checkmark',
      badge: t.onboarding.badge3,
      title: t.onboarding.slide3Title,
      description: t.onboarding.slide3Description,
    },
  ];

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
    []
  );

  const finishOnboarding = async () => {
    await storageAdapter.setItem('@onboarding_completed', 'true');
    router.replace('/(tabs)');
  };

  const handleSkip = async () => {
    await triggerHaptic(ImpactFeedbackStyle.Medium);
    await finishOnboarding();
  };

  const handleNext = async () => {
    await triggerHaptic(ImpactFeedbackStyle.Light);
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      await finishOnboarding();
    }
  };

  const isLast = currentIndex === slides.length - 1;

  const renderSlide = useCallback(
    ({ item }: { item: OnboardingSlide }) => (
      <Animated.View entering={FadeIn} style={styles.slide}>
        {/* Mascote grande com glow */}
        <View style={styles.mascotWrapper}>
          <View style={[styles.mascotGlow, { backgroundColor: colors.primary + '30' }]} />
          <Image
            source={require('../../assets/images/icon-transparent.png')}
            style={styles.mascotImage}
            contentFit="contain"
          />
        </View>

        {/* Badge da etapa */}
        <View
          style={[
            styles.badge,
            { backgroundColor: colors.primary + '20', borderColor: colors.primary + '4D' },
          ]}
        >
          <Ionicons name={item.icon} size={16} color={colors.primary} />
          <Text style={[styles.badgeText, { color: colors.primary }]}>{item.badge}</Text>
        </View>

        {/* Título */}
        <Text style={[styles.slideTitle, { color: colors.text }]}>{item.title}</Text>

        {/* Descrição */}
        <Text style={[styles.slideDescription, { color: colors.textMuted }]}>
          {item.description}
        </Text>
      </Animated.View>
    ),
    [colors]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <HoneycombPattern opacity={0.05} color={colors.primary} />

      {/* Glow superior */}
      <View style={[styles.topGlow, { backgroundColor: colors.primary + '25' }]} />

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        scrollEventThrottle={16}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        showsHorizontalScrollIndicator={false}
        style={styles.list}
      />

      {/* Indicador de progresso (pílulas) */}
      <View style={styles.indicators}>
        {slides.map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.indicatorDot,
              {
                width: index === currentIndex ? 26 : 7,
                backgroundColor: index === currentIndex ? colors.primary : colors.border,
              },
            ]}
          />
        ))}
      </View>

      {/* Ações */}
      <View style={styles.footer}>
        <AnimatedPressable
          style={[styles.primaryBtn, { backgroundColor: colors.primary }, nextAnimatedStyle]}
          onPress={handleNext}
          onPressIn={onNextPressIn}
          onPressOut={onNextPressOut}
          accessibilityRole="button"
          accessibilityLabel={isLast ? t.onboarding.start : t.onboarding.next}
        >
          <Text style={[styles.primaryBtnText, { color: colors.onPrimary }]}>
            {isLast ? t.onboarding.start : t.onboarding.next}
          </Text>
          <Ionicons
            name={isLast ? 'arrow-forward' : 'chevron-forward'}
            size={20}
            color={colors.onPrimary}
          />
        </AnimatedPressable>

        <AnimatedPressable
          style={skipAnimatedStyle}
          onPress={handleSkip}
          onPressIn={onSkipPressIn}
          onPressOut={onSkipPressOut}
          accessibilityRole="button"
          accessibilityLabel={isLast ? t.onboarding.notNow : t.onboarding.skip}
        >
          <Text style={[styles.skipText, { color: colors.textFaint }]}>
            {isLast ? t.onboarding.notNow : t.onboarding.skip}
          </Text>
        </AnimatedPressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topGlow: {
    position: 'absolute',
    top: -90,
    left: '50%',
    marginLeft: -180,
    width: 360,
    height: 360,
    borderRadius: 180,
  },
  list: { flex: 1 },
  slide: {
    width: '100%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 34,
  },
  mascotWrapper: {
    position: 'relative',
    width: 188,
    height: 188,
    marginBottom: Spacing.xl,
  },
  mascotGlow: {
    position: 'absolute',
    inset: -24,
    borderRadius: 120,
    top: -24,
    left: -24,
    right: -24,
    bottom: -24,
  },
  mascotImage: {
    width: '100%',
    height: '100%',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm - 1,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginBottom: Spacing.md + 2,
  },
  badgeText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, letterSpacing: 0.3 },
  slideTitle: {
    fontSize: 28,
    fontWeight: FontWeight.bold,
    lineHeight: 34,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: Spacing.md,
  },
  slideDescription: {
    fontSize: FontSize.md,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 300,
  },
  indicators: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  indicatorDot: {
    height: 7,
    borderRadius: 99,
  },
  footer: {
    paddingHorizontal: 28,
    paddingBottom: 38,
    gap: Spacing.md,
    alignItems: 'stretch',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    minHeight: 52,
    borderRadius: 16,
    paddingHorizontal: Spacing.lg,
  },
  primaryBtnText: { fontSize: 17, fontWeight: FontWeight.bold },
  skipText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
    paddingVertical: Spacing.xs,
  },
});
