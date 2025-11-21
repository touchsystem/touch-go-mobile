import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
          <Ionicons name="backspace-outline" size={24} color="#333" />
        </TouchableOpacity>
        <NumberButton number="0" />
        <TouchableOpacity style={styles.numberButton} onPress={onConfirm}>
          <Ionicons name="checkmark" size={24} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  numberButton: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  numberText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
});

