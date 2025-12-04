import React, { useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ViewStyle, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { scale, scaleFont } from '../../utils/responsive';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = (props) => {
  const { label, error, rightIcon, onRightIconPress, containerStyle, style, ...textInputProps } = props;
  const { colors, isDark } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          marginBottom: scale(20),
        },
        label: {
          fontSize: scaleFont(14),
          fontWeight: '500',
          color: colors.text,
          marginBottom: scale(8),
        },
        inputWrapper: {
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: scale(10),
          paddingHorizontal: scale(12),
          backgroundColor: isDark ? '#1A1F2B' : '#FFFFFF',
        },
        inputWrapperError: {
          borderColor: colors.error,
        },
        input: {
          flex: 1,
          height: scale(50),
          fontSize: scaleFont(16),
          color: colors.text,
        },
        rightIcon: {
          marginLeft: scale(10),
          padding: scale(4),
        },
        errorText: {
          fontSize: scaleFont(12),
          color: colors.error,
          marginTop: scale(4),
        },
      }),
    [colors, isDark]
  );

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, error && styles.inputWrapperError]}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={isDark ? '#7C859B' : '#9CA3AF'}
          {...textInputProps}
        />
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIcon}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

