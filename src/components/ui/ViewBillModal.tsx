import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from './Button';
import { Card } from './Card';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { storage, storageKeys } from '../../services/storage';
import { formatCurrency } from '../../utils/format';

interface ViewBillModalProps {
  visible: boolean;
  mesaCartao: number;
  onClose: () => void;
}

interface Relacional {
  id_venda: number;
  produto?: string;
  pv: number;
  qtd: number | string;
  precoVenda?: number;
  fractionQty?: number;
  totalItem?: number;
}

interface Venda {
  id_venda: number;
  produto: string;
  pv: number;
  qtd: number;
  desconto?: number;
  itens_relacionais?: Relacional[];
  relacionados?: Relacional[];
  totalItem?: number;
}

interface BillData {
  vendas: Venda[];
  mesa?: {
    mesa_numero: number;
    qtd_pessoas?: number;
  };
}

export const ViewBillModal: React.FC<ViewBillModalProps> = ({
  visible,
  mesaCartao,
  onClose,
}) => {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const [data, setData] = useState<BillData | null>(null);
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    if (visible && mesaCartao) {
      fetchBillData();
    }
  }, [visible, mesaCartao]);

  const fetchBillData = async () => {
    try {
      setLoading(true);
      const response = await api.get<BillData>(`/caixa/vendas/${mesaCartao}`);
      // Log temporário para debug - remover depois
      console.log('Bill data structure:', JSON.stringify(response.data, null, 2));
      setData(response.data);
    } catch (error: any) {
      console.error('Error fetching bill data:', error);
      Alert.alert(
        'Erro',
        error.response?.data?.erro || error.message || 'Erro ao carregar conta da mesa'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = async () => {
    try {
      setPrinting(true);

      // Busca o nick salvo no storage ou usa o nick do usuário logado
      let nickToUse = await storage.getItem<string>(storageKeys.LAST_USED_NICK);
      if (!nickToUse) {
        nickToUse = user?.nick || '';
      }

      if (!nickToUse) {
        Alert.alert('Erro', 'Nick do garçom não encontrado. Configure o garçom no perfil.');
        setPrinting(false);
        return;
      }

      const response = await api.post(
        `/caixa/imprimir-conta?mesa=${mesaCartao}&nick=${nickToUse}`
      );

      if (response.data?.mensagem) {
        Alert.alert('Sucesso', response.data.mensagem);
      } else {
        Alert.alert('Sucesso', 'Conta enviada para impressão!');
      }
    } catch (error: any) {
      console.error('Error printing bill:', error);
      Alert.alert(
        'Erro',
        error.response?.data?.erro || error.message || 'Erro ao imprimir conta'
      );
    } finally {
      setPrinting(false);
    }
  };

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
          borderWidth: 1,
          borderColor: colors.border,
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
        scrollContent: {
          maxHeight: 400,
        },
        itemRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        itemInfo: {
          flex: 1,
          marginRight: 12,
        },
        itemName: {
          fontSize: 14,
          fontWeight: '500',
          color: colors.text,
          marginBottom: 4,
        },
        itemQuantity: {
          fontSize: 12,
          color: colors.textSecondary,
        },
        itemPrice: {
          fontSize: 14,
          fontWeight: '600',
          color: colors.text,
        },
        totalRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 16,
          marginTop: 16,
          borderTopWidth: 2,
          borderTopColor: colors.border,
        },
        totalLabel: {
          fontSize: 18,
          fontWeight: '600',
          color: colors.text,
        },
        totalValue: {
          fontSize: 18,
          fontWeight: 'bold',
          color: colors.primary,
        },
        loadingContainer: {
          padding: 40,
          alignItems: 'center',
        },
        emptyContainer: {
          padding: 40,
          alignItems: 'center',
        },
        emptyText: {
          fontSize: 14,
          color: colors.textSecondary,
          textAlign: 'center',
          marginTop: 12,
        },
      }),
    [colors, isDark]
  );

  // Função para parsear fração
  const parseFraction = (qtd: any): number => {
    if (typeof qtd === 'string' && qtd.includes('/')) {
      const [num, den] = qtd.split('/').map(Number);
      return den ? num / den : 0;
    }
    return Number(qtd) || 0;
  };

  // Função para calcular o total de um item incluindo relacionais
  const calculateItemTotal = (item: Venda): number => {
    // Se já tem totalItem calculado, usa ele
    if (item.totalItem !== undefined && item.totalItem > 0) {
      return item.totalItem - (item.desconto || 0);
    }

    const relacionais = item.itens_relacionais || item.relacionados || [];
    const principalQty = parseFraction(item.qtd);
    
    // Calcula total do principal
    let totalPrincipal = (item.pv || 0) * principalQty;

    // Calcula total dos relacionais
    let totalRelacionais = 0;
    if (relacionais.length > 0) {
      // Verifica se tem relacionais fracionados
      const hasFractional = relacionais.some((rel: Relacional) => 
        typeof rel.qtd === 'string' && rel.qtd.includes('/')
      );

      if (hasFractional) {
        // Para produtos fracionados, soma os relacionais por unidade do principal
        const unitAdditionalSum = relacionais.reduce((sum: number, rel: Relacional) => {
          if (rel.totalItem !== undefined) {
            return sum + rel.totalItem;
          }
          
          const relQty = parseFraction(rel.qtd);
          const relPrice = rel.precoVenda || rel.pv || 0;
          return sum + (relPrice * relQty);
        }, 0);
        
        totalRelacionais = unitAdditionalSum * principalQty;
      } else {
        // Para relacionais normais, soma diretamente
        totalRelacionais = relacionais.reduce((sum: number, rel: Relacional) => {
          if (rel.totalItem !== undefined) {
            return sum + rel.totalItem;
          }
          
          const relQty = parseFraction(rel.qtd);
          const relPrice = rel.precoVenda || rel.pv || 0;
          return sum + (relPrice * relQty * principalQty);
        }, 0);
      }
    }

    // Se o principal está zerado mas tem relacionais, usa apenas os relacionais
    if (totalPrincipal === 0 && totalRelacionais > 0) {
      return totalRelacionais - (item.desconto || 0);
    }

    return totalPrincipal + totalRelacionais - (item.desconto || 0);
  };

  const total = data?.vendas?.reduce((sum, item) => sum + calculateItemTotal(item), 0) || 0;

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
              <Text style={styles.title}>Conta - Mesa {mesaCartao}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : !data?.vendas || data.vendas.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="receipt-outline" size={48} color={colors.textSecondary} />
                <Text style={styles.emptyText}>Nenhum item encontrado para esta mesa</Text>
              </View>
            ) : (
              <>
                <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={true}>
                  {data.vendas.map((item) => {
                    const relacionais = item.itens_relacionais || item.relacionados || [];
                    const itemTotal = calculateItemTotal(item);
                    
                    return (
                      <View key={item.id_venda}>
                        <View style={styles.itemRow}>
                          <View style={styles.itemInfo}>
                            <Text style={styles.itemName}>{item.produto}</Text>
                            <Text style={styles.itemQuantity}>x{item.qtd}</Text>
                            {relacionais.length > 0 && (
                              <View style={{ marginTop: 4 }}>
                                {relacionais.map((rel, idx) => (
                                  <Text key={idx} style={[styles.itemQuantity, { marginLeft: 8, fontSize: 11 }]}>
                                    + {typeof rel.qtd === 'string' ? rel.qtd : `${rel.qtd}x`} {rel.produto || ''}
                                  </Text>
                                ))}
                              </View>
                            )}
                          </View>
                          <Text style={styles.itemPrice}>
                            {formatCurrency(itemTotal)}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </ScrollView>

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
                </View>

                <Button
                  title={printing ? 'Imprimindo...' : 'Imprimir Conta'}
                  onPress={handlePrint}
                  disabled={printing}
                  icon={
                    printing ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Ionicons name="print-outline" size={20} color="#fff" />
                    )
                  }
                  style={{ marginTop: 20 }}
                />
              </>
            )}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

