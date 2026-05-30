import { clearLanguagePreference } from './languageService';
import { storageAdapter } from './storage';

export type ThemePreference = 'light' | 'dark' | 'auto';

const KEYS = {
  THEME: '@theme_preference',
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

export const clearPreferences = async (): Promise<void> => {
  try {
    await storageAdapter.removeItem(KEYS.THEME);
    await clearLanguagePreference();
  } catch {}
};
