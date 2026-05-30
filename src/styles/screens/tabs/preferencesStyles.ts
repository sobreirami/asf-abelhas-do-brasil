import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';
import { StyleSheet } from 'react-native';

export function createStyles(colors: (typeof Colors)['light']) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: Spacing.lg,
      paddingBottom: Spacing.xxl * 2,
    },
    header: {
      marginBottom: Spacing.xl,
    },
    title: {
      fontSize: FontSize.xxxl,
      fontWeight: FontWeight.bold,
      color: colors.text,
      marginBottom: Spacing.sm,
    },
    subtitle: {
      fontSize: FontSize.md,
      color: colors.icon,
    },
    section: {
      marginBottom: Spacing.xl,
    },
    sectionTitle: {
      fontSize: FontSize.xxl,
      fontWeight: FontWeight.semibold,
      color: colors.text,
      marginBottom: Spacing.sm,
    },
    sectionDescription: {
      fontSize: FontSize.sm,
      color: colors.icon,
      marginBottom: Spacing.md,
    },
    infoContainer: {
      marginTop: Spacing.lg,
      padding: Spacing.md,
      backgroundColor: `${colors.secondary}1A`,
      borderRadius: BorderRadius.md,
    },
    infoText: {
      fontSize: FontSize.sm,
      color: colors.icon,
      lineHeight: 20,
    },
    versionContainer: {
      marginTop: Spacing.xl,
      alignItems: 'center',
      paddingBottom: Spacing.lg,
    },
    versionText: {
      fontSize: FontSize.xs,
      color: colors.icon,
      fontWeight: FontWeight.medium,
    },
  });
}
