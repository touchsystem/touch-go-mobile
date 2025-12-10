import React, { useMemo, useEffect, useState, memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useTables, Table } from '../../hooks/useTables';
import { Card } from './Card';

interface TableMapModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectTable: (table: Table) => void;
  selectedTableNumber?: number;
  refreshKey?: number; // Chave para forçar atualização
}

export const TableMapModal: React.FC<TableMapModalProps> = ({
  visible,
  onClose,
  onSelectTable,
  selectedTableNumber,
  refreshKey,
}) => {
  const { colors, isDark } = useTheme();
  const { tables, loading, error, fetchTables } = useTables();
  const [searchQuery, setSearchQuery] = useState('');

  // Recarrega as mesas sempre que o modal for aberto ou quando refreshKey mudar
  useEffect(() => {
    if (visible) {
      fetchTables();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, refreshKey]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        modalOverlay: {
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        },
        modalContent: {
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 20,
          width: Math.min(Dimensions.get('window').width * 0.9, 500),
          maxHeight: Dimensions.get('window').height * 0.85,
          minHeight: 400,
          borderWidth: 1,
          borderColor: colors.border,
        },
        scrollableContent: {
          maxHeight: 300,
          minHeight: 200,
        },
        header: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        },
        title: {
          fontSize: 20,
          fontWeight: '600',
          color: colors.text,
        },
        closeButton: {
          padding: 4,
        },
        legend: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 16,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          justifyContent: 'center',
        },
        legendItem: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
        },
        legendColor: {
          width: 16,
          height: 16,
          borderRadius: 4,
        },
        legendText: {
          fontSize: 12,
          color: colors.textSecondary,
        },
        grid: {
          padding: 8,
          paddingBottom: 16,
        },
        rowWrapper: {
          justifyContent: 'center',
          gap: 8,
        },
        tableCard: {
          width: '23%',
          minHeight: 60,
          margin: 2,
        },
        tableButton: {
          width: '100%',
          padding: 8,
          borderRadius: 8,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 2,
        },
        tableNumber: {
          fontSize: 16,
          fontWeight: '600',
          marginBottom: 2,
        },
        tableStatus: {
          fontSize: 9,
        },
        loadingContainer: {
          padding: 40,
          alignItems: 'center',
        },
        errorContainer: {
          padding: 40,
          alignItems: 'center',
        },
        errorText: {
          fontSize: 14,
          color: colors.error,
          textAlign: 'center',
        },
        emptyContainer: {
          padding: 40,
          alignItems: 'center',
        },
        emptyText: {
          fontSize: 14,
          color: colors.textSecondary,
          textAlign: 'center',
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
      }),
    [colors, isDark]
  );

  // Otimização: Remove duplicatas e ordena por mesa_cartao
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
    
    // Converte Map para array e ordena por mesa_cartao
    let uniqueTables = Array.from(tableMap.values()).sort((a, b) => a.mesa_cartao - b.mesa_cartao);

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

  // Memoiza funções para evitar recriações
  const getTableColor = useCallback((status: string) => {
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
  }, [isDark, colors.border]);

  const getTableStatusText = useCallback((status: string) => {
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
  }, []);

  const handleTableSelect = useCallback((table: Table) => {
    onSelectTable(table);
    onClose();
  }, [onSelectTable, onClose]);

  if (!visible) {
    return null;
  }

  if (loading) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.title}>Selecionar Mesa</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.title}>Selecionar Mesa</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={styles.modalOverlay}
      >
        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalContent}>
              <View style={styles.header}>
                <Text style={styles.title}>Selecionar Mesa</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

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

              {filteredTables.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="restaurant-outline" size={48} color={colors.textSecondary} />
                  <Text style={styles.emptyText}>
                    {searchQuery ? 'Nenhuma mesa encontrada' : 'Nenhuma mesa disponível'}
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={filteredTables}
                  numColumns={4}
                  keyExtractor={(item) => `table-${item.mesa_cartao}-${item.id}`}
                  contentContainerStyle={styles.grid}
                  style={styles.scrollableContent}
                  keyboardShouldPersistTaps="handled"
                  removeClippedSubviews={true}
                  maxToRenderPerBatch={16}
                  updateCellsBatchingPeriod={50}
                  initialNumToRender={16}
                  windowSize={5}
                  renderItem={({ item }) => (
                    <TableCard
                      table={item}
                      isSelected={selectedTableNumber === item.mesa_cartao}
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
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

// Componente memoizado para melhor performance
const TableCard = memo<{
  table: Table;
  isSelected: boolean;
  onPress: (table: Table) => void;
  getTableColor: (status: string) => string;
  getTableStatusText: (status: string) => string;
  colors: any;
  isDark: boolean;
  styles: any;
}>(({ table, isSelected, onPress, getTableColor, getTableStatusText, colors, isDark, styles }) => {
  const tableColor = getTableColor(table.status);
  const statusText = getTableStatusText(table.status);

  return (
    <View style={styles.tableCard}>
      <TouchableOpacity
        style={[
          styles.tableButton,
          {
            backgroundColor: tableColor,
            borderColor: isSelected ? colors.primary : colors.border,
            borderWidth: isSelected ? 3 : 2,
          },
        ]}
        onPress={() => onPress(table)}
        activeOpacity={0.7}
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
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isDark === nextProps.isDark
  );
});

TableCard.displayName = 'TableCard';

