import React, { useEffect, useMemo, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useProducts } from '../hooks/useProducts';
import { ProductGroupCard } from '../components/ui/ProductGroupCard';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { ProductGroup } from '../types';
import { scale, scaleFont } from '../utils/responsive';
import { storage, storageKeys } from '../services/storage';

export default function MenuScreen() {
  const { user } = useAuth();
  const { groups, loading, fetchGroups } = useProducts();
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [profileNick, setProfileNick] = React.useState<string | null>(null);

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
        headerNick: {
          fontSize: scaleFont(12),
          color: colors.textSecondary,
          textAlign: 'right',
          marginTop: scale(4),
        },
        headerLeft: {
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          minWidth: scale(80),
        },
        headerRight: {
          flexDirection: 'column',
          alignItems: 'flex-end',
          justifyContent: 'center',
          minWidth: scale(80),
        },
        searchButton: {
          justifyContent: 'center',
          alignItems: 'center',
          width: scale(40),
          height: scale(40),
        },
        listContent: {
          padding: scale(12),
          paddingBottom: scale(20),
        },
        row: {
          justifyContent: 'space-between',
          alignItems: 'stretch',
        },
        emptyContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: scale(20),
        },
        emptyText: {
          fontSize: scaleFont(16),
          color: colors.textSecondary,
          textAlign: 'center',
          marginTop: scale(12),
        },
      }),
    [colors, insets]
  );

  useEffect(() => {
    // Só busca grupos se o usuário estiver autenticado
    if (user) {
      fetchGroups();
    }
  }, [user, fetchGroups]);

  const loadProfileNick = useCallback(async () => {
    const nick = await storage.getItem<string>(storageKeys.LAST_USED_NICK);
    setProfileNick(nick);
  }, []);

  useEffect(() => {
    loadProfileNick();
  }, [loadProfileNick]);

  // Atualiza o nick quando a tela receber foco (quando voltar do perfil após trocar usuário)
  useFocusEffect(
    useCallback(() => {
      loadProfileNick();
    }, [loadProfileNick])
  );

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
          <View style={{ width: scale(40) }} />
          <Text style={styles.headerTitle}>Cardápio</Text>
          <View style={styles.headerRight}>
            {profileNick && (
              <Text style={styles.headerNick}>{profileNick}</Text>
            )}
          </View>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="restaurant-outline" size={scale(48)} color={colors.textSecondary} />
          <Text style={styles.emptyText}>Nenhum grupo de produtos disponível</Text>
        </View>
      </View>
    );
  }

  const handleSearchPress = () => {
    router.push('/(tabs)/search-products');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearchPress}
        >
          <Ionicons name="search-outline" size={scale(24)} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cardápio</Text>
        <View style={styles.headerRight}>
          {profileNick && (
            <Text style={styles.headerNick}>{profileNick}</Text>
          )}
        </View>
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

