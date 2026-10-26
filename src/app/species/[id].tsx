import Ionicons, { type IoniconsIconName } from '@react-native-vector-icons/ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  GestureDetector,
  GestureHandlerRootView,
  usePanGesture,
  usePinchGesture,
  useSimultaneousGestures,
  useTapGesture,
} from 'react-native-gesture-handler';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

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
  const insets = useSafeAreaInsets();

  const [species, setSpecies] = useState<Species | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [headerImageError, setHeaderImageError] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchSpeciesById(id as string)
      .then((data) => {
        setSpecies(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleShare = async () => {
    if (!species) return;
    await triggerHaptic(ImpactFeedbackStyle.Light);
    try {
      const url = `https://asfabelhasdobrasil.com.br/species/${id}`;
      await Share.share({
        message: `${species.commonName} (${species.scientificName})\n\n${species.shortDescription}\n\n${t.species.shareOpenIn} ${url}`,
        url, // iOS usa este campo para link clicável no iMessage e WhatsApp
      });
    } catch (error) {
      if (__DEV__) console.warn('Share error:', error);
    }
  };

  const handleOpenExternalLink = (url: string) => {
    Alert.alert(t.common.externalLinkTitle, t.common.externalLinkMessage, [
      {
        text: t.common.cancel,
        style: 'cancel',
        onPress: () => triggerNotificationHaptic(NotificationFeedbackType.Warning),
      },
      {
        text: t.common.externalLinkContinue,
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
              source={
                species.photos?.original && !headerImageError
                  ? { uri: species.photos.original }
                  : require('../../../assets/images/bee-default.png')
              }
              style={styles.headerImage}
              contentFit="cover"
              transition={300}
              onError={() => setHeaderImageError(true)}
            />
            {/* Gradiente de proteção */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.72)']}
              style={styles.headerGradient}
            />

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

            {/* Caixa Racional */}
            {species.rationalBox ? (
              <Animated.View entering={FadeInDown.delay(375)}>
                <DetailSection icon="cube-outline" title={t.species.rationalBox} colors={colors}>
                  <Text selectable style={[styles.bodyText, { color: colors.textMuted }]}>
                    {species.rationalBox}
                  </Text>
                </DetailSection>
              </Animated.View>
            ) : null}

            {/* Ninho Isca */}
            {species.trapNest ? (
              <Animated.View entering={FadeInDown.delay(390)}>
                <DetailSection icon="magnet-outline" title={t.species.trapNest} colors={colors}>
                  <Text selectable style={[styles.bodyText, { color: colors.textMuted }]}>
                    {species.trapNest}
                  </Text>
                </DetailSection>
              </Animated.View>
            ) : null}

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

            {/* Carrossel de fotos — prefere iNaturalist (com créditos), cai em photoGallery */}
            {(() => {
              const inatPhotos = (species.iNaturalistPhotos ?? []).filter((p) => !!p.url);
              const galleryPhotos = (species.photoGallery ?? []).filter((url) => !!url);
              const hasInat = inatPhotos.length > 0;
              const hasGallery = galleryPhotos.length > 0;
              if (!hasInat && !hasGallery) return null;
              return (
                <PhotoCarousel
                  photos={hasInat ? inatPhotos.map((p) => p.url) : galleryPhotos}
                  credits={hasInat ? inatPhotos : undefined}
                  delay={500}
                  onImagePress={handleOpenImage}
                  onExternalLinkPress={handleOpenExternalLink}
                />
              );
            })()}

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

        {/* Botões flutuantes fixos (fora do scroll) */}
        <View style={[styles.floatingBtns, { top: insets.top + 12 }]}>
          <GlassButton
            icon="chevron-back"
            onPress={async () => {
              await triggerHaptic(ImpactFeedbackStyle.Light);
              router.back();
            }}
          />
          <View style={styles.floatingRight}>
            <GlassButton icon="share-outline" onPress={handleShare} />
          </View>
        </View>

        {/* Image Viewer Modal */}
        <Modal
          visible={imageModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setImageModalVisible(false)}
        >
          <GestureHandlerRootView style={styles.imageModalContainer}>
            <BlurView intensity={90} tint="dark" style={styles.imageModalBlur}>
              <Pressable
                style={[
                  styles.imageModalClose,
                  { backgroundColor: colors.overlay, top: insets.top + 16 },
                ]}
                onPress={async () => {
                  await triggerHaptic(ImpactFeedbackStyle.Light);
                  setImageModalVisible(false);
                }}
              >
                <Ionicons name="close" size={32} color={colors.onOverlay} />
              </Pressable>
              <ZoomableImage uri={selectedImage} placeholderColor={colors.skeletonBase} />
              <Text style={[styles.imageHint, { color: colors.onOverlay }]}>
                {t.species.imageZoomHint}
              </Text>
            </BlurView>
          </GestureHandlerRootView>
        </Modal>
      </View>
    </>
  );
}

function ZoomableImage({ uri, placeholderColor }: { uri: string; placeholderColor: string }) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const pinchGesture = usePinchGesture({
    onUpdate: (e) => {
      scale.set(Math.max(1, Math.min(savedScale.get() * e.scale, 5)));
    },
    onDeactivate: () => {
      savedScale.set(scale.get());
      if (scale.get() <= 1) {
        scale.set(withSpring(1));
        translateX.set(withSpring(0));
        translateY.set(withSpring(0));
        savedScale.set(1);
        savedTranslateX.set(0);
        savedTranslateY.set(0);
      }
    },
  });

  const panGesture = usePanGesture({
    onUpdate: (e) => {
      if (scale.get() > 1) {
        translateX.set(savedTranslateX.get() + e.translationX);
        translateY.set(savedTranslateY.get() + e.translationY);
      }
    },
    onDeactivate: () => {
      savedTranslateX.set(translateX.get());
      savedTranslateY.set(translateY.get());
    },
  });

  const doubleTapGesture = useTapGesture({
    numberOfTaps: 2,
    onDeactivate: () => {
      if (scale.get() > 1) {
        scale.set(withSpring(1));
        translateX.set(withSpring(0));
        translateY.set(withSpring(0));
        savedScale.set(1);
        savedTranslateX.set(0);
        savedTranslateY.set(0);
      } else {
        scale.set(withSpring(2.5));
        savedScale.set(2.5);
      }
    },
  });

  const composed = useSimultaneousGestures(pinchGesture, panGesture, doubleTapGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.get() },
      { translateY: translateY.get() },
      { scale: scale.get() },
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[styles.fullImage, animatedStyle]}>
        <Image
          source={{ uri }}
          style={{ width: '100%', height: '100%' }}
          contentFit="contain"
          transition={300}
          placeholder={placeholderColor}
        />
      </Animated.View>
    </GestureDetector>
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
    zIndex: 100,
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
    top: 16,
    right: 20,
    zIndex: 10,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: { width: '90%', height: '70%', overflow: 'hidden' },
  imageHint: { fontSize: FontSize.sm, marginTop: Spacing.lg, opacity: 0.7 },
});
