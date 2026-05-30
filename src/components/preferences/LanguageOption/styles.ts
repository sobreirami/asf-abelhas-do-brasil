import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';
import { StyleSheet } from 'react-native';

export function createStyles(colors: (typeof Colors)['light']) {
  return StyleSheet.create({
    optionButton: {
      marginBottom: 0,
    },
    optionContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: Spacing.md,
      borderRadius: BorderRadius.md,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
    },
    radioOuter: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.md,
    },
    radioInner: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    optionText: {
      fontSize: FontSize.md,
      color: colors.text,
      fontWeight: FontWeight.medium,
    },
  });
}
