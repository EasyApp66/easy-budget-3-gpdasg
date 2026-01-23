
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language, getTranslation } from '@/i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: ReturnType<typeof getTranslation>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = '@easy_budget_language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('DE');

  // Compute t directly from language state to ensure it updates
  const t = getTranslation(language);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      console.log('[LanguageContext] Loading saved language from AsyncStorage');
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      console.log('[LanguageContext] Saved language:', savedLanguage);
      if (savedLanguage === 'DE' || savedLanguage === 'EN') {
        console.log('[LanguageContext] Setting language to:', savedLanguage);
        setLanguageState(savedLanguage);
      }
    } catch (error) {
      console.error('[LanguageContext] Failed to load language:', error);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      console.log('[LanguageContext] Changing language to:', lang);
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      console.log('[LanguageContext] Language saved to AsyncStorage');
      setLanguageState(lang);
      console.log('[LanguageContext] Language state updated to:', lang);
    } catch (error) {
      console.error('[LanguageContext] Failed to save language:', error);
      throw error;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
