import Ionicons from '@react-native-vector-icons/ionicons';
import { ImpactFeedbackStyle } from 'expo-haptics';
import { router, Stack } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FontWeight } from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { clearAllCache } from '@/services/cacheService';
import { LanguageCode } from '@/services/languageService';
import { ThemePreference } from '@/services/preferencesService';
import { triggerHaptic } from '@/utils/haptics';

export default function SettingsScreen() {
  const colors = useThemeColors();
  const { language, setLanguagePreference, t } = useLanguage();
  const { themePreference, setThemePreference } = useTheme();
  const colorScheme = useColorScheme();
  const activeTheme = themePreference === 'auto' ? colorScheme : themePreference;

  const [cleared, setCleared] = useState(false);

  const handleClearCache = async () => {
    await triggerHaptic(ImpactFeedbackStyle.Medium);
    await clearAllCache();
    setCleared(true);
    Alert.alert(t.alerts.clearCacheTitle, t.alerts.clearCacheMessage, [{ text: t.common.ok }]);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView
        edges={['top']}
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={[styles.topBar, { backgroundColor: colors.background }]}>
          <Pressable
            onPress={() => router.back()}
            style={[
              styles.backBtn,
              { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
            ]}
            accessibilityRole="button"
            accessibilityLabel={t.common.back}
          >
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </Pressable>
          <Text style={[styles.topBarTitle, { color: colors.text }]}>{t.settings.title}</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Conteúdo */}
          <SettingsGroup title={t.settings.contentSection} colors={colors}>
            <SettingsRow
              icon="language-outline"
              label={t.settings.language}
              last
              colors={colors}
              control={
                <SegmentedControl
                  value={language === 'pt-BR' ? 'pt' : language === 'es' ? 'es' : 'en'}
                  options={[
                    { value: 'pt', label: 'PT' },
                    { value: 'en', label: 'EN' },
                    { value: 'es', label: 'ES' },
                  ]}
                  onChange={async (v) => {
                    await triggerHaptic(ImpactFeedbackStyle.Light);
                    const code: LanguageCode = v === 'pt' ? 'pt-BR' : v === 'es' ? 'es' : 'en';
                    setLanguagePreference(code);
                  }}
                  colors={colors}
                />
              }
            />
          </SettingsGroup>

          {/* Aparência */}
          <SettingsGroup title={t.settings.appearanceSection} colors={colors}>
            <SettingsRow
              icon="contrast-outline"
              label={t.preferences.appearance}
              last
              colors={colors}
              control={
                <SegmentedControl
                  value={activeTheme ?? 'light'}
                  options={[
                    { value: 'light', label: t.theme.light },
                    { value: 'dark', label: t.theme.dark },
                  ]}
                  onChange={async (v) => {
                    await triggerHaptic(ImpactFeedbackStyle.Light);
                    setThemePreference(v as ThemePreference);
                  }}
                  colors={colors}
                />
              }
            />
          </SettingsGroup>

          {/* Dados */}
          <SettingsGroup title={t.settings.dataSection} colors={colors}>
            <SettingsRow
              icon="server-outline"
              label={t.settings.offlineStorage}
              sub={cleared ? t.settings.clearCacheSuccess : t.settings.clearCacheDesc}
              last
              colors={colors}
              control={
                <Pressable
                  onPress={cleared ? undefined : handleClearCache}
                  disabled={cleared}
                  style={[
                    styles.clearBtn,
                    cleared
                      ? { backgroundColor: colors.surfaceElevated }
                      : { backgroundColor: colors.error + '29', borderColor: colors.error + '52' },
                  ]}
                >
                  <Text
                    style={[
                      styles.clearBtnText,
                      { color: cleared ? colors.textFaint : colors.error },
                    ]}
                  >
                    {cleared ? t.settings.clearCacheSuccess : t.filters.clear}
                  </Text>
                </Pressable>
              }
            />
          </SettingsGroup>

          {/* Sobre */}
          <SettingsGroup title={t.settings.aboutSection} colors={colors}>
            <SettingsRow
              icon="star-outline"
              label={t.settings.rateApp}
              colors={colors}
              onClick={() => {}}
              control={<Ionicons name="chevron-forward" size={18} color={colors.textFaint} />}
            />
            <SettingsRow
              icon="document-text-outline"
              label={t.settings.termsOfUse}
              colors={colors}
              onClick={() => {}}
              control={<Ionicons name="chevron-forward" size={18} color={colors.textFaint} />}
            />
            <SettingsRow
              icon="lock-closed-outline"
              label={t.settings.privacyPolicy}
              last
              colors={colors}
              onClick={() => {}}
              control={<Ionicons name="chevron-forward" size={18} color={colors.textFaint} />}
            />
          </SettingsGroup>

          {/* Rodapé */}
          <View style={styles.footer}>
            <Text style={[styles.footerTagline, { color: colors.textMuted }]}>
              Feito com ❤️ para a biodiversidade brasileira
            </Text>
            <Text style={[styles.footerVersion, { color: colors.textFaint }]}>
              {t.settings.version} 1.0 · Projeto educativo
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

function SettingsGroup({
  title,
  children,
  colors,
}: {
  title: string;
  children: React.ReactNode;
  colors: ReturnType<typeof useThemeColors>;
}) {
  return (
    <View style={styles.group}>
      <Text style={[styles.groupTitle, { color: colors.textFaint }]}>{title.toUpperCase()}</Text>
      <View
        style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        {children}
      </View>
    </View>
  );
}

function SettingsRow({
  icon,
  label,
  sub,
  control,
  last,
  onClick,
  colors,
}: {
  icon: string;
  label: string;
  sub?: string;
  control: React.ReactNode;
  last?: boolean;
  onClick?: () => void;
  colors: ReturnType<typeof useThemeColors>;
}) {
  return (
    <Pressable
      onPress={onClick}
      disabled={!onClick}
      style={({ pressed }) => [
        styles.row,
        !last && { borderBottomWidth: 1, borderBottomColor: colors.border },
        pressed && onClick ? { backgroundColor: colors.surfaceElevated } : undefined,
      ]}
    >
      <View style={[styles.rowIcon, { backgroundColor: colors.primary + '21' }]}>
        <Ionicons name={icon as never} size={19} color={colors.primary} />
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
        {sub ? <Text style={[styles.rowSub, { color: colors.textFaint }]}>{sub}</Text> : null}
      </View>
      {control}
    </Pressable>
  );
}

function SegmentedControl({
  value,
  options,
  onChange,
  colors,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  colors: ReturnType<typeof useThemeColors>;
}) {
  return (
    <View style={[styles.segmented, { backgroundColor: colors.surfaceElevated }]}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={[styles.segmentedItem, active && { backgroundColor: colors.primary }]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text
              style={[
                styles.segmentedLabel,
                { color: active ? colors.onPrimary : colors.textMuted },
              ]}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderWidth: 1,
  },
  topBarTitle: {
    fontSize: 24,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.3,
  },
  scrollContent: { paddingBottom: 40 },

  group: { paddingHorizontal: 20, marginBottom: 22 },
  groupTitle: {
    fontSize: 12.5,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.6,
    marginBottom: 9,
    marginHorizontal: 4,
  },
  groupCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 13,
    paddingHorizontal: 15,
    minHeight: 52,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, minWidth: 0 },
  rowLabel: { fontSize: 15.5, fontWeight: FontWeight.semibold },
  rowSub: { fontSize: 12.5, marginTop: 2, lineHeight: 17 },

  segmented: {
    flexDirection: 'row',
    borderRadius: 11,
    padding: 3,
    gap: 2,
  },
  segmentedItem: {
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 13,
  },
  segmentedLabel: { fontSize: 13.5, fontWeight: FontWeight.bold },

  clearBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  clearBtnText: { fontSize: 13.5, fontWeight: FontWeight.bold },

  footer: { alignItems: 'center', paddingVertical: 4, paddingHorizontal: 20 },
  footerTagline: { fontSize: 13, fontWeight: FontWeight.semibold },
  footerVersion: { fontSize: 12, marginTop: 5 },
});
