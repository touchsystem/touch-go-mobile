import React, { useEffect, useMemo, useState, useCallback } from 'react';
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
import { useRouter } from 'expo-router';
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
import { useAuth } from '../contexts/AuthContext';

export default function SearchProductsScreen() {
  const { products, loading, error, fetchProducts } = useProducts();
  const { addToCart, getTotal, getTotalItems } = useCart();
  const { selectedTable } = useTableContext();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { fetchRelationalGroups } = useRelationalGroups();
  const { user } = useAuth();

  // Busca todos os produtos ao carregar a tela
  useEffect(() => {
    if (user) {
      fetchProducts(); // Busca todos os produtos sem filtro de grupo
    }
  }, [user, fetchProducts]);

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
          paddingHorizontal: scale(20),
          paddingVertical: scale(20),
          paddingTop: Math.max(insets.top + scale(10), scale(20)),
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          minHeight: scale(70),
        },
        backButton: {
          width: scale(40),
          height: scale(40),
          justifyContent: 'center',
          alignItems: 'center',
        },
        headerTitle: {
          fontSize: scaleFont(18),
          fontWeight: '600',
          color: colors.text,
          textAlign: 'center',
          flex: 1,
        },
        orderSummary: {
          flexDirection: 'row',
          alignItems: 'center',
          padding: scale(12),
          paddingHorizontal: scale(16),
          backgroundColor: isDark ? '#1C2230' : '#EEF2F7',
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
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
          marginBottom: scale(12),
          paddingHorizontal: scale(16),
          paddingVertical: scale(12),
          borderRadius: scale(12),
          borderWidth: 1,
          borderColor: colors.border,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 3,
        },
        searchIcon: {
          marginRight: scale(12),
        },
        searchInput: {
          flex: 1,
          fontSize: scaleFont(16),
          color: colors.text,
        },
        resultsCount: {
          paddingHorizontal: scale(16),
          paddingBottom: scale(8),
        },
        resultsCountText: {
          fontSize: scaleFont(14),
          color: colors.textSecondary,
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
          paddingVertical: scale(12),
          backgroundColor: colors.primary,
          borderRadius: scale(10),
        },
        retryButtonText: {
          color: '#fff',
          fontSize: scaleFont(14),
          fontWeight: '600',
        },
        listContent: {
          padding: scale(16),
          paddingTop: scale(8),
        },
        emptyContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: scale(40),
        },
        emptyIcon: {
          marginBottom: scale(16),
        },
        emptyText: {
          fontSize: scaleFont(16),
          color: colors.text,
          textAlign: 'center',
          marginBottom: scale(8),
          fontWeight: '600',
        },
        emptySubtext: {
          fontSize: scaleFont(14),
          color: colors.textSecondary,
          textAlign: 'center',
        },
        clearSearchButton: {
          marginTop: scale(16),
          paddingHorizontal: scale(20),
          paddingVertical: scale(10),
          backgroundColor: colors.primary,
          borderRadius: scale(8),
        },
        clearSearchText: {
          color: '#fff',
          fontSize: scaleFont(14),
          fontWeight: '600',
        },
        orderButton: {
          backgroundColor: colors.primary,
          padding: scale(16),
          alignItems: 'center',
          margin: scale(16),
          borderRadius: scale(12),
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 4,
        },
        orderButtonText: {
          color: '#fff',
          fontSize: scaleFont(16),
          fontWeight: '600',
        },
      }),
    [colors, isDark, insets]
  );

  // Filtra produtos baseado na busca
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) {
      return products;
    }
    const query = searchQuery.toLowerCase().trim();
    return products.filter((product) => {
      const nome = (product.nome || product.des2 || product.des1 || '').toLowerCase();
      const descricao = (product.descricao || product.des1 || '').toLowerCase();
      if (!nome) return false;
      return nome.includes(query) || descricao.includes(query);
    });
  }, [products, searchQuery]);

  const handleProductPress = useCallback(async (product: Product) => {
    if (!selectedTable) {
      // Se não tiver mesa selecionada, abre o modal de seleção de mesa
      router.push('/(tabs)/orders');
      return;
    }

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
  }, [selectedTable, router, fetchRelationalGroups, addToCart]);

  const handleViewOrder = () => {
    router.push('/(tabs)/orders');
  };

  if (loading && products.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={scale(24)} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pesquisar Produtos</Text>
          <View style={{ width: scale(40) }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Carregando produtos...</Text>
        </View>
      </View>
    );
  }

  if (error && products.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={scale(24)} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pesquisar Produtos</Text>
          <View style={{ width: scale(40) }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={scale(48)} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchProducts()}
          >
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={scale(24)} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pesquisar Produtos</Text>
        <View style={{ width: scale(40) }} />
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
        <Ionicons name="search-outline" size={scale(22)} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar produtos..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus={true}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={scale(20)} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {searchQuery.trim() && filteredProducts.length > 0 && (
        <View style={styles.resultsCount}>
          <Text style={styles.resultsCountText}>
            {filteredProducts.length} {filteredProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
          </Text>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Carregando produtos...</Text>
        </View>
      ) : filteredProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons 
            name={searchQuery ? "search-outline" : "cube-outline"} 
            size={scale(64)} 
            color={colors.textSecondary} 
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyText}>
            {searchQuery 
              ? 'Nenhum produto encontrado' 
              : 'Digite para buscar produtos'}
          </Text>
          {searchQuery && (
            <Text style={styles.emptySubtext}>
              Tente usar palavras-chave diferentes
            </Text>
          )}
          {searchQuery && (
            <TouchableOpacity 
              style={styles.clearSearchButton}
              onPress={() => setSearchQuery('')}
            >
              <Text style={styles.clearSearchText}>Limpar busca</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onAdd={() => handleProductPress(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={10}
          windowSize={5}
          showsVerticalScrollIndicator={false}
        />
      )}

      {getTotalItems() > 0 && (
        <TouchableOpacity style={styles.orderButton} onPress={handleViewOrder}>
          <Text style={styles.orderButtonText}>
            Ver Pedido ({getTotalItems()} {getTotalItems() === 1 ? 'item' : 'itens'} - {formatCurrency(getTotal())})
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
