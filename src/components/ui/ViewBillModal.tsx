import { Ionicons } from '@expo/vector-icons';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { useLanguage } from '../../contexts/LanguageContext';
import { useTableContext } from '../../contexts/TableContext';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../services/api';
import { storage, storageKeys } from '../../services/storage';
import { Alert } from '../../utils/alert';
import { formatCurrency } from '../../utils/format';
import {
    isPagSeguroModuleLoaded,
    payWithSmart2,
    printOnSmart2,
    isSmart2PrintSupported,
    type PagSeguroPaymentType,
} from '../../utils/pagseguroSmart2';
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

interface Antecipacao {
    tipo_rec_nome?: string;
    vl_moeda_prin: number;
    cambio?: number;
    ft_conv?: string;
}

interface BillData {
    vendas: Venda[];
    taxa_servico?: number;
    antecipacoes?: Antecipacao[];
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
    const { refreshTable, fetchTables, updateTableStatus } = useTableContext();
    const { t } = useLanguage();
    const [data, setData] = useState<BillData | null>(null);
    const [loading, setLoading] = useState(true);
    const [printing, setPrinting] = useState(false);
    const [paying, setPaying] = useState(false);
    const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);

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
                t('viewBill.error'),
                error.response?.data?.erro || error.message || t('viewBill.errorLoadingBill')
            );
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = async () => {
        try {
            setPrinting(true);

            // 1) Se o módulo custom tiver print(texto), imprime direto
            if (isSmart2PrintSupported() && data?.vendas?.length) {
                const billText = buildBillTextForThermal();
                const smart2Result = await printOnSmart2(billText);
                if (!smart2Result.success) {
                    setPrinting(false);
                    Alert.alert(
                        t('viewBill.error'),
                        smart2Result.message || t('viewBill.errorLoadingBill')
                    );
                    return;
                }
            }

            // Registra impressão no backend (imprimir-conta) e opcionalmente imprime na impressora do servidor
            let nickToUse = await storage.getItem<string>(storageKeys.LAST_USED_NICK);
            if (!nickToUse) {
                nickToUse = user?.nick || '';
            }

            if (!nickToUse) {
                Alert.alert(t('viewBill.error'), t('viewBill.userNotFound'));
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
                Alert.alert(t('common.success'), response.data?.mensagem || t('viewBill.print'));
            }, 300);
        } catch (error: any) {
            console.error('Error printing bill:', error);
            setPrinting(false);
            // Em caso de erro, NÃO fecha o modal - mantém aberto para o usuário tentar novamente
            Alert.alert(
                t('viewBill.error'),
                error.response?.data?.erro || error.message || t('viewBill.errorLoadingBill')
            );
        }
    };

    const handlePay = () => {
        if (!data?.vendas?.length || total <= 0) return;
        if (!isPagSeguroModuleLoaded()) {
            Alert.alert(t('viewBill.error'), t('viewBill.paymentNotAvailable'));
            return;
        }
        // Mostra o modal de seleção de método de pagamento
        setShowPaymentMethodModal(true);
    };

    /** Notifica o backend para fechar a mesa após pagamento no terminal (cartão/Pix). Payload alinhado ao touch-go desktop. */
    const closeMesaOnBackend = async (paymentType: PagSeguroPaymentType) => {
        if (!data?.vendas?.length) return;
        // Nick para imprimir-conta (backend exige "imprimir conta" antes de fechar a mesa)
        let nickToUse = await storage.getItem<string>(storageKeys.LAST_USED_NICK) || user?.nick || '';
        if (!nickToUse) {
            console.warn('[ViewBill] Nick não definido; fechamento pode falhar se o backend exige impressão.');
        }
        // Backend exige que a conta tenha sido "impressa" (imprimir-conta) antes de fechar
        try {
            await api.post(`/caixa/imprimir-conta?mesa=${mesaCartao}&nick=${encodeURIComponent(nickToUse)}`);
        } catch (printErr: any) {
            // Se imprimir-conta falhar (ex.: sem impressora), ainda tentamos fechar; o backend pode aceitar em alguns casos
            console.warn('[ViewBill] imprimir-conta antes de fechar:', printErr?.response?.data ?? printErr);
        }
        // IDs de tipo de recebimento (mesmo do desktop: 2=Crédito, 3=Débito, 4=Pix)
        const idTipoRec = paymentType === 'CREDITO' ? 2 : paymentType === 'DEBITO' ? 3 : 4;
        // Estrutura de vendas igual ao desktop: principal + relacionais com id_venda e desconto numéricos
        const vendas = data.vendas.flatMap((product) => {
            const relacionais = product.itens_relacionais || product.relacionados || [];
            const mainVenda = [{
                id_venda: Number(product.id_venda),
                desconto: Number(product.desconto ?? 0),
            }];
            const relVendas = relacionais.map((rel: Relacional) => ({
                id_venda: Number(rel.id_venda),
                desconto: Number((rel as any).desconto ?? 0),
            }));
            return [...mainVenda, ...relVendas];
        });
        // Arredondamento em 2 decimais (backend pode validar valor)
        const roundedTotal = Math.round(total * 100) / 100;
        const requestData = {
            id_mesa: Number(mesaCartao),
            taxa_servico: 'N',
            vendas,
            recebimentos: [
                {
                    id_tipo_rec: idTipoRec,
                    vl_principal: roundedTotal,
                    vl_extrangeiro: roundedTotal,
                },
            ],
        };
        try {
            await api.post('/caixa/fechar-mesa', requestData);
            updateTableStatus(mesaCartao, 'F');
        } catch (err: any) {
            console.error('[ViewBill] Erro ao fechar mesa no backend:', err?.response?.data ?? err);
            (err as any).closeMesaError = err?.response?.data?.erro || err?.message;
            throw err;
        }
    };

    const processPayment = async (paymentType: PagSeguroPaymentType) => {
        setShowPaymentMethodModal(false);

        const amountInCents = Math.round(total * 100);
        const reference = `mesa-${mesaCartao}`;

        try {
            setPaying(true);
            console.log('[PagSeguro] Iniciando pagamento:', { amountInCents, reference, paymentType });

            // Timeout de 2 minutos (120000ms) - tempo padrão do PagSeguro
            const result = await payWithSmart2(amountInCents, reference, paymentType, 1, 120000);

            console.log('[PagSeguro] Resultado:', result);

            if (result.success) {
                try {
                    await closeMesaOnBackend(paymentType);
                    Alert.alert(
                        t('common.success'),
                        t('viewBill.paymentSuccess') || `Pagamento aprovado! ID: ${result.transactionId}`
                    );
                    onClose();
                    await fetchTables();
                } catch (closeErr: any) {
                    const backendMsg = closeErr?.closeMesaError || closeErr?.response?.data?.erro || closeErr?.message;
                    const isPrintRelated =
                        typeof backendMsg === 'string' &&
                        (backendMsg.includes('sem imprimir') ||
                            backendMsg.includes('imprimir') ||
                            backendMsg.includes('impressão') ||
                            backendMsg.includes('impressora'));
                    const hint = isPrintRelated ? `\n\n${t('viewBill.closeFailedPrintHint')}` : '';
                    Alert.alert(
                        t('common.success'),
                        (t('viewBill.paymentSuccess') || 'Pagamento aprovado!') +
                            (backendMsg ? `\n\nAtenção: ${backendMsg}` : '\n\nNão foi possível fechar a mesa no sistema.') +
                            hint
                    );
                    onClose();
                    await fetchTables();
                }
            } else {
                // Mensagem de erro específica baseada no código
                let errorMessage = result.message || t('viewBill.paymentError');

                if (result.code === 'TIMEOUT') {
                    errorMessage = t('viewBill.paymentTimeout') || 'Tempo máximo estipulado para a operação expirou. Por favor, tente novamente.';
                }

                console.error('[PagSeguro] Erro no pagamento:', result);
                Alert.alert(t('viewBill.error'), errorMessage);
            }
        } catch (e) {
            console.error('[PagSeguro] Exceção ao processar pagamento:', e);
            const errorMessage = e instanceof Error ? e.message : String(e);
            Alert.alert(
                t('viewBill.error'),
                errorMessage.includes('TIMEOUT')
                    ? (t('viewBill.paymentTimeout') || 'Tempo máximo estipulado para a operação expirou. Por favor, tente novamente.')
                    : t('viewBill.paymentError')
            );
        } finally {
            // Garante que o loading seja sempre resetado
            setPaying(false);
            console.log('[PagSeguro] Estado de pagamento resetado');
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
                actionsRow: {
                    flexDirection: 'row',
                    gap: scale(12),
                    marginTop: scale(20),
                },
                actionButton: {
                    flex: 1,
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

    /** Monta o texto da conta para impressão térmica na Smart2. Itens principais + relacionais (ex.: PIZZA GRANDE com sabores) como no recibo. */
    const buildBillTextForThermal = useCallback((): string => {
        if (!data?.vendas?.length) return '';
        const W = 40;
        const line = (s: string) => s + '\n';
        const padNum = (n: number, width: number): string => {
            const s = n.toFixed(2).replace('.', ',');
            return s.length >= width ? s.slice(-width) : ' '.repeat(width - s.length) + s;
        };
        let out = '';
        out += line('   ' + t('viewBill.table') + ' - ' + mesaCartao);
        out += line('-'.repeat(W));
        const numWidth = 8;
        const qtyWidth = 3;
        const nameWidth = W - qtyWidth - 1 - 1 - numWidth - numWidth;
        const indentRel = '   ';
        const relNameWidth = W - indentRel.length - 1 - qtyWidth - numWidth - numWidth;

        for (const item of data.vendas) {
            const relacionais =
                (item.itens_relacionais && item.itens_relacionais.length > 0)
                    ? item.itens_relacionais
                    : (item.relacionados && item.relacionados.length > 0)
                        ? item.relacionados
                        : [];

            if (relacionais.length > 0) {
                // Item principal com relacionais: linha só com qtd e nome (sem PU/TOTAL)
                const qtyPrincipal = (item as any).fractionQty ?? item.qtd ?? (item as any)._qty ?? (item as any).quantity ?? 1;
                const qtyStrPrincipal = typeof qtyPrincipal === 'string' ? qtyPrincipal : (qtyPrincipal % 1 === 0 ? String(Math.round(qtyPrincipal)) : String(qtyPrincipal));
                const nomePrincipal = (item.produto || '').trim().slice(0, nameWidth);
                out += line((qtyStrPrincipal + ' ' + nomePrincipal).padEnd(W));
                // Relacionais: recuo + nome + QTD + PU + TOTAL
                for (const rel of relacionais) {
                    const relQty = (rel as any).fractionQty ?? rel.qtd ?? (rel as any)._qty ?? (rel as any).quantity ?? 1;
                    const relQtyStr = typeof relQty === 'string' ? relQty : (relQty % 1 === 0 ? String(Math.round(relQty)) : String(relQty));
                    const relUnit = rel.precoVenda ?? rel.pv ?? 0;
                    const relTotal = Number(rel.totalItem ?? relUnit * (typeof relQty === 'number' ? relQty : parseFraction(relQty)));
                    const relNome = (rel.produto || '').trim().slice(0, relNameWidth);
                    out += line(
                        indentRel + relNome.padEnd(relNameWidth) + ' ' + relQtyStr.padStart(qtyWidth) + padNum(relUnit, numWidth) + padNum(relTotal, numWidth)
                    );
                }
                out += line('');  // Linha em branco após o grupo para separar do próximo item
            } else {
                // Item sem relacionais: uma linha com qtd, nome, PU, TOTAL
                const itemTotal = calculateItemTotal(item);
                const qtyNum = parseFraction(
                    (item as any).fractionQty ?? item.qtd ?? (item as any)._qty ?? (item as any).quantity ?? 1
                );
                const qtyStr = qtyNum % 1 === 0 ? String(Math.round(qtyNum)) : String(qtyNum);
                const unitPrice = item.pv ?? (qtyNum !== 0 ? itemTotal / qtyNum : 0);
                const nome = (item.produto || '').trim().slice(0, nameWidth);
                out += line(
                    qtyStr.padStart(qtyWidth) + ' ' + nome.padEnd(nameWidth) + ' ' + padNum(unitPrice, numWidth) + padNum(itemTotal, numWidth)
                );
            }
        }
        out += line('-'.repeat(W));
        const taxaServico = Number(data.taxa_servico ?? 0);
        const totalComTaxa = total + taxaServico;
        const labelSoma = 'Soma :';
        out += line(labelSoma + ' '.repeat(W - labelSoma.length - numWidth) + padNum(total, numWidth));
        if (taxaServico > 0) {
            const labelTaxa = 'Taxa de Serviço :';
            out += line(labelTaxa + ' '.repeat(W - labelTaxa.length - numWidth) + padNum(taxaServico, numWidth));
        }
        out += line('TOTAL :' + ' '.repeat(W - 7 - numWidth) + padNum(totalComTaxa, numWidth));
        out += line('-'.repeat(W));
        const antecipacoes = data.antecipacoes ?? [];
        if (antecipacoes.length > 0) {
            out += line('RECEBIMENTOS DESCONTOS:');
            const descWidth = W - numWidth;
            for (const a of antecipacoes) {
                const label = (a.tipo_rec_nome || '').trim().slice(0, descWidth);
                out += line(label + ' '.repeat(W - label.length - numWidth) + padNum(a.vl_moeda_prin, numWidth));
            }
            const totalDescontos = antecipacoes.reduce((s, a) => s + a.vl_moeda_prin, 0);
            const totalAPagar = totalComTaxa - totalDescontos;
            const labelPagar = 'TOTAL A PAGAR:';
            out += line(labelPagar + ' '.repeat(W - labelPagar.length - numWidth) + padNum(totalAPagar, numWidth));
        }
        out += line('');
        out += line('ESTE DOCUMENTO NÃO POSSUI VALIDADE FISCAL');
        out += line('www.EatzGo.com');
        out += line('');
        return out;
    }, [data?.vendas, data?.taxa_servico, data?.antecipacoes, mesaCartao, total, calculateItemTotal, parseFraction, t]);

    return (
        <>
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
                                    <Text style={styles.title}>{t('viewBill.table')} - {mesaCartao}</Text>
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
                                        <Text style={styles.emptyText}>{t('products.noResults')}</Text>
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
                                            <Text style={styles.totalLabel}>{t('viewBill.total')}:</Text>
                                            <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
                                        </View>

                                        <View style={styles.actionsRow}>
                                            <Button
                                                title={printing ? t('common.loading') : t('viewBill.print')}
                                                onPress={handlePrint}
                                                disabled={printing || paying}
                                                icon={
                                                    printing ? (
                                                        <ActivityIndicator size="small" color="#fff" />
                                                    ) : (
                                                        <Ionicons name="print-outline" size={scale(20)} color="#fff" />
                                                    )
                                                }
                                                style={styles.actionButton}
                                            />
                                            <Button
                                                title={paying ? (t('viewBill.awaitingCard') || 'Aguardando cartão...') : t('viewBill.pay')}
                                                onPress={handlePay}
                                                disabled={paying || printing}
                                                icon={
                                                    paying ? (
                                                        <ActivityIndicator size="small" color="#fff" />
                                                    ) : (
                                                        <Ionicons name="card-outline" size={scale(20)} color="#fff" />
                                                    )
                                                }
                                                style={styles.actionButton}
                                            />
                                        </View>
                                    </>
                                )}
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Modal de seleção de método de pagamento */}
            <Modal
                visible={showPaymentMethodModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowPaymentMethodModal(false)}
                hardwareAccelerated={true}
                statusBarTranslucent={true}
            >
                <View style={styles.modalOverlay} pointerEvents="box-none">
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => setShowPaymentMethodModal(false)}
                        style={StyleSheet.absoluteFill}
                    />
                    <View style={{ alignSelf: 'center' }} pointerEvents="box-only">
                        <TouchableOpacity
                            activeOpacity={1}
                            onPress={(e) => e.stopPropagation()}
                        >
                            <View style={[styles.modalContent, { maxWidth: scaleWidth(400) }]} pointerEvents="box-only">
                                <View style={styles.header}>
                                    <Text style={styles.title}>{t('viewBill.selectPaymentMethod')}</Text>
                                    <TouchableOpacity
                                        onPress={() => setShowPaymentMethodModal(false)}
                                        style={styles.closeButton}
                                    >
                                        <Ionicons name="close" size={scale(24)} color={colors.text} />
                                    </TouchableOpacity>
                                </View>

                                <View style={{ gap: scale(12), marginTop: scale(20) }}>
                                    <Button
                                        title={t('viewBill.credit')}
                                        onPress={() => processPayment('CREDITO')}
                                        disabled={paying}
                                        icon={<Ionicons name="card-outline" size={scale(20)} color="#fff" />}
                                        style={{ width: '100%' }}
                                    />
                                    <Button
                                        title={t('viewBill.debit')}
                                        onPress={() => processPayment('DEBITO')}
                                        disabled={paying}
                                        icon={<Ionicons name="card-outline" size={scale(20)} color="#fff" />}
                                        style={{ width: '100%' }}
                                    />
                                    <Button
                                        title={t('viewBill.pix')}
                                        onPress={() => processPayment('PIX')}
                                        disabled={paying}
                                        icon={<Ionicons name="qr-code-outline" size={scale(20)} color="#fff" />}
                                        style={{ width: '100%' }}
                                    />
                                </View>

                                <View style={{ marginTop: scale(20) }}>
                                    <Button
                                        title={t('common.cancel')}
                                        onPress={() => setShowPaymentMethodModal(false)}
                                        disabled={paying}
                                        variant="outline"
                                        style={{ width: '100%' }}
                                    />
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
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

