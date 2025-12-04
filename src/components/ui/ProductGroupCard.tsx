import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProductGroup } from '../../types';
import { Card } from './Card';
import { useTheme } from '../../contexts/ThemeContext';
import { capitalizeFirstLetter } from '../../utils/format';
import { GroupImage } from './GroupImage';
import { scale, scaleFont } from '../../utils/responsive';

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
          margin: scale(4),
          minHeight: scale(120),
        },
        imageContainer: {
          width: '100%',
          height: scale(70),
          marginBottom: scale(8),
        },
        name: {
          fontSize: scaleFont(14),
          fontWeight: '600',
          color: colors.text,
          marginBottom: scale(2),
        },
        count: {
          fontSize: scaleFont(12),
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
