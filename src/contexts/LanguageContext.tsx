import en from '@/locales/en';
import es from '@/locales/es';
import ptBR from '@/locales/pt-BR';
import {
  getLanguagePreference,
  LanguageCode,
  saveLanguagePreference,
} from '@/services/languageService';
import React, { createContext, use, useCallback, useEffect, useState } from 'react';
import { I18nManager, Platform, Settings } from 'react-native';

type Translations = typeof ptBR;

type LanguageContextType = {
  language: 'pt-BR' | 'en' | 'es';
  languagePreference: LanguageCode;
  setLanguagePreference: (lang: LanguageCode) => void;
  t: Translations;
};

const translations: Record<'pt-BR' | 'en' | 'es', Translations> = {
  'pt-BR': ptBR,
  en: en,
  es: es,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// TurboModules are always on since RN 0.87: native constants are only reachable
// through the typed module APIs, never as properties of `NativeModules.*`.
function getDeviceLocale(): string | undefined {
  if (Platform.OS === 'ios') {
    const appleLocale: unknown = Settings.get('AppleLocale');
    if (typeof appleLocale === 'string') return appleLocale;
    const appleLanguages: unknown = Settings.get('AppleLanguages');
    if (Array.isArray(appleLanguages) && typeof appleLanguages[0] === 'string') {
      return appleLanguages[0];
    }
    return undefined;
  }
  return I18nManager.getConstants().localeIdentifier;
}

function getDeviceLanguage(): 'pt-BR' | 'en' | 'es' {
  const deviceLanguage = getDeviceLocale() ?? 'pt-BR';

  if (deviceLanguage.startsWith('pt')) return 'pt-BR';
  if (deviceLanguage.startsWith('en')) return 'en';
  if (deviceLanguage.startsWith('es')) return 'es';

  return 'pt-BR';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [languagePreference, setLanguagePreferenceState] = useState<LanguageCode>('auto');

  const language: 'pt-BR' | 'en' | 'es' =
    languagePreference === 'auto' ? getDeviceLanguage() : languagePreference;

  useEffect(() => {
    getLanguagePreference().then(setLanguagePreferenceState);
  }, []);

  const setLanguagePreference = useCallback((lang: LanguageCode) => {
    setLanguagePreferenceState(lang);
    saveLanguagePreference(lang);
  }, []);

  return (
    <LanguageContext
      value={{
        language,
        languagePreference,
        setLanguagePreference,
        t: translations[language],
      }}
    >
      {children}
    </LanguageContext>
  );
}

export function useLanguage() {
  const context = use(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
