import React, { useMemo, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
  ScrollView,
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
          gap: 8,
          justifyContent: 'center',
          paddingBottom: 16,
        },
        rowWrapper: {
          justifyContent: 'center',
          gap: 8,
        },
        tableCard: {
          width: '23%',
          minHeight: 60,
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

  const filteredTables = useMemo(() => {
    if (!searchQuery.trim()) {
      return tables;
    }
    const query = searchQuery.trim();
    return tables.filter((table) => {
      const tableNumber = table.mesa_cartao.toString();
      return tableNumber.includes(query);
    });
  }, [tables, searchQuery]);

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

  const handleTableSelect = (table: Table) => {
    onSelectTable(table);
    onClose();
  };

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

              <ScrollView
                style={styles.scrollableContent}
                contentContainerStyle={styles.grid}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled={true}
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
                      const isSelected = selectedTableNumber === item.mesa_cartao;
                      const tableColor = getTableColor(item.status);
                      const statusText = getTableStatusText(item.status);

                      return (
                        <View key={item.id} style={styles.tableCard}>
                          <TouchableOpacity
                            style={[
                              styles.tableButton,
                              {
                                backgroundColor: tableColor,
                                borderColor: isSelected ? colors.primary : colors.border,
                                borderWidth: isSelected ? 3 : 2,
                              },
                            ]}
                            onPress={() => handleTableSelect(item)}
                            activeOpacity={0.7}
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
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

