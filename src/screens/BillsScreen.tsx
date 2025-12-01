import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  AppState,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useTableContext, Table } from '../contexts/TableContext';
import { Card } from '../components/ui/Card';
import { ViewBillModal } from '../components/ui/ViewBillModal';
import { useAuth } from '../contexts/AuthContext';
import { storage, storageKeys } from '../services/storage';

export default function BillsScreen() {
  const { tables, loading, error, fetchTables } = useTableContext();
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isViewBillModalVisible, setIsViewBillModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const appState = useRef(AppState.currentState);
  const lastFetchTime = useRef<number>(0);
  const FETCH_COOLDOWN = 2000; // 2 segundos entre atualizações
  const hasInitialLoad = useRef(false);
  const fetchTablesRef = useRef(fetchTables);

  // Atualiza a ref sempre que fetchTables mudar
  useEffect(() => {
    fetchTablesRef.current = fetchTables;
  }, [fetchTables]);

  // Carrega apenas uma vez no mount
  useEffect(() => {
    if (!hasInitialLoad.current) {
      fetchTables();
      lastFetchTime.current = Date.now();
      hasInitialLoad.current = true;
    }
  }, []); // Array vazio - executa apenas uma vez

  // Atualiza as mesas quando a tela recebe foco (quando o usuário troca de aba)
  useFocusEffect(
    useCallback(() => {
      // Evita múltiplas requisições em pouco tempo
      const now = Date.now();
      const timeSinceLastFetch = now - lastFetchTime.current;
      
      // Só atualiza se passou o cooldown
      if (timeSinceLastFetch >= FETCH_COOLDOWN) {
        fetchTablesRef.current();
        lastFetchTime.current = now;
      }
    }, []) // Array vazio - usa ref para evitar loops
  );

  // Atualiza quando o app volta do background
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App voltou do background, atualiza as mesas (com cooldown)
        const now = Date.now();
        if (now - lastFetchTime.current >= FETCH_COOLDOWN) {
          fetchTables();
          lastFetchTime.current = now;
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [fetchTables]);

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
          justifyContent: 'center',
          padding: 20,
          paddingTop: Math.max(insets.top, 40),
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTitle: {
          fontSize: 18,
          fontWeight: '600',
          color: colors.text,
        },
        content: {
          flex: 1,
          padding: 16,
        },
        searchContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: isDark ? '#1A1F2B' : '#F4F4F5',
          marginBottom: 16,
          paddingHorizontal: 12,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: colors.border,
        },
        searchIcon: {
          marginRight: 8,
        },
        searchInput: {
          flex: 1,
          height: 40,
          fontSize: 16,
          color: colors.text,
        },
        grid: {
          gap: 8,
          justifyContent: 'center',
          paddingBottom: 16,
        },
        tableCard: {
          width: '23%',
          minHeight: 60,
        },
        tableButton: {
          width: '100%',
          padding: 12,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 2,
          minHeight: 80,
        },
        tableNumber: {
          fontSize: 18,
          fontWeight: '600',
          marginBottom: 4,
        },
        tableStatus: {
          fontSize: 10,
        },
        loadingContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
        errorContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        },
        errorText: {
          fontSize: 14,
          color: colors.error,
          textAlign: 'center',
          marginTop: 12,
        },
        emptyContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 40,
        },
        emptyText: {
          fontSize: 16,
          color: colors.textSecondary,
          textAlign: 'center',
          marginTop: 12,
        },
      }),
    [colors, isDark, insets]
  );

  const getTableColor = (status: string) => {
    switch (status) {
      case 'L':
        return isDark ? '#374151' : '#E5E7EB'; // Livre
      case 'O':
        return '#10B981'; // Ocupada
      case 'R':
        return '#3B82F6'; // Reservada
      case 'F':
        return '#F59E0B'; // Fechada
      case 'I':
        return '#EF4444'; // Inativa
      default:
        return colors.border;
    }
  };

  const getTableStatusText = (status: string) => {
    switch (status) {
      case 'L':
        return 'Livre';
      case 'O':
        return 'Ocupada';
      case 'R':
        return 'Reservada';
      case 'F':
        return 'Fechada';
      case 'I':
        return 'Inativa';
      default:
        return '';
    }
  };

  const handleTableSelect = async (table: Table) => {
    // Só permite visualizar conta de mesas ocupadas ou fechadas
    if (table.status === 'O' || table.status === 'F') {
      setSelectedTable(table);
      setIsViewBillModalVisible(true);
    } else {
      Alert.alert('Aviso', 'Esta mesa não possui pedidos. Apenas mesas ocupadas ou fechadas podem ter contas.');
    }
  };

  const handleCloseModal = () => {
    setIsViewBillModalVisible(false);
    setSelectedTable(null);
  };

  const filteredTables = useMemo(() => {
    // Remove duplicatas baseado em mesa_cartao (mantém apenas a ÚLTIMA ocorrência para preservar atualizações)
    const uniqueTables = tables.filter((table, index, self) => {
      // Encontra o último índice da mesa com o mesmo mesa_cartao
      let lastIndex = -1;
      for (let i = self.length - 1; i >= 0; i--) {
        if (self[i].mesa_cartao === table.mesa_cartao) {
          lastIndex = i;
          break;
        }
      }
      // Mantém apenas a última ocorrência (a mais atualizada)
      return index === lastIndex;
    });

    if (!searchQuery.trim()) {
      return uniqueTables;
    }
    const query = searchQuery.trim();
    return uniqueTables.filter((table) => {
      const tableNumber = table.mesa_cartao.toString();
      return tableNumber.includes(query);
    });
  }, [tables, searchQuery]);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Contas</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Contas</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={{
              marginTop: 20,
              paddingHorizontal: 20,
              paddingVertical: 10,
              backgroundColor: colors.primary,
              borderRadius: 8,
            }}
            onPress={fetchTables}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container} pointerEvents={isViewBillModalVisible ? 'none' : 'auto'}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Contas</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar mesa por número..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            keyboardType="number-pad"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.grid}
          scrollEnabled={!isViewBillModalVisible}
          nestedScrollEnabled={false}
          pointerEvents={isViewBillModalVisible ? 'none' : 'auto'}
          keyboardShouldPersistTaps="handled"
        >
          {filteredTables.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="restaurant-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>
                {searchQuery ? 'Nenhuma mesa encontrada' : 'Nenhuma mesa disponível'}
              </Text>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
              {filteredTables.map((item) => {
                const tableColor = getTableColor(item.status);
                const statusText = getTableStatusText(item.status);
                const canViewBill = item.status === 'O' || item.status === 'F';

                return (
                  <View key={`table-${item.mesa_cartao}`} style={styles.tableCard}>
                    <TouchableOpacity
                      style={[
                        styles.tableButton,
                        {
                          backgroundColor: tableColor,
                          borderColor: colors.border,
                          borderWidth: 2,
                        },
                      ]}
                      onPress={() => handleTableSelect(item)}
                      activeOpacity={0.7}
                      disabled={!canViewBill}
                    >
                      <Text
                        style={[
                          styles.tableNumber,
                          {
                            color: item.status === 'L' && !isDark ? '#111827' : '#FFFFFF',
                          },
                        ]}
                      >
                        {item.mesa_cartao}
                      </Text>
                      <Text
                        style={[
                          styles.tableStatus,
                          {
                            color: item.status === 'L' && !isDark ? '#6B7280' : '#FFFFFF',
                          },
                        ]}
                      >
                        {statusText}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </View>

      {selectedTable && (
        <ViewBillModal
          visible={isViewBillModalVisible}
          mesaCartao={selectedTable.mesa_cartao}
          onClose={handleCloseModal}
        />
      )}
    </View>
  );
}

