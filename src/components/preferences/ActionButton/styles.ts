import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';
import { StyleSheet } from 'react-native';

export function createStyles(colors: (typeof Colors)['light']) {
  return StyleSheet.create({
    actionButton: {
      marginBottom: Spacing.sm,
    },
    actionButtonContent: {
      padding: Spacing.md,
      borderRadius: BorderRadius.md,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    actionButtonText: {
      fontSize: FontSize.md,
      fontWeight: FontWeight.semibold,
      color: colors.primary,
    },
    actionButtonDanger: {
      borderColor: colors.error,
    },
    actionButtonTextDanger: {
      color: colors.error,
    },
  });
}
