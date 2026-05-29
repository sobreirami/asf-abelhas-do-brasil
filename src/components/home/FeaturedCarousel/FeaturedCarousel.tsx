import { ImpactFeedbackStyle, triggerHaptic } from '@/utils/haptics';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';

import { Colors, Shadows } from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Species } from '@/types/species';
import { SNAP_TO_INTERVAL } from './constants';
import { styles } from './styles';
import { getStatusColor } from './utils';

type FeaturedCarouselProps = {
  species: Species[];
  loading?: boolean;
};

export default function FeaturedCarousel({ species, loading = false }: FeaturedCarouselProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useLanguage();
  const getConservationLabel = (status: string) => {
    const key = status as keyof typeof t.conservation;
    return t.conservation[key] ?? t.common.error;
  };

  const handlePress = async (id: string) => {
    await triggerHaptic(ImpactFeedbackStyle.Light);
    router.push(`/species/${id}`);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>{t.home.featuredSpecies}</Text>
        <View style={[styles.loadingCard, { backgroundColor: colors.card }]} />
      </View>
    );
  }

  if (!species || species.length === 0) {
    return null;
  }

  const renderItem = ({ item }: { item: Species }) => (
    <Pressable onPress={() => handlePress(item.id)} style={[styles.card, Shadows.lg]}>
      <Image
        source={{ uri: item.photos.media }}
        style={styles.image}
        contentFit="cover"
        transition={300}
      />
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.gradientOverlay} />
      <BlurView intensity={60} tint={colorScheme ?? 'light'} style={styles.infoContainer}>
        <Text style={[styles.commonName, { color: colors.text }]} numberOfLines={1}>
          {item.commonName}
        </Text>
        <Text style={[styles.scientificName, { color: colors.icon }]} numberOfLines={1}>
          {item.scientificName}
        </Text>
        <View style={styles.tagContainer}>
          {item.conservationStatus && (
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(item.conservationStatus, colors) },
              ]}
            >
              <Text style={styles.statusText}>{getConservationLabel(item.conservationStatus)}</Text>
            </View>
          )}
        </View>
      </BlurView>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{t.home.featuredSpecies}</Text>
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
    </View>
  );
}
