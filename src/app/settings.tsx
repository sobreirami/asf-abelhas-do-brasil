import Ionicons from '@react-native-vector-icons/ionicons';
import { router, Stack } from 'expo-router';
import React from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemeColors } from '@/hooks/useThemeColors';
import { clearAllCache } from '@/services/cacheService';
import { LanguageCode } from '@/services/languageService';
import { AccentColor, TextScale } from '@/services/preferencesService';
import { triggerHaptic, triggerNotificationHaptic } from '@/utils/haptics';
import { ImpactFeedbackStyle, NotificationFeedbackType } from 'expo-haptics';

const ACCENT_OPTIONS: { key: AccentColor; color: { light: string; dark: string } }[] = [
  { key: 'mel', color: { light: '#F5B800', dark: '#FFC53D' } },
  { key: 'oliva', color: { light: '#6B8E23', dark: '#A8CE6C' } },
  { key: 'laranja', color: { light: '#FF9500', dark: '#FF9F45' } },
];

const TEXT_SCALE_OPTIONS: TextScale[] = ['small', 'normal', 'large'];

const LANG_OPTIONS: { code: LanguageCode; label: string }[] = [
  { code: 'pt-BR', label: 'Português (Brasil)' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
];

export default function SettingsScreen() {
  const colors = useThemeColors();
  const {
    colorScheme,
    accentColor,
    setAccentColor,
    textScale,
    setTextScale,
    showScientificNames,
    setShowScientificNames,
  } = useTheme();
  const { t, language, setLanguagePreference } = useLanguage();

  const handleClearCache = async () => {
    await triggerHaptic(ImpactFeedbackStyle.Medium);
    Alert.alert(t.settings.clearCacheConfirmTitle, t.settings.clearCacheConfirmMsg, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.settings.clearCache,
        style: 'destructive',
        onPress: async () => {
          await clearAllCache();
          await triggerNotificationHaptic(NotificationFeedbackType.Success);
          Alert.alert('', t.settings.clearCacheSuccess);
        },
      },
    ]);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: t.settings.title,
          headerShown: true,
          headerTransparent: false,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              style={styles.backBtn}
              accessibilityRole="button"
              accessibilityLabel={t.common.back}
            >
              <Ionicons name="chevron-back" size={24} color={colors.text} />
            </Pressable>
          ),
        }}
      />
      <SafeAreaView
        edges={['bottom']}
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Geral */}
          <SectionHeader label={t.settings.generalSection} colors={colors} />
          <View
            style={[
              styles.group,
              { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
            ]}
          >
            {/* Idioma */}
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="language-outline" size={20} color={colors.primary} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  {t.settings.language}
                </Text>
              </View>
            </View>
            <View style={[styles.segmentRow, { borderTopColor: colors.border }]}>
              {LANG_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.code}
                  onPress={async () => {
                    await triggerHaptic(ImpactFeedbackStyle.Light);
                    setLanguagePreference(opt.code);
                  }}
                  style={[
                    styles.segmentBtn,
                    language === opt.code && { backgroundColor: colors.primary },
                    { borderColor: colors.border },
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: language === opt.code }}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      { color: language === opt.code ? colors.onPrimary : colors.textMuted },
                    ]}
                    numberOfLines={1}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Divider colors={colors} />

            {/* Nomes científicos */}
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="leaf-outline" size={20} color={colors.primary} />
                <View>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    {t.settings.showScientificNames}
                  </Text>
                  <Text style={[styles.settingDesc, { color: colors.textFaint }]}>
                    {t.settings.showScientificNamesDesc}
                  </Text>
                </View>
              </View>
              <Switch
                value={showScientificNames}
                onValueChange={async (v) => {
                  await triggerHaptic(ImpactFeedbackStyle.Light);
                  setShowScientificNames(v);
                }}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={Colors[colorScheme].card}
              />
            </View>
          </View>

          {/* Aparência */}
          <SectionHeader label={t.settings.appearanceSection} colors={colors} />
          <View
            style={[
              styles.group,
              { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
            ]}
          >
            {/* Cor de destaque */}
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="color-palette-outline" size={20} color={colors.primary} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  {t.settings.accentColor}
                </Text>
              </View>
            </View>
            <View style={[styles.accentRow, { borderTopColor: colors.border }]}>
              {ACCENT_OPTIONS.map((opt) => {
                const hex = opt.color[colorScheme];
                const selected = accentColor === opt.key;
                const labelKey =
                  `accent${opt.key.charAt(0).toUpperCase()}${opt.key.slice(1)}` as keyof typeof t.settings;
                return (
                  <Pressable
                    key={opt.key}
                    onPress={async () => {
                      await triggerHaptic(ImpactFeedbackStyle.Light);
                      setAccentColor(opt.key);
                    }}
                    style={[styles.accentBtn, selected && { borderColor: hex, borderWidth: 2 }]}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={String(t.settings[labelKey])}
                  >
                    <View style={[styles.accentSwatch, { backgroundColor: hex }]} />
                    <Text
                      style={[styles.accentLabel, { color: selected ? hex : colors.textMuted }]}
                    >
                      {String(t.settings[labelKey])}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Divider colors={colors} />

            {/* Tamanho de texto */}
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="text-outline" size={20} color={colors.primary} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  {t.settings.textSize}
                </Text>
              </View>
            </View>
            <View style={[styles.segmentRow, { borderTopColor: colors.border }]}>
              {TEXT_SCALE_OPTIONS.map((opt) => {
                const labelKey =
                  `textSize${opt.charAt(0).toUpperCase()}${opt.slice(1)}` as keyof typeof t.settings;
                return (
                  <Pressable
                    key={opt}
                    onPress={async () => {
                      await triggerHaptic(ImpactFeedbackStyle.Light);
                      setTextScale(opt);
                    }}
                    style={[
                      styles.segmentBtn,
                      textScale === opt && { backgroundColor: colors.primary },
                      { borderColor: colors.border },
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: textScale === opt }}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        { color: textScale === opt ? colors.onPrimary : colors.textMuted },
                      ]}
                    >
                      {String(t.settings[labelKey])}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Dados */}
          <SectionHeader label={t.settings.dataSection} colors={colors} />
          <View
            style={[
              styles.group,
              { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
            ]}
          >
            <Pressable
              onPress={handleClearCache}
              style={styles.settingRow}
              accessibilityRole="button"
            >
              <View style={styles.settingLeft}>
                <Ionicons name="trash-outline" size={20} color={colors.error} />
                <View>
                  <Text style={[styles.settingLabel, { color: colors.error }]}>
                    {t.settings.clearCache}
                  </Text>
                  <Text style={[styles.settingDesc, { color: colors.textFaint }]}>
                    {t.settings.clearCacheDesc}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
            </Pressable>
          </View>

          {/* Sobre */}
          <SectionHeader label={t.settings.aboutSection} colors={colors} />
          <View
            style={[
              styles.group,
              { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
            ]}
          >
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  {t.settings.version}
                </Text>
              </View>
              <Text style={[styles.settingValue, { color: colors.textFaint }]}>1.0.0</Text>
            </View>

            <Divider colors={colors} />

            <Pressable
              onPress={() => Linking.openURL('https://github.com/sobreirami/asf-abelhas-do-brasil')}
              style={styles.settingRow}
              accessibilityRole="link"
            >
              <View style={styles.settingLeft}>
                <Ionicons name="logo-github" size={20} color={colors.primary} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  {t.settings.repository}
                </Text>
              </View>
              <Ionicons name="open-outline" size={18} color={colors.textFaint} />
            </Pressable>

            <Divider colors={colors} />

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="heart-outline" size={20} color={colors.error} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  {t.settings.credits}
                </Text>
              </View>
              <Text style={[styles.settingValue, { color: colors.textFaint }]}>
                Michel Rodrigues
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

function SectionHeader({
  label,
  colors,
}: {
  label: string;
  colors: ReturnType<typeof useThemeColors>;
}) {
  return (
    <Text style={[styles.sectionHeader, { color: colors.textFaint }]}>{label.toUpperCase()}</Text>
  );
}

function Divider({ colors }: { colors: ReturnType<typeof useThemeColors> }) {
  return <View style={[styles.divider, { backgroundColor: colors.border }]} />;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 60, paddingTop: Spacing.sm },
  backBtn: { padding: Spacing.xs },

  sectionHeader: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.8,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  group: {
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  divider: { height: StyleSheet.hairlineWidth, marginHorizontal: Spacing.md },

  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    minHeight: 52,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  settingLabel: { fontSize: FontSize.md, fontWeight: FontWeight.medium },
  settingDesc: { fontSize: FontSize.xs, marginTop: 1 },
  settingValue: { fontSize: FontSize.sm },

  segmentRow: {
    flexDirection: 'row',
    padding: Spacing.sm,
    gap: Spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  segmentText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },

  accentRow: {
    flexDirection: 'row',
    padding: Spacing.sm,
    gap: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  accentBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  accentSwatch: { width: 32, height: 32, borderRadius: 16 },
  accentLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
});
