import {
  ImpactFeedbackStyle,
  NotificationFeedbackType,
  triggerHaptic,
  triggerNotificationHaptic,
} from '@/utils/haptics';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

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

  useEffect(() => {
    setSearchText(currentFilters.searchText || '');
    setSelectedBehavior(currentFilters.behavior);
    setSelectedRegions(currentFilters.regions || []);
    setSelectedBiomes(currentFilters.biomes || []);
    setSelectedStatus(currentFilters.conservationStatus);
    setSelectedTags(currentFilters.tags || []);
  }, [currentFilters]);

  const toggleRegion = async (region: string) => {
    await triggerHaptic(ImpactFeedbackStyle.Light);
    setSelectedRegions((prev) =>
      prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]
    );
  };

  const toggleBiome = async (biome: string) => {
    await triggerHaptic(ImpactFeedbackStyle.Light);
    setSelectedBiomes((prev) =>
      prev.includes(biome) ? prev.filter((b) => b !== biome) : [...prev, biome]
    );
  };

  const toggleTag = async (tag: string) => {
    await triggerHaptic(ImpactFeedbackStyle.Light);
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleClear = async () => {
    await triggerNotificationHaptic(NotificationFeedbackType.Warning);
    setSearchText('');
    setSelectedBehavior(undefined);
    setSelectedRegions([]);
    setSelectedBiomes([]);
    setSelectedStatus(undefined);
    setSelectedTags([]);
  };

  const handleApply = async () => {
    await triggerHaptic(ImpactFeedbackStyle.Medium);
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
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={colors.icon} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              <Ionicons name="search" size={18} /> {t.filters.searchByName}
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
              <Ionicons name="people" size={18} /> {t.filters.behavior}
            </Text>
            <View style={styles.chipContainer}>
              {BEHAVIORS.map((behavior) => (
                <Pressable
                  key={behavior}
                  onPress={async () => {
                    await triggerHaptic(ImpactFeedbackStyle.Light);
                    setSelectedBehavior(selectedBehavior === behavior ? undefined : behavior);
                  }}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selectedBehavior === behavior ? colors.primary : colors.card,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: selectedBehavior === behavior ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {behavior}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              <Ionicons name="map" size={18} /> {t.filters.regions}
            </Text>
            <View style={styles.chipContainer}>
              {REGIONS.map((region) => (
                <Pressable
                  key={region}
                  onPress={() => toggleRegion(region)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selectedRegions.includes(region)
                        ? colors.primary
                        : colors.card,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: selectedRegions.includes(region) ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {region}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              <Ionicons name="earth" size={18} /> {t.filters.biomes}
            </Text>
            <View style={styles.chipContainer}>
              {BIOMES.map((biome) => (
                <Pressable
                  key={biome}
                  onPress={() => toggleBiome(biome)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selectedBiomes.includes(biome)
                        ? colors.secondary
                        : colors.card,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: selectedBiomes.includes(biome) ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {biome}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              <Ionicons name="shield-checkmark" size={18} /> {t.filters.conservationStatus}
            </Text>
            <View style={styles.chipContainer}>
              {CONSERVATION_STATUS.map((status) => (
                <Pressable
                  key={status}
                  onPress={async () => {
                    await triggerHaptic(ImpactFeedbackStyle.Light);
                    setSelectedStatus(selectedStatus === status ? undefined : status);
                  }}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selectedStatus === status ? colors.primary : colors.card,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: selectedStatus === status ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {t.conservation[status as keyof typeof t.conservation] ?? status}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              <Ionicons name="pricetags" size={18} /> {t.filters.tags}
            </Text>
            <View style={styles.chipContainer}>
              {TAGS.map((tag) => (
                <Pressable
                  key={tag}
                  onPress={() => toggleTag(tag)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selectedTags.includes(tag) ? colors.primary : colors.card,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: selectedTags.includes(tag) ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {tag}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            onPress={handleClear}
            style={[styles.clearButton, { backgroundColor: colors.card }]}
          >
            <Text style={[styles.clearText, { color: colors.icon }]}>{t.filters.clear}</Text>
          </Pressable>
          <Pressable
            onPress={handleApply}
            style={[styles.applyButton, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.applyText}>{t.filters.apply}</Text>
          </Pressable>
        </View>
      </View>
    </BlurView>
  );
}
