import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProducts } from '../hooks/useProducts';
import { ProductGroupCard } from '../components/ui/ProductGroupCard';
import { useTheme } from '../contexts/ThemeContext';
import { ProductGroup } from '../types';

export default function MenuScreen() {
  const { groups, loading, fetchGroups } = useProducts();
  const router = useRouter();
  const { colors } = useTheme();

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
          justifyContent: 'center',
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
        listContent: {
          padding: 12,
        },
        row: {
          justifyContent: 'space-between',
        },
        emptyContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        },
        emptyText: {
          fontSize: 16,
          color: colors.textSecondary,
          textAlign: 'center',
          marginTop: 12,
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (groups.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Cardápio</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="restaurant-outline" size={48} color={colors.textSecondary} />
          <Text style={styles.emptyText}>Nenhum grupo de produtos disponível</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cardápio</Text>
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
    </View>
  );
}

