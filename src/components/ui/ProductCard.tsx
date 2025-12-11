import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { capitalizeFirstLetter } from '../../utils/format';
import { scale, scaleFont } from '../../utils/responsive';

interface ProductCardProps {
  product: Product;
  onAdd: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd }) => {
  const { colors, isDark } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          backgroundColor: colors.card,
          borderRadius: scale(12),
          marginBottom: scale(12),
          padding: scale(16),
          borderWidth: isDark ? 1 : 0,
          borderColor: colors.border,
          minHeight: scale(80),
        },
        content: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flex: 1,
        },
        info: {
          flex: 1,
          marginRight: scale(12),
          minHeight: scale(48),
        },
        name: {
          fontSize: scaleFont(16),
          fontWeight: '600',
          color: colors.text,
          marginBottom: scale(4),
        },
        description: {
          fontSize: scaleFont(13),
          color: colors.textSecondary,
          marginBottom: scale(6),
        },
        price: {
          fontSize: scaleFont(16),
          fontWeight: '600',
          color: colors.text,
          marginTop: 'auto',
        },
        addButton: {
          width: scale(44),
          height: scale(44),
          borderRadius: scale(22),
          backgroundColor: isDark ? '#1F2533' : '#E5E7EB',
          justifyContent: 'center',
          alignItems: 'center',
          flexShrink: 0,
        },
      }),
    [colors, isDark]
  );

  const formatPrice = (price: number | undefined) => {
    if (!price) return 'R$ 0,00';
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  // Mapeia os campos possíveis do produto
  const nomeRaw = product.nome || product.des2 || product.des1 || 'Produto sem nome';
  const descricaoRaw = product.descricao || product.des1 || '';
  const preco = product.preco || product.pv || 0;
  
  // Capitaliza apenas a primeira letra
  const nome = capitalizeFirstLetter(nomeRaw);
  const descricao = descricaoRaw ? capitalizeFirstLetter(descricaoRaw) : '';

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2} ellipsizeMode="tail">
            {nome}
          </Text>
          {descricao && descricao !== nome && (
            <Text style={styles.description} numberOfLines={1} ellipsizeMode="tail">
              {descricao}
            </Text>
          )}
          <Text style={styles.price}>{formatPrice(preco)}</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={onAdd}>
          <Ionicons name="add" size={24} color={isDark ? '#F4F4F5' : '#111827'} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
