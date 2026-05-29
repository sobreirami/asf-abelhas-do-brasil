import { ActionButton } from '@/components/preferences/ActionButton';
import { LanguageSelector } from '@/components/preferences/LanguageSelector';
import { ThemeSelector } from '@/components/preferences/ThemeSelector';
import { Colors } from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useColorScheme as useDeviceColorScheme } from '@/hooks/useColorScheme';
import { clearAllCache } from '@/services/cacheService';
import { clearFavorites } from '@/services/favoritesService';
import {
  LanguageCode,
  getLanguagePreference,
  saveLanguagePreference,
} from '@/services/languageService';
import {
  ThemePreference,
  clearPreferences,
  getThemePreference,
  saveThemePreference,
} from '@/services/preferencesService';
import { storageAdapter } from '@/services/storage';
import { styles } from '@/styles/tabs/preferencesStyles';
import Constants from 'expo-constants';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PreferencesScreen() {
  const colorScheme = useDeviceColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme ?? 'light'];
  const { setThemePreference } = useTheme();
  const { t, setLanguagePreference: setLanguagePref } = useLanguage();

  const [selectedTheme, setSelectedTheme] = useState<ThemePreference>('auto');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>('auto');

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    const themePreference = await getThemePreference();
    const languagePreference = await getLanguagePreference();
    setSelectedTheme(themePreference);
    setSelectedLanguage(languagePreference);
  };

  const handleThemeChange = async (newTheme: ThemePreference) => {
    setSelectedTheme(newTheme);
    await saveThemePreference(newTheme);
    setThemePreference(newTheme);
  };

  const handleLanguageChange = async (newLanguage: LanguageCode) => {
    setSelectedLanguage(newLanguage);
    await saveLanguagePreference(newLanguage);
    setLanguagePref(newLanguage);
  };

  const handleClearCache = () => {
    Alert.alert(t.alerts.clearCacheTitle, t.alerts.clearCacheMessage, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.filters.clear,
        style: 'destructive',
        onPress: async () => {
          await clearAllCache();
          Alert.alert(t.common.success, t.alerts.clearCacheSuccess);
        },
      },
    ]);
  };

  const handleClearAllData = () => {
    Alert.alert(t.alerts.clearAllDataTitle, t.alerts.clearAllDataMessage, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.alerts.clearAllDataConfirm,
        style: 'destructive',
        onPress: async () => {
          await clearAllCache();
          await clearFavorites();
          await clearPreferences();
          await storageAdapter.removeItem('@onboarding_completed');

          Alert.alert(t.alerts.dataCleared, t.alerts.dataClearedMessage, [{ text: t.common.ok }]);
        },
      },
    ]);
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.container, isDark && styles.containerDark]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, isDark && styles.titleDark]}>{t.preferences.title}</Text>
          <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
            {t.preferences.subtitle}
          </Text>
        </View>

        {/* Tema */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            {t.preferences.appearance}
          </Text>
          <Text style={[styles.sectionDescription, isDark && styles.sectionDescriptionDark]}>
            {t.preferences.appearanceDescription}
          </Text>

          <ThemeSelector
            selectedTheme={selectedTheme}
            isDark={isDark}
            primaryColor={colors.primary}
            labels={t.theme}
            onThemeChange={handleThemeChange}
          />
        </View>

        {/* Idioma */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            {t.preferences.language}
          </Text>
          <Text style={[styles.sectionDescription, isDark && styles.sectionDescriptionDark]}>
            {t.preferences.languageDescription}
          </Text>

          <LanguageSelector
            selectedLanguage={selectedLanguage}
            isDark={isDark}
            primaryColor={colors.primary}
            labels={t.language}
            onLanguageChange={handleLanguageChange}
          />
        </View>

        {/* Dados */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            {t.preferences.dataStorage}
          </Text>
          <Text style={[styles.sectionDescription, isDark && styles.sectionDescriptionDark]}>
            {t.preferences.dataStorageDescription}
          </Text>

          <ActionButton
            title={t.preferences.clearCache}
            onPress={handleClearCache}
            isDark={isDark}
          />
          <ActionButton
            title={t.preferences.clearAllData}
            onPress={handleClearAllData}
            isDark={isDark}
            danger
          />
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <Text style={[styles.infoText, isDark && styles.infoTextDark]}>
            {t.preferences.offlineInfo}
          </Text>
        </View>

        {/* Versão */}
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, isDark && styles.versionTextDark]}>
            Versão {Constants.expoConfig?.version || '1.0.0'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
