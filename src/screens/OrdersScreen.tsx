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
import { OrderItemModal } from '../components/ui/OrderItemModal';
import { Table as TableType } from '../hooks/useTables';
import axiosInstance from '../services/api';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function OrdersScreen() {
  const { cart, updateQuantity, updateCartItem, removeFromCart, getTotal, clearCart } = useCart();
  const { selectedTable, setSelectedTable } = useTable();
  const { user } = useAuth();
  const [isTableMapVisible, setIsTableMapVisible] = useState(false);
  const [tableRefreshKey, setTableRefreshKey] = useState(0);
  const [isOrderItemModalVisible, setIsOrderItemModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    uuid: string;
    name: string;
    quantity: number;
    observation: string;
  } | null>(null);
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
          alignItems: 'center',
          gap: 12,
        },
        observationButton: {
          padding: 4,
        },
        cartItemInfo: {
          flex: 1,
          flexShrink: 1,
        },
        cartItemControls: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          flexShrink: 0,
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
        cartItemObservation: {
          fontSize: 12,
          color: colors.textSecondary,
          fontStyle: 'italic',
          marginTop: 4,
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
    setIsTableMapVisible(false);
    
    // Se tiver itens no carrinho e não tiver mesa selecionada anteriormente, envia automaticamente
    if (cart.length > 0 && user?.nick) {
      // Pequeno delay para fechar o modal antes de enviar
      setTimeout(async () => {
        try {
          const orderData = {
            cabecalho: {
              status_tp_venda: 'P',
              mesa: parseInt(selectedTableData.numero),
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
          setSelectedTable(null);
          
          // Força atualização do mapa de mesas para refletir o novo status
          setTableRefreshKey((prev) => prev + 1);
        } catch (error: any) {
          console.error('Erro ao enviar pedido:', error);
          Alert.alert(
            'Erro',
            error.response?.data?.erro || error.message || 'Erro ao enviar pedido'
          );
        }
      }, 300);
    }
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

  const openObservationModal = (
    uuid: string,
    itemName: string,
    quantity: number,
    observation: string
  ) => {
    setSelectedItem({ uuid, name: itemName, quantity, observation });
    setIsOrderItemModalVisible(true);
  };

  const saveObservation = (newQuantity: number, newObservation: string) => {
    if (selectedItem) {
      updateCartItem(selectedItem.uuid, newQuantity, newObservation);
    }
    setSelectedItem(null);
    setIsOrderItemModalVisible(false);
  };

  const handleSendOrder = async () => {
    if (cart.length === 0) {
      Alert.alert('Erro', 'Adicione itens ao pedido');
      return;
    }
    
    // Se não tiver mesa selecionada, abre o mapa automaticamente
    if (!selectedTable) {
      setIsTableMapVisible(true);
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
      setSelectedTable(null); // Limpa a mesa selecionada após enviar
      
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
        {selectedTable && (
          <Card style={styles.tableCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoText}>Garçom: {user?.nome || 'N/A'}</Text>
              <Text style={styles.infoText}>Mesa: #{selectedTable.numero}</Text>
            </View>
          </Card>
        )}

        {isTableMapVisible && (
          <TableMapModal
            visible={isTableMapVisible}
            onClose={() => setIsTableMapVisible(false)}
            onSelectTable={handleTableSelect}
            selectedTableNumber={selectedTable ? parseInt(selectedTable.numero) : undefined}
            refreshKey={tableRefreshKey}
          />
        )}

        {isOrderItemModalVisible && selectedItem && (
          <OrderItemModal
            visible={isOrderItemModalVisible}
            itemName={selectedItem.name}
            currentObservation={selectedItem.observation}
            currentQuantity={selectedItem.quantity}
            onClose={() => {
              setIsOrderItemModalVisible(false);
              setSelectedItem(null);
            }}
            onSave={saveObservation}
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
                    <TouchableOpacity
                      style={styles.observationButton}
                      onPress={() =>
                        openObservationModal(
                          item.uuid,
                          item.nome,
                          item.quantidade,
                          item.observacao || ''
                        )
                      }
                      activeOpacity={0.7}
                    >
                      <Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <View style={styles.cartItemInfo}>
                      <Text style={styles.cartItemName}>{capitalizeFirstLetter(item.nome)}</Text>
                      <Text style={styles.cartItemPrice}>
                        {formatCurrency(item.preco)} x {item.quantidade}
                      </Text>
                      {item.observacao && (
                        <Text style={styles.cartItemObservation}>
                          Obs: {item.observacao}
                        </Text>
                      )}
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

