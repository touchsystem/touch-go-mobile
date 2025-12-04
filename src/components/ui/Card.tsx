import React, { useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { scale } from '../../utils/responsive';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({ children, onPress, style }) => {
  const { colors, isDark } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: colors.card,
          borderRadius: scale(12),
          padding: scale(16),
          borderWidth: isDark ? 1 : 0,
          borderColor: colors.border,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: scale(2) },
          shadowOpacity: isDark ? 0.25 : 0.1,
          shadowRadius: scale(6),
          elevation: 3,
        },
      }),
    [colors, isDark]
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.card, style]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.card, style]}>{children}</View>;
};

