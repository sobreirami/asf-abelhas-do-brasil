import { clearLanguagePreference } from './languageService';
import { storageAdapter } from './storage';

export type ThemePreference = 'light' | 'dark' | 'auto';
export type AccentColor = 'mel' | 'oliva' | 'laranja';
export type TextScale = 'small' | 'normal' | 'large';

const KEYS = {
  THEME: '@theme_preference',
  ACCENT_COLOR: '@accent_color',
  TEXT_SCALE: '@text_scale',
  SHOW_SCIENTIFIC_NAMES: '@show_scientific_names',
};

export const saveThemePreference = async (theme: ThemePreference): Promise<void> => {
  try {
    await storageAdapter.setItem(KEYS.THEME, theme);
  } catch {}
};

export const getThemePreference = async (): Promise<ThemePreference> => {
  try {
    const theme = await storageAdapter.getItem(KEYS.THEME);
    return (theme as ThemePreference) || 'auto';
  } catch {
    return 'auto';
  }
};

export const saveAccentColor = async (accent: AccentColor): Promise<void> => {
  try {
    await storageAdapter.setItem(KEYS.ACCENT_COLOR, accent);
  } catch {}
};

export const getAccentColor = async (): Promise<AccentColor> => {
  try {
    const v = await storageAdapter.getItem(KEYS.ACCENT_COLOR);
    return (v as AccentColor) || 'mel';
  } catch {
    return 'mel';
  }
};

export const saveTextScale = async (scale: TextScale): Promise<void> => {
  try {
    await storageAdapter.setItem(KEYS.TEXT_SCALE, scale);
  } catch {}
};

export const getTextScale = async (): Promise<TextScale> => {
  try {
    const v = await storageAdapter.getItem(KEYS.TEXT_SCALE);
    return (v as TextScale) || 'normal';
  } catch {
    return 'normal';
  }
};

export const saveShowScientificNames = async (show: boolean): Promise<void> => {
  try {
    await storageAdapter.setItem(KEYS.SHOW_SCIENTIFIC_NAMES, show ? '1' : '0');
  } catch {}
};

export const getShowScientificNames = async (): Promise<boolean> => {
  try {
    const v = await storageAdapter.getItem(KEYS.SHOW_SCIENTIFIC_NAMES);
    return v !== '0';
  } catch {
    return true;
  }
};

export const clearPreferences = async (): Promise<void> => {
  try {
    await storageAdapter.removeItem(KEYS.THEME);
    await storageAdapter.removeItem(KEYS.ACCENT_COLOR);
    await storageAdapter.removeItem(KEYS.TEXT_SCALE);
    await storageAdapter.removeItem(KEYS.SHOW_SCIENTIFIC_NAMES);
    await clearLanguagePreference();
  } catch {}
};
