import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProductGroup } from '../../types';
import { Card } from './Card';
import { useTheme } from '../../contexts/ThemeContext';
import { capitalizeFirstLetter } from '../../utils/format';
import { GroupImage } from './GroupImage';

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
          margin: 4,
          minHeight: 120,
        },
        imageContainer: {
          width: '100%',
          height: 70,
          marginBottom: 8,
        },
        name: {
          fontSize: 14,
          fontWeight: '600',
          color: colors.text,
          marginBottom: 2,
        },
        count: {
          fontSize: 12,
          color: colors.textSecondary,
        },
      }),
    [colors, isDark]
  );

  const displayName = capitalizeFirstLetter(group.nome);

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.imageContainer}>
        <GroupImage 
          cod_gp={group.cod_gp} 
          status={group.tipo || 'C'} 
          groupName={displayName}
          showNameOnFallback={true}
        />
      </View>
      <Text style={styles.name}>{displayName}</Text>
      <Text style={styles.count}>
        {group.quantidadeItens !== undefined ? `${group.quantidadeItens} itens` : '0 itens'}
      </Text>
    </Card>
  );
};
