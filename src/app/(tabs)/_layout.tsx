import { NativeTabs } from 'expo-router/unstable-native-tabs';
import React from 'react';

import { Colors } from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { t } = useLanguage();

  return (
    <NativeTabs
      tintColor={colors.primary}
      backgroundColor={colors.card}
      indicatorColor="transparent"
      labelStyle={{ color: colors.text }}
      iconColor={colors.tabIconDefault}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon
          sf={{ default: 'square.grid.2x2', selected: 'square.grid.2x2.fill' }}
          md="grid_view"
        />
        <NativeTabs.Trigger.Label>{t.tabs.gallery}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="conservation">
        <NativeTabs.Trigger.Icon
          sf={{ default: 'shield.checkered', selected: 'shield.fill' }}
          md="shield"
        />
        <NativeTabs.Trigger.Label>{t.tabs.conservation}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="about">
        <NativeTabs.Trigger.Icon
          sf={{ default: 'info.circle', selected: 'info.circle.fill' }}
          md="info"
        />
        <NativeTabs.Trigger.Label>{t.tabs.about}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
