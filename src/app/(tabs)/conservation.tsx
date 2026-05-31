import Ionicons from '@react-native-vector-icons/ionicons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import HoneycombPattern from '@/components/ui/HoneycombPattern';
import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';

import { useFilter } from '@/contexts/FilterContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getCachedSpeciesList } from '@/services/cacheService';
import { fetchSpecies } from '@/services/speciesService';
import { Species } from '@/types/species';

const STATUS_ORDER = [
  'critically-endangered',
  'endangered',
  'vulnerable',
  'data-deficient',
  'least-concern',
] as const;

type StatusKey = (typeof STATUS_ORDER)[number];

const STATUS_COLORS: Record<StatusKey, string> = {
  'critically-endangered': '#F0726A',
  endangered: '#F0726A',
  vulnerable: '#FFCB4D',
  'data-deficient': '#9EAB90',
  'least-concern': '#6FCF73',
};

const STATUS_ICONS: Record<StatusKey, string> = {
  'critically-endangered': 'alert-circle',
  endangered: 'warning',
  vulnerable: 'alert',
  'data-deficient': 'help-circle',
  'least-concern': 'shield-checkmark',
};

const THREATENED_STATUSES = new Set(['critically-endangered', 'endangered', 'vulnerable']);

export default function ConservationScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { t } = useLanguage();
  const { setActiveFilters } = useFilter();

  const [allSpecies, setAllSpecies] = useState<Species[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const cached = await getCachedSpeciesList();
        if (cached && cached.length > 0) {
          setAllSpecies(cached);
          setLoading(false);
          return;
        }
        const result = await fetchSpecies();
        setAllSpecies(result.species);
      } catch {
        setAllSpecies([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const grouped = useMemo(() => {
    const map: Record<string, Species[]> = {};
    for (const s of allSpecies) {
      const key = s.conservationStatus || 'data-deficient';
      if (!map[key]) map[key] = [];
      map[key].push(s);
    }
    return map;
  }, [allSpecies]);

  const threatenedCount = useMemo(
    () =>
      allSpecies.filter((s) => THREATENED_STATUSES.has(s.conservationStatus as StatusKey)).length,
    [allSpecies]
  );

  const handleViewInGallery = useCallback(
    (status: string) => {
      setActiveFilters({ conservationStatus: status });
      router.push('/(tabs)');
    },
    [setActiveFilters]
  );

  const conservationLabel = (key: string) =>
    t.conservation[key as keyof typeof t.conservation] ?? key;

  if (loading) {
    return (
      <SafeAreaView
        edges={['top']}
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.centered}>
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>{t.common.loading}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero */}
        <View style={styles.hero}>
          <HoneycombPattern opacity={0.05} color={colors.primary} />
          <View style={[styles.heroGlow, { backgroundColor: colors.error + '18' }]} />
          <Text style={[styles.heroTitle, { color: colors.text }]}>{t.conservationTab.title}</Text>
          <Text style={[styles.heroSubtitle, { color: colors.textMuted }]}>
            {t.conservationTab.subtitle}
          </Text>
        </View>

        {/* Painel de ameaça */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.heroPanelWrap}>
          <View
            style={[
              styles.heroPanel,
              { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
            ]}
          >
            <View style={[styles.heroPanelLeft, { borderRightColor: colors.border }]}>
              <Text style={[styles.heroBigNum, { color: colors.error }]}>{threatenedCount}</Text>
              <Text style={[styles.heroPanelLabel, { color: colors.textMuted }]}>
                {t.conservationTab.heroOf} {allSpecies.length}
              </Text>
              <Text style={[styles.heroPanelSub, { color: colors.textFaint }]}>
                {t.conservationTab.heroLabel}
              </Text>
            </View>
            <View style={styles.heroPanelRight}>
              <Text style={[styles.heroBigNum, { color: colors.success }]}>
                {allSpecies.length - threatenedCount}
              </Text>
              <Text style={[styles.heroPanelLabel, { color: colors.textMuted }]}>
                {t.conservationTab.safe}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Barra de distribuição */}
        {allSpecies.length > 0 && (
          <Animated.View entering={FadeInDown.delay(180)} style={styles.distributionWrap}>
            <Text style={[styles.sectionLabel, { color: colors.text }]}>
              {t.conservationTab.distributionTitle}
            </Text>
            <View style={styles.distributionBar}>
              {STATUS_ORDER.map((status) => {
                const count = grouped[status]?.length ?? 0;
                if (count === 0) return null;
                const flex = count / allSpecies.length;
                return (
                  <View
                    key={status}
                    style={[
                      styles.distributionSegment,
                      { flex, backgroundColor: STATUS_COLORS[status] },
                    ]}
                  />
                );
              })}
            </View>
            <View style={styles.distributionLegend}>
              {STATUS_ORDER.map((status) => {
                const count = grouped[status]?.length ?? 0;
                if (count === 0) return null;
                return (
                  <View key={status} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: STATUS_COLORS[status] }]} />
                    <Text style={[styles.legendText, { color: colors.textFaint }]}>
                      {conservationLabel(status)} ({count})
                    </Text>
                  </View>
                );
              })}
            </View>
          </Animated.View>
        )}

        {/* Seções por status */}
        {STATUS_ORDER.map((status, sIdx) => {
          const items = grouped[status];
          if (!items || items.length === 0) return null;
          const color = STATUS_COLORS[status];
          const icon = STATUS_ICONS[status];
          const label = conservationLabel(status);
          const countLabel =
            items.length === 1
              ? t.conservationTab.speciesSingular
              : `${items.length} ${t.conservationTab.speciesPlural}`;

          return (
            <Animated.View key={status} entering={FadeInDown.delay(260 + sIdx * 80)}>
              {/* Cabeçalho da seção */}
              <View style={styles.statusHeader}>
                <View style={[styles.statusBadge, { backgroundColor: color + '22' }]}>
                  <Ionicons name={icon as never} size={16} color={color} />
                  <Text style={[styles.statusLabel, { color }]}>{label}</Text>
                </View>
                <Text style={[styles.statusCount, { color: colors.textFaint }]}>{countLabel}</Text>
              </View>

              {/* Cards de espécies */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.speciesRow}
              >
                {items.map((sp) => (
                  <ConservationSpeciesCard
                    key={sp.id}
                    species={sp}
                    statusColor={color}
                    colors={colors}
                    onPress={() => router.push(`/species/${sp.id}`)}
                  />
                ))}
              </ScrollView>

              {/* Botão ver na galeria */}
              <Pressable
                onPress={() => handleViewInGallery(status)}
                style={[styles.viewGalleryBtn, { borderColor: color + '60' }]}
                accessibilityRole="button"
              >
                <Ionicons name="grid-outline" size={16} color={color} />
                <Text style={[styles.viewGalleryText, { color }]}>
                  {t.conservationTab.viewInGallery}
                </Text>
              </Pressable>
            </Animated.View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

function ConservationSpeciesCard({
  species,
  statusColor,
  colors,
  onPress,
}: {
  species: Species;
  statusColor: string;
  colors: (typeof Colors)['dark'];
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.speciesCard,
        { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${species.commonName}, ${species.scientificName}`}
    >
      <Image
        source={{ uri: species.photos.thumbnail }}
        style={styles.speciesCardImage}
        contentFit="cover"
        transition={200}
      />
      <View style={[styles.speciesCardBar, { borderTopColor: statusColor + '40' }]}>
        <Text style={[styles.speciesCardName, { color: colors.text }]} numberOfLines={1}>
          {species.commonName}
        </Text>
        <Text style={[styles.speciesCardSci, { color: colors.textMuted }]} numberOfLines={1}>
          {species.scientificName}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 120 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: FontSize.md },

  hero: {
    position: 'relative',
    overflow: 'hidden',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  heroGlow: {
    position: 'absolute',
    top: -60,
    right: -20,
    width: 200,
    height: 200,
    borderRadius: 100,
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

  heroPanelWrap: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg },
  heroPanel: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  heroPanelLeft: {
    flex: 1,
    padding: Spacing.lg,
    borderRightWidth: 1,
  },
  heroPanelRight: {
    flex: 1,
    padding: Spacing.lg,
  },
  heroBigNum: {
    fontSize: FontSize.display,
    fontWeight: FontWeight.bold,
    lineHeight: 44,
  },
  heroPanelLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginTop: 2,
  },
  heroPanelSub: {
    fontSize: FontSize.xs,
    marginTop: 2,
    lineHeight: 16,
  },

  distributionWrap: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.xl },
  sectionLabel: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginBottom: Spacing.sm },
  distributionBar: {
    flexDirection: 'row',
    height: 12,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  distributionSegment: { height: '100%' },
  distributionLegend: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: FontSize.xs },

  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  statusLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  statusCount: { fontSize: FontSize.sm },

  speciesRow: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  speciesCard: {
    width: 140,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
  },
  speciesCardImage: { width: '100%', height: 100 },
  speciesCardBar: {
    padding: Spacing.sm,
    borderTopWidth: 2,
  },
  speciesCardName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    marginBottom: 2,
  },
  speciesCardSci: {
    fontSize: FontSize.xs,
    fontStyle: 'italic',
  },

  viewGalleryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  viewGalleryText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
});
