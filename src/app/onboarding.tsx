import { storageAdapter } from '@/services/storage';
import { ImpactFeedbackStyle, triggerHaptic } from '@/utils/haptics';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { FlatList, Pressable, Text, View, ViewToken } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { styles } from '@/styles/onboarding/onboardingStyles';

type OnboardingSlide = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
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

  const slides: OnboardingSlide[] = [
    {
      id: '1',
      icon: 'information-circle',
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

  const handleViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

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

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <Animated.View entering={FadeIn} style={styles.slide}>
      <LinearGradient
        colors={[item.color, item.color + 'CC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <View style={styles.slideContent}>
          <View style={[styles.iconContainer, { backgroundColor: colors.cardBlur }]}>
            <Ionicons name={item.icon} size={60} color={colors.text} />
          </View>

          <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
          <Text style={[styles.description, { color: colors.text }]}>{item.description}</Text>
        </View>
      </LinearGradient>
    </Animated.View>
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
        <Pressable style={styles.skipButton} onPress={handleSkip}>
          <Text style={[styles.skipText, { color: colors.text, opacity: 0.7 }]}>
            {t.onboarding.skip}
          </Text>
        </Pressable>

        {currentIndex === slides.length - 1 ? (
          <Pressable
            style={[styles.finishButton, { backgroundColor: slides[currentIndex]?.color }]}
            onPress={handleNext}
          >
            <Text style={[styles.finishText, { color: colors.text }]}>{t.onboarding.start}</Text>
            <Ionicons name="arrow-forward" size={20} color={colors.text} />
          </Pressable>
        ) : (
          <Pressable
            style={[styles.nextButton, { backgroundColor: slides[currentIndex]?.color }]}
            onPress={handleNext}
          >
            <Text style={[styles.nextText, { color: colors.text }]}>{t.onboarding.next}</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.text} />
          </Pressable>
        )}
      </View>
    </View>
  );
}
