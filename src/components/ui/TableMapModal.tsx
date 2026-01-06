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
import { useLanguage } from '../../contexts/LanguageContext';
import { useTables, Table } from '../../hooks/useTables';
import { Card } from './Card';
import { scale, scaleFont, scaleWidth, scaleHeight, widthPercentage } from '../../utils/responsive';

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
  const { t } = useLanguage();
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
          borderRadius: scale(16),
          padding: scale(20),
          width: Math.min(widthPercentage(90), scaleWidth(600)),
          maxHeight: scaleHeight(700),
          minHeight: scaleHeight(400),
          borderWidth: 1,
          borderColor: colors.border,
        },
        scrollableContent: {
          maxHeight: scaleHeight(300),
          minHeight: scaleHeight(200),
        },
        header: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: scale(20),
        },
        title: {
          fontSize: scaleFont(20),
          fontWeight: '600',
          color: colors.text,
        },
        closeButton: {
          padding: scale(4),
        },
        legend: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: scale(12),
          marginBottom: scale(16),
          paddingBottom: scale(16),
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          justifyContent: 'center',
        },
        legendItem: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: scale(6),
        },
        legendColor: {
          width: scale(16),
          height: scale(16),
          borderRadius: scale(4),
        },
        legendText: {
          fontSize: scaleFont(12),
          color: colors.textSecondary,
        },
        grid: {
          padding: scale(8),
          paddingBottom: scale(16),
        },
        rowWrapper: {
          justifyContent: 'center',
          gap: scale(8),
        },
        tableCard: {
          width: '23%',
          minHeight: scaleHeight(60),
          margin: scale(2),
        },
        tableButton: {
          width: '100%',
          padding: scale(8),
          borderRadius: scale(8),
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 2,
        },
        tableNumber: {
          fontSize: scaleFont(16),
          fontWeight: '600',
          marginBottom: scale(2),
        },
        tableStatus: {
          fontSize: scaleFont(9),
        },
        loadingContainer: {
          padding: scale(40),
          alignItems: 'center',
        },
        errorContainer: {
          padding: scale(40),
          alignItems: 'center',
        },
        errorText: {
          fontSize: scaleFont(14),
          color: colors.error,
          textAlign: 'center',
        },
        emptyContainer: {
          padding: scale(40),
          alignItems: 'center',
        },
        emptyText: {
          fontSize: scaleFont(14),
          color: colors.textSecondary,
          textAlign: 'center',
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
              <Text style={styles.title}>{t('orders.selectTable')}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={scale(24)} color={colors.text} />
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
              <Text style={styles.title}>{t('orders.selectTable')}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={scale(24)} color={colors.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={scale(48)} color={colors.error} />
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
                <Text style={styles.title}>{t('orders.selectTable')}</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={scale(24)} color={colors.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={scale(20)} color={colors.textSecondary} style={styles.searchIcon} />
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

