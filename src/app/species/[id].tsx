import Ionicons, { type IoniconsIconName } from '@react-native-vector-icons/ionicons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import PhotoCarousel from '@/components/species/PhotoCarousel';
import { Chip } from '@/components/ui';
import { SkeletonSpeciesDetail } from '@/components/ui/SkeletonLoader';
import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';
import { useFilter } from '@/contexts/FilterContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { fetchSpeciesById } from '@/services/speciesService';
import { Species } from '@/types/species';

import { triggerHaptic, triggerNotificationHaptic } from '@/utils/haptics';
import { ImpactFeedbackStyle, NotificationFeedbackType } from 'expo-haptics';
import {
  addFavorite,
  removeFavorite,
  isFavorite as checkIsFavorite,
} from '@/services/favoritesService';

const HEADER_HEIGHT = 320;

const CONSERVATION_COLORS: Record<string, string> = {
  'least-concern': '#6FCF73',
  vulnerable: '#FFCB4D',
  endangered: '#F0726A',
  'critically-endangered': '#F0726A',
  'data-deficient': '#9EAB90',
};

export default function SpeciesDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { t } = useLanguage();
  const { setPendingTagFilter, setActiveFilters } = useFilter();

  const [species, setSpecies] = useState<Species | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');

  useEffect(() => {
    if (!id) return;
    fetchSpeciesById(id as string)
      .then((data) => {
        setSpecies(data);
        if (data) {
          checkIsFavorite(data.id).then(setIsFavorite);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleToggleFavorite = async () => {
    if (!species) return;
    await triggerHaptic(ImpactFeedbackStyle.Medium);
    if (isFavorite) {
      await removeFavorite(species.id);
      setIsFavorite(false);
    } else {
      await addFavorite(species);
      setIsFavorite(true);
    }
  };

  const handleShare = async () => {
    if (!species) return;
    await triggerHaptic(ImpactFeedbackStyle.Light);
    try {
      const { Share } = await import('react-native');
      await Share.share({
        message: `Conheça ${species.commonName} (${species.scientificName}) - Uma abelha nativa do Brasil!`,
      });
    } catch {}
  };

  const handleOpenExternalLink = (url: string) => {
    Alert.alert(t.species.externalLinkTitle, t.species.externalLinkMessage, [
      {
        text: t.common.cancel,
        style: 'cancel',
        onPress: () => triggerNotificationHaptic(NotificationFeedbackType.Warning),
      },
      {
        text: t.species.externalLinkContinue,
        onPress: async () => {
          await triggerHaptic(ImpactFeedbackStyle.Light);
          Linking.openURL(url);
        },
      },
    ]);
  };

  const handleOpenImage = async (imageUrl: string) => {
    await triggerHaptic(ImpactFeedbackStyle.Medium);
    setSelectedImage(imageUrl);
    setImageModalVisible(true);
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: '', headerShown: true, headerTransparent: true }} />
        <SkeletonSpeciesDetail />
      </>
    );
  }

  if (!species) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }, styles.centered]}>
        <Text style={[styles.errorText, { color: colors.text }]}>{t.species.notFound}</Text>
      </View>
    );
  }

  const conservationKey = species.conservationStatus as keyof typeof t.conservation;
  const conservationLabel = conservationKey ? t.conservation[conservationKey] : '';
  const badgeColor = CONSERVATION_COLORS[species.conservationStatus ?? ''] ?? colors.icon;

  return (
    <>
      <Stack.Screen options={{ title: '', headerShown: false }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header full-bleed */}
          <View style={styles.headerContainer}>
            <Image
              source={{ uri: species.photos.original }}
              style={styles.headerImage}
              contentFit="cover"
              transition={300}
            />
            {/* Gradiente de proteção */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.72)']}
              style={styles.headerGradient}
            />

            {/* Botões flutuantes */}
            <View style={[styles.floatingBtns, { top: Platform.OS === 'ios' ? 56 : 36 }]}>
              <GlassButton
                icon="chevron-back"
                onPress={async () => {
                  await triggerHaptic(ImpactFeedbackStyle.Light);
                  router.back();
                }}
              />
              <View style={styles.floatingRight}>
                <GlassButton
                  icon={isFavorite ? 'heart' : 'heart-outline'}
                  active={isFavorite}
                  onPress={handleToggleFavorite}
                />
                <GlassButton icon="share-outline" onPress={handleShare} />
              </View>
            </View>

            {/* Nome sobreposto */}
            <View style={styles.headerNameArea}>
              {conservationLabel ? (
                <View style={[styles.consBadge, { backgroundColor: badgeColor }]}>
                  <View style={styles.consBadgeDot} />
                  <Text style={styles.consBadgeText}>{conservationLabel}</Text>
                </View>
              ) : null}
              <Text style={styles.headerCommonName}>{species.commonName}</Text>
              <Text style={styles.headerScientificName}>{species.scientificName}</Text>
            </View>
          </View>

          {/* Corpo em sheet arredondado */}
          <View style={[styles.sheet, { backgroundColor: colors.background }]}>
            {/* Nome selecionável no body (acessível) */}
            <Text selectable style={[styles.sheetCommonName, { color: colors.text }]}>
              {species.commonName}
            </Text>
            <Text selectable style={[styles.sheetScientificName, { color: colors.textMuted }]}>
              {species.scientificName}
            </Text>
            {/* Resumo */}
            <Animated.View entering={FadeInDown.delay(100)}>
              <Text selectable style={[styles.summary, { color: colors.text }]}>
                {species.shortDescription}
              </Text>
            </Animated.View>

            {/* 3 stat tiles */}
            <Animated.View entering={FadeInDown.delay(150)} style={styles.statRow}>
              <StatTile
                icon="resize"
                label={t.species.size}
                value={`${species.sizeMm} mm`}
                colors={colors}
              />
              <StatTile
                icon="happy"
                label={t.species.behavior}
                value={species.behavior}
                colors={colors}
              />
              <StatTile
                icon="home"
                label={t.species.nestType}
                value={species.nest.split(',')[0].trim()}
                colors={colors}
              />
            </Animated.View>

            {/* Sobre a espécie */}
            <Animated.View entering={FadeInDown.delay(200)}>
              <DetailSection icon="book-outline" title={t.species.aboutTitle} colors={colors}>
                <Text selectable style={[styles.bodyText, { color: colors.textMuted }]}>
                  {species.longDescription}
                </Text>
              </DetailSection>
            </Animated.View>

            {/* Biomas */}
            {species.biomes && species.biomes.length > 0 && (
              <Animated.View entering={FadeInDown.delay(250)}>
                <DetailSection icon="earth-outline" title={t.species.biomes} colors={colors}>
                  <View style={styles.chipsWrap}>
                    {species.biomes.map((b, i) => (
                      <Chip
                        key={i}
                        label={b}
                        onPress={() => {
                          setActiveFilters((prev) => ({ ...prev, biomes: [b] }));
                          router.back();
                        }}
                      />
                    ))}
                  </View>
                </DetailSection>
              </Animated.View>
            )}

            {/* Onde ocorre */}
            {species.regions && species.regions.length > 0 && (
              <Animated.View entering={FadeInDown.delay(300)}>
                <DetailSection icon="location-outline" title={t.species.regions} colors={colors}>
                  <View style={styles.chipsWrap}>
                    {species.regions.map((r, i) => (
                      <Chip
                        key={i}
                        label={r}
                        onPress={() => {
                          setActiveFilters((prev) => ({ ...prev, regions: [r] }));
                          router.back();
                        }}
                      />
                    ))}
                  </View>
                </DetailSection>
              </Animated.View>
            )}

            {/* Nidificação */}
            <Animated.View entering={FadeInDown.delay(350)}>
              <DetailSection icon="construct-outline" title={t.species.nesting} colors={colors}>
                <Text selectable style={[styles.bodyText, { color: colors.textMuted }]}>
                  {species.nest}
                </Text>
              </DetailSection>
            </Animated.View>

            {/* Plantas favoritas */}
            {species.favoredPlants && species.favoredPlants.length > 0 && (
              <Animated.View entering={FadeInDown.delay(400)}>
                <DetailSection
                  icon="flower-outline"
                  title={t.species.favoredPlants}
                  colors={colors}
                >
                  <View style={styles.plantsList}>
                    {species.favoredPlants.map((plant, i) => (
                      <View
                        key={i}
                        style={[
                          styles.plantRow,
                          { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
                        ]}
                      >
                        <View
                          style={[styles.plantIcon, { backgroundColor: colors.secondary + '28' }]}
                        >
                          <Ionicons name="leaf" size={18} color={colors.secondary} />
                        </View>
                        <Text selectable style={[styles.plantName, { color: colors.text }]}>
                          {plant}
                        </Text>
                      </View>
                    ))}
                  </View>
                </DetailSection>
              </Animated.View>
            )}

            {/* Tags */}
            <Animated.View entering={FadeInDown.delay(450)}>
              <View style={styles.tagsWrap}>
                {species.tags.map((tag, i) => (
                  <Chip
                    key={i}
                    label={tag}
                    prefix="#"
                    onPress={() => {
                      setPendingTagFilter(tag);
                      router.back();
                    }}
                  />
                ))}
              </View>
            </Animated.View>

            {/* Carrossel de fotos */}
            {species.photoGallery && species.photoGallery.length > 0 && (
              <PhotoCarousel
                photos={species.photoGallery}
                delay={500}
                onImagePress={handleOpenImage}
              />
            )}

            {/* Artigos científicos */}
            {species.scientificArticles && species.scientificArticles.length > 0 && (
              <Animated.View entering={FadeInDown.delay(550)}>
                <DetailSection
                  icon="document-text-outline"
                  title={t.species.scientificArticles}
                  colors={colors}
                >
                  {species.scientificArticles.map((article, i) => (
                    <Pressable
                      key={i}
                      onPress={() => handleOpenExternalLink(article.url)}
                      style={[
                        styles.articleCard,
                        { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
                      ]}
                    >
                      <Ionicons name="document-text" size={22} color={colors.primary} />
                      <Text style={[styles.articleTitle, { color: colors.text }]} selectable>
                        {article.title}
                      </Text>
                      <Ionicons name="open-outline" size={18} color={colors.textFaint} />
                    </Pressable>
                  ))}
                </DetailSection>
              </Animated.View>
            )}

            {/* Report */}
            <Pressable
              onPress={async () => {
                await triggerHaptic(ImpactFeedbackStyle.Light);
                router.push({
                  pathname: '/report',
                  params: { speciesId: species.id, speciesName: species.commonName },
                });
              }}
              style={[styles.reportBtn, { backgroundColor: colors.surfaceElevated }]}
            >
              <Ionicons name="alert-circle-outline" size={18} color={colors.textFaint} />
              <Text style={[styles.reportText, { color: colors.textFaint }]}>
                {t.species.reportError}
              </Text>
            </Pressable>
          </View>
        </ScrollView>

        {/* Image Viewer Modal */}
        <Modal
          visible={imageModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setImageModalVisible(false)}
        >
          <View style={styles.imageModalContainer}>
            <BlurView intensity={90} tint="dark" style={styles.imageModalBlur}>
              <Pressable
                style={[styles.imageModalClose, { backgroundColor: colors.overlay }]}
                onPress={async () => {
                  await triggerHaptic(ImpactFeedbackStyle.Light);
                  setImageModalVisible(false);
                }}
              >
                <Ionicons name="close" size={32} color={colors.onOverlay} />
              </Pressable>
              <Image
                source={{ uri: selectedImage }}
                style={styles.fullImage}
                contentFit="contain"
                transition={300}
              />
              <Text style={[styles.imageHint, { color: colors.onOverlay }]}>
                {t.species.imageZoomHint}
              </Text>
            </BlurView>
          </View>
        </Modal>
      </View>
    </>
  );
}

function GlassButton({
  icon,
  onPress,
  active = false,
}: {
  icon: IoniconsIconName;
  onPress: () => void;
  active?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={styles.glassBtn} accessibilityRole="button">
      <BlurView intensity={60} tint="dark" style={styles.glassBtnBlur}>
        <Ionicons name={icon} size={21} color={active ? '#F0726A' : '#ffffff'} />
      </BlurView>
    </Pressable>
  );
}

function StatTile({
  icon,
  label,
  value,
  colors,
}: {
  icon: IoniconsIconName;
  label: string;
  value: string;
  colors: (typeof Colors)['dark'];
}) {
  return (
    <View
      style={[
        styles.statTile,
        { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
      ]}
    >
      <Ionicons name={icon} size={22} color={colors.primary} />
      <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.statValue, { color: colors.text }]} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

function DetailSection({
  icon,
  title,
  children,
  colors,
}: {
  icon: IoniconsIconName;
  title: string;
  children: React.ReactNode;
  colors: (typeof Colors)['dark'];
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={18} color={colors.primary} />
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: FontSize.lg },

  // Header full-bleed
  headerContainer: {
    height: HEADER_HEIGHT,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
  floatingBtns: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 3,
  },
  floatingRight: { flexDirection: 'row', gap: 10 },
  glassBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  glassBtnBlur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerNameArea: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 18,
    zIndex: 3,
  },
  consBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    marginBottom: 10,
  },
  consBadgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#1B1F0E',
    opacity: 0.7,
  },
  consBadgeText: {
    fontSize: 12,
    fontWeight: FontWeight.bold,
    color: '#1B1F0E',
  },
  headerCommonName: {
    fontSize: 32,
    fontWeight: FontWeight.bold,
    color: '#ffffff',
    lineHeight: 36,
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  headerScientificName: {
    fontSize: FontSize.md,
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.9)',
    marginTop: 3,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },

  // Sheet
  sheet: {
    marginTop: -18,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  summary: {
    fontSize: 16.5,
    fontWeight: FontWeight.medium,
    lineHeight: 26,
    marginBottom: Spacing.lg,
  },

  // Stats
  statRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: Spacing.xl,
  },
  statTile: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 15,
    paddingHorizontal: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  statLabel: { fontSize: 11.5, fontWeight: FontWeight.medium, textAlign: 'center' },
  statValue: {
    fontSize: 14.5,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
    lineHeight: 18,
  },

  // Sections
  section: { marginTop: Spacing.lg },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  bodyText: { fontSize: 15.5, lineHeight: 25 },

  // Chips
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },

  // Plants
  plantsList: { gap: 9 },
  plantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  plantIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plantName: { fontSize: 15.5, fontWeight: FontWeight.semibold, flex: 1 },

  // Tags
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: Spacing.xl,
  },

  // Articles
  articleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  articleTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    flex: 1,
  },

  // Sheet names (selecionáveis)
  sheetCommonName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: '#EEF3E6',
    marginBottom: 2,
  },
  sheetScientificName: {
    fontSize: FontSize.sm,
    fontStyle: 'italic',
    marginBottom: Spacing.md,
  },

  // Report
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xl,
    gap: Spacing.xs,
  },
  reportText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },

  // Image modal
  imageModalContainer: { flex: 1 },
  imageModalBlur: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imageModalClose: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: { width: '90%', height: '70%' },
  imageHint: { fontSize: FontSize.sm, marginTop: Spacing.lg, opacity: 0.7 },
});
