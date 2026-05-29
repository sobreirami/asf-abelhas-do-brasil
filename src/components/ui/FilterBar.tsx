// Barra de filtros com chips selecionáveis
import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ImpactFeedbackStyle, triggerHaptic } from '@/utils/haptics';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  options: FilterOption[];
  selectedValue?: string;
  onSelect: (value: string) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function FilterBar({ options, selectedValue, onSelect }: FilterBarProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleSelect = async (value: string) => {
    await triggerHaptic(ImpactFeedbackStyle.Light);
    onSelect(value);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {options.map((option, index) => {
        const isSelected = selectedValue === option.value;

        return (
          <AnimatedPressable
            key={option.value}
            entering={FadeIn.delay(index * 50)}
            onPress={() => handleSelect(option.value)}
            style={[
              styles.chip,
              {
                backgroundColor: isSelected ? colors.primary : colors.backgroundSecondary,
                borderColor: isSelected ? colors.primary : colors.border,
              },
            ]}
          >
            <Text style={[styles.chipText, { color: isSelected ? '#FFFFFF' : colors.text }]}>
              {option.label}
            </Text>
          </AnimatedPressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  chipText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
});
