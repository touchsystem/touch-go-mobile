import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProducts } from '../hooks/useProducts';
import { ProductCard } from '../components/ui/ProductCard';
import { useCart } from '../contexts/CartContext';
import { useTableContext } from '../contexts/TableContext';
import { formatCurrency, capitalizeFirstLetter } from '../utils/format';
import { Product } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useRelationalGroups } from '../hooks/useRelationalGroups';
import { scale, scaleFont } from '../utils/responsive';

export default function ProductsScreen() {
  const { codGp } = useLocalSearchParams<{ codGp?: string }>();
  const { products, loading, error, fetchProducts } = useProducts();
  const { addToCart, getTotal, getTotalItems } = useCart();
  const { selectedTable } = useTableContext();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { fetchRelationalGroups } = useRelationalGroups();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: scale(20),
          paddingTop: Math.max(insets.top, scale(10)),
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTitle: {
          fontSize: scaleFont(18),
          fontWeight: '600',
          color: colors.text,
        },
        orderSummary: {
          flexDirection: 'row',
          alignItems: 'center',
          padding: scale(12),
          backgroundColor: isDark ? '#1C2230' : '#EEF2F7',
          gap: scale(8),
        },
        orderSummaryText: {
          fontSize: scaleFont(14),
          color: colors.textSecondary,
        },
        orderSummaryDot: {
          fontSize: scaleFont(14),
          color: colors.textSecondary,
        },
        orderSummaryPrice: {
          fontSize: scaleFont(14),
          fontWeight: '600',
          color: colors.text,
          marginLeft: 'auto',
        },
        searchContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.surface,
          margin: scale(16),
          paddingHorizontal: scale(12),
          borderRadius: scale(10),
          borderWidth: 1,
          borderColor: colors.border,
        },
        searchIcon: {
          marginRight: scale(8),
        },
        searchInput: {
          flex: 1,
          height: scale(40),
          fontSize: scaleFont(16),
          color: colors.text,
        },
        loadingContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        },
        loadingText: {
          marginTop: scale(12),
          fontSize: scaleFont(14),
          color: colors.textSecondary,
        },
        errorContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: scale(20),
          backgroundColor: colors.background,
        },
        errorText: {
          marginTop: scale(12),
          fontSize: scaleFont(16),
          color: colors.error,
          textAlign: 'center',
        },
        retryButton: {
          marginTop: scale(20),
          paddingHorizontal: scale(20),
          paddingVertical: scale(10),
          backgroundColor: colors.primary,
          borderRadius: scale(10),
        },
        retryButtonText: {
          color: '#fff',
          fontSize: scaleFont(14),
          fontWeight: '600',
        },
        emptyContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: scale(20),
        },
        emptyText: {
          marginTop: scale(12),
          fontSize: scaleFont(16),
          color: colors.textSecondary,
          textAlign: 'center',
        },
        clearSearchText: {
          marginTop: scale(12),
          fontSize: scaleFont(14),
          color: colors.primary,
          textDecorationLine: 'underline',
        },
        listContent: {
          padding: scale(16),
        },
        orderButton: {
          backgroundColor: colors.primary,
          padding: scale(16),
          alignItems: 'center',
          margin: scale(16),
          borderRadius: scale(10),
        },
        orderButtonText: {
          color: '#fff',
          fontSize: scaleFont(16),
          fontWeight: '600',
        },
      }),
    [colors, isDark, insets]
  );

  useEffect(() => {
    fetchProducts(codGp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codGp]);

  const filteredProducts = products.filter((product) => {
    const nome = product.nome || product.des2 || product.des1 || '';
    if (!nome) return false;
    return nome.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleAddProduct = async (product: Product) => {
    try {
      const codm = product.codm || product.id?.toString() || '';
      if (!codm) {
        // Se não tiver codm, adiciona direto
        const nomeRaw = product.nome || product.des2 || product.des1 || 'Produto';
        const descricaoRaw = product.descricao || product.des1 || '';
        const preco = product.preco || product.pv || 0;
        const id = product.id || parseInt(product.codm || '0') || 0;
        const pv = product.pv || product.preco || 0;
        const nome = capitalizeFirstLetter(nomeRaw);
        const descricao = descricaoRaw ? capitalizeFirstLetter(descricaoRaw) : '';

        addToCart({
          id,
          nome,
          descricao,
          preco,
          codm,
          pv,
          codm_status: product.status || 'C',
          codm_relacional: undefined,
        });
        return;
      }

      // Busca grupos relacionais
      const grupos = await fetchRelationalGroups(codm);
      
      if (grupos.length > 0) {
        // Navega para tela de opções
        router.push({
          pathname: '/(tabs)/product-options',
          params: {
            produto: JSON.stringify(product),
            grupos: JSON.stringify(grupos),
          },
        });
        return;
      } else {
        // Adiciona direto ao carrinho
        const nomeRaw = product.nome || product.des2 || product.des1 || 'Produto';
        const descricaoRaw = product.descricao || product.des1 || '';
        const preco = product.preco || product.pv || 0;
        const id = product.id || parseInt(product.codm || '0') || 0;
        const pv = product.pv || product.preco || 0;
        const nome = capitalizeFirstLetter(nomeRaw);
        const descricao = descricaoRaw ? capitalizeFirstLetter(descricaoRaw) : '';

        addToCart({
          id,
          nome,
          descricao,
          preco,
          codm,
          pv,
          codm_status: product.status || 'C',
          codm_relacional: undefined,
        });
      }
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      // Em caso de erro, adiciona direto
      const nomeRaw = product.nome || product.des2 || product.des1 || 'Produto';
      const descricaoRaw = product.descricao || product.des1 || '';
      const preco = product.preco || product.pv || 0;
      const id = product.id || parseInt(product.codm || '0') || 0;
      const codm = product.codm || product.id?.toString() || '';
      const pv = product.pv || product.preco || 0;
      const nome = capitalizeFirstLetter(nomeRaw);
      const descricao = descricaoRaw ? capitalizeFirstLetter(descricaoRaw) : '';

      addToCart({
        id,
        nome,
        descricao,
        preco,
        codm,
        pv,
        codm_status: product.status || 'C',
        codm_relacional: undefined,
      });
    }
  };

  const handleViewOrder = () => {
    router.push('/(tabs)/orders');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={scale(24)} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Produtos</Text>
        <View style={{ width: 24 }} />
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
        <Ionicons name="search-outline" size={scale(20)} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar produtos..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Carregando produtos...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={scale(48)} color={colors.error} />
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
          <Ionicons name="cube-outline" size={scale(48)} color={colors.textSecondary} />
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

