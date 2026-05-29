// Serviço de Preferências do Usuário
import { clearLanguagePreference } from './languageService';
import { storageAdapter } from './storage';

export type ThemePreference = 'light' | 'dark' | 'auto';

const KEYS = {
  THEME: '@theme_preference',
};

/**
 * Salva a preferência de tema do usuário
 */
export const saveThemePreference = async (theme: ThemePreference): Promise<void> => {
  try {
    await storageAdapter.setItem(KEYS.THEME, theme);
  } catch (error) {}
};

/**
 * Recupera a preferência de tema do usuário
 */
export const getThemePreference = async (): Promise<ThemePreference> => {
  try {
    const theme = await storageAdapter.getItem(KEYS.THEME);
    return (theme as ThemePreference) || 'auto';
  } catch (error) {
    return 'auto';
  }
};

/**
 * Limpa todas as preferências (tema e idioma)
 */
export const clearPreferences = async (): Promise<void> => {
  try {
    await storageAdapter.removeItem(KEYS.THEME);
    await clearLanguagePreference();
  } catch (error) {}
};
