import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProductGroup } from '../../types';
import { Card } from './Card';

interface ProductGroupCardProps {
  group: ProductGroup;
  onPress: () => void;
}

export const ProductGroupCard: React.FC<ProductGroupCardProps> = ({ group, onPress }) => {
  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.imagePlaceholder}>
        <Text style={styles.imagePlaceholderText}>{group.nome}</Text>
      </View>
      <Text style={styles.name}>{group.nome}</Text>
      <Text style={styles.count}>{group.quantidadeItens} itens</Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 6,
    minHeight: 150,
  },
  imagePlaceholder: {
    width: '100%',
    height: 100,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  imagePlaceholderText: {
    fontSize: 12,
    color: '#999',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  count: {
    fontSize: 14,
    color: '#666',
  },
});

