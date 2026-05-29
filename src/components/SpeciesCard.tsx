// Card de espécie para a galeria
import { BorderRadius, Colors, FontSize, FontWeight, Shadows, Spacing } from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Species } from '@/types/species';
import { ImpactFeedbackStyle, triggerHaptic } from '@/utils/haptics';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface SpeciesCardProps {
  species: Species;
  onPress: (species: Species) => void;
  index: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function SpeciesCard({ species, onPress, index }: SpeciesCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useLanguage();

  const handlePress = async () => {
    await triggerHaptic(ImpactFeedbackStyle.Light);
    onPress(species);
  };

  const statusKey = species.conservationStatus ?? '';
  const statusLabel = statusKey
    ? (t.conservation[statusKey as keyof typeof t.conservation] ?? t.common.error)
    : '';

  const getStatusColor = (status: string): string => {
    const statusMap: Record<string, string> = {
      'least-concern': colors.success,
      vulnerable: colors.warning,
      endangered: colors.error,
      'critically-endangered': colors.error,
      'data-deficient': colors.icon,
    };
    return statusMap[status] || colors.icon;
  };

  return (
    <AnimatedPressable
      entering={FadeIn.delay(index * 50)}
      style={[styles.container, { backgroundColor: colors.card }, Shadows.md]}
      onPress={handlePress}
    >
      {/* Imagem */}
      <Image
        source={{ uri: species.photos.thumbnail }}
        style={styles.image}
        contentFit="cover"
        transition={300}
      />

      {/* Info overlay com blur effect */}
      <BlurView intensity={80} tint={colorScheme ?? 'light'} style={styles.infoContainer}>
        <Text style={[styles.commonName, { color: colors.text }]} numberOfLines={1}>
          {species.commonName}
        </Text>
        <Text style={[styles.scientificName, { color: colors.icon }]} numberOfLines={1}>
          {species.scientificName}
        </Text>
      </BlurView>

      {/* Badge de status de conservação */}
      {species.conservationStatus && (
        <View style={[styles.badge, { backgroundColor: getStatusColor(statusKey) }]}>
          <Text style={styles.badgeText}>{statusLabel}</Text>
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  image: {
    width: '100%',
    height: 200,
  },
  infoContainer: {
    padding: Spacing.md,
    overflow: 'hidden',
  },
  commonName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.xs,
  },
  scientificName: {
    fontSize: FontSize.sm,
    fontStyle: 'italic',
  },
  badge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
});
