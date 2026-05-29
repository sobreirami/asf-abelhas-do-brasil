import { LanguageOption } from '@/components/preferences/LanguageOption';
import { LanguageCode } from '@/services/languageService';
import React from 'react';
import { View } from 'react-native';
import { styles } from './styles';

interface LanguageSelectorProps {
  selectedLanguage: LanguageCode;
  isDark: boolean;
  primaryColor: string;
  labels: {
    'pt-BR': string;
    en: string;
    es: string;
    auto: string;
  };
  onLanguageChange: (language: LanguageCode) => void;
}

export function LanguageSelector({
  selectedLanguage,
  isDark,
  primaryColor,
  labels,
  onLanguageChange,
}: LanguageSelectorProps) {
  const languages: LanguageCode[] = ['pt-BR', 'en', 'es', 'auto'];

  return (
    <View style={styles.optionsContainer}>
      {languages.map((lang) => (
        <LanguageOption
          key={lang}
          value={lang}
          label={labels[lang]}
          isSelected={selectedLanguage === lang}
          isDark={isDark}
          primaryColor={primaryColor}
          onPress={onLanguageChange}
        />
      ))}
    </View>
  );
}
