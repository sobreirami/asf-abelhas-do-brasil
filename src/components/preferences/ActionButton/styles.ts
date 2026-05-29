import { Colors } from '@/constants/theme';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  actionButton: {
    marginBottom: 12,
  },
  actionButtonContent: {
    padding: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  actionButtonTextDark: {
    color: Colors.light.primary,
  },
});
