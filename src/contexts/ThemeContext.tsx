import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { storage } from '../services/storage';
import { Colors } from '@/constants/theme';

type Theme = 'light' | 'dark' | 'system';

export type ThemeColor = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'pink' | 'teal' | 'indigo';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  themeColor: ThemeColor;
  setTheme: (theme: Theme) => Promise<void>;
  setThemeColor: (color: ThemeColor) => Promise<void>;
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

export const THEME_COLORS: Record<ThemeColor, { light: string; dark: string; name: string }> = {
  blue: { light: '#2563EB', dark: '#3B82F6', name: 'Azul' },
  green: { light: '#059669', dark: '#10B981', name: 'Verde' },
  purple: { light: '#7C3AED', dark: '#8B5CF6', name: 'Roxo' },
  orange: { light: '#EA580C', dark: '#F97316', name: 'Laranja' },
  red: { light: '#DC2626', dark: '#EF4444', name: 'Vermelho' },
  pink: { light: '#DB2777', dark: '#EC4899', name: 'Rosa' },
  teal: { light: '#0D9488', dark: '#14B8A6', name: 'Verde-água' },
  indigo: { light: '#4F46E5', dark: '#6366F1', name: 'Anil' },
};

const lightColors = {
  background: Colors.light.background,
  surface: '#FFFFFF',
  text: Colors.light.text,
  textSecondary: '#6B7280',
  border: '#E4E4E7',
  primary: Colors.light.tint,
  error: '#DC2626',
  card: '#FFFFFF',
  tint: Colors.light.tint,
  icon: Colors.light.icon,
};

const darkColors = {
  background: Colors.dark.background,
  surface: '#111826',
  text: Colors.dark.text,
  textSecondary: '#A1A7B5',
  border: '#2A3140',
  primary: Colors.dark.tint,
  error: '#F87171',
  card: '#111826',
  tint: Colors.dark.tint,
  icon: Colors.dark.icon,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'app_theme';
const THEME_COLOR_STORAGE_KEY = 'app_theme_color';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemTheme = useSystemColorScheme();
  const [theme, setThemeState] = useState<Theme>('system');
  const [themeColor, setThemeColorState] = useState<ThemeColor>('blue');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    loadTheme();
    loadThemeColor();
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

  const loadThemeColor = async () => {
    try {
      const savedColor = await storage.getItem<ThemeColor>(THEME_COLOR_STORAGE_KEY);
      if (savedColor) {
        setThemeColorState(savedColor);
      }
    } catch (error) {
      console.error('Error loading theme color:', error);
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
    // Atualiza isDark imediatamente baseado no novo tema
    if (newTheme === 'system') {
      setIsDark(systemTheme === 'dark');
    } else {
      setIsDark(newTheme === 'dark');
    }
    try {
      await storage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const setThemeColor = async (color: ThemeColor) => {
    setThemeColorState(color);
    try {
      await storage.setItem(THEME_COLOR_STORAGE_KEY, color);
    } catch (error) {
      console.error('Error saving theme color:', error);
    }
  };

  const colors = useMemo(() => {
    const baseColors = isDark ? darkColors : lightColors;
    const colorScheme = THEME_COLORS[themeColor];
    const primaryColor = isDark ? colorScheme.dark : colorScheme.light;
    
    return {
      ...baseColors,
      primary: primaryColor,
      tint: primaryColor,
    };
  }, [isDark, themeColor]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        themeColor,
        setTheme,
        setThemeColor,
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

