import { storageAdapter } from '@/services/storage';
import { ImpactFeedbackStyle, triggerHaptic } from '@/utils/haptics';
import Ionicons, { type IoniconsIconName } from '@react-native-vector-icons/ionicons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { FlatList, Pressable, Text, View, ViewToken } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { styles } from '@/styles/screens/onboardingStyles';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type OnboardingSlide = {
  id: string;
  icon: IoniconsIconName;
  useLogo?: boolean;
  title: string;
  description: string;
  color: string;
};

export default function OnboardingScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const [skipped, setSkipped] = useState(false);
  const nextScale = useSharedValue(1);
  const skipScale = useSharedValue(1);

  const nextAnimatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: nextScale.value }] }));
  const skipAnimatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: skipScale.value }] }));

  const slides: OnboardingSlide[] = [
    {
      id: '1',
      icon: 'information-circle',
      useLogo: true,
      title: t.onboarding.slide1Title,
      description: t.onboarding.slide1Description,
      color: colors.primary,
    },
    {
      id: '2',
      icon: 'leaf',
      title: t.onboarding.slide2Title,
      description: t.onboarding.slide2Description,
      color: colors.secondary,
    },
    {
      id: '3',
      icon: 'heart',
      title: t.onboarding.slide3Title,
      description: t.onboarding.slide3Description,
      color: colors.accent,
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

  const handleSkip = async () => {
    await triggerHaptic(ImpactFeedbackStyle.Medium);
    setSkipped(true);
    await storageAdapter.setItem('@onboarding_completed', 'true');
    router.replace('/(tabs)');
  };

  const handleNext = async () => {
    await triggerHaptic(ImpactFeedbackStyle.Light);
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      await storageAdapter.setItem('@onboarding_completed', 'true');
      router.replace('/(tabs)');
    }
  };

  const renderSlide = useCallback(
    ({ item }: { item: OnboardingSlide }) => (
      <Animated.View entering={FadeIn} style={styles.slide}>
        <LinearGradient
          colors={[item.color, item.color + 'CC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBackground}
        >
          <View style={styles.slideContent}>
            {item.useLogo ? (
              <View style={styles.logoContainer}>
                <Image
                  source={require('../../assets/images/icon-transparent.png')}
                  style={styles.logoImage}
                  contentFit="contain"
                />
              </View>
            ) : (
              <View style={[styles.iconContainer, { backgroundColor: colors.cardBlur }]}>
                <Ionicons name={item.icon} size={60} color={colors.text} />
              </View>
            )}

            <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.description, { color: colors.text }]}>{item.description}</Text>
          </View>
        </LinearGradient>
      </Animated.View>
    ),
    [colors]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
        scrollEnabled={!skipped}
      />

      {/* Pagination */}
      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.paginationDot,
              {
                width: index === currentIndex ? 24 : 8,
                backgroundColor: colors.text,
                opacity: index === currentIndex ? 0.9 : 0.4,
              },
            ]}
          />
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <AnimatedPressable
          style={[styles.skipButton, skipAnimatedStyle]}
          onPress={handleSkip}
          onPressIn={() => {
            skipScale.value = withSpring(0.94, { duration: 100 });
          }}
          onPressOut={() => {
            skipScale.value = withSpring(1, { duration: 100 });
          }}
        >
          <Text style={[styles.skipText, { color: colors.text, opacity: 0.7 }]}>
            {t.onboarding.skip}
          </Text>
        </AnimatedPressable>

        <AnimatedPressable
          style={[
            currentIndex === slides.length - 1 ? styles.finishButton : styles.nextButton,
            { backgroundColor: slides[currentIndex]?.color },
            nextAnimatedStyle,
          ]}
          onPress={handleNext}
          onPressIn={() => {
            nextScale.value = withSpring(0.94, { duration: 100 });
          }}
          onPressOut={() => {
            nextScale.value = withSpring(1, { duration: 100 });
          }}
        >
          <Text style={[styles.nextText, { color: colors.text }]}>
            {currentIndex === slides.length - 1 ? t.onboarding.start : t.onboarding.next}
          </Text>
          <Ionicons name="arrow-forward" size={16} color={colors.text} />
        </AnimatedPressable>
      </View>
    </View>
  );
}
