import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { isDark, setTheme, colors } = useTheme();

  const handleToggle = async () => {
    await setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: colors.border }]}
      onPress={handleToggle}
      activeOpacity={0.7}
    >
      <Ionicons
        name={isDark ? 'sunny-outline' : 'moon-outline'}
        size={20}
        color={colors.text}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

