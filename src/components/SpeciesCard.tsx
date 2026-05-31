import { BorderRadius, Colors, FontSize, FontWeight, Shadows, Spacing } from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Species } from '@/types/species';
import { ImpactFeedbackStyle, triggerHaptic } from '@/utils/haptics';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface SpeciesCardProps {
  species: Species;
  onPress: (species: Species) => void;
  index: number;
}

const CONSERVATION_COLORS: Record<string, string> = {
  'least-concern': '#6FCF73',
  vulnerable: '#FFCB4D',
  endangered: '#F0726A',
  'critically-endangered': '#F0726A',
  'data-deficient': '#9EAB90',
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function SpeciesCardBase({ species, onPress, index }: SpeciesCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { t } = useLanguage();

  const handlePress = async () => {
    await triggerHaptic(ImpactFeedbackStyle.Light);
    onPress(species);
  };

  const statusKey = species.conservationStatus ?? '';
  const statusLabel = statusKey
    ? (t.conservation[statusKey as keyof typeof t.conservation] ?? '')
    : '';
  const badgeColor = CONSERVATION_COLORS[statusKey] ?? colors.icon;

  return (
    <AnimatedPressable
      entering={FadeIn.delay(index * 40)}
      style={[styles.container, { backgroundColor: colors.card }, Shadows.md]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${species.commonName}, ${species.scientificName}`}
    >
      {/* Foto full-bleed */}
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: species.photos.thumbnail }}
          style={styles.image}
          contentFit="cover"
          transition={300}
        />
        {/* Badge de conservação no canto superior esquerdo */}
        {statusLabel ? (
          <View style={[styles.badge, { backgroundColor: badgeColor }]}>
            <View style={[styles.badgeDot, { backgroundColor: '#1B1F0E' }]} />
            <Text style={styles.badgeText}>{statusLabel}</Text>
          </View>
        ) : null}
      </View>

      {/* Barra inferior */}
      <View style={[styles.infoBar, { borderTopColor: colors.border + '60' }]}>
        <Text style={[styles.commonName, { color: colors.text }]} numberOfLines={1}>
          {species.commonName}
        </Text>
        <Text style={[styles.scientificName, { color: colors.textMuted }]} numberOfLines={1}>
          {species.scientificName}
        </Text>
        <Text style={[styles.meta, { color: colors.textFaint }]} numberOfLines={1}>
          {species.sizeMm} mm · {species.behavior}
        </Text>
      </View>
    </AnimatedPressable>
  );
}

const SpeciesCard = React.memo(
  SpeciesCardBase,
  (prev, next) =>
    prev.species.id === next.species.id &&
    prev.onPress === next.onPress &&
    prev.index === next.index
);
export default SpeciesCard;

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 124,
  },
  badge: {
    position: 'absolute',
    top: 9,
    left: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.7,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: '#1B1F0E',
  },
  infoBar: {
    padding: Spacing.sm + 3,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  commonName: {
    fontSize: 17,
    fontWeight: FontWeight.bold,
    marginBottom: 2,
  },
  scientificName: {
    fontSize: FontSize.xs + 0.5,
    fontStyle: 'italic',
    marginBottom: Spacing.xs,
  },
  meta: {
    fontSize: FontSize.xs + 0.5,
    fontWeight: FontWeight.semibold,
    marginTop: Spacing.xs,
  },
});
