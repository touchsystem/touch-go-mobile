import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

export const CodeAccessButton: React.FC = () => {
  const router = useRouter();
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          marginVertical: 20,
        },
        separator: {
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 20,
        },
        separatorLine: {
          flex: 1,
          height: 1,
          backgroundColor: colors.border,
        },
        separatorText: {
          marginHorizontal: 10,
          color: colors.textSecondary,
          fontSize: 14,
        },
        button: {
          marginBottom: 30,
        },
      }),
    [colors]
  );

  return (
    <View style={styles.container}>
      <View style={styles.separator}>
        <View style={styles.separatorLine} />
        <Text style={styles.separatorText}>ou</Text>
        <View style={styles.separatorLine} />
      </View>
      <Button
        title="Acesso por Código"
        variant="outline"
        onPress={() => router.push('/code-access')}
        icon={<Ionicons name="key-outline" size={20} color={colors.text} />}
        style={styles.button}
      />
    </View>
  );
};
