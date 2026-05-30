import {
  ImpactFeedbackStyle,
  NotificationFeedbackType,
  triggerHaptic,
  triggerNotificationHaptic,
} from '@/utils/haptics';
import Ionicons from '@react-native-vector-icons/ionicons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import FeaturedCarousel from '@/components/home/FeaturedCarousel';
import SpeciesCard from '@/components/SpeciesCard';
import EmptyState from '@/components/ui/EmptyState';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import { Colors, Spacing } from '@/constants/theme';
import { FilterOptions, useFilter } from '@/contexts/FilterContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { fetchFeaturedSpecies, fetchSpecies } from '@/services/speciesService';
import { styles } from '@/styles/screens/tabs/homeStyles';
import { Species } from '@/types/species';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
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

  // Aplica filtro de tag ao voltar de espécie
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

    if (activeFilters.searchText) {
      const searchLower = activeFilters.searchText.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.commonName.toLowerCase().includes(searchLower) ||
          s.scientificName.toLowerCase().includes(searchLower)
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
    if (activeFilters.biomes && activeFilters.biomes.length > 0) {
      filtered = filtered.filter((s) =>
        activeFilters.biomes!.some((biome) => s.biomes?.includes(biome))
      );
    }
    if (activeFilters.conservationStatus) {
      filtered = filtered.filter((s) => s.conservationStatus === activeFilters.conservationStatus);
    }
    if (activeFilters.tags && activeFilters.tags.length > 0) {
      filtered = filtered.filter((s) => activeFilters.tags!.some((tag) => s.tags?.includes(tag)));
    }

    return filtered;
  }, [species, activeFilters]);

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

  const clearFilters = useCallback(async () => {
    await triggerNotificationHaptic(NotificationFeedbackType.Warning);
    setActiveFilters({});
  }, [setActiveFilters]);

  const hasActiveFilters = Object.keys(activeFilters).some(
    (key) => activeFilters[key as keyof FilterOptions] !== undefined
  );

  const activeFilterChips = useCallback((): {
    key: string;
    label: string;
    onRemove: () => void;
  }[] => {
    const chips: { key: string; label: string; onRemove: () => void }[] = [];

    if (activeFilters.searchText) {
      chips.push({
        key: 'searchText',
        label: `"${activeFilters.searchText}"`,
        onRemove: () =>
          setActiveFilters((prev) => {
            const next = { ...prev };
            delete next.searchText;
            return next;
          }),
      });
    }
    if (activeFilters.behavior) {
      chips.push({
        key: 'behavior',
        label: activeFilters.behavior,
        onRemove: () =>
          setActiveFilters((prev) => {
            const next = { ...prev };
            delete next.behavior;
            return next;
          }),
      });
    }
    if (activeFilters.conservationStatus) {
      chips.push({
        key: 'conservationStatus',
        label: activeFilters.conservationStatus,
        onRemove: () =>
          setActiveFilters((prev) => {
            const next = { ...prev };
            delete next.conservationStatus;
            return next;
          }),
      });
    }
    activeFilters.regions?.forEach((region) => {
      chips.push({
        key: `region-${region}`,
        label: region,
        onRemove: () =>
          setActiveFilters((prev) => {
            const regions = prev.regions?.filter((r) => r !== region);
            return { ...prev, regions: regions?.length ? regions : undefined };
          }),
      });
    });
    activeFilters.biomes?.forEach((biome) => {
      chips.push({
        key: `biome-${biome}`,
        label: biome,
        onRemove: () =>
          setActiveFilters((prev) => {
            const biomes = prev.biomes?.filter((b) => b !== biome);
            return { ...prev, biomes: biomes?.length ? biomes : undefined };
          }),
      });
    });
    activeFilters.tags?.forEach((tag) => {
      chips.push({
        key: `tag-${tag}`,
        label: `#${tag}`,
        onRemove: () =>
          setActiveFilters((prev) => {
            const tags = prev.tags?.filter((tg) => tg !== tag);
            return { ...prev, tags: tags?.length ? tags : undefined };
          }),
      });
    });

    return chips;
  }, [activeFilters, setActiveFilters]);

  const renderHeader = useCallback(() => {
    const chips = activeFilterChips();
    return (
      <>
        {featuredSpecies.length > 0 && <FeaturedCarousel species={featuredSpecies} />}
        <View style={styles.headerContainer}>
          <Pressable
            onPress={async () => {
              await triggerHaptic(ImpactFeedbackStyle.Light);
              router.push('/filters');
            }}
            style={[
              styles.filterButton,
              {
                backgroundColor: hasActiveFilters ? colors.primary + '15' : colors.card,
                borderColor: hasActiveFilters ? colors.primary : colors.border,
              },
            ]}
          >
            <Ionicons
              name="filter"
              size={20}
              color={hasActiveFilters ? colors.primary : colors.icon}
            />
            <Text
              style={[
                styles.filterButtonText,
                { color: hasActiveFilters ? colors.primary : colors.icon },
              ]}
            >
              {t.home.filters}
            </Text>
          </Pressable>

          {hasActiveFilters && (
            <Pressable onPress={clearFilters} style={styles.clearFiltersButton}>
              <Text style={[styles.clearFiltersText, { color: colors.primary }]}>
                {t.home.clearFilters}
              </Text>
            </Pressable>
          )}
        </View>

        {chips.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipsScroll}
            contentContainerStyle={styles.chipsContent}
          >
            {chips.map((chip) => (
              <Pressable
                key={chip.key}
                onPress={async () => {
                  await triggerHaptic(ImpactFeedbackStyle.Light);
                  chip.onRemove();
                }}
                style={[
                  styles.filterChip,
                  { borderColor: colors.border, backgroundColor: colors.card },
                ]}
              >
                <Text style={[styles.filterChipText, { color: colors.text }]}>{chip.label}</Text>
                <Ionicons name="close" size={14} color={colors.icon} />
              </Pressable>
            ))}
          </ScrollView>
        )}
      </>
    );
  }, [featuredSpecies, hasActiveFilters, activeFilterChips, colors, t, clearFilters]);

  const renderHeaderRef = useRef(renderHeader);
  useLayoutEffect(() => {
    renderHeaderRef.current = renderHeader;
  });
  const stableHeader = useCallback(() => renderHeaderRef.current(), []);

  const renderItem = useCallback(
    ({ item, index }: { item: Species; index: number }) => (
      <SpeciesCard
        species={item}
        index={index}
        onPress={() => router.push(`/species/${item.id}`)}
      />
    ),
    []
  );

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footer}>
        <SkeletonLoader height={180} />
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
              style={[styles.emptyActionButton, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.emptyActionText, { color: colors.onPrimary }]}>
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
          <SkeletonLoader height={280} style={{ marginBottom: Spacing.xl }} />
          <SkeletonLoader height={180} />
          <SkeletonLoader height={180} />
        </View>
      ) : (
        <FlatList
          data={filteredSpecies}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={stableHeader}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          onEndReached={loadMoreSpecies}
          onEndReachedThreshold={0.5}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
