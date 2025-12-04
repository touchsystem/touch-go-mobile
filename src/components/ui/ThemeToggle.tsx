import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { scale } from '../../utils/responsive';

export const ThemeToggle: React.FC = () => {
  const { theme, isDark, setTheme, colors } = useTheme();

  const handleToggle = () => {
    // Se o tema atual é 'system', alterna baseado no isDark atual
    // Caso contrário, alterna entre 'light' e 'dark'
    if (theme === 'system') {
      setTheme(isDark ? 'light' : 'dark');
    } else {
      setTheme(theme === 'dark' ? 'light' : 'dark');
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: colors.border }]}
      onPress={handleToggle}
      activeOpacity={0.7}
    >
      <Ionicons
        name={isDark ? 'sunny-outline' : 'moon-outline'}
        size={scale(20)}
        color={colors.text}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
});

