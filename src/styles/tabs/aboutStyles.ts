import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 0,
  },
  header: {
    position: 'relative',
  },
  heroGradient: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: FontSize.display,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    marginTop: Spacing.md,
  },
  heroSubtitle: {
    fontSize: FontSize.lg,
    color: '#FFFFFF',
    marginTop: Spacing.xs,
    opacity: 0.9,
  },
  content: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  cardText: {
    fontSize: FontSize.md,
    lineHeight: 24,
  },
  linksContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  linkButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  linkText: {
    color: '#FFFFFF',
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  footer: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
  footerText: {
    fontSize: FontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
});
