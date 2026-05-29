// Componente de carrossel de fotos
import { ImpactFeedbackStyle, triggerHaptic } from '@/utils/haptics';
import { Image } from 'expo-image';
import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Colors, Shadows, Spacing } from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IMAGE_WIDTH, styles } from './styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PhotoCarouselProps {
  photos: string[];
  delay?: number;
  onImagePress?: (imageUrl: string) => void;
}

export default function PhotoCarousel({ photos, delay = 0, onImagePress }: PhotoCarouselProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useLanguage();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (event: any) => {
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

  if (!photos || photos.length === 0) {
    return null;
  }

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
        renderItem={({ item }) => (
          <Pressable
            style={[styles.imageWrapper, Shadows.md]}
            onPress={() => handleImagePress(item)}
          >
            <Image
              source={{ uri: item }}
              style={styles.image}
              contentFit="cover"
              transition={300}
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
    </Animated.View>
  );
}
