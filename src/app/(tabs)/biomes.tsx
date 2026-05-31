import Ionicons from '@react-native-vector-icons/ionicons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import HoneycombPattern from '@/components/ui/HoneycombPattern';
import { BorderRadius, Colors, FontSize, FontWeight, Shadows, Spacing } from '@/constants/theme';
import { useFilter } from '@/contexts/FilterContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useColorScheme } from '@/hooks/useColorScheme';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

type BiomeInfo = {
  key: string;
  nameKey: keyof ReturnType<typeof useBiomeNames>;
  blurbKey: keyof ReturnType<typeof useBiomeNames>;
  icon: IoniconsName;
  gradientColors: [string, string];
  glowColor: string;
};

function useBiomeNames() {
  const { t } = useLanguage();
  return {
    mataAtlantica: t.biomes.mataAtlantica,
    mataAtlanticaBlurb: t.biomes.mataAtlanticaBlurb,
    cerrado: t.biomes.cerrado,
    cerradoBlurb: t.biomes.cerradoBlurb,
    amazonia: t.biomes.amazonia,
    amazoniaBlurb: t.biomes.amazoniaBlurb,
    caatinga: t.biomes.caatinga,
    caatingaBlurb: t.biomes.caatingaBlurb,
  };
}

const BIOME_CONFIGS: BiomeInfo[] = [
  {
    key: 'Mata Atlântica',
    nameKey: 'mataAtlantica',
    blurbKey: 'mataAtlanticaBlurb',
    icon: 'leaf',
    gradientColors: ['#6B8E23', '#2f4512'],
    glowColor: '#C9DBA3',
  },
  {
    key: 'Cerrado',
    nameKey: 'cerrado',
    blurbKey: 'cerradoBlurb',
    icon: 'sunny',
    gradientColors: ['#C79A3A', '#6a4d18'],
    glowColor: '#F3D27A',
  },
  {
    key: 'Amazônia',
    nameKey: 'amazonia',
    blurbKey: 'amazoniaBlurb',
    icon: 'water',
    gradientColors: ['#3f7d4f', '#163a22'],
    glowColor: '#A7C98B',
  },
  {
    key: 'Caatinga',
    nameKey: 'caatinga',
    blurbKey: 'caatingaBlurb',
    icon: 'flame',
    gradientColors: ['#B98A4B', '#6e4f24'],
    glowColor: '#EAC58C',
  },
];

export default function BiomesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { t } = useLanguage();
  const { setActiveFilters } = useFilter();
  const names = useBiomeNames();

  const handlePickBiome = (biomeKey: string) => {
    setActiveFilters({ biomes: [biomeKey] });
    router.push('/(tabs)');
  };

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero */}
        <View style={styles.hero}>
          <HoneycombPattern opacity={0.05} color={colors.primary} />
          <View style={[styles.glow, { backgroundColor: colors.primary + '15' }]} />
          <Text style={[styles.heroTitle, { color: colors.text }]}>{t.biomes.title}</Text>
          <Text style={[styles.heroSubtitle, { color: colors.textMuted }]}>
            {t.biomes.subtitle}
          </Text>
        </View>

        {/* Cards de bioma */}
        <View style={styles.cards}>
          {BIOME_CONFIGS.map((biome, index) => {
            const name = names[biome.nameKey];
            const blurb = names[biome.blurbKey];
            return (
              <Animated.View key={biome.key} entering={FadeInDown.delay(index * 80)}>
                <BiomeCard
                  name={name}
                  blurb={blurb}
                  icon={biome.icon}
                  bgColorDark={biome.gradientColors[1]}
                  glowColor={biome.glowColor}
                  speciesLabel={t.biomes.speciesPlural}
                  onPress={() => handlePickBiome(biome.key)}
                />
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function BiomeCard({
  name,
  blurb,
  icon,
  bgColorDark,
  glowColor,
  onPress,
}: {
  name: string;
  blurb: string;
  icon: IoniconsName;
  bgColorDark: string;
  glowColor: string;
  speciesLabel: string;
  onPress: () => void;
}) {
  const [pressed, setPressed] = React.useState(false);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.biomeCard,
        { backgroundColor: bgColorDark },
        Shadows.lg,
        pressed && { transform: [{ scale: 0.98 }] },
      ]}
      accessibilityRole="button"
      accessibilityLabel={name}
    >
      {/* Favo de mel sutil */}
      <HoneycombPattern opacity={0.12} color="#ffffff" />

      {/* Glow interno */}
      <View style={[styles.biomeGlow, { backgroundColor: glowColor + '40' }]} />

      {/* Overlay escuro */}
      <View style={styles.biomeOverlay} />

      {/* Conteúdo */}
      <View style={styles.biomeContent}>
        {/* Topo: ícone em vidro */}
        <View style={styles.biomeGlassIcon}>
          <Ionicons name={icon} size={22} color="#fff" />
        </View>

        {/* Nome e blurb */}
        <View>
          <Text style={styles.biomeName}>{name}</Text>
          <Text style={styles.biomeBlurb} numberOfLines={2}>
            {blurb}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  hero: {
    position: 'relative',
    overflow: 'hidden',
    padding: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  glow: {
    position: 'absolute',
    top: -60,
    left: '25%',
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  heroTitle: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.5,
    marginBottom: Spacing.sm,
    position: 'relative',
  },
  heroSubtitle: {
    fontSize: FontSize.md,
    lineHeight: 24,
    maxWidth: 300,
    position: 'relative',
  },
  cards: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing.md,
  },
  biomeCard: {
    height: 150,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  biomeGlow: {
    position: 'absolute',
    top: -40,
    left: -20,
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  biomeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.38)',
  },
  biomeContent: {
    position: 'absolute',
    inset: 0,
    padding: Spacing.md + 2,
    justifyContent: 'space-between',
  },
  biomeGlassIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: 'rgba(20,24,16,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  biomeName: {
    fontFamily: undefined,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: '#ffffff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  biomeBlurb: {
    fontSize: FontSize.sm - 1,
    color: 'rgba(255,255,255,0.88)',
    marginTop: 3,
    lineHeight: 18,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    maxWidth: 280,
  },
});
