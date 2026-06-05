import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';
import { Dimensions, StyleSheet } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const IMAGE_WIDTH = SCREEN_WIDTH - Spacing.lg * 2;
export const IMAGE_HEIGHT = 300;

export const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  imageWrapper: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
  },
  creditContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  creditText: {
    fontSize: FontSize.xs,
    opacity: 0.6,
    lineHeight: 16,
  },
  inatLink: {
    marginTop: Spacing.xs,
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
  },
  inatLinkText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
});
