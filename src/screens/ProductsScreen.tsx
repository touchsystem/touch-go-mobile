import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProducts } from '../hooks/useProducts';
import { ProductCard } from '../components/ui/ProductCard';
import { useCart } from '../contexts/CartContext';
import { useTable } from '../contexts/TableContext';
import { formatCurrency } from '../utils/format';
import { Product } from '../types';

export default function ProductsScreen() {
  const { codGp } = useLocalSearchParams<{ codGp?: string }>();
  const { products, loading, error, fetchProducts } = useProducts();
  const { addToCart, getTotal, getTotalItems } = useCart();
  const { selectedTable } = useTable();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchProducts(codGp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codGp]);

  const filteredProducts = products.filter((product) => {
    const nome = product.nome || product.des2 || product.des1 || '';
    if (!nome) return false;
    return nome.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleAddProduct = (product: Product) => {
    const nome = product.nome || product.des2 || product.des1 || 'Produto';
    const descricao = product.descricao || product.des1 || '';
    const preco = product.preco || product.pv || 0;
    const id = product.id || parseInt(product.codm || '0') || 0;

    addToCart({
      id,
      nome,
      descricao,
      preco,
    });
  };

  const handleViewOrder = () => {
    router.push('/orders');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Produtos</Text>
        <TouchableOpacity>
          <Ionicons name="search-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {selectedTable && (
        <View style={styles.orderSummary}>
          <Text style={styles.orderSummaryText}>
            Mesa #{selectedTable.numero}
          </Text>
          <Text style={styles.orderSummaryDot}>•</Text>
          <Text style={styles.orderSummaryText}>
            {getTotalItems()} itens
          </Text>
          <Text style={styles.orderSummaryPrice}>
            {formatCurrency(getTotal())}
          </Text>
        </View>
      )}

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar produtos..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#333" />
          <Text style={styles.loadingText}>Carregando produtos...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ff4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchProducts(codGp)}
          >
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : filteredProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={48} color="#999" />
          <Text style={styles.emptyText}>
            {searchQuery ? 'Nenhum produto encontrado' : 'Nenhum produto disponível'}
          </Text>
          {searchQuery && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearSearchText}>Limpar busca</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item, index) => (item.id || item.codm || index).toString()}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onAdd={() => handleAddProduct(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhum produto encontrado</Text>
            </View>
          }
        />
      )}

      {getTotalItems() > 0 && (
        <TouchableOpacity style={styles.orderButton} onPress={handleViewOrder}>
          <Text style={styles.orderButtonText}>
            Ver Pedido ({getTotalItems()} itens - {formatCurrency(getTotal())})
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  orderSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f0f0f0',
    gap: 8,
  },
  orderSummaryText: {
    fontSize: 14,
    color: '#666',
  },
  orderSummaryDot: {
    fontSize: 14,
    color: '#999',
  },
  orderSummaryPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginLeft: 'auto',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  clearSearchText: {
    marginTop: 12,
    fontSize: 14,
    color: '#0a7ea4',
    textDecorationLine: 'underline',
  },
  listContent: {
    padding: 16,
  },
  orderButton: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    alignItems: 'center',
    margin: 16,
    borderRadius: 8,
  },
  orderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

