import Ionicons, { type IoniconsIconName } from '@react-native-vector-icons/ionicons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import PhotoCarousel from '@/components/species/PhotoCarousel';
import { Chip } from '@/components/ui';
import { SkeletonSpeciesDetail } from '@/components/ui/SkeletonLoader';
import { BorderRadius, Colors, FontSize, FontWeight, Shadows, Spacing } from '@/constants/theme';
import { useFilter } from '@/contexts/FilterContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { fetchSpeciesById } from '@/services/speciesService';
import { Species } from '@/types/species';

import { triggerHaptic, triggerNotificationHaptic } from '@/utils/haptics';
import { ImpactFeedbackStyle, NotificationFeedbackType } from 'expo-haptics';

export default function SpeciesDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useLanguage();
  const { setPendingTagFilter } = useFilter();

  const [species, setSpecies] = useState<Species | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');

  useEffect(() => {
    if (!id) return;
    fetchSpeciesById(id as string)
      .then((data) => setSpecies(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleShare = async () => {
    if (!species) return;

    await triggerHaptic(ImpactFeedbackStyle.Light);

    try {
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
  const conservationLabel = conservationKey ? t.conservation[conservationKey] : t.common.error;

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerLeft:
            Platform.OS === 'android'
              ? () => (
                  <Pressable
                    onPress={async () => {
                      await triggerHaptic(ImpactFeedbackStyle.Light);
                      router.back();
                    }}
                    style={{
                      backgroundColor: colors.card + 'DD',
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginLeft: 8,
                    }}
                  >
                    <Ionicons name="arrow-back" size={22} color={colors.text} />
                  </Pressable>
                )
              : undefined,
          headerRight: () => (
            <Pressable
              onPress={handleShare}
              style={
                Platform.OS === 'android'
                  ? {
                      backgroundColor: colors.card + 'DD',
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 8,
                    }
                  : { marginRight: 8 }
              }
            >
              <Ionicons name="share-outline" size={22} color={colors.text} />
            </Pressable>
          ),
        }}
      />
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: species.photos.original }}
            style={styles.image}
            contentFit="cover"
            transition={300}
          />
        </View>

        {/* Conteúdo */}
        <View style={styles.content}>
          <Animated.View entering={FadeInDown.delay(100)}>
            <Text selectable style={[styles.commonName, { color: colors.text }]}>
              {species.commonName}
            </Text>
            <Text selectable style={[styles.scientificName, { color: colors.icon }]}>
              {species.scientificName}
            </Text>
          </Animated.View>

          {/* Botão Report */}
          <Animated.View entering={FadeInDown.delay(150)}>
            <Pressable
              onPress={async () => {
                await triggerHaptic(ImpactFeedbackStyle.Light);
                router.push({
                  pathname: '/report',
                  params: { speciesId: species.id, speciesName: species.commonName },
                });
              }}
              style={[styles.reportButton, { backgroundColor: colors.card }]}
            >
              <Ionicons name="alert-circle-outline" size={18} color={colors.icon} />
              <Text style={[styles.reportText, { color: colors.icon }]}>
                {t.species.reportError}
              </Text>
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200)} style={styles.tagsContainer}>
            {species.tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                prefix="#"
                onPress={() => {
                  setPendingTagFilter(tag);
                  router.back();
                }}
              />
            ))}
          </Animated.View>

          {/* Informações em cards */}
          <Animated.View entering={FadeInDown.delay(300)}>
            <InfoCard
              icon="resize"
              title={t.species.size}
              value={`${species.sizeMm} mm`}
              colors={colors}
            />

            <InfoCard
              icon="leaf"
              title={t.species.behavior}
              value={species.behavior}
              colors={colors}
            />

            <InfoCard icon="home" title={t.species.nestType} value={species.nest} colors={colors} />

            <InfoCard
              icon="location"
              title={t.species.regions}
              value={species.regions.join(', ')}
              colors={colors}
            />

            <InfoCard
              icon="shield-checkmark"
              title={t.species.conservationStatus}
              value={conservationLabel}
              colors={colors}
            />
          </Animated.View>

          {/* Descrição */}
          <Animated.View
            entering={FadeInDown.delay(400)}
            style={[styles.descriptionCard, { backgroundColor: colors.card }, Shadows.sm]}
          >
            <Text style={[styles.descriptionTitle, { color: colors.text }]}>
              {t.species.aboutTitle}
            </Text>
            <Text style={[styles.descriptionText, { color: colors.text }]}>
              {species.longDescription}
            </Text>
          </Animated.View>

          {/* Biomas */}
          {species.biomes && species.biomes.length > 0 && (
            <Animated.View entering={FadeInDown.delay(450)}>
              <InfoCard
                icon="earth"
                title={t.species.biomes}
                value={species.biomes.join(', ')}
                colors={colors}
              />
            </Animated.View>
          )}

          {/* Plantas Favoritas */}
          {species.favoredPlants && species.favoredPlants.length > 0 && (
            <Animated.View
              entering={FadeInDown.delay(500)}
              style={[styles.descriptionCard, { backgroundColor: colors.card }, Shadows.sm]}
            >
              <View style={styles.sectionHeader}>
                <Ionicons name="flower" size={24} color={colors.primary} />
                <Text style={[styles.descriptionTitle, { color: colors.text }]}>
                  {t.species.favoredPlants}
                </Text>
              </View>
              <Text style={[styles.sectionSubtitle, { color: colors.icon }]}>
                {t.species.favoredPlantsDescription}
              </Text>
              <View style={styles.plantsList}>
                {species.favoredPlants.map((plant, index) => (
                  <View key={index} style={styles.plantItem}>
                    <Ionicons name="checkmark-circle" size={20} color={colors.secondary} />
                    <Text selectable style={[styles.plantText, { color: colors.text }]}>
                      {plant}
                    </Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          )}
        </View>

        {/* Carrossel de Fotos */}
        {species.photoGallery && species.photoGallery.length > 0 && (
          <PhotoCarousel photos={species.photoGallery} delay={550} onImagePress={handleOpenImage} />
        )}

        {/* Artigos Científicos */}
        {species.scientificArticles && species.scientificArticles.length > 0 && (
          <Animated.View
            entering={FadeInDown.delay(600)}
            style={[styles.content, styles.articlesSection]}
          >
            <Text style={[styles.articlesTitle, { color: colors.text }]}>
              {t.species.scientificArticles}
            </Text>
            {species.scientificArticles.map((article, index) => (
              <Pressable
                key={index}
                onPress={() => handleOpenExternalLink(article.url)}
                style={[styles.articleCard, { backgroundColor: colors.card }, Shadows.sm]}
              >
                <View style={styles.articleContent}>
                  <Ionicons name="document-text" size={24} color={colors.primary} />
                  <Text selectable style={[styles.articleTitle, { color: colors.text }]}>
                    {article.title}
                  </Text>
                </View>
                <Ionicons name="open-outline" size={20} color={colors.icon} />
              </Pressable>
            ))}
          </Animated.View>
        )}
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
              style={[styles.imageModalCloseButton, { backgroundColor: colors.overlay }]}
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

            <Text style={[styles.imageModalHint, { color: colors.onOverlay }]}>
              {t.species.imageZoomHint}
            </Text>
          </BlurView>
        </View>
      </Modal>
    </>
  );
}

// Componente de card de informação
function InfoCard({
  icon,
  title,
  value,
  colors,
}: {
  icon: IoniconsIconName;
  title: string;
  value: string;
  colors: (typeof Colors)['light'];
}) {
  return (
    <View style={[styles.infoCard, { backgroundColor: colors.card }, Shadows.sm]}>
      <Ionicons name={icon} size={24} color={colors.primary} />
      <View style={styles.infoContent}>
        <Text style={[styles.infoTitle, { color: colors.icon }]}>{title}</Text>
        <Text selectable style={[styles.infoValue, { color: colors.text }]}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Espaço para a tabbar
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    height: 400,
    position: 'relative',
    marginTop: -100, // Compensa o header transparente
    paddingTop: 100, // Espaço para o header
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: Spacing.lg,
  },
  commonName: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.xs,
  },
  scientificName: {
    fontSize: FontSize.lg,
    fontStyle: 'italic',
    marginBottom: Spacing.md,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },
  reportText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    marginTop: Spacing.lg,
  },
  infoCard: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    alignItems: 'center',
    gap: Spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: FontSize.sm,
    marginBottom: Spacing.xs / 2,
  },
  infoValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  descriptionCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  descriptionTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.md,
  },
  descriptionText: {
    fontSize: FontSize.md,
    lineHeight: 24,
  },
  errorText: {
    fontSize: FontSize.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  sectionSubtitle: {
    fontSize: FontSize.sm,
    marginBottom: Spacing.md,
  },
  plantsList: {
    gap: Spacing.sm,
  },
  plantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  plantText: {
    fontSize: FontSize.md,
    flex: 1,
  },
  articlesSection: {
    marginTop: 0,
  },
  articlesTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.md,
  },
  articleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  articleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  articleTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    flex: 1,
  },
  bottomPadding: {
    height: Spacing.xl,
  },
  imageModalContainer: {
    flex: 1,
  },
  imageModalBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalCloseButton: {
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
  fullImage: {
    width: '90%',
    height: '70%',
  },
  imageModalHint: {
    fontSize: FontSize.sm,
    marginTop: Spacing.lg,
    opacity: 0.7,
  },
});
