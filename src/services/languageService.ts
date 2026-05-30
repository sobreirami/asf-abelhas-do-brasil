import { storageAdapter } from './storage';

export type LanguageCode = 'pt-BR' | 'en' | 'es' | 'auto';

const KEYS = {
  LANGUAGE: '@language_preference',
};

export const saveLanguagePreference = async (language: LanguageCode): Promise<void> => {
  try {
    await storageAdapter.setItem(KEYS.LANGUAGE, language);
  } catch {}
};

export const getLanguagePreference = async (): Promise<LanguageCode> => {
  try {
    const language = await storageAdapter.getItem(KEYS.LANGUAGE);
    return (language as LanguageCode) || 'auto';
  } catch {
    return 'auto';
  }
};

export const clearLanguagePreference = async (): Promise<void> => {
  try {
    await storageAdapter.removeItem(KEYS.LANGUAGE);
  } catch {}
};
