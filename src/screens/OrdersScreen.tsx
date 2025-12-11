import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { OrderItemModal } from '../components/ui/OrderItemModal';
import { TableMapModal } from '../components/ui/TableMapModal';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useTableContext } from '../contexts/TableContext';
import { useTheme } from '../contexts/ThemeContext';
import { Table as TableType } from '../hooks/useTables';
import axiosInstance from '../services/api';
import { storage, storageKeys } from '../services/storage';
import { Table } from '../types';
import { capitalizeFirstLetter, formatCurrency } from '../utils/format';
import { scale, scaleFont } from '../utils/responsive';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function OrdersScreen() {
  const { cart, updateQuantity, updateCartItem, removeFromCart, getTotal, getTotalItems, clearCart } = useCart();
  const { selectedTable, setSelectedTable } = useTableContext();
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
  const insets = useSafeAreaInsets();

  // Calcula altura disponível para a lista (tela - header - footer - outros elementos)
  const listHeight = SCREEN_HEIGHT - 320;

  // Memoiza os itens principais do carrinho
  const principalItems = useMemo(() => {
    return cart.filter(
      (item) => item.codm_status === 'R' || !item.codm_status || !item.codm_relacional
    );
  }, [cart]);

  // Função para calcular o preço unitário de um item principal incluindo relacionais
  const getItemUnitPrice = (principal: any): number => {
    const relacionais = cart.filter(
      (rel) => rel.uuid_principal === principal.uuid && rel.codm_status === 'M'
    );

    let valorPrincipal = (principal.pv || principal.preco || 0);

    // Calcula valor dos relacionais
    if (relacionais.length > 0) {
      const hasFractionals = relacionais.some(
        (rel) => typeof rel.fractionQty === 'number' || rel.fractionLabel
      );

      if (hasFractionals) {
        // Verifica se está no modo SOMA ou MAIOR PREÇO
        const positives = relacionais.filter((rel) => {
          const price = (rel as any).fractionValue ?? rel.pv ?? rel.preco ?? 0;
          return (typeof rel.fractionQty === 'number' || rel.fractionLabel) && price > 0;
        }).length;

        if (positives > 1) {
          // Modo SOMA: soma todas as frações
          const fractionalTotal = relacionais.reduce((sum: number, rel: any) => {
            if (typeof rel.fractionQty === 'number' || rel.fractionLabel) {
              // Prioriza fractionValue se disponível (já calculado corretamente)
              if (rel.fractionValue !== undefined && rel.fractionValue !== null) {
                return sum + rel.fractionValue;
              }
              // Se o item já tem pv calculado corretamente, usa ele
              if (rel.pv && rel.pv > 0) {
                return sum + rel.pv;
              }
              // Senão, calcula baseado na fração
              const priceUnit = rel.pv ?? rel.preco ?? rel.precoVenda ?? 0;
              const fraction = rel.fractionQty ?? 1;
              return sum + (priceUnit * fraction);
            }
            return sum;
          }, 0);
          valorPrincipal += fractionalTotal;
        } else {
          // Modo MAIOR PREÇO: usa apenas o maior preço entre os sabores
          const unitMaxPrice = relacionais.reduce((m: number, rel: any) => {
            // Usa fractionValue se disponível, senão usa pv, senão usa preco
            const price = rel.fractionValue ?? rel.pv ?? rel.preco ?? 0;
            return price > m ? price : m;
          }, 0);
          valorPrincipal += unitMaxPrice;
        }
      } else {
        // Relacionais normais (não fracionados)
        const relacionaisTotal = relacionais.reduce((sum, rel) => {
          const price = rel.pv || rel.preco || 0;
          const qty = rel.quantity || rel.quantidade || 1;
          return sum + price * qty;
        }, 0);
        valorPrincipal += relacionaisTotal;
      }
    }

    return valorPrincipal;
  };

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
        content: {
          flex: 1,
          padding: scale(16),
          backgroundColor: colors.background,
        },
        tableCard: {
          marginBottom: scale(16),
        },
        infoText: {
          fontSize: scaleFont(14),
          color: colors.textSecondary,
        },
        orderSection: {
          marginBottom: scale(16),
          flex: 1,
          minHeight: scale(200),
        },
        orderHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: scale(12),
        },
        sectionTitle: {
          fontSize: scaleFont(16),
          fontWeight: '600',
          color: colors.text,
        },
        itemsCount: {
          fontSize: scaleFont(14),
          color: colors.textSecondary,
        },
        cartItem: {
          marginBottom: scale(12),
        },
        emptyCart: {
          alignItems: 'center',
          justifyContent: 'center',
          padding: scale(40),
        },
        emptyCartText: {
          fontSize: scaleFont(16),
          color: colors.textSecondary,
          marginTop: scale(12),
        },
        cartItemContent: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: scale(12),
        },
        observationButton: {
          padding: scale(4),
        },
        cartItemInfo: {
          flex: 1,
          flexShrink: 1,
        },
        cartItemControls: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: scale(6),
          flexShrink: 0,
        },
        cartItemName: {
          fontSize: scaleFont(16),
          fontWeight: '600',
          color: colors.text,
          marginBottom: scale(4),
        },
        cartItemPrice: {
          fontSize: scaleFont(14),
          color: colors.textSecondary,
        },
        cartItemObservation: {
          fontSize: scaleFont(12),
          color: colors.textSecondary,
          fontStyle: 'italic',
          marginTop: scale(4),
        },
        quantityText: {
          fontSize: scaleFont(16),
          fontWeight: '600',
          color: colors.text,
          minWidth: scale(30),
          textAlign: 'center',
        },
        totalSection: {
          marginTop: scale(16),
        },
        totalCard: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: scale(8),
        },
        totalLabel: {
          fontSize: scaleFont(18),
          fontWeight: '600',
          color: colors.text,
        },
        totalValue: {
          fontSize: scaleFont(20),
          fontWeight: 'bold',
          color: colors.text,
        },
        footer: {
          padding: scale(16),
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
        quantityButton: {
          width: scale(32),
          height: scale(32),
          borderRadius: scale(16),
          backgroundColor: isDark ? '#1F2533' : '#E5E7EB',
          justifyContent: 'center',
          alignItems: 'center',
        },
        infoRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 8,
        },
        infoLeft: {
          flex: 1,
        },
        changeTableButton: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: scale(4),
          paddingHorizontal: scale(12),
          paddingVertical: scale(6),
          borderRadius: scale(8),
          backgroundColor: isDark ? '#1F2533' : '#E5E7EB',
        },
        changeTableText: {
          fontSize: scaleFont(12),
          fontWeight: '600',
        },
      }),
    [colors, isDark, listHeight, insets]
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

    // Se tiver itens no carrinho, mostra confirmação antes de enviar
    if (cart.length > 0) {
      // Pequeno delay para fechar o modal antes de mostrar o alert
      setTimeout(() => {
        Alert.alert(
          'Confirmar Pedido',
          `Deseja enviar o pedido para a Mesa ${selectedTableData.numero}?`,
          [
            {
              text: 'Cancelar',
              style: 'cancel',
              onPress: () => {
                setSelectedTable(null);
              },
            },
            {
              text: 'Confirmar',
              onPress: async () => {
                sendOrderToTable(selectedTableData);
              },
            },
          ]
        );
      }, 300);
    }
  };

  const sendOrderToTable = async (selectedTableData: Table) => {
    try {
      // Busca o nick salvo no storage ou usa o nick do usuário logado
      let nickToUse = await storage.getItem<string>(storageKeys.LAST_USED_NICK);
      if (!nickToUse) {
        nickToUse = user?.nick || '';
      }

      if (!nickToUse) {
        Alert.alert('Erro', 'Usuário não encontrado. Configure o usuário no perfil.');
        return;
      }
      // Agrupa principais e relacionais
      const principais = cart.filter(
        (item) => item.codm_status === 'R' || !item.codm_status || !item.codm_relacional
      );

      // Numerador por ocorrência de cada codm principal
      const ocorrenciaPorCodm = new Map<string, number>();
      const itens = principais.flatMap((principal) => {
        const atual = (ocorrenciaPorCodm.get(principal.codm || '') || 0) + 1;
        ocorrenciaPorCodm.set(principal.codm || '', atual);
        const chaveRelacional = `${String(atual).padStart(2, '0')}-${principal.codm || ''}`;

        const relacionais = cart.filter(
          (item) =>
            item.uuid_principal === principal.uuid &&
            item.codm_status === 'M'
        );

        // Agrupar adicionais fracionados por codm e somar fractionQty
        const fracionadosMap = new Map();
        relacionais.forEach((rel: any) => {
          if (rel.fractionQty !== undefined) {
            if (!fracionadosMap.has(rel.codm)) {
              fracionadosMap.set(rel.codm, { ...rel });
            } else {
              const existing = fracionadosMap.get(rel.codm);
              existing.fractionQty = (existing.fractionQty ?? 0) + (rel.fractionQty ?? 0);
            }
          }
        });
        const fracionados = Array.from(fracionadosMap.values());
        const naoFracionados = relacionais.filter((rel: any) => rel.fractionQty === undefined);

        // Item principal
        const temAdicionais = relacionais.length > 0;
        const principalItem = {
          codm: principal.codm || principal.id.toString(),
          qtd: principal.quantidade,
          obs: principal.observacao || '',
          pv: principal.pv ?? 0,
          ...(temAdicionais ? { codm_status: 'R' } : {}),
        };

        // Adicionais/relacionais
        const adicionais = [
          ...fracionados.map((ad: any) => ({
            codm: ad.codm || ad.id.toString(),
            qtd: ad.fractionQty,
            obs: ad.observacao || '',
            pv: ad.pv || ad.preco || 0,
            codm_relacional: chaveRelacional,
            codm_status: ad.codm_status || 'M',
          })),
          ...naoFracionados.map((ad: any) => ({
            codm: ad.codm || ad.id.toString(),
            qtd: ad.quantity || ad.quantidade || 1,
            obs: ad.observacao || '',
            pv: (ad.pv || ad.preco || 0) * (ad.quantity || ad.quantidade || 1),
            codm_relacional: chaveRelacional,
            codm_status: ad.codm_status || 'M',
          })),
        ];

        return [principalItem, ...adicionais];
      });

      const orderData = {
        cabecalho: {
          status_tp_venda: 'P',
          mesa: parseInt(selectedTableData.numero),
          id_cliente: null,
          nome_cliente: '',
          cpf_cliente: '',
          celular: '',
          nick: nickToUse,
          obs: '',
        },
        itens,
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
  };

  // Função para remover principal e relacionais (igual ao web)
  const handleRemovePrincipalAndRelacionais = (principal: any) => {
    removeFromCart(principal.uuid); // Remove o principal
    cart
      .filter(
        (item) =>
          item.uuid_principal === principal.uuid &&
          item.codm_status === 'M'
      )
      .forEach((rel) => removeFromCart(rel.uuid));
  };

  const handleQuantityChange = (uuid: string, delta: number) => {
    const item = cart.find((i) => i.uuid === uuid);
    if (item) {
      const newQuantity = item.quantidade + delta;
      if (newQuantity > 0) {
        updateQuantity(uuid, newQuantity);
      } else {
        // Se for item principal, remove ele e todos os relacionais
        if (!item.codm_relacional && (item.codm_status === 'R' || !item.codm_status)) {
          handleRemovePrincipalAndRelacionais(item);
        } else {
          removeFromCart(uuid);
        }
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

    try {
      // Busca o nick salvo no storage ou usa o nick do usuário logado
      let nickToUse = await storage.getItem<string>(storageKeys.LAST_USED_NICK);
      if (!nickToUse) {
        nickToUse = user?.nick || '';
      }

      if (!nickToUse) {
        Alert.alert('Erro', 'Usuário não encontrado. Configure o usuário no perfil.');
        return;
      }

      // Agrupa principais e relacionais
      const principais = cart.filter(
        (item) => item.codm_status === 'R' || !item.codm_status || !item.codm_relacional
      );

      // Numerador por ocorrência de cada codm principal
      const ocorrenciaPorCodm = new Map<string, number>();
      const itens = principais.flatMap((principal) => {
        const atual = (ocorrenciaPorCodm.get(principal.codm || '') || 0) + 1;
        ocorrenciaPorCodm.set(principal.codm || '', atual);
        const chaveRelacional = `${String(atual).padStart(2, '0')}-${principal.codm || ''}`;

        const relacionais = cart.filter(
          (item) =>
            item.uuid_principal === principal.uuid &&
            item.codm_status === 'M'
        );

        // Agrupar adicionais fracionados por codm e somar fractionQty
        const fracionadosMap = new Map();
        relacionais.forEach((rel: any) => {
          if (rel.fractionQty !== undefined) {
            if (!fracionadosMap.has(rel.codm)) {
              fracionadosMap.set(rel.codm, { ...rel });
            } else {
              const existing = fracionadosMap.get(rel.codm);
              existing.fractionQty = (existing.fractionQty ?? 0) + (rel.fractionQty ?? 0);
            }
          }
        });
        const fracionados = Array.from(fracionadosMap.values());
        const naoFracionados = relacionais.filter((rel: any) => rel.fractionQty === undefined);

        // Item principal
        const temAdicionais = relacionais.length > 0;
        const principalItem = {
          codm: principal.codm || principal.id.toString(),
          qtd: principal.quantidade,
          obs: principal.observacao || '',
          pv: principal.pv ?? 0,
          ...(temAdicionais ? { codm_status: 'R' } : {}),
        };

        // Adicionais/relacionais
        const adicionais = [
          ...fracionados.map((ad: any) => ({
            codm: ad.codm || ad.id.toString(),
            qtd: ad.fractionQty,
            obs: ad.observacao || '',
            pv: ad.pv || ad.preco || 0,
            codm_relacional: chaveRelacional,
            codm_status: ad.codm_status || 'M',
          })),
          ...naoFracionados.map((ad: any) => ({
            codm: ad.codm || ad.id.toString(),
            qtd: ad.quantity || ad.quantidade || 1,
            obs: ad.observacao || '',
            pv: (ad.pv || ad.preco || 0) * (ad.quantity || ad.quantidade || 1),
            codm_relacional: chaveRelacional,
            codm_status: ad.codm_status || 'M',
          })),
        ];

        return [principalItem, ...adicionais];
      });

      const orderData = {
        cabecalho: {
          status_tp_venda: 'P',
          mesa: parseInt(selectedTable.numero),
          id_cliente: null,
          nome_cliente: '',
          cpf_cliente: '',
          celular: '',
          nick: nickToUse,
          obs: '',
        },
        itens,
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={scale(24)} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vendas</Text>
        <View style={{ width: scale(40) }} />
      </View>

      <View style={styles.content}>
        {selectedTable && (
          <Card style={styles.tableCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <Text style={styles.infoText}>Usuário: {user?.nome || 'N/A'}</Text>
                <Text style={styles.infoText}>Mesa: #{selectedTable.numero}</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    'Trocar Mesa',
                    'Deseja trocar a mesa selecionada?',
                    [
                      {
                        text: 'Cancelar',
                        style: 'cancel',
                      },
                      {
                        text: 'Trocar',
                        onPress: () => {
                          setSelectedTable(null);
                          setIsTableMapVisible(true);
                        },
                      },
                    ]
                  );
                }}
                style={styles.changeTableButton}
              >
                <Ionicons name="swap-horizontal-outline" size={scale(20)} color={colors.primary} />
                <Text style={[styles.changeTableText, { color: colors.primary }]}>Trocar</Text>
              </TouchableOpacity>
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
            <Text style={styles.itemsCount}>
              {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'itens'}
            </Text>
          </View>

          {cart.length === 0 ? (
            <View style={styles.emptyCart}>
              <Ionicons name="cart-outline" size={scale(48)} color={colors.textSecondary} />
              <Text style={styles.emptyCartText}>Carrinho vazio</Text>
            </View>
          ) : (
            <FlatList
              data={principalItems}
              keyExtractor={(item, index) => item.uuid || `item-${index}`}
              contentContainerStyle={{ paddingBottom: 150 + Math.max(insets.bottom, 0), flexGrow: 1 }}
              showsVerticalScrollIndicator={true}
              style={{ flex: 1 }}
              renderItem={({ item: principal }) => {
                const relacionais = cart.filter(
                  (rel) => rel.uuid_principal === principal.uuid && rel.codm_status === 'M'
                );
                return (
                  <Card style={styles.cartItem}>
                    <View style={styles.cartItemContent}>
                      <TouchableOpacity
                        style={styles.observationButton}
                        onPress={() =>
                          openObservationModal(
                            principal.uuid,
                            principal.nome,
                            principal.quantidade,
                            principal.observacao || ''
                          )
                        }
                        activeOpacity={0.7}
                      >
                        <Ionicons name="ellipsis-vertical" size={scale(20)} color={colors.textSecondary} />
                      </TouchableOpacity>
                      <View style={styles.cartItemInfo}>
                        <Text style={styles.cartItemName}>
                          {capitalizeFirstLetter(principal.nome)}
                        </Text>
                        <Text style={styles.cartItemPrice}>
                          {formatCurrency(getItemUnitPrice(principal))} x {principal.quantidade}
                        </Text>
                        {relacionais.length > 0 && (
                          <View style={{ marginTop: 8 }}>
                            {relacionais.map((rel, idx) => (
                              <Text
                                key={rel.uuid || idx}
                                style={[styles.cartItemObservation, { marginLeft: 8 }]}
                              >
                                + {rel.fractionLabel || `${rel.quantity || rel.quantidade}x`}{' '}
                                {capitalizeFirstLetter(rel.nome)}
                              </Text>
                            ))}
                          </View>
                        )}
                        {principal.observacao && (
                          <Text style={styles.cartItemObservation}>
                            Obs: {principal.observacao}
                          </Text>
                        )}
                      </View>
                      <View style={styles.cartItemControls}>
                        {principal.quantidade > 1 ? (
                          <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => handleQuantityChange(principal.uuid, -1)}
                          >
                            <Ionicons name="remove" size={scale(20)} color={colors.text} />
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            style={[styles.quantityButton, { backgroundColor: colors.error + '20' }]}
                            onPress={() => handleRemovePrincipalAndRelacionais(principal)}
                          >
                            <Ionicons name="trash-outline" size={scale(20)} color={colors.error} />
                          </TouchableOpacity>
                        )}
                        <Text style={styles.quantityText}>{principal.quantidade}</Text>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => handleQuantityChange(principal.uuid, 1)}
                        >
                          <Ionicons name="add" size={scale(20)} color={colors.text} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Card>
                );
              }}
            />
          )}

          {cart.length > 0 && (
            <View style={styles.totalSection}>
              <Card>
                <View style={styles.totalCard}>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalValue}>{formatCurrency(getTotal())}</Text>
                </View>
              </Card>
            </View>
          )}
        </View>
      </View>

      {cart.length > 0 && (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <Button
            title={`Enviar Pedido - ${formatCurrency(getTotal())}`}
            onPress={handleSendOrder}
            icon={<Ionicons name="paper-plane-outline" size={scale(20)} color="#fff" />}
          />
        </View>
      )}
    </View>
  );
}

