import { ImpactFeedbackStyle, triggerHaptic } from '@/utils/haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { BorderRadius, Colors, FontSize, FontWeight } from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Species } from '@/types/species';
import { CARD_GAP, CARD_WIDTH, SNAP_TO_INTERVAL } from './constants';

const CONSERVATION_COLORS: Record<string, string> = {
  'least-concern': '#6FCF73',
  vulnerable: '#FFCB4D',
  endangered: '#F0726A',
  'critically-endangered': '#F0726A',
  'data-deficient': '#9EAB90',
};

type FeaturedCarouselProps = {
  species: Species[];
  loading?: boolean;
};

export default function FeaturedCarousel({ species, loading = false }: FeaturedCarouselProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { t } = useLanguage();

  const getConservationLabel = useCallback(
    (status: string) => {
      const key = status as keyof typeof t.conservation;
      return t.conservation[key] ?? '';
    },
    [t]
  );

  const handlePress = useCallback(async (id: string) => {
    await triggerHaptic(ImpactFeedbackStyle.Light);
    router.push(`/species/${id}`);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Species }) => {
      const badgeColor = CONSERVATION_COLORS[item.conservationStatus ?? ''] ?? colors.icon;
      const statusLabel = getConservationLabel(item.conservationStatus ?? '');
      return (
        <Pressable
          onPress={() => handlePress(item.id)}
          style={styles.card}
          accessibilityRole="button"
          accessibilityLabel={item.commonName}
        >
          <Image
            source={
              item.photos?.media
                ? { uri: item.photos.media }
                : require('../../../../assets/images/bee-default.png')
            }
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={300}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.75)']}
            style={StyleSheet.absoluteFill}
          />
          {/* Badge no topo direito */}
          {statusLabel ? (
            <View style={[styles.badge, { backgroundColor: badgeColor }]}>
              <Text style={styles.badgeText}>{statusLabel}</Text>
            </View>
          ) : null}
          {/* Nome no fundo */}
          <View style={styles.nameArea}>
            <Text style={styles.commonName} numberOfLines={1}>
              {item.commonName}
            </Text>
            <Text style={styles.scientificName} numberOfLines={1}>
              {item.scientificName}
            </Text>
          </View>
        </Pressable>
      );
    },
    [colors, handlePress, getConservationLabel]
  );

  if (loading || !species || species.length === 0) return null;

  return (
    <FlatList
      data={species}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={SNAP_TO_INTERVAL}
      decelerationRate="fast"
      contentContainerStyle={styles.listContent}
      bounces={false}
    />
  );
}

const styles = StyleSheet.create({
  listContent: { paddingHorizontal: 20, gap: CARD_GAP, paddingBottom: 6 },
  card: {
    width: CARD_WIDTH,
    height: 168,
    borderRadius: 22,
    overflow: 'hidden',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 11,
    right: 11,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: '#1B1F0E',
  },
  nameArea: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 12,
  },
  commonName: {
    fontSize: 21,
    fontWeight: FontWeight.bold,
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  scientificName: {
    fontSize: FontSize.sm - 1,
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.88)',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
    marginTop: 2,
  },
});
