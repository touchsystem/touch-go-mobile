import { Ionicons } from '@expo/vector-icons';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTableContext } from '../../contexts/TableContext';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../services/api';
import { storage, storageKeys } from '../../services/storage';
import { Alert } from '../../utils/alert';
import { formatCurrency } from '../../utils/format';
import { scale, scaleFont, scaleHeight, scaleWidth, widthPercentage } from '../../utils/responsive';
import { Button } from './Button';

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
    const { refreshTable } = useTableContext();
    const [data, setData] = useState<BillData | null>(null);
    const [loading, setLoading] = useState(true);
    const [printing, setPrinting] = useState(false);

    useEffect(() => {
        if (visible && mesaCartao && !printing) {
            fetchBillData();
        }
    }, [visible, mesaCartao, printing]);

    const fetchBillData = async () => {
        try {
            setLoading(true);
            const response = await api.get<BillData>(`/caixa/vendas/${mesaCartao}`);
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
                Alert.alert('Erro', 'Usuário não encontrado. Configure o usuário no perfil.');
                setPrinting(false);
                return;
            }

            const response = await api.post(
                `/caixa/imprimir-conta?mesa=${mesaCartao}&nick=${nickToUse}`
            );

            // Reseta o estado de impressão ANTES de atualizar a mesa para evitar loop
            setPrinting(false);

            // Fecha o modal imediatamente após sucesso
            onClose();

            // Atualiza apenas a mesa específica após imprimir (sem reload completo)
            refreshTable(mesaCartao).catch(err => {
                console.error('Erro ao atualizar mesa:', err);
            });

            // Mostra alert de sucesso (sem botão OK, fecha automaticamente em 1s)
            setTimeout(() => {
                Alert.alert('Sucesso', response.data?.mensagem || 'Conta enviada para impressão!');
            }, 300);
        } catch (error: any) {
            console.error('Error printing bill:', error);
            setPrinting(false);
            // Em caso de erro, NÃO fecha o modal - mantém aberto para o usuário tentar novamente
            Alert.alert(
                'Erro',
                error.response?.data?.erro || error.message || 'Erro ao imprimir conta'
            );
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
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                },
                modalContent: {
                    backgroundColor: colors.surface,
                    borderRadius: scale(16),
                    padding: scale(20),
                    width: Math.min(widthPercentage(90), scaleWidth(500)),
                    maxHeight: scaleHeight(700),
                    borderWidth: 1,
                    borderColor: colors.border,
                    justifyContent: 'flex-start',
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
                scrollContent: {
                    maxHeight: scaleHeight(350),
                    minHeight: scaleHeight(200),
                    flexGrow: 0,
                },
                scrollContentContainer: {
                    paddingBottom: scale(10),
                    flexGrow: 0,
                },
                itemRow: {
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: scale(12),
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                },
                itemInfo: {
                    flex: 1,
                    marginRight: scale(12),
                },
                itemName: {
                    fontSize: scaleFont(14),
                    fontWeight: '500',
                    color: colors.text,
                    marginBottom: scale(4),
                },
                itemQuantity: {
                    fontSize: scaleFont(12),
                    color: colors.textSecondary,
                },
                itemPrice: {
                    fontSize: scaleFont(14),
                    fontWeight: '600',
                    color: colors.text,
                },
                totalRow: {
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: scale(16),
                    marginTop: scale(16),
                    borderTopWidth: 2,
                    borderTopColor: colors.border,
                },
                totalLabel: {
                    fontSize: scaleFont(18),
                    fontWeight: '600',
                    color: colors.text,
                },
                totalValue: {
                    fontSize: scaleFont(18),
                    fontWeight: 'bold',
                    color: colors.primary,
                },
                loadingContainer: {
                    padding: scale(40),
                    alignItems: 'center',
                },
                emptyContainer: {
                    padding: scale(40),
                    alignItems: 'center',
                },
                emptyText: {
                    fontSize: scaleFont(14),
                    color: colors.textSecondary,
                    textAlign: 'center',
                    marginTop: scale(12),
                },
            }),
        [colors, isDark]
    );

    // Função para parsear fração (movida para fora do useCallback)
    const parseFraction = useCallback((qtd: any): number => {
        if (typeof qtd === 'string' && qtd.includes('/')) {
            const [num, den] = qtd.split('/').map(Number);
            return den ? num / den : 0;
        }
        return Number(qtd) || 0;
    }, []);

    // Função para calcular o total de um item incluindo relacionais
    // Segue a mesma lógica do receipt-content.tsx
    // Memoizada com useCallback para evitar recriações
    const calculateItemTotal = useCallback((item: Venda): number => {
        const relacionais =
            (item.itens_relacionais && Array.isArray(item.itens_relacionais))
                ? item.itens_relacionais
                : (item.relacionados && Array.isArray(item.relacionados))
                    ? item.relacionados
                    : [];

        const principalQty = parseFraction(
            (item as any).fractionQty ?? item.qtd ?? (item as any)._qty ?? (item as any).quantity ?? 1
        );

        // Se totalItem existe e é > 0, ele já inclui os relacionais calculados pelo backend
        // Nesse caso, usa ele diretamente sem somar relacionais novamente
        if (item.totalItem !== undefined && item.totalItem > 0) {
            return Number(item.totalItem) - (item.desconto || 0);
        }

        // Se totalItem não existe ou é 0, calcula manualmente
        let totalPrincipal = (item.pv ?? 0) * principalQty;

        // Soma dos relacionais
        // IMPORTANTE: Quando os relacionais têm totalItem, esse valor é POR UNIDADE
        // e precisa ser multiplicado pela quantidade do principal
        let totalRelacionais = 0;
        if (relacionais.length > 0) {
            // Verifica se os relacionais têm totalItem (já calculado)
            const hasTotalItem = relacionais.some((rel: Relacional) => rel.totalItem !== undefined);

            if (hasTotalItem) {
                // Relacionais têm totalItem, mas esse valor é POR UNIDADE
                // Soma todos os totalItem dos relacionais (valor por unidade)
                const unitAdditionalSum = relacionais.reduce((sum: number, rel: Relacional) => {
                    return sum + (rel.totalItem !== undefined ? Number(rel.totalItem) : 0);
                }, 0);
                // MULTIPLICA pela quantidade do principal (porque totalItem é por unidade)
                totalRelacionais = unitAdditionalSum * principalQty;
            } else {
                // Relacionais não têm totalItem, calcula e multiplica pela qtd do principal
                const unitAdditionalSum = relacionais.reduce((sum: number, rel: Relacional) => {
                    const relQty = parseFraction(
                        (rel as any).fractionQty ?? rel.qtd ?? (rel as any)._qty ?? (rel as any).quantity ?? 1
                    );
                    const relUnit = rel.precoVenda ?? rel.pv ?? 0;
                    return sum + (relQty * relUnit);
                }, 0);
                // Multiplica pela quantidade do principal
                totalRelacionais = unitAdditionalSum * principalQty;
            }
        }

        const itemTotal = totalPrincipal + totalRelacionais - (item.desconto || 0);

        return itemTotal;
    }, [parseFraction]);

    // Memoiza o cálculo do total para evitar recálculos desnecessários
    const total = useMemo(() => {
        if (!data?.vendas || data.vendas.length === 0) return 0;
        return data.vendas.reduce((sum, item) => sum + calculateItemTotal(item), 0);
    }, [data?.vendas]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
            hardwareAccelerated={true}
            statusBarTranslucent={true}
        >
            <View style={styles.modalOverlay} pointerEvents="box-none">
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={onClose}
                    style={StyleSheet.absoluteFill}
                />
                <View style={{ alignSelf: 'center' }} pointerEvents="box-only">
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View style={styles.modalContent} pointerEvents="box-only">
                            <View style={styles.header}>
                                <Text style={styles.title}>Conta - Mesa {mesaCartao}</Text>
                                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                    <Ionicons name="close" size={scale(24)} color={colors.text} />
                                </TouchableOpacity>
                            </View>

                            {loading ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color={colors.primary} />
                                </View>
                            ) : !data?.vendas || data.vendas.length === 0 ? (
                                <View style={styles.emptyContainer}>
                                    <Ionicons name="receipt-outline" size={scale(48)} color={colors.textSecondary} />
                                    <Text style={styles.emptyText}>Nenhum item encontrado para esta mesa</Text>
                                </View>
                            ) : (
                                <>
                                    <ScrollView
                                        key={`scroll-${data.vendas.length}`}
                                        style={styles.scrollContent}
                                        contentContainerStyle={styles.scrollContentContainer}
                                        showsVerticalScrollIndicator={true}
                                        nestedScrollEnabled={false}
                                        keyboardShouldPersistTaps="handled"
                                        bounces={true}
                                        scrollEventThrottle={16}
                                        decelerationRate="normal"
                                        removeClippedSubviews={true}
                                        overScrollMode="auto"
                                    >
                                        {data.vendas.map((item) => (
                                            <BillItem
                                                key={item.id_venda}
                                                item={item}
                                                styles={styles}
                                                formatCurrency={formatCurrency}
                                                calculateItemTotal={calculateItemTotal}
                                            />
                                        ))}
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
                                                <Ionicons name="print-outline" size={scale(20)} color="#fff" />
                                            )
                                        }
                                        style={{ marginTop: scale(20) }}
                                    />
                                </>
                            )}
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

// Componente memoizado para item da conta (melhora performance)
const BillItem = memo<{
    item: Venda;
    styles: any;
    formatCurrency: (value: number) => string;
    calculateItemTotal: (item: Venda) => number;
}>(({ item, styles, formatCurrency, calculateItemTotal }) => {
    const relacionais = item.itens_relacionais || item.relacionados || [];
    const itemTotal = useMemo(() => calculateItemTotal(item), [item, calculateItemTotal]);

    return (
        <View>
            <View style={styles.itemRow}>
                <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.produto}</Text>
                    <Text style={styles.itemQuantity}>x{item.qtd}</Text>
                    {relacionais.length > 0 && (
                        <View style={{ marginTop: scale(4) }}>
                            {relacionais.map((rel, idx) => (
                                <Text key={idx} style={[styles.itemQuantity, { marginLeft: scale(8), fontSize: scaleFont(11) }]}>
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
}, (prevProps, nextProps) => {
    // Comparação customizada para evitar re-renders desnecessários
    return (
        prevProps.item.id_venda === nextProps.item.id_venda &&
        prevProps.item.qtd === nextProps.item.qtd &&
        prevProps.item.pv === nextProps.item.pv &&
        prevProps.item.desconto === nextProps.item.desconto &&
        JSON.stringify(prevProps.item.itens_relacionais) === JSON.stringify(nextProps.item.itens_relacionais) &&
        JSON.stringify(prevProps.item.relacionados) === JSON.stringify(nextProps.item.relacionados)
    );
});

BillItem.displayName = 'BillItem';

