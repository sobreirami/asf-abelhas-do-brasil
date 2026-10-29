import { Colors } from '@/constants/theme';

type ThemeColors = typeof Colors.light;

export const getStatusColor = (status: string, colors: ThemeColors): string => {
  const statusMap: Record<string, string> = {
    'least-concern': colors.success,
    vulnerable: colors.warning,
    endangered: colors.error,
    'critically-endangered': colors.error,
    'data-deficient': colors.icon,
    'not-evaluated': colors.icon,
  };
  return statusMap[status] || colors.icon;
};
