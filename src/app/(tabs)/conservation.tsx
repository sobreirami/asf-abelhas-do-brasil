import Ionicons from '@react-native-vector-icons/ionicons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ExternalLink from '@/components/ui/ExternalLink';
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
  'not-evaluated',
] as const;

type StatusKey = (typeof STATUS_ORDER)[number];

const STATUS_COLORS: Record<StatusKey, string> = {
  'critically-endangered': '#F0726A',
  endangered: '#F0726A',
  vulnerable: '#FFCB4D',
  'data-deficient': '#9EAB90',
  'least-concern': '#6FCF73',
  'not-evaluated': '#9EAB90',
};

const STATUS_LABELS: Record<StatusKey, string> = {
  'critically-endangered': 'Criticamente em Perigo',
  endangered: 'Em Perigo',
  vulnerable: 'Vulnerável',
  'data-deficient': 'Dados Insuficientes',
  'least-concern': 'Pouco Preocupante',
  'not-evaluated': 'Não Avaliada',
};

const THREATENED_STATUSES = new Set<string>(['critically-endangered', 'endangered', 'vulnerable']);

function consColor(status: string): string {
  return STATUS_COLORS[status as StatusKey] ?? '#9EAB90';
}

function ConsSpeciesRow({
  species,
  colors,
  onPress,
}: {
  species: Species;
  colors: (typeof Colors)['dark'];
  onPress: () => void;
}) {
  const [thumbnailError, setThumbnailError] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.speciesRow,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${species.commonName}, ${species.scientificName}`}
    >
      <View style={styles.speciesThumb}>
        <Image
          source={
            species.photos?.thumbnail && !thumbnailError
              ? { uri: species.photos.thumbnail }
              : require('../../../assets/images/bee-default.png')
          }
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
          onError={() => setThumbnailError(true)}
        />
        <View
          style={[
            styles.speciesStatusDot,
            { backgroundColor: consColor(species.conservationStatus) },
          ]}
        />
      </View>
      <View style={styles.speciesInfo}>
        <Text style={[styles.speciesName, { color: colors.text }]} numberOfLines={1}>
          {species.commonName}
        </Text>
        <Text style={[styles.speciesSci, { color: colors.textMuted }]} numberOfLines={1}>
          {species.scientificName}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
    </Pressable>
  );
}

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
      const key = s.conservationStatus || 'not-evaluated';
      if (!map[key]) map[key] = [];
      map[key].push(s);
    }
    return map;
  }, [allSpecies]);

  const presentStatuses = useMemo(
    () => STATUS_ORDER.filter((k) => grouped[k] && grouped[k].length > 0),
    [grouped]
  );

  const threatenedCount = useMemo(
    () => allSpecies.filter((s) => THREATENED_STATUSES.has(s.conservationStatus ?? '')).length,
    [allSpecies]
  );

  const handleViewInGallery = useCallback(
    (status: string) => {
      setActiveFilters({ conservationStatus: status });
      router.push('/(tabs)');
    },
    [setActiveFilters]
  );

  const sections = useMemo(
    () => presentStatuses.map((status) => ({ status, data: grouped[status] })),
    [presentStatuses, grouped]
  );

  const listHeader = useMemo(
    () => (
      <>
        <View style={styles.hero}>
          <HoneycombPattern opacity={0.05} color={colors.primary} />
          <Text style={[styles.heroTitle, { color: colors.text }]}>Conservação</Text>
          <Text style={[styles.heroSubtitle, { color: colors.textMuted }]}>
            Como estão as abelhas nativas.
          </Text>
        </View>

        <View style={styles.panelWrap}>
          <View
            style={[
              styles.threatPanel,
              { backgroundColor: colors.error + '1C', borderColor: colors.error + '42' },
            ]}
          >
            <View style={styles.threatTop}>
              <View style={[styles.threatIconWrap, { backgroundColor: colors.error + '2E' }]}>
                <Ionicons name="warning-outline" size={24} color={colors.error} />
              </View>
              <View style={styles.threatText}>
                <Text style={[styles.threatTitle, { color: colors.text }]}>
                  {threatenedCount} de {allSpecies.length} espécies já estão ameaçadas
                </Text>
                <Text style={[styles.threatBody, { color: colors.textMuted }]}>
                  Desmatamento, agrotóxicos e perda de habitat pressionam as populações. Conhecer é
                  o primeiro passo para proteger.
                </Text>
              </View>
            </View>

            {allSpecies.length > 0 && (
              <>
                <View style={styles.distBar}>
                  {presentStatuses.map((k) => (
                    <View
                      key={k}
                      style={[
                        styles.distSegment,
                        { flex: grouped[k].length, backgroundColor: STATUS_COLORS[k] },
                      ]}
                    />
                  ))}
                </View>
                <View style={styles.distLegend}>
                  {presentStatuses.map((k) => (
                    <View key={k} style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: STATUS_COLORS[k] }]} />
                      <Text style={[styles.legendLabel, { color: colors.textMuted }]}>
                        {STATUS_LABELS[k]}
                      </Text>
                      <Text style={[styles.legendCount, { color: colors.textFaint }]}>
                        {grouped[k].length}
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        </View>

        <View style={styles.groupsTopSpacer} />
      </>
    ),
    [colors, grouped, presentStatuses, allSpecies.length, threatenedCount]
  );

  const listFooter = useMemo(
    () => (
      <View
        style={[styles.closingNote, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <Ionicons name="shield-checkmark" size={22} color={colors.success} />
        <View style={styles.closingContent}>
          <Text style={[styles.closingText, { color: colors.textMuted }]}>
            Os status seguem critérios da IUCN. Criar abelhas sem ferrão com responsabilidade ajuda
            a preservar cada espécie.
          </Text>
          <ExternalLink
            label="Saiba mais sobre os critérios da IUCN →"
            url="https://www.iucnredlist.org/resources/categories-and-criteria"
            accessibilityLabel="Saiba mais sobre os critérios da IUCN"
            style={styles.iucnLink}
          />
        </View>
      </View>
    ),
    [colors]
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: { status: StatusKey; data: Species[] } }) => {
      const color = STATUS_COLORS[section.status];
      return (
        <View style={[styles.groupHeader, { backgroundColor: colors.background }]}>
          <View style={styles.groupHeaderLeft}>
            <View style={[styles.groupDot, { backgroundColor: color }]} />
            <Text style={[styles.groupLabel, { color: colors.text }]}>
              {STATUS_LABELS[section.status]}
            </Text>
            <Text style={[styles.groupCount, { color: colors.textFaint }]}>
              {section.data.length}
            </Text>
          </View>
          <Pressable onPress={() => handleViewInGallery(section.status)} accessibilityRole="button">
            <Text style={[styles.galleryLink, { color: colors.primary }]}>Ver na galeria</Text>
          </Pressable>
        </View>
      );
    },
    [colors, handleViewInGallery]
  );

  const renderItem = useCallback(
    ({ item }: { item: Species }) => (
      <View style={styles.rowWrap}>
        <ConsSpeciesRow
          species={item}
          colors={colors}
          onPress={() => router.push(`/species/${item.id}`)}
        />
      </View>
    ),
    [colors]
  );

  const renderSectionSeparator = useCallback(() => <View style={styles.sectionSeparator} />, []);

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
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        SectionSeparatorComponent={renderSectionSeparator}
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        removeClippedSubviews
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        stickySectionHeadersEnabled={false}
      />
    </SafeAreaView>
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
    paddingHorizontal: 20,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.5,
    marginBottom: Spacing.xs,
    position: 'relative',
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 300,
    position: 'relative',
  },

  panelWrap: { paddingHorizontal: 20, paddingTop: 16 },
  threatPanel: {
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
  },
  threatTop: { flexDirection: 'row', gap: 13, alignItems: 'flex-start' },
  threatIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 13,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  threatText: { flex: 1, minWidth: 0 },
  threatTitle: {
    fontSize: 17,
    fontWeight: FontWeight.bold,
    lineHeight: 22,
    marginBottom: 4,
  },
  threatBody: { fontSize: 13.5, lineHeight: 20 },

  distBar: {
    flexDirection: 'row',
    height: 12,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginTop: 16,
    gap: 2,
  },
  distSegment: { height: '100%' },
  distLegend: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, rowGap: 6, marginTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 9, height: 9, borderRadius: BorderRadius.full },
  legendLabel: { fontSize: 12.5, fontWeight: FontWeight.semibold },
  legendCount: { fontSize: 12.5, fontWeight: FontWeight.bold },

  groupsTopSpacer: { height: 22 },
  sectionSeparator: { height: 22 },
  rowWrap: { paddingHorizontal: 20, marginBottom: 9 },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 11,
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  groupHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 9, flex: 1, minWidth: 0 },
  groupDot: { width: 11, height: 11, borderRadius: BorderRadius.full, flexShrink: 0 },
  groupLabel: { fontSize: 18, fontWeight: FontWeight.bold, letterSpacing: -0.2 },
  groupCount: { fontSize: 13, fontWeight: FontWeight.bold },
  galleryLink: { fontSize: 13.5, fontWeight: FontWeight.semibold, flexShrink: 0 },

  speciesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 10,
    paddingHorizontal: 12,
    borderRadius: 15,
    borderWidth: 1,
  },
  speciesThumb: {
    width: 46,
    height: 46,
    borderRadius: 13,
    overflow: 'hidden',
    flexShrink: 0,
    backgroundColor: '#2D3624',
    position: 'relative',
  },
  speciesStatusDot: {
    position: 'absolute',
    right: 5,
    bottom: 5,
    width: 9,
    height: 9,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.35)',
  },
  speciesInfo: { flex: 1, minWidth: 0 },
  speciesName: { fontSize: 16, fontWeight: FontWeight.bold },
  speciesSci: { fontSize: 12.5, fontStyle: 'italic', marginTop: 1 },

  closingNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 18,
    padding: 16,
    margin: 20,
    marginTop: 8,
    borderWidth: 1,
  },
  closingContent: { flex: 1, minWidth: 0 },
  closingText: { fontSize: 13.5, lineHeight: 20 },
  iucnLink: { fontSize: 13.5, fontWeight: FontWeight.semibold, marginTop: 8 },
});
