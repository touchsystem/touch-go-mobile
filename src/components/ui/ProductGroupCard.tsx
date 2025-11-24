import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProductGroup } from '../../types';
import { Card } from './Card';
import { useTheme } from '../../contexts/ThemeContext';
import { capitalizeFirstLetter } from '../../utils/format';

interface ProductGroupCardProps {
  group: ProductGroup;
  onPress: () => void;
}

export const ProductGroupCard: React.FC<ProductGroupCardProps> = ({ group, onPress }) => {
  const { colors, isDark } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          flex: 1,
          margin: 6,
          minHeight: 150,
        },
        imagePlaceholder: {
          width: '100%',
          height: 100,
          backgroundColor: isDark ? '#1C2230' : '#F4F4F5',
          borderRadius: 10,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 12,
        },
        imagePlaceholderText: {
          fontSize: 12,
          color: colors.textSecondary,
          textAlign: 'center',
        },
        name: {
          fontSize: 16,
          fontWeight: '600',
          color: colors.text,
          marginBottom: 4,
        },
        count: {
          fontSize: 14,
          color: colors.textSecondary,
        },
      }),
    [colors, isDark]
  );

  const displayName = capitalizeFirstLetter(group.nome);

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.imagePlaceholder}>
        <Text style={styles.imagePlaceholderText}>{displayName}</Text>
      </View>
      <Text style={styles.name}>{displayName}</Text>
      <Text style={styles.count}>{group.quantidadeItens} itens</Text>
    </Card>
  );
};
