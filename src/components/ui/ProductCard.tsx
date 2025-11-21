import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  onAdd: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd }) => {
  const formatPrice = (price: number | undefined) => {
    if (!price) return 'R$ 0,00';
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  // Mapeia os campos possíveis do produto
  const nome = product.nome || product.des2 || product.des1 || 'Produto sem nome';
  const descricao = product.descricao || product.des1 || '';
  const preco = product.preco || product.pv || 0;

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
          <Ionicons name="add" size={24} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
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
    color: '#000',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

