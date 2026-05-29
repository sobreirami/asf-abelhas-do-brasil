import {
  ImpactFeedbackStyle,
  NotificationFeedbackType,
  triggerHaptic,
  triggerNotificationHaptic,
} from '@/utils/haptics';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
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
import { styles } from '@/styles/tabs/homeStyles';
import { Species } from '@/types/species';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useLanguage();
  const { pendingTagFilter, setPendingTagFilter, activeFilters, setActiveFilters } = useFilter();
  const params = useLocalSearchParams<{ tag?: string }>();

  const [species, setSpecies] = useState<Species[]>([]);
  const [filteredSpecies, setFilteredSpecies] = useState<Species[]>([]);
  const [featuredSpecies, setFeaturedSpecies] = useState<Species[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Aplicar filtro de tag quando vier do Context (voltar de espécie)
  useFocusEffect(() => {
    if (pendingTagFilter) {
      setActiveFilters((prev) => ({
        ...prev,
        tags: [pendingTagFilter],
      }));
      setPendingTagFilter(null);
    } else if (params.tag && typeof params.tag === 'string') {
      // Fallback para parâmetros de URL
      setActiveFilters((prev) => ({
        ...prev,
        tags: [params.tag as string],
      }));
      router.setParams({ tag: undefined });
    }
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [species, activeFilters]);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Carregar espécies em destaque (SEMPRE busca do Firebase para garantir filtro)
      try {
        const featured = await fetchFeaturedSpecies();

        setFeaturedSpecies(featured);
      } catch {
        // Featured opcional - se falhar (índice pendente ou sem dados), continua
        setFeaturedSpecies([]);
      }

      // Carregar lista principal
      const result = await fetchSpecies();
      setSpecies(result.species);
      setLastDoc(result.lastVisible);
      setHasMore(result.species.length >= 20);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreSpecies = async () => {
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
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const applyFilters = () => {
    let filtered = [...species];

    // Filtro por texto (nome comum ou científico)
    if (activeFilters.searchText) {
      const searchLower = activeFilters.searchText.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.commonName.toLowerCase().includes(searchLower) ||
          s.scientificName.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por comportamento
    if (activeFilters.behavior) {
      filtered = filtered.filter((s) => s.behavior === activeFilters.behavior);
    }

    // Filtro por regiões
    if (activeFilters.regions && activeFilters.regions.length > 0) {
      filtered = filtered.filter((s) =>
        activeFilters.regions!.some((region) => s.regions.includes(region))
      );
    }

    // Filtro por biomas
    if (activeFilters.biomes && activeFilters.biomes.length > 0) {
      filtered = filtered.filter((s) =>
        activeFilters.biomes!.some((biome) => s.biomes?.includes(biome))
      );
    }

    // Filtro por status de conservação
    if (activeFilters.conservationStatus) {
      filtered = filtered.filter((s) => s.conservationStatus === activeFilters.conservationStatus);
    }

    // Filtro por tags
    if (activeFilters.tags && activeFilters.tags.length > 0) {
      filtered = filtered.filter((s) => activeFilters.tags!.some((tag) => s.tags?.includes(tag)));
    }

    setFilteredSpecies(filtered);
  };

  const clearFilters = async () => {
    await triggerNotificationHaptic(NotificationFeedbackType.Warning);
    setActiveFilters({});
  };

  const hasActiveFilters = Object.keys(activeFilters).some(
    (key) => activeFilters[key as keyof FilterOptions] !== undefined
  );

  const renderHeader = () => (
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
            { backgroundColor: hasActiveFilters ? colors.primary : colors.card },
          ]}
        >
          <Ionicons name="filter" size={20} color={hasActiveFilters ? '#FFFFFF' : colors.icon} />
          <Text
            style={[styles.filterButtonText, { color: hasActiveFilters ? '#FFFFFF' : colors.icon }]}
          >
            {t.home.filters}
          </Text>
          {hasActiveFilters && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>
                {
                  Object.keys(activeFilters).filter((k) => activeFilters[k as keyof FilterOptions])
                    .length
                }
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {hasActiveFilters && (
        <View style={styles.activeFiltersContainer}>
          <Text style={[styles.activeFiltersText, { color: colors.icon }]}>
            {t.home.activeFilters}
          </Text>
          <Pressable onPress={clearFilters} style={styles.clearFiltersButton}>
            <Text style={[styles.clearFiltersText, { color: colors.primary }]}>
              {t.home.clearFilters}
            </Text>
          </Pressable>
        </View>
      )}
    </>
  );

  const renderItem = ({ item, index }: { item: Species; index: number }) => (
    <SpeciesCard species={item} index={index} onPress={() => router.push(`/species/${item.id}`)} />
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footer}>
        <SkeletonLoader height={180} />
      </View>
    );
  };

  const renderEmpty = () => {
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
              <Text style={styles.emptyActionText}>{t.home.clearFilters}</Text>
            </Pressable>
          ) : undefined
        }
      />
    );
  };

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
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          onEndReached={loadMoreSpecies}
          onEndReachedThreshold={0.5}
          contentContainerStyle={styles.listContent}
          showsHorizontalScrollIndicator={false}
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
