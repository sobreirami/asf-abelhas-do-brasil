import { ImpactFeedbackStyle, triggerHaptic } from '@/utils/haptics';
import Ionicons from '@react-native-vector-icons/ionicons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import React from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ImportanceCard } from '@/components/about/ImportanceCard';
import { Colors, FontWeight, Shadows } from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { styles } from '@/styles/screens/tabs/aboutStyles';

const LINKEDIN_BLUE = '#0A66C2' as const;

export default function AboutScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useLanguage();

  const handleLink = async (url: string) => {
    await triggerHaptic(ImpactFeedbackStyle.Light);
    Linking.openURL(url);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          title: '',
          headerRight: () => (
            <Pressable
              onPress={async () => {
                await triggerHaptic(ImpactFeedbackStyle.Light);
                router.push('/settings');
              }}
              style={{ padding: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Configurações"
            >
              <Ionicons name="settings-outline" size={22} color={colors.onOverlay} />
            </Pressable>
          ),
        }}
      />
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <Animated.View entering={FadeInDown.delay(100)} style={styles.heroContent}>
              <View style={styles.heroLogoContainer}>
                <Image
                  source={require('../../../assets/images/icon-transparent.png')}
                  style={styles.heroLogo}
                  contentFit="contain"
                />
              </View>
              <Text style={[styles.heroTitle, { color: colors.onOverlay }]}>{t.about.title}</Text>
              <Text style={[styles.heroSubtitle, { color: colors.onOverlay }]}>
                {t.about.subtitle}
              </Text>
            </Animated.View>
          </LinearGradient>
        </View>

        <View style={styles.content}>
          <Animated.View entering={FadeInDown.delay(200)}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t.about.stinglessBeesTitle}
            </Text>
            <View style={[styles.card, { backgroundColor: colors.card }, Shadows.sm]}>
              <Text style={[styles.cardText, { color: colors.text }]}>
                {t.about.stinglessBeesDescription}
              </Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300)}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t.about.importanceTitle}
            </Text>

            <ImportanceCard
              icon="leaf"
              title={t.about.pollinationTitle}
              description={t.about.pollinationDescription}
              colors={colors}
            />

            <ImportanceCard
              icon="globe"
              title={t.about.biodiversityTitle}
              description={t.about.biodiversityDescription}
              colors={colors}
            />

            <ImportanceCard
              icon="flask"
              title={t.about.medicinalHoneyTitle}
              description={t.about.medicinalHoneyDescription}
              colors={colors}
            />

            <ImportanceCard
              icon="home"
              title={t.about.meliponicultureTitle}
              description={t.about.meliponicultureDescription}
              colors={colors}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400)}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t.about.conservationTitle}
            </Text>
            <View style={[styles.card, { backgroundColor: colors.card }, Shadows.sm]}>
              <Text style={[styles.cardText, { color: colors.text }]}>
                {t.about.conservationDescription}
              </Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(500)}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.about.appTitle}</Text>
            <View style={[styles.card, { backgroundColor: colors.card }, Shadows.sm]}>
              <Text style={[styles.cardText, { color: colors.text }]}>
                {t.about.appDescription}
                {'\n\n'}
                <Text style={{ fontWeight: FontWeight.bold }}>{t.about.appObjective}</Text>{' '}
                {t.about.appObjectiveText}
                {'\n\n'}
                <Text style={{ fontWeight: FontWeight.bold }}>{t.about.techStack}</Text>
                {'\n'}• React Native + Expo SDK 56{'\n'}• TypeScript{'\n'}• Firebase (Firestore +
                Storage){'\n'}• Expo Router (navegação){'\n'}• Reanimated (animações)
              </Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(600)}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t.about.developerTitle}
            </Text>
            <View style={[styles.card, { backgroundColor: colors.card }, Shadows.sm]}>
              <Text style={[styles.cardText, { color: colors.text }]}>
                {t.about.developerDescription}
              </Text>

              <View style={styles.linksContainer}>
                <Pressable
                  onPress={() => handleLink('https://github.com')}
                  style={[styles.linkButton, { backgroundColor: colors.primary }]}
                >
                  <Ionicons name="logo-github" size={20} color={colors.onPrimary} />
                  <Text style={[styles.linkText, { color: colors.onPrimary }]}>GitHub</Text>
                </Pressable>

                <Pressable
                  onPress={() => handleLink('https://linkedin.com')}
                  style={[styles.linkButton, { backgroundColor: LINKEDIN_BLUE }]}
                >
                  <Ionicons name="logo-linkedin" size={20} color={colors.onOverlay} />
                  <Text style={[styles.linkText, { color: colors.onOverlay }]}>LinkedIn</Text>
                </Pressable>
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(700)} style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.icon }]}>
              {t.about.footerVersion}
              {'\n'}
              {t.about.footerDisclaimer}
            </Text>
          </Animated.View>
        </View>
      </ScrollView>
    </>
  );
}
