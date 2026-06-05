import { NotificationFeedbackType, triggerNotificationHaptic } from '@/utils/haptics';
import Ionicons from '@react-native-vector-icons/ionicons';
import { BlurView } from 'expo-blur';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Chip } from '@/components/ui';
import { Colors, Shadows } from '@/constants/theme';
import { FilterOptions } from '@/contexts/FilterContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { styles } from './styles';

type AdvancedFilterModalProps = {
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
};

export default function AdvancedFilterModal({
  onClose,
  onApply,
  currentFilters,
}: AdvancedFilterModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  const BEHAVIORS = [t.filters.solitary, t.filters.social, 'Semi-social'];
  const REGIONS = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'];
  const BIOMES = ['Mata Atlântica', 'Cerrado', 'Amazônia', 'Caatinga', 'Pantanal', 'Pampa'];
  const CONSERVATION_STATUS = [
    'least-concern',
    'vulnerable',
    'endangered',
    'critically-endangered',
    'data-deficient',
  ];
  const TAGS = ['meliponicultura', 'polinização', 'mel medicinal', 'urbana', 'agressiva', 'mansa'];

  const [searchText, setSearchText] = useState(currentFilters.searchText || '');
  const [selectedBehavior, setSelectedBehavior] = useState(currentFilters.behavior);
  const [selectedRegions, setSelectedRegions] = useState<string[]>(currentFilters.regions || []);
  const [selectedBiomes, setSelectedBiomes] = useState<string[]>(currentFilters.biomes || []);
  const [selectedStatus, setSelectedStatus] = useState(currentFilters.conservationStatus);
  const [selectedTags, setSelectedTags] = useState<string[]>(currentFilters.tags || []);

  const toggleRegion = (region: string) =>
    setSelectedRegions((prev) =>
      prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]
    );

  const toggleBiome = (biome: string) =>
    setSelectedBiomes((prev) =>
      prev.includes(biome) ? prev.filter((b) => b !== biome) : [...prev, biome]
    );

  const toggleTag = (tag: string) =>
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );

  const handleClear = async () => {
    await triggerNotificationHaptic(NotificationFeedbackType.Warning);
    setSearchText('');
    setSelectedBehavior(undefined);
    setSelectedRegions([]);
    setSelectedBiomes([]);
    setSelectedStatus(undefined);
    setSelectedTags([]);
  };

  const handleApply = () => {
    onApply({
      searchText: searchText || undefined,
      behavior: selectedBehavior,
      regions: selectedRegions.length > 0 ? selectedRegions : undefined,
      biomes: selectedBiomes.length > 0 ? selectedBiomes : undefined,
      conservationStatus: selectedStatus,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
    });
  };

  return (
    <BlurView intensity={80} tint={colorScheme ?? 'light'} style={styles.container}>
      <View style={[styles.content, { backgroundColor: colors.background }, Shadows.lg]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t.filters.advancedFiltersTitle}
          </Text>
          <Pressable
            onPress={onClose}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel={t.common.cancel}
          >
            <Ionicons name="close" size={28} color={colors.icon} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              <Ionicons name="search" size={18} color={colors.text} /> {t.filters.searchByName}
            </Text>
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder={t.filters.searchPlaceholderAdvanced}
              placeholderTextColor={colors.icon}
              style={[
                styles.searchInput,
                {
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              <Ionicons name="people" size={18} color={colors.text} /> {t.filters.behavior}
            </Text>
            <View style={styles.chipContainer}>
              {BEHAVIORS.map((behavior) => (
                <Chip
                  key={behavior}
                  label={behavior}
                  selected={selectedBehavior === behavior}
                  onPress={() =>
                    setSelectedBehavior(selectedBehavior === behavior ? undefined : behavior)
                  }
                />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              <Ionicons name="map" size={18} color={colors.text} /> {t.filters.regions}
            </Text>
            <View style={styles.chipContainer}>
              {REGIONS.map((region) => (
                <Chip
                  key={region}
                  label={region}
                  selected={selectedRegions.includes(region)}
                  onPress={() => toggleRegion(region)}
                />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              <Ionicons name="earth" size={18} color={colors.text} /> {t.filters.biomes}
            </Text>
            <View style={styles.chipContainer}>
              {BIOMES.map((biome) => (
                <Chip
                  key={biome}
                  label={biome}
                  selected={selectedBiomes.includes(biome)}
                  onPress={() => toggleBiome(biome)}
                />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              <Ionicons name="shield-checkmark" size={18} color={colors.text} />{' '}
              {t.filters.conservationStatus}
            </Text>
            <View style={styles.chipContainer}>
              {CONSERVATION_STATUS.map((status) => (
                <Chip
                  key={status}
                  label={t.conservation[status as keyof typeof t.conservation] ?? status}
                  selected={selectedStatus === status}
                  onPress={() => setSelectedStatus(selectedStatus === status ? undefined : status)}
                />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              <Ionicons name="pricetags" size={18} color={colors.text} /> {t.filters.tags}
            </Text>
            <View style={styles.chipContainer}>
              {TAGS.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  prefix="#"
                  selected={selectedTags.includes(tag)}
                  onPress={() => toggleTag(tag)}
                />
              ))}
            </View>
          </View>
        </ScrollView>

        <View
          style={[
            styles.footer,
            { borderTopColor: colors.border, paddingBottom: insets.bottom + 8 },
          ]}
        >
          <Button
            label={t.filters.clear}
            onPress={handleClear}
            variant="secondary"
            fullWidth
            style={styles.footerButton}
          />
          <Button
            label={t.filters.apply}
            onPress={handleApply}
            variant="primary"
            fullWidth
            style={styles.footerButton}
          />
        </View>
      </View>
    </BlurView>
  );
}
