// Serviço de Preferências de Idioma
import { storageAdapter } from './storage';

export type LanguageCode = 'pt-BR' | 'en' | 'es' | 'auto';

const KEYS = {
  LANGUAGE: '@language_preference',
};

/**
 * Salva a preferência de idioma do usuário
 */
export const saveLanguagePreference = async (language: LanguageCode): Promise<void> => {
  try {
    await storageAdapter.setItem(KEYS.LANGUAGE, language);
  } catch (error) {}
};

/**
 * Recupera a preferência de idioma do usuário
 */
export const getLanguagePreference = async (): Promise<LanguageCode> => {
  try {
    const language = await storageAdapter.getItem(KEYS.LANGUAGE);
    return (language as LanguageCode) || 'auto';
  } catch (error) {
    return 'auto';
  }
};

/**
 * Limpa a preferência de idioma
 */
export const clearLanguagePreference = async (): Promise<void> => {
  try {
    await storageAdapter.removeItem(KEYS.LANGUAGE);
  } catch (error) {}
};
