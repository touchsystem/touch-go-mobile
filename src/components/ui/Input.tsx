import React, { useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ViewStyle, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

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
          marginBottom: 20,
        },
        label: {
          fontSize: 14,
          fontWeight: '500',
          color: colors.text,
          marginBottom: 8,
        },
        inputWrapper: {
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 10,
          paddingHorizontal: 12,
          backgroundColor: isDark ? '#1A1F2B' : '#FFFFFF',
        },
        inputWrapperError: {
          borderColor: colors.error,
        },
        input: {
          flex: 1,
          height: 50,
          fontSize: 16,
          color: colors.text,
        },
        rightIcon: {
          marginLeft: 10,
          padding: 4,
        },
        errorText: {
          fontSize: 12,
          color: colors.error,
          marginTop: 4,
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

