import React, { useMemo } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { scale } from '../../utils/responsive';

interface NumericKeypadProps {
  onNumberPress: (number: string) => void;
  onDelete: () => void;
  onConfirm: () => void;
}

export const NumericKeypad: React.FC<NumericKeypadProps> = ({
  onNumberPress,
  onDelete,
  onConfirm,
}) => {
  const { colors, isDark } = useTheme();
  const { width } = Dimensions.get('window');
  
  // Calcula tamanho responsivo baseado na largura da tela
  const buttonSize = Math.min(width * 0.15, 65); // 15% da largura, máximo 65px
  const gap = Math.max(width * 0.02, 4); // 2% da largura, mínimo 4px
  const fontSize = Math.max(width * 0.045, 16); // 4.5% da largura, mínimo 16px

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          width: '100%',
        },
        row: {
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: gap,
          gap: gap,
        },
        numberButton: {
          width: buttonSize,
          height: buttonSize,
          backgroundColor: isDark ? '#1C2230' : '#F2F4F7',
          borderRadius: scale(12),
          justifyContent: 'center',
          alignItems: 'center',
        },
        numberText: {
          fontSize: fontSize,
          fontWeight: '600',
          color: colors.text,
        },
        iconColor: {
          color: isDark ? '#F4F4F5' : '#111827',
        },
      }),
    [colors, isDark, buttonSize, gap, fontSize]
  );

  const NumberButton = ({ number }: { number: string }) => (
    <TouchableOpacity
      style={styles.numberButton}
      onPress={() => onNumberPress(number)}
      activeOpacity={0.7}
    >
      <Text style={styles.numberText}>{number}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <NumberButton number="1" />
        <NumberButton number="2" />
        <NumberButton number="3" />
      </View>
      <View style={styles.row}>
        <NumberButton number="4" />
        <NumberButton number="5" />
        <NumberButton number="6" />
      </View>
      <View style={styles.row}>
        <NumberButton number="7" />
        <NumberButton number="8" />
        <NumberButton number="9" />
      </View>
      <View style={styles.row}>
        <TouchableOpacity style={styles.numberButton} onPress={onDelete}>
          <Ionicons name="backspace-outline" size={fontSize + 4} color={styles.iconColor.color} />
        </TouchableOpacity>
        <NumberButton number="0" />
        <TouchableOpacity style={styles.numberButton} onPress={onConfirm}>
          <Ionicons name="checkmark" size={fontSize + 4} color={styles.iconColor.color} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
