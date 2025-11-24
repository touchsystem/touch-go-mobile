import React, { useMemo } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onToggle: () => void;
  style?: ViewStyle;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onToggle, style }) => {
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flexDirection: 'row',
          alignItems: 'center',
        },
        checkbox: {
          width: 20,
          height: 20,
          borderWidth: 2,
          borderColor: colors.border,
          borderRadius: 6,
          marginRight: 8,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'transparent',
        },
        checkboxChecked: {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
        },
        label: {
          fontSize: 14,
          color: colors.text,
        },
      }),
    [colors]
  );

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Ionicons name="checkmark" size={16} color="#fff" />}
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

