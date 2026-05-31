import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useMemo } from 'react';

export function useThemeColors() {
  const { colorScheme, primaryColor } = useTheme();
  return useMemo(
    () => ({
      ...Colors[colorScheme],
      primary: primaryColor,
      tint: primaryColor,
      tabIconSelected: primaryColor,
    }),
    [colorScheme, primaryColor]
  );
}
