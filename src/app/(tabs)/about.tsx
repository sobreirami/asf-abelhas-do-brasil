import Ionicons from '@react-native-vector-icons/ionicons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import HoneycombPattern from '@/components/ui/HoneycombPattern';
import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function AboutScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero */}
        <View style={styles.hero}>
          <HoneycombPattern opacity={0.06} color={colors.primary} />
          <Pressable
            onPress={() => router.push('/settings')}
            style={[
              styles.settingsBtn,
              { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Configurações"
          >
            <Ionicons name="settings-outline" size={21} color={colors.text} />
          </Pressable>
          <View style={styles.heroInner}>
            <Image
              source={require('../../../assets/images/icon-transparent.png')}
              style={styles.mascot}
              contentFit="contain"
            />
            <Text style={[styles.heroTitle, { color: colors.text }]}>ASF Abelhas do Brasil</Text>
            <Text style={[styles.heroSubtitle, { color: colors.textMuted }]}>
              Um guia de bolso das abelhas sem ferrão nativas — para conhecer, valorizar e proteger.
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          <InfoCard
            emoji="🐝"
            title="Abelhas Sem Ferrão"
            text="As abelhas sem ferrão (meliponíneos) são nativas do Brasil e vivem em colônias organizadas. Mansas e seguras de criar, são peças-chave da meliponicultura."
            colors={colors}
          />

          <InfoCard
            emoji="🌱"
            title="Por que são importantes?"
            text="Polinizam plantas nativas e cultivos agrícolas, sustentando a biodiversidade e a produção de alimentos. Sem elas, ecossistemas inteiros entram em colapso."
            colors={colors}
          />

          {/* Destaque conservação */}
          <View
            style={[
              styles.conservationCard,
              { backgroundColor: colors.error + '1F', borderColor: colors.error + '4D' },
            ]}
          >
            <View style={styles.conservationHeader}>
              <Ionicons name="shield-checkmark" size={22} color={colors.error} />
              <Text style={[styles.conservationTitle, { color: colors.text }]}>
                Status de Conservação
              </Text>
            </View>
            <Text style={[styles.conservationText, { color: colors.textMuted }]}>
              Muitas espécies estão ameaçadas pelo desmatamento, agrotóxicos e perda de habitat.
              Conhecer cada uma é o primeiro passo para protegê-las.
            </Text>
          </View>

          {/* Créditos */}
          <View
            style={[
              styles.creditsCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.creditsTagline, { color: colors.textMuted }]}>
              Feito com ❤️ para a biodiversidade brasileira
            </Text>
            <View style={styles.socialRow}>
              <SocialButton
                icon="logo-github"
                label="GitHub"
                onPress={() =>
                  Linking.openURL('https://github.com/sobreirami/asf-abelhas-do-brasil')
                }
                colors={colors}
              />
              <SocialButton
                icon="logo-linkedin"
                label="LinkedIn"
                onPress={() => Linking.openURL('https://linkedin.com')}
                colors={colors}
              />
              <SocialButton icon="globe-outline" label="Site" onPress={() => {}} colors={colors} />
            </View>
            <Text style={[styles.version, { color: colors.textFaint }]}>
              Versão 1.0 · Projeto educativo
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoCard({
  emoji,
  title,
  text,
  colors,
}: {
  emoji: string;
  title: string;
  text: string;
  colors: (typeof Colors)['dark'];
}) {
  return (
    <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.infoCardHeader}>
        <Text style={styles.infoEmoji}>{emoji}</Text>
        <Text style={[styles.infoTitle, { color: colors.text }]}>{title}</Text>
      </View>
      <Text style={[styles.infoText, { color: colors.textMuted }]}>{text}</Text>
    </View>
  );
}

function SocialButton({
  icon,
  label,
  onPress,
  colors,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  colors: (typeof Colors)['dark'];
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.socialBtn,
        { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
      ]}
      accessibilityRole="button"
    >
      <Ionicons name={icon as never} size={22} color={colors.primary} />
      <Text style={[styles.socialLabel, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 120 },

  hero: {
    position: 'relative',
    overflow: 'hidden',
    paddingHorizontal: 20,
    paddingBottom: 26,
    paddingTop: Spacing.sm,
    alignItems: 'center',
  },
  settingsBtn: {
    position: 'absolute',
    top: Spacing.sm,
    right: 20,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  heroInner: { position: 'relative', alignItems: 'center' },
  mascot: { width: 130, height: 130 },
  heroTitle: {
    fontSize: 27,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.4,
    marginTop: 18,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 15.5,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 290,
    marginTop: Spacing.sm,
  },

  content: { paddingHorizontal: 20, gap: 16, paddingBottom: Spacing.lg },

  infoCard: { borderRadius: 20, padding: 18, borderWidth: 1 },
  infoCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 9 },
  infoEmoji: { fontSize: 22 },
  infoTitle: { fontSize: 18, fontWeight: FontWeight.bold },
  infoText: { fontSize: 15, lineHeight: 23 },

  conservationCard: { borderRadius: 20, padding: 18, borderWidth: 1 },
  conservationHeader: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 9 },
  conservationTitle: { fontSize: 18, fontWeight: FontWeight.bold },
  conservationText: { fontSize: 15, lineHeight: 23 },

  creditsCard: { borderRadius: 20, padding: 18, borderWidth: 1, alignItems: 'center' },
  creditsTagline: { fontSize: 13, fontWeight: FontWeight.semibold },
  socialRow: { flexDirection: 'row', gap: 12, marginTop: 14, width: '100%' },
  socialBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  socialLabel: { fontSize: 12.5, fontWeight: FontWeight.semibold },
  version: { fontSize: FontSize.xs, marginTop: 16 },
});
