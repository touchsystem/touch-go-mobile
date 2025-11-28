import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useTables, Table } from '../hooks/useTables';
import { Card } from '../components/ui/Card';
import { ViewBillModal } from '../components/ui/ViewBillModal';
import { useAuth } from '../contexts/AuthContext';
import { storage, storageKeys } from '../services/storage';

export default function BillsScreen() {
  const { tables, loading, error, fetchTables } = useTables();
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isViewBillModalVisible, setIsViewBillModalVisible] = useState(false);

  useEffect(() => {
    fetchTables();
  }, []);

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
        grid: {
          gap: 12,
        },
        tableCard: {
          width: '23%',
          minHeight: 80,
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Contas</Text>
      </View>

      <View style={styles.content}>
        {tables.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>Nenhuma mesa disponível</Text>
          </View>
        ) : (
          <FlatList
            data={tables}
            numColumns={4}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.grid}
            renderItem={({ item }) => {
              const tableColor = getTableColor(item.status);
              const statusText = getTableStatusText(item.status);
              const canViewBill = item.status === 'O' || item.status === 'F';

              return (
                <View style={styles.tableCard}>
                  <TouchableOpacity
                    style={[
                      styles.tableButton,
                      {
                        backgroundColor: tableColor,
                        borderColor: canViewBill ? colors.primary : colors.border,
                        opacity: canViewBill ? 1 : 0.6,
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
            }}
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

