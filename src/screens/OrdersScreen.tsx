import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../contexts/CartContext';
import { useTable } from '../contexts/TableContext';
import { Table } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, capitalizeFirstLetter } from '../utils/format';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useTheme } from '../contexts/ThemeContext';
import { TableMapModal } from '../components/ui/TableMapModal';
import { Table as TableType } from '../hooks/useTables';
import axiosInstance from '../services/api';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function OrdersScreen() {
  const { cart, updateQuantity, removeFromCart, getTotal, clearCart } = useCart();
  const { selectedTable, setSelectedTable } = useTable();
  const { user } = useAuth();
  const [isTableMapVisible, setIsTableMapVisible] = useState(false);
  const [tableRefreshKey, setTableRefreshKey] = useState(0);
  const router = useRouter();
  const { colors, isDark } = useTheme();

  // Calcula altura disponível para a lista (tela - header - footer - outros elementos)
  const listHeight = SCREEN_HEIGHT - 320;

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
        content: {
          flex: 1,
          padding: 16,
          backgroundColor: colors.background,
        },
        tableCard: {
          marginBottom: 16,
        },
        sectionLabel: {
          fontSize: 14,
          fontWeight: '500',
          color: colors.textSecondary,
          marginBottom: 12,
        },
        selectTableButton: {
          marginBottom: 12,
        },
        infoText: {
          fontSize: 14,
          color: colors.textSecondary,
        },
        orderSection: {
          marginBottom: 16,
          flex: 1,
          minHeight: 200,
        },
        orderHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        },
        sectionTitle: {
          fontSize: 16,
          fontWeight: '600',
          color: colors.text,
        },
        itemsCount: {
          fontSize: 14,
          color: colors.textSecondary,
        },
        cartItem: {
          marginBottom: 12,
        },
        emptyCart: {
          alignItems: 'center',
          justifyContent: 'center',
          padding: 40,
        },
        emptyCartText: {
          fontSize: 16,
          color: colors.textSecondary,
          marginTop: 12,
        },
        cartItemContent: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
        cartItemInfo: {
          flex: 1,
        },
        cartItemControls: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        },
        cartItemName: {
          fontSize: 16,
          fontWeight: '600',
          color: colors.text,
          marginBottom: 4,
        },
        cartItemPrice: {
          fontSize: 14,
          color: colors.textSecondary,
        },
        quantityText: {
          fontSize: 16,
          fontWeight: '600',
          color: colors.text,
          minWidth: 30,
          textAlign: 'center',
        },
        totalSection: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 16,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          marginTop: 16,
        },
        totalLabel: {
          fontSize: 18,
          fontWeight: '600',
          color: colors.text,
        },
        totalValue: {
          fontSize: 20,
          fontWeight: 'bold',
          color: colors.text,
        },
        footer: {
          padding: 16,
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
        quantityButton: {
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: isDark ? '#1F2533' : '#E5E7EB',
          justifyContent: 'center',
          alignItems: 'center',
        },
        deleteButton: {
          padding: 4,
        },
        infoRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 8,
        },
      }),
    [colors, isDark, listHeight]
  );

  const handleTableSelect = async (table: TableType) => {
    const selectedTableData: Table = {
      id: table.id,
      numero: table.mesa_cartao.toString(),
      nome: table.nome,
      status: table.status,
    };
    await setSelectedTable(selectedTableData);
  };

  const handleQuantityChange = (uuid: string, delta: number) => {
    const item = cart.find((i) => i.uuid === uuid);
    if (item) {
      const newQuantity = item.quantidade + delta;
      if (newQuantity > 0) {
        updateQuantity(uuid, newQuantity);
      } else {
        removeFromCart(uuid);
      }
    }
  };

  const handleSendOrder = async () => {
    if (cart.length === 0) {
      Alert.alert('Erro', 'Adicione itens ao pedido');
      return;
    }
    if (!selectedTable) {
      Alert.alert('Erro', 'Selecione uma mesa');
      return;
    }
    if (!user?.nick) {
      Alert.alert('Erro', 'Usuário não encontrado');
      return;
    }

    try {
      const orderData = {
        cabecalho: {
          status_tp_venda: 'P',
          mesa: parseInt(selectedTable.numero),
          id_cliente: null,
          nome_cliente: '',
          cpf_cliente: '',
          celular: '',
          nick: user.nick,
          obs: '',
        },
        itens: cart.map((item) => ({
          codm: (item.codm || item.id.toString()).trim(),
          qtd: item.quantidade,
          obs: item.observacao || '',
          pv: item.pv || item.preco,
          codm_status: item.codm_status || 'C',
          codm_relacional: item.codm_relacional || undefined,
        })),
      };

      await axiosInstance.post('/vendas', orderData);

      Alert.alert('Sucesso', 'Pedido enviado!');
      clearCart();
      
      // Força atualização do mapa de mesas para refletir o novo status
      setTableRefreshKey((prev) => prev + 1);
    } catch (error: any) {
      console.error('Erro ao enviar pedido:', error);
      Alert.alert(
        'Erro',
        error.response?.data?.erro || error.message || 'Erro ao enviar pedido'
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ width: 24 }} />
        <Text style={styles.headerTitle}>Vendas</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Card style={styles.tableCard}>
          <Text style={styles.sectionLabel}>Mesa/Cartão</Text>
          <Button
            title={selectedTable ? `Mesa #${selectedTable.numero}` : 'Selecionar Mesa'}
            onPress={() => setIsTableMapVisible(true)}
            variant={selectedTable ? 'outline' : 'primary'}
            icon={
              <Ionicons
                name="restaurant-outline"
                size={20}
                color={selectedTable ? colors.text : '#fff'}
              />
            }
            style={styles.selectTableButton}
          />
          <View style={styles.infoRow}>
            <Text style={styles.infoText}>Garçom: {user?.nome || 'N/A'}</Text>
            {selectedTable && (
              <Text style={styles.infoText}>Mesa: #{selectedTable.numero}</Text>
            )}
          </View>
        </Card>

        {isTableMapVisible && (
          <TableMapModal
            visible={isTableMapVisible}
            onClose={() => setIsTableMapVisible(false)}
            onSelectTable={handleTableSelect}
            selectedTableNumber={selectedTable ? parseInt(selectedTable.numero) : undefined}
            refreshKey={tableRefreshKey}
          />
        )}

        <View style={styles.orderSection}>
          <View style={styles.orderHeader}>
            <Text style={styles.sectionTitle}>Pedido Atual</Text>
            <Text style={styles.itemsCount}>{cart.length} itens</Text>
          </View>

          {cart.length === 0 ? (
            <View style={styles.emptyCart}>
              <Ionicons name="cart-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyCartText}>Carrinho vazio</Text>
            </View>
          ) : (
            <FlatList
              data={cart}
              keyExtractor={(item) => item.uuid}
              contentContainerStyle={{ paddingBottom: 150, flexGrow: 1 }}
              showsVerticalScrollIndicator={true}
              style={{ flex: 1 }}
              renderItem={({ item }) => (
                <Card style={styles.cartItem}>
                  <View style={styles.cartItemContent}>
                    <View style={styles.cartItemInfo}>
                      <Text style={styles.cartItemName}>{capitalizeFirstLetter(item.nome)}</Text>
                      <Text style={styles.cartItemPrice}>
                        {formatCurrency(item.preco)}
                      </Text>
                    </View>
                    <View style={styles.cartItemControls}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => handleQuantityChange(item.uuid, -1)}
                      >
                        <Ionicons name="remove" size={20} color={colors.text} />
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>{item.quantidade}</Text>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => handleQuantityChange(item.uuid, 1)}
                      >
                        <Ionicons name="add" size={20} color={colors.text} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => removeFromCart(item.uuid)}
                      >
                        <Ionicons name="trash-outline" size={20} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </Card>
              )}
            />
          )}

          {cart.length > 0 && (
            <View style={styles.totalSection}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>{formatCurrency(getTotal())}</Text>
            </View>
          )}
        </View>
      </View>

      {cart.length > 0 && (
        <View style={styles.footer}>
          <Button
            title={`Enviar Pedido - ${formatCurrency(getTotal())}`}
            onPress={handleSendOrder}
            icon={<Ionicons name="paper-plane-outline" size={20} color="#fff" />}
          />
        </View>
      )}
    </View>
  );
}

