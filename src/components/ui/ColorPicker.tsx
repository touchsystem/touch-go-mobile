import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeColor, THEME_COLORS } from '../../contexts/ThemeContext';

interface ColorPickerProps {
  onColorSelect?: (color: ThemeColor) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ onColorSelect }) => {
  const { themeColor, setThemeColor, colors, isDark } = useTheme();

  const handleColorSelect = (color: ThemeColor) => {
    setThemeColor(color);
    onColorSelect?.(color);
  };

  const colorOptions = Object.entries(THEME_COLORS) as [ThemeColor, typeof THEME_COLORS[ThemeColor]][];

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>Cor do Tema</Text>
      <View style={styles.colorsGrid}>
        {colorOptions.map(([key, colorInfo]) => {
          const isSelected = themeColor === key;
          const colorValue = isDark ? colorInfo.dark : colorInfo.light;

          return (
            <TouchableOpacity
              key={key}
              style={[
                styles.colorOption,
                {
                  backgroundColor: colorValue,
                  borderColor: isSelected ? colors.text : colors.border,
                  borderWidth: isSelected ? 3 : 2,
                },
              ]}
              onPress={() => handleColorSelect(key)}
              activeOpacity={0.7}
            >
              {isSelected && (
                <View style={styles.checkIcon}>
                  <Ionicons name="checkmark" size={20} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={[styles.selectedColorText, { color: colors.textSecondary }]}>
        {THEME_COLORS[themeColor].name}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  colorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 8,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  checkIcon: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedColorText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
});

