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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProducts } from '../hooks/useProducts';
import { ProductGroupCard } from '../components/ui/ProductGroupCard';
import { Button } from '../components/ui/Button';
import { useCart } from '../contexts/CartContext';
import { formatCurrency } from '../utils/format';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { scale, scaleFont } from '../utils/responsive';

export default function ProductGroupsScreen() {
  const { user } = useAuth();
  const { groups, loading, fetchGroups } = useProducts();
  const { getTotal, getTotalItems, clearCart } = useCart();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

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
          paddingHorizontal: scale(20),
          paddingVertical: scale(20),
          paddingTop: Math.max(insets.top + scale(10), scale(20)),
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          minHeight: scale(70),
        },
        headerTitle: {
          fontSize: scaleFont(18),
          fontWeight: '600',
          color: colors.text,
          textAlign: 'center',
          flex: 1,
        },
        headerRight: {
          width: scale(40),
        },
        listContent: {
          padding: scale(12),
        },
        row: {
          justifyContent: 'space-between',
        },
        footer: {
          padding: scale(16),
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
        sendButton: {
          marginBottom: scale(12),
        },
        footerButtons: {
          flexDirection: 'row',
          gap: scale(12),
        },
        footerButton: {
          flex: 1,
        },
      }),
    [colors]
  );

  useEffect(() => {
    // Só busca grupos se o usuário estiver autenticado
    if (user) {
      fetchGroups();
    }
  }, [user, fetchGroups]);

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
        <TouchableOpacity 
          onPress={() => router.back()}
          style={{ width: scale(40), height: scale(40), justifyContent: 'center', alignItems: 'center' }}
        >
          <Ionicons name="arrow-back" size={scale(24)} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('productGroups.title')}</Text>
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
          icon={<Ionicons name="paper-plane-outline" size={scale(20)} color="#fff" />}
          style={styles.sendButton}
        />
        <View style={styles.footerButtons}>
          <Button
            title="Salvar"
            variant="outline"
            onPress={handleSave}
            icon={<Ionicons name="lock-closed-outline" size={scale(18)} color={colors.text} />}
            style={styles.footerButton}
          />
          <Button
            title="Limpar"
            variant="outline"
            onPress={handleClear}
            icon={<Ionicons name="trash-outline" size={scale(18)} color={colors.text} />}
            style={styles.footerButton}
          />
        </View>
      </View>
    </View>
  );
}
