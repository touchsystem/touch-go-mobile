import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProducts } from '../hooks/useProducts';
import { ProductGroupCard } from '../components/ui/ProductGroupCard';
import { Button } from '../components/ui/Button';
import { useCart } from '../contexts/CartContext';
import { formatCurrency } from '../utils/format';
import { useTheme } from '../contexts/ThemeContext';

export default function ProductGroupsScreen() {
  const { groups, loading, fetchGroups } = useProducts();
  const { getTotal, getTotalItems, clearCart } = useCart();
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        loadingContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 20,
          paddingTop: 40,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTitle: {
          fontSize: 18,
          fontWeight: '600',
          color: colors.text,
        },
        headerRight: {
          width: 24,
        },
        listContent: {
          padding: 12,
        },
        row: {
          justifyContent: 'space-between',
        },
        footer: {
          padding: 16,
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
        sendButton: {
          marginBottom: 12,
        },
        footerButtons: {
          flexDirection: 'row',
          gap: 12,
        },
        footerButton: {
          flex: 1,
        },
      }),
    [colors]
  );

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleGroupPress = (group: ProductGroup) => {
    router.push({
      pathname: '/(tabs)/products',
      params: { codGp: group.cod_gp },
    });
  };

  const handleSendOrder = () => {
    // Implementar envio de pedido
    console.log('Enviar pedido');
  };

  const handleSave = () => {
    // Implementar salvar pedido
    console.log('Salvar pedido');
  };

  const handleClear = () => {
    clearCart();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Grupos de Produtos</Text>
        <View style={styles.headerRight} />
      </View>

      <FlatList
        data={groups}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ProductGroupCard
            group={item}
            onPress={() => handleGroupPress(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
      />

      <View style={styles.footer}>
        <Button
          title="Enviar Pedido"
          onPress={handleSendOrder}
          icon={<Ionicons name="paper-plane-outline" size={20} color="#fff" />}
          style={styles.sendButton}
        />
        <View style={styles.footerButtons}>
          <Button
            title="Salvar"
            variant="outline"
            onPress={handleSave}
            icon={<Ionicons name="lock-closed-outline" size={18} color={colors.text} />}
            style={styles.footerButton}
          />
          <Button
            title="Limpar"
            variant="outline"
            onPress={handleClear}
            icon={<Ionicons name="trash-outline" size={18} color={colors.text} />}
            style={styles.footerButton}
          />
        </View>
      </View>
    </View>
  );
}
