import { ImpactFeedbackStyle, triggerHaptic } from '@/utils/haptics';
import { Image } from 'expo-image';
import React, { useRef, useState, useCallback } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Colors, Shadows, Spacing } from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { PhotoCredit } from '@/types/species';
import { IMAGE_WIDTH, styles } from './styles';

interface PhotoCarouselProps {
  photos: string[];
  credits?: PhotoCredit[];
  delay?: number;
  onImagePress?: (imageUrl: string) => void;
  onExternalLinkPress?: (url: string) => void;
}

export default function PhotoCarousel({
  photos,
  credits,
  delay = 0,
  onImagePress,
  onExternalLinkPress,
}: PhotoCarouselProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useLanguage();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / IMAGE_WIDTH);
    setCurrentIndex(index);
  };

  const scrollToIndex = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setCurrentIndex(index);
  };

  const handleImagePress = async (imageUrl: string) => {
    await triggerHaptic(ImpactFeedbackStyle.Medium);
    if (onImagePress) {
      onImagePress(imageUrl);
    }
  };

  const [failedIndexes, setFailedIndexes] = useState<Set<number>>(new Set());

  const handleImageError = useCallback((index: number) => {
    setFailedIndexes((prev) => new Set(prev).add(index));
  }, []);

  if (!photos || photos.length === 0 || failedIndexes.size === photos.length) {
    return null;
  }

  const currentCredit = credits?.[currentIndex];

  return (
    <Animated.View entering={FadeInDown.delay(delay)} style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{t.gallery.title}</Text>

      <FlatList
        ref={flatListRef}
        data={photos}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        snapToInterval={IMAGE_WIDTH + Spacing.md}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
        keyExtractor={(item, index) => `photo-${index}`}
        renderItem={({ item, index }) => (
          <Pressable
            style={[styles.imageWrapper, Shadows.md, { backgroundColor: colors.card }]}
            onPress={() => handleImagePress(item)}
          >
            <Image
              source={
                failedIndexes.has(index)
                  ? require('../../../../assets/images/bee-default.png')
                  : { uri: item }
              }
              style={styles.image}
              contentFit="cover"
              transition={300}
              onError={() => handleImageError(index)}
            />
          </Pressable>
        )}
      />

      {/* Indicadores */}
      <View style={styles.indicatorContainer}>
        {photos.map((_, index) => (
          <Pressable
            key={index}
            onPress={() => scrollToIndex(index)}
            style={[
              styles.indicator,
              {
                backgroundColor: index === currentIndex ? colors.primary : colors.icon + '40',
              },
            ]}
          />
        ))}
      </View>

      {/* Crédito da foto atual + link iNaturalist */}
      {currentCredit ? (
        <View style={styles.creditContainer}>
          <Text style={[styles.creditText, { color: colors.icon }]}>
            {`© ${currentCredit.photographerName}`}
            {currentCredit.licenseCode ? ` · ${currentCredit.licenseCode.toUpperCase()}` : ''}
            {' · iNaturalist'}
          </Text>
          {currentCredit.observationId ? (
            <Pressable
              onPress={() =>
                onExternalLinkPress?.(
                  `https://www.inaturalist.org/observations/${currentCredit.observationId}`
                )
              }
              style={styles.inatLink}
            >
              <Text style={[styles.inatLinkText, { color: colors.secondary }]}>
                {t.gallery.viewOnINaturalist} ↗
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </Animated.View>
  );
}
