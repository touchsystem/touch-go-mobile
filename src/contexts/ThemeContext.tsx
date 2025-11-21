import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { storage } from '../services/storage';
import { Colors } from '@/constants/theme';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => Promise<void>;
  colors: {
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    primary: string;
    error: string;
    card: string;
    tint: string;
    icon: string;
  };
}

const lightColors = {
  background: Colors.light.background,
  surface: Colors.light.background,
  text: Colors.light.text,
  textSecondary: Colors.light.icon,
  border: '#e0e0e0',
  primary: Colors.light.tint,
  error: '#ff4444',
  card: Colors.light.background,
  tint: Colors.light.tint,
  icon: Colors.light.icon,
};

const darkColors = {
  background: Colors.dark.background,
  surface: Colors.dark.background,
  text: Colors.dark.text,
  textSecondary: Colors.dark.icon,
  border: '#333333',
  primary: Colors.dark.tint,
  error: '#ff6666',
  card: Colors.dark.background,
  tint: Colors.dark.tint,
  icon: Colors.dark.icon,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'app_theme';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemTheme = useSystemColorScheme();
  const [theme, setThemeState] = useState<Theme>('system');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  useEffect(() => {
    updateIsDark();
  }, [theme, systemTheme]);

  const loadTheme = async () => {
    try {
      const savedTheme = await storage.getItem<Theme>(THEME_STORAGE_KEY);
      if (savedTheme) {
        setThemeState(savedTheme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const updateIsDark = () => {
    if (theme === 'system') {
      setIsDark(systemTheme === 'dark');
    } else {
      setIsDark(theme === 'dark');
    }
  };

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    await storage.setItem(THEME_STORAGE_KEY, newTheme);
    updateIsDark();
  };

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        setTheme,
        colors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

