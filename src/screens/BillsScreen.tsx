import React, { useMemo, useState, useEffect, useRef, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  AppState,
} from 'react-native';
import { Alert } from '../utils/alert';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useTableContext, Table } from '../contexts/TableContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card } from '../components/ui/Card';
import { ViewBillModal } from '../components/ui/ViewBillModal';
import { useAuth } from '../contexts/AuthContext';
import { storage, storageKeys } from '../services/storage';
import { scale, scaleFont } from '../utils/responsive';

export default function BillsScreen() {
  const { tables, loading, error, fetchTables } = useTableContext();
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [profileNick, setProfileNick] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isViewBillModalVisible, setIsViewBillModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const appState = useRef(AppState.currentState);
  const lastFetchTime = useRef<number>(0);
  const FETCH_COOLDOWN = 2000; // 2 segundos entre atualizações
  const hasInitialLoad = useRef(false);
  const fetchTablesRef = useRef(fetchTables);

  const loadProfileNick = useCallback(async () => {
    const nick = await storage.getItem<string>(storageKeys.LAST_USED_NICK);
    setProfileNick(nick);
  }, []);

  useEffect(() => {
    loadProfileNick();
  }, [loadProfileNick]);

  // Atualiza o nick quando o user do AuthContext muda (após login)
  useEffect(() => {
    if (user?.nick) {
      setProfileNick(user.nick);
    }
  }, [user?.nick]);

  useFocusEffect(
    useCallback(() => {
      loadProfileNick();
    }, [loadProfileNick])
  );

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
        headerNick: {
          fontSize: scaleFont(12),
          color: colors.textSecondary,
          textAlign: 'right',
          marginTop: scale(4),
        },
        headerRight: {
          flexDirection: 'column',
          alignItems: 'flex-end',
          justifyContent: 'center',
          minWidth: scale(80),
        },
        content: {
          flex: 1,
          padding: scale(16),
        },
        searchContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: isDark ? '#1A1F2B' : '#F4F4F5',
          marginBottom: scale(16),
          paddingHorizontal: scale(12),
          borderRadius: scale(8),
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
        grid: {
          padding: scale(8),
          paddingBottom: scale(16),
        },
        tableCard: {
          width: '23%',
          minHeight: scale(60),
          margin: scale(2),
        },
        tableButton: {
          width: '100%',
          padding: scale(12),
          borderRadius: scale(12),
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 2,
          minHeight: scale(80),
        },
        tableNumber: {
          fontSize: scaleFont(18),
          fontWeight: '600',
          marginBottom: scale(4),
        },
        tableStatus: {
          fontSize: scaleFont(10),
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
          padding: scale(20),
        },
        errorText: {
          fontSize: scaleFont(14),
          color: colors.error,
          textAlign: 'center',
          marginTop: scale(12),
        },
        emptyContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: scale(40),
        },
        emptyText: {
          fontSize: scaleFont(16),
          color: colors.textSecondary,
          textAlign: 'center',
          marginTop: scale(12),
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
      Alert.alert(t('bills.warning'), t('bills.noOrdersMessage'));
    }
  };

  const handleCloseModal = () => {
    setIsViewBillModalVisible(false);
    setSelectedTable(null);
  };

  // Otimização: Remove duplicatas em O(n) em vez de O(n²)
  const filteredTables = useMemo(() => {
    // Usa Map para remover duplicatas de forma eficiente (O(n))
    const tableMap = new Map<number, Table>();
    
    // Itera uma vez e mantém apenas a última ocorrência de cada mesa
    for (let i = tables.length - 1; i >= 0; i--) {
      const table = tables[i];
      if (!tableMap.has(table.mesa_cartao)) {
        tableMap.set(table.mesa_cartao, table);
      }
    }
    
    // Converte Map para array e ordena por mesa_cartao para manter ordem correta
    const uniqueTables = Array.from(tableMap.values()).sort((a, b) => a.mesa_cartao - b.mesa_cartao);

    // Aplica filtro de busca se houver
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
          <Text style={styles.headerTitle}>{t('bills.title')}</Text>
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
          <Text style={styles.headerTitle}>{t('bills.title')}</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={scale(48)} color={colors.error} />
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
            <Text style={{ color: '#fff', fontWeight: '600' }}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container} pointerEvents={isViewBillModalVisible ? 'none' : 'auto'}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={scale(24)} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contas</Text>
        <View style={styles.headerRight}>
          {profileNick && (
            <Text style={styles.headerNick}>{profileNick}</Text>
          )}
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={scale(20)} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('bills.searchPlaceholder')}
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            keyboardType="number-pad"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={scale(20)} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {filteredTables.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={scale(48)} color={colors.textSecondary} />
            <Text style={styles.emptyText}>
              {searchQuery ? t('bills.emptyTables') : t('bills.noTables')}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredTables}
            numColumns={4}
            keyExtractor={(item) => `table-${item.mesa_cartao}`}
            contentContainerStyle={styles.grid}
            scrollEnabled={!isViewBillModalVisible}
            keyboardShouldPersistTaps="handled"
            removeClippedSubviews={true}
            maxToRenderPerBatch={16}
            updateCellsBatchingPeriod={50}
            initialNumToRender={16}
            windowSize={5}
            renderItem={({ item }) => (
              <TableCard
                table={item}
                onPress={handleTableSelect}
                getTableColor={getTableColor}
                getTableStatusText={getTableStatusText}
                colors={colors}
                isDark={isDark}
                styles={styles}
              />
            )}
          />
        )}
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

// Componente memoizado para melhor performance
const TableCard = memo<{
  table: Table;
  onPress: (table: Table) => void;
  getTableColor: (status: string) => string;
  getTableStatusText: (status: string) => string;
  colors: any;
  isDark: boolean;
  styles: any;
}>(({ table, onPress, getTableColor, getTableStatusText, colors, isDark, styles }) => {
  const tableColor = getTableColor(table.status);
  const statusText = getTableStatusText(table.status);
  const canViewBill = table.status === 'O' || table.status === 'F';

  return (
    <View style={styles.tableCard}>
      <TouchableOpacity
        style={[
          styles.tableButton,
          {
            backgroundColor: tableColor,
            borderColor: colors.border,
            borderWidth: 2,
          },
        ]}
        onPress={() => onPress(table)}
        activeOpacity={0.7}
        disabled={!canViewBill}
      >
        <Text
          style={[
            styles.tableNumber,
            {
              color: table.status === 'L' && !isDark ? '#111827' : '#FFFFFF',
            },
          ]}
        >
          {table.mesa_cartao}
        </Text>
        <Text
          style={[
            styles.tableStatus,
            {
              color: table.status === 'L' && !isDark ? '#6B7280' : '#FFFFFF',
            },
          ]}
        >
          {statusText}
        </Text>
      </TouchableOpacity>
    </View>
  );
}, (prevProps, nextProps) => {
  // Comparação customizada para evitar re-renders desnecessários
  return (
    prevProps.table.mesa_cartao === nextProps.table.mesa_cartao &&
    prevProps.table.status === nextProps.table.status &&
    prevProps.isDark === nextProps.isDark
  );
});

TableCard.displayName = 'TableCard';

