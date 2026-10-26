import { useCallback } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, TextStyle } from 'react-native';

import { Colors, FontSize, FontWeight } from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';
import { useColorScheme } from '@/hooks/useColorScheme';

/**
 * Hook that returns a handler to open any URL with a confirmation Alert
 * before leaving the app. Use this when you need the logic inside a non-text
 * pressable (e.g. an icon button or a card).
 *
 * @example
 * const openExternalLink = useOpenExternalLink();
 * <Pressable onPress={() => openExternalLink(url, () => triggerHaptic())}>…</Pressable>
 */
export function useOpenExternalLink() {
  const { t } = useLanguage();
  return useCallback(
    (url: string, onConfirm?: () => void) => {
      Alert.alert(t.common.externalLinkTitle, t.common.externalLinkMessage, [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.common.externalLinkContinue,
          onPress: () => {
            onConfirm?.();
            Linking.openURL(url);
          },
        },
      ]);
    },
    [t]
  );
}

type ExternalLinkProps = {
  label: string;
  url: string;
  accessibilityLabel?: string;
  /** Called after the user confirms, right before the browser opens. */
  onPress?: () => void;
  style?: TextStyle;
};

/**
 * Inline text link that opens a URL in the browser after a confirmation
 * Alert. Always shows the "leaving the app" dialog before navigating.
 *
 * @example
 * <ExternalLink label="Saiba mais sobre os critérios da IUCN →" url="https://…" />
 */
export default function ExternalLink({
  label,
  url,
  accessibilityLabel,
  onPress,
  style,
}: ExternalLinkProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const openExternalLink = useOpenExternalLink();

  return (
    <Pressable
      onPress={() => openExternalLink(url, onPress)}
      accessibilityRole="link"
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => pressed && styles.pressed}
      hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
    >
      <Text style={[styles.link, { color: colors.primary }, style]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  pressed: { opacity: 0.6 },
});
