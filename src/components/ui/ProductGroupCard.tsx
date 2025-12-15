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
          minHeight: scale(150),
          maxHeight: scale(180),
          justifyContent: 'flex-start',
          alignItems: 'stretch',
        },
        contentContainer: {
          flex: 1,
          width: '100%',
          justifyContent: 'flex-start',
          alignItems: 'stretch',
        },
        imageContainer: {
          width: '100%',
          height: scale(70),
          marginBottom: scale(8),
          alignSelf: 'stretch',
          overflow: 'hidden',
        },
        textContainer: {
          flex: 1,
          width: '100%',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          minHeight: scale(50),
        },
        name: {
          fontSize: scaleFont(16),
          fontWeight: '600',
          color: colors.text,
          marginBottom: scale(4),
          textAlign: 'left',
          width: '100%',
          lineHeight: scaleFont(14),
        },
        count: {
          fontSize: scaleFont(12),
          color: colors.textSecondary,
          textAlign: 'left',
          width: '100%',
        },
      }),
    [colors, isDark]
  );

  const displayName = capitalizeFirstLetter(group.nome);

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.contentContainer}>
        <View style={styles.imageContainer}>
          <GroupImage 
            cod_gp={group.cod_gp} 
            status={group.tipo || 'C'} 
            groupName={displayName}
            showNameOnFallback={true}
          />
        </View>
        <View style={styles.textContainer}>
          <Text 
            style={styles.name} 
            numberOfLines={1} 
            ellipsizeMode="tail"
          >
            {displayName}
          </Text>
          <Text style={styles.count}>
            {group.quantidadeItens !== undefined ? `${group.quantidadeItens} itens` : '0 itens'}
          </Text>
        </View>
      </View>
    </Card>
  );
};
