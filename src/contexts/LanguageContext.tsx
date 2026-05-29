import en from '@/locales/en';
import es from '@/locales/es';
import ptBR from '@/locales/pt-BR';
import { getLanguagePreference, LanguageCode } from '@/services/languageService';
import React, { createContext, use, useEffect, useState } from 'react';
import { NativeModules, Platform } from 'react-native';

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

function getDeviceLanguage(): 'pt-BR' | 'en' | 'es' {
  let deviceLanguage = 'pt-BR';

  if (Platform.OS === 'ios') {
    deviceLanguage =
      NativeModules.SettingsManager?.settings?.AppleLocale ||
      NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] ||
      'pt-BR';
  } else {
    deviceLanguage = NativeModules.I18nManager?.localeIdentifier || 'pt-BR';
  }

  // Normalizar para nossos idiomas suportados
  if (deviceLanguage.startsWith('pt')) return 'pt-BR';
  if (deviceLanguage.startsWith('en')) return 'en';
  if (deviceLanguage.startsWith('es')) return 'es';

  return 'pt-BR'; // Fallback
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [languagePreference, setLanguagePreferenceState] = useState<LanguageCode>('auto');
  const [language, setLanguage] = useState<'pt-BR' | 'en' | 'es'>('pt-BR');

  useEffect(() => {
    loadLanguage();
  }, []);

  useEffect(() => {
    const effectiveLanguage =
      languagePreference === 'auto' ? getDeviceLanguage() : languagePreference;
    setLanguage(effectiveLanguage as 'pt-BR' | 'en' | 'es');
  }, [languagePreference]);

  const loadLanguage = async () => {
    const preference = await getLanguagePreference();
    setLanguagePreferenceState(preference);
  };

  const setLanguagePreference = (lang: LanguageCode) => {
    setLanguagePreferenceState(lang);
  };

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
