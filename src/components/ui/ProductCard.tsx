import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { capitalizeFirstLetter } from '../../utils/format';

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
          borderRadius: 12,
          marginBottom: 12,
          padding: 16,
          borderWidth: isDark ? 1 : 0,
          borderColor: colors.border,
        },
        content: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
        info: {
          flex: 1,
          marginRight: 12,
        },
        name: {
          fontSize: 16,
          fontWeight: '600',
          color: colors.text,
          marginBottom: 4,
        },
        description: {
          fontSize: 14,
          color: colors.textSecondary,
          marginBottom: 8,
        },
        price: {
          fontSize: 16,
          fontWeight: '600',
          color: colors.text,
        },
        addButton: {
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: isDark ? '#1F2533' : '#E5E7EB',
          justifyContent: 'center',
          alignItems: 'center',
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
          <Text style={styles.name}>{nome}</Text>
          {descricao && descricao !== nome && (
            <Text style={styles.description}>{descricao}</Text>
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
