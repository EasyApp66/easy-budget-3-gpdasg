
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Theme = 'dark' | 'light';

interface ThemeColors {
  neonGreen: string;
  black: string;
  white: string;
  darkGray: string;
  red: string;
  background: string;
  text: string;
  cardBackground: string;
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => Promise<void>;
  colors: ThemeColors;
}

const THEME_STORAGE_KEY = '@easy_budget_theme';

const darkTheme: ThemeColors = {
  neonGreen: '#BFFE84',
  black: '#000000',
  white: '#FFFFFF',
  darkGray: '#232323',
  red: '#C43C3E',
  background: '#000000',
  text: '#FFFFFF',
  cardBackground: '#232323',
};

const lightTheme: ThemeColors = {
  neonGreen: '#BFFE84',
  black: '#000000',
  white: '#FFFFFF',
  darkGray: '#E8E8E8',
  red: '#C43C3E',
  background: '#FFFFFF',
  text: '#000000',
  cardBackground: '#E8E8E8',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [colors, setColors] = useState<ThemeColors>(darkTheme);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'dark' || savedTheme === 'light') {
        setTheme(savedTheme);
        setColors(savedTheme === 'dark' ? darkTheme : lightTheme);
        console.log('[Theme] Loaded theme:', savedTheme);
      }
    } catch (error) {
      console.error('[Theme] Failed to load theme:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme: Theme = theme === 'dark' ? 'light' : 'dark';
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
      setTheme(newTheme);
      setColors(newTheme === 'dark' ? darkTheme : lightTheme);
      console.log('[Theme] Theme toggled to:', newTheme);
    } catch (error) {
      console.error('[Theme] Failed to save theme:', error);
      throw error;
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
