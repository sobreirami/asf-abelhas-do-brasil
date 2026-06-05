import {
  ImpactFeedbackStyle,
  NotificationFeedbackType,
  triggerHaptic,
  triggerNotificationHaptic,
} from '@/utils/haptics';
import Ionicons from '@react-native-vector-icons/ionicons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

import FeaturedCarousel from '@/components/home/FeaturedCarousel';
import SpeciesCard from '@/components/SpeciesCard';
import HoneycombPattern from '@/components/ui/HoneycombPattern';
import EmptyState from '@/components/ui/EmptyState';
import SkeletonLoader, {
  SkeletonFeaturedCarousel,
  SkeletonSpeciesCard,
} from '@/components/ui/SkeletonLoader';
import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';
import { FilterOptions, useFilter } from '@/contexts/FilterContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { fetchFeaturedSpecies, fetchSpecies } from '@/services/speciesService';
import { Species } from '@/types/species';

const BIOME_CHIPS = ['Mata Atlântica', 'Cerrado', 'Amazônia', 'Caatinga'];

// --- Types for the extracted header component ---

type HomeListHeaderProps = {
  colors: (typeof Colors)['dark'];
  t: ReturnType<typeof useLanguage>['t'];
  searchInput: string;
  searchFocused: boolean;
  onSearchChange: (text: string) => void;
  onSearchFocus: () => void;
  onSearchBlur: () => void;
  onSearchClear: () => void;
  activeFilterCount: number;
  onFilterPress: () => void;
  activeBiome: string | null;
  onBiomeAll: () => void;
  onBiomeToggle: (biome: string) => void;
  featuredSpecies: Species[];
  showFeatured: boolean;
  resultsLabel: string;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
};

// Defined outside HomeScreen so the component type reference is always stable.
// React reconciles by type — same reference → update props, never remount → TextInput keeps focus.
function HomeListHeader({
  colors,
  t,
  searchInput,
  searchFocused,
  onSearchChange,
  onSearchFocus,
  onSearchBlur,
  onSearchClear,
  activeFilterCount,
  onFilterPress,
  activeBiome,
  onBiomeAll,
  onBiomeToggle,
  featuredSpecies,
  showFeatured,
  resultsLabel,
  hasActiveFilters,
  onClearFilters,
}: HomeListHeaderProps) {
  return (
    <>
      {/* Hero */}
      <View style={styles.hero}>
        <HoneycombPattern opacity={0.05} color={colors.primary} />
        <View style={styles.heroRow}>
          <View style={styles.heroText}>
            <Text style={[styles.heroGreeting, { color: colors.textMuted }]}>
              {t.home.heroGreeting}
            </Text>
            <Text style={[styles.heroTitle, { color: colors.text }]}>{t.home.title}</Text>
          </View>
          <View style={styles.heroRight}>
            <Image
              source={require('../../../assets/images/icon-transparent.png')}
              style={styles.mascot}
              contentFit="contain"
            />
          </View>
        </View>
      </View>

      {/* Barra de busca */}
      <View style={[styles.searchRow, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: colors.card,
              borderColor: searchFocused ? colors.primary : colors.border,
            },
          ]}
        >
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <TextInput
            value={searchInput}
            onChangeText={onSearchChange}
            onFocus={onSearchFocus}
            onBlur={onSearchBlur}
            placeholder={t.home.searchPlaceholder}
            placeholderTextColor={colors.textFaint}
            style={[styles.searchInput, { color: colors.text }]}
            returnKeyType="search"
          />
          {searchInput ? (
            <Pressable onPress={onSearchClear}>
              <Ionicons name="close-circle" size={20} color={colors.textFaint} />
            </Pressable>
          ) : null}
        </View>
        <Pressable
          onPress={onFilterPress}
          style={[
            styles.filterBtn,
            {
              backgroundColor: activeFilterCount > 0 ? colors.primary : colors.card,
              borderColor: activeFilterCount > 0 ? colors.primary : colors.border,
            },
          ]}
          accessibilityLabel={t.home.filters}
          accessibilityRole="button"
        >
          <Ionicons
            name="options"
            size={22}
            color={activeFilterCount > 0 ? colors.onPrimary : colors.text}
          />
          {activeFilterCount > 0 && (
            <View style={[styles.filterBadge, { backgroundColor: colors.accent }]}>
              <Text style={[styles.filterBadgeText, { color: colors.onPrimary }]}>
                {activeFilterCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Chips de bioma */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.biomesRow}
        style={styles.biomesScroll}
      >
        <BiomeChip
          label={t.home.all}
          selected={activeBiome === null}
          onPress={onBiomeAll}
          colors={colors}
        />
        {BIOME_CHIPS.map((b) => (
          <BiomeChip
            key={b}
            label={b}
            selected={activeBiome === b}
            onPress={() => onBiomeToggle(b)}
            colors={colors}
          />
        ))}
      </ScrollView>

      {/* Destaques */}
      {showFeatured && featuredSpecies.length > 0 && (
        <View style={styles.featured}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t.home.featuredSpecies}
            </Text>
          </View>
          <FeaturedCarousel species={featuredSpecies} />
        </View>
      )}

      {/* Título da grade */}
      <View style={[styles.sectionHeader, styles.gridHeader]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{resultsLabel}</Text>
        {hasActiveFilters && (
          <Pressable onPress={onClearFilters}>
            <Text style={[styles.sectionAction, { color: colors.primary }]}>
              {t.home.clearFilters}
            </Text>
          </Pressable>
        )}
      </View>
    </>
  );
}

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { t } = useLanguage();
  const { pendingTagFilter, setPendingTagFilter, activeFilters, setActiveFilters } = useFilter();
  const params = useLocalSearchParams<{ tag?: string }>();

  const [species, setSpecies] = useState<Species[]>([]);
  const [featuredSpecies, setFeaturedSpecies] = useState<Species[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const searchDebounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (pendingTagFilter) {
        setActiveFilters((prev) => ({ ...prev, tags: [pendingTagFilter] }));
        setPendingTagFilter(null);
      } else if (params.tag && typeof params.tag === 'string') {
        setActiveFilters((prev) => ({ ...prev, tags: [params.tag as string] }));
        router.setParams({ tag: undefined });
      }
    }, [pendingTagFilter, params.tag, setPendingTagFilter, setActiveFilters])
  );

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      try {
        const featured = await fetchFeaturedSpecies();
        setFeaturedSpecies(featured);
      } catch {
        setFeaturedSpecies([]);
      }
      const result = await fetchSpecies();
      setSpecies(result.species);
      setLastDoc(result.lastVisible);
      setHasMore(result.species.length >= 20);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const filteredSpecies = useMemo(() => {
    let filtered = [...species];

    const search = searchText.trim().toLowerCase();
    if (search) {
      filtered = filtered.filter(
        (s) =>
          s.commonName.toLowerCase().includes(search) ||
          s.scientificName.toLowerCase().includes(search)
      );
    }
    if (activeFilters.biomes && activeFilters.biomes.length > 0) {
      filtered = filtered.filter((s) =>
        activeFilters.biomes!.some((biome) => s.biomes?.includes(biome))
      );
    }
    if (activeFilters.behavior) {
      filtered = filtered.filter((s) => s.behavior === activeFilters.behavior);
    }
    if (activeFilters.regions && activeFilters.regions.length > 0) {
      filtered = filtered.filter((s) =>
        activeFilters.regions!.some((region) => s.regions.includes(region))
      );
    }
    if (activeFilters.conservationStatus) {
      filtered = filtered.filter((s) => s.conservationStatus === activeFilters.conservationStatus);
    }
    if (activeFilters.tags && activeFilters.tags.length > 0) {
      filtered = filtered.filter((s) => activeFilters.tags!.some((tag) => s.tags?.includes(tag)));
    }

    return filtered;
  }, [species, activeFilters, searchText]);

  const loadMoreSpecies = useCallback(async () => {
    if (loadingMore || !hasMore || !lastDoc) return;
    try {
      setLoadingMore(true);
      const result = await fetchSpecies(lastDoc);
      setSpecies((prev) => [...prev, ...result.species]);
      setLastDoc(result.lastVisible);
      setHasMore(result.species.length >= 20);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, lastDoc]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  }, [loadInitialData]);

  const handleSearchChange = useCallback((text: string) => {
    setSearchInput(text);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => setSearchText(text), 200);
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchInput('');
    setSearchText('');
  }, []);

  const handleSearchFocus = useCallback(() => setSearchFocused(true), []);
  const handleSearchBlur = useCallback(() => setSearchFocused(false), []);

  const handleFilterPress = useCallback(async () => {
    await triggerHaptic(ImpactFeedbackStyle.Light);
    router.push('/filters');
  }, []);

  const clearFilters = useCallback(async () => {
    await triggerNotificationHaptic(NotificationFeedbackType.Warning);
    setActiveFilters({});
    setSearchText('');
    setSearchInput('');
  }, [setActiveFilters]);

  const hasActiveFilters =
    !!searchInput.trim() ||
    Object.keys(activeFilters).some((key) => {
      const val = activeFilters[key as keyof FilterOptions];
      return Array.isArray(val) ? val.length > 0 : val !== undefined;
    });

  const activeFilterCount = [
    activeFilters.behavior,
    activeFilters.regions?.length,
    activeFilters.biomes?.length,
    activeFilters.conservationStatus,
    activeFilters.tags?.length,
  ].filter(Boolean).length;

  const activeBiome =
    activeFilters.biomes && activeFilters.biomes.length === 1 ? activeFilters.biomes[0] : null;

  const handleBiomeAll = useCallback(() => {
    void triggerHaptic(ImpactFeedbackStyle.Light);
    setActiveFilters((prev) => ({ ...prev, biomes: undefined }));
  }, [setActiveFilters]);

  const toggleBiome = useCallback(
    async (biome: string) => {
      await triggerHaptic(ImpactFeedbackStyle.Light);
      setActiveFilters((prev) => {
        const current = prev.biomes ?? [];
        const next = current.length === 1 && current[0] === biome ? [] : [biome];
        return { ...prev, biomes: next.length > 0 ? next : undefined };
      });
    },
    [setActiveFilters]
  );

  const showFeatured = !searchText.trim() && !hasActiveFilters;
  const resultsLabel =
    searchText || hasActiveFilters
      ? `${filteredSpecies.length} resultado${filteredSpecies.length === 1 ? '' : 's'}`
      : t.home.allSpecies;

  // Pre-rendered element with a stable component type (HomeListHeader defined outside).
  // React reconciles by type → props update without remounting → TextInput never loses focus.
  const listHeader = useMemo(
    () => (
      <HomeListHeader
        colors={colors}
        t={t}
        searchInput={searchInput}
        searchFocused={searchFocused}
        onSearchChange={handleSearchChange}
        onSearchFocus={handleSearchFocus}
        onSearchBlur={handleSearchBlur}
        onSearchClear={handleSearchClear}
        activeFilterCount={activeFilterCount}
        onFilterPress={handleFilterPress}
        activeBiome={activeBiome}
        onBiomeAll={handleBiomeAll}
        onBiomeToggle={toggleBiome}
        featuredSpecies={featuredSpecies}
        showFeatured={showFeatured}
        resultsLabel={resultsLabel}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
      />
    ),
    [
      colors,
      t,
      searchInput,
      searchFocused,
      handleSearchChange,
      handleSearchFocus,
      handleSearchBlur,
      handleSearchClear,
      activeFilterCount,
      handleFilterPress,
      activeBiome,
      handleBiomeAll,
      toggleBiome,
      featuredSpecies,
      showFeatured,
      resultsLabel,
      hasActiveFilters,
      clearFilters,
    ]
  );

  // Grade de 2 colunas: agrupar os items em pares
  const pairedSpecies = useMemo(() => {
    const pairs: [Species, Species | null][] = [];
    for (let i = 0; i < filteredSpecies.length; i += 2) {
      pairs.push([filteredSpecies[i], filteredSpecies[i + 1] ?? null]);
    }
    return pairs;
  }, [filteredSpecies]);

  const renderItem = useCallback(
    ({ item, index }: { item: [Species, Species | null]; index: number }) => (
      <View style={styles.gridRow}>
        <View style={styles.gridCell}>
          <SpeciesCard
            species={item[0]}
            index={index * 2}
            onPress={() => router.push(`/species/${item[0].id}`)}
          />
        </View>
        <View style={styles.gridCell}>
          {item[1] ? (
            <SpeciesCard
              species={item[1]}
              index={index * 2 + 1}
              onPress={() => router.push(`/species/${item[1]!.id}`)}
            />
          ) : null}
        </View>
      </View>
    ),
    []
  );

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footer}>
        <SkeletonLoader height={140} />
      </View>
    );
  }, [loadingMore]);

  const renderEmpty = useCallback(() => {
    if (loading) return null;
    return (
      <EmptyState
        icon="search"
        title={t.home.noSpeciesFound}
        description={t.home.noSpeciesDescription}
        action={
          hasActiveFilters ? (
            <Pressable
              onPress={clearFilters}
              style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.emptyBtnText, { color: colors.onPrimary }]}>
                {t.home.clearFilters}
              </Text>
            </Pressable>
          ) : undefined
        }
      />
    );
  }, [loading, hasActiveFilters, clearFilters, t, colors]);

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <View style={{ paddingHorizontal: Spacing.md, marginBottom: Spacing.lg }}>
            <SkeletonLoader
              width="40%"
              height={20}
              borderRadius={4}
              style={{ marginBottom: Spacing.sm }}
            />
            <SkeletonFeaturedCarousel />
          </View>
          <View style={styles.gridRow}>
            <View style={styles.gridCell}>
              <SkeletonSpeciesCard />
            </View>
            <View style={styles.gridCell}>
              <SkeletonSpeciesCard />
            </View>
          </View>
          <View style={styles.gridRow}>
            <View style={styles.gridCell}>
              <SkeletonSpeciesCard />
            </View>
            <View style={styles.gridCell}>
              <SkeletonSpeciesCard />
            </View>
          </View>
        </View>
      ) : (
        <FlatList
          data={pairedSpecies}
          renderItem={renderItem}
          keyExtractor={(item) => `${item[0].id}-${item[1]?.id ?? 'empty'}`}
          ListHeaderComponent={listHeader}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          onEndReached={loadMoreSpecies}
          onEndReachedThreshold={0.5}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews
          initialNumToRender={4}
          maxToRenderPerBatch={4}
          windowSize={5}
          updateCellsBatchingPeriod={50}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

function BiomeChip({
  label,
  selected,
  onPress,
  colors,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  colors: (typeof Colors)['dark'];
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.biomeChip,
        {
          backgroundColor: selected ? colors.primary : 'transparent',
          borderColor: selected ? colors.primary : colors.border,
        },
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text style={[styles.biomeChipText, { color: selected ? colors.onPrimary : colors.text }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingBottom: 100 },
  loadingContainer: { padding: Spacing.lg, gap: Spacing.lg },

  // Hero
  hero: {
    position: 'relative',
    overflow: 'hidden',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    position: 'relative',
  },
  heroText: { flex: 1, marginRight: Spacing.sm },
  heroGreeting: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, marginBottom: 4 },
  heroTitle: {
    fontSize: 28,
    fontWeight: FontWeight.bold,
    lineHeight: 32,
    letterSpacing: -0.5,
    maxWidth: 230,
  },
  heroRight: { alignItems: 'flex-end', gap: 2 },
  mascot: { width: 64, height: 64, marginTop: 2 },

  // Search
  searchRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    height: 50,
    paddingHorizontal: Spacing.md,
    borderRadius: 15,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: FontSize.md, minWidth: 0 },
  filterBtn: {
    width: 50,
    height: 50,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },

  // Biome chips
  biomesScroll: { marginTop: Spacing.sm },
  biomesRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  biomeChip: {
    flexShrink: 0,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 1,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  biomeChipText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },

  // Featured
  featured: { marginTop: Spacing.md },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  gridHeader: { marginTop: Spacing.lg },
  sectionTitle: { fontSize: FontSize.xl + 1, fontWeight: FontWeight.bold, letterSpacing: -0.3 },
  sectionAction: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },

  // Grid
  gridRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  gridCell: { flex: 1 },

  footer: { padding: Spacing.lg },
  emptyBtn: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
  },
  emptyBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, textAlign: 'center' },
});
