import React from 'react';
import { Switch as RNSwitch, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export const Switch: React.FC<SwitchProps> = ({
  value,
  onValueChange,
  disabled = false,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <RNSwitch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{
        false: colors.border,
        true: '#007AFF',
      }}
      thumbColor={value ? '#fff' : '#f4f3f4'}
      ios_backgroundColor={colors.border}
      style={style}
    />
  );
};

