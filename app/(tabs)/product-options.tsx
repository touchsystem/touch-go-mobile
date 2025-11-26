import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { RelationalGroup } from '../../src/hooks/useRelationalGroups';
import api from '../../src/services/api';
import { capitalizeFirstLetter, formatCurrency } from '../../src/utils/format';
import { Button } from '../../src/components/ui/Button';
import { useCart } from '../../src/contexts/CartContext';

function generateUUID() {
  return Math.random().toString(36).substring(2, 15) + Date.now();
}

export default function ProductOptionsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ produto?: string; grupos?: string }>();
  const { colors, isDark } = useTheme();
  const { addToCart } = useCart();
  const insets = useSafeAreaInsets();
  
  const [selected, setSelected] = useState<{ [groupId: number]: any[] | any }>({});
  const [parameters, setParameters] = useState<any[]>([]);
  const [loadingParams, setLoadingParams] = useState(false);

  const produto = useMemo(() => {
    return params.produto ? JSON.parse(params.produto) : null;
  }, [params.produto]);

  const grupos: RelationalGroup[] = useMemo(() => {
    return params.grupos ? JSON.parse(params.grupos) : [];
  }, [params.grupos]);

  useEffect(() => {
    if (!params.produto) return;
    
    const fetchParameters = async () => {
      try {
        setLoadingParams(true);
        const response = await api.get('/parametros');
        setParameters(response.data || []);
      } catch (error) {
        console.error('Erro ao carregar parâmetros:', error);
      } finally {
        setLoadingParams(false);
      }
    };
    
    fetchParameters();
    setSelected({});
  }, [params.produto]);

  const total = useMemo(() => {
    const fractionalPriceParam = parameters.find((p: any) => p.id === 44);
    const useFractionalMaxPrice = fractionalPriceParam?.status === 'S';

    let sum = produto?.pv ?? 0;
    if (isNaN(sum) || sum === null || sum === undefined) {
      sum = 0;
    }

    grupos.forEach((grupo: RelationalGroup) => {
      const sel = selected[grupo.grupo.id];
      if (
        grupo.grupo.min === grupo.grupo.max &&
        grupo.grupo.max !== undefined &&
        grupo.grupo.max > 1 &&
        Array.isArray(sel)
      ) {
        const selectedItems = sel.filter((i: any) => (i._qty ?? 0) > 0);
        if (useFractionalMaxPrice) {
          const maxPrice = selectedItems.reduce(
            (m: number, it: any) => Math.max(m, it.precoVenda ?? 0),
            0
          );
          sum += maxPrice;
        } else {
          if (grupo.grupo.max === 3) {
            if (selectedItems.length === 3) {
              const maxPriceItem = selectedItems.reduce((max: any, item: any) =>
                (item.precoVenda ?? 0) > (max.precoVenda ?? 0) ? item : max
              );
              const proportionalSum = selectedItems.reduce((sum: number, it: any) => {
                const fraction = it.id === maxPriceItem.id ? 0.34 : 0.33;
                return sum + (it.precoVenda ?? 0) * fraction;
              }, 0);
              sum += proportionalSum;
            } else if (selectedItems.length === 2) {
              const proportionalSum = selectedItems.reduce((sum: number, it: any, index: number) => {
                const fraction = index === 0 ? 0.67 : 0.33;
                return sum + (it.precoVenda ?? 0) * fraction;
              }, 0);
              sum += proportionalSum;
            } else if (selectedItems.length === 1) {
              const singleItem = selectedItems[0];
              if (singleItem._qty === 3) {
                sum += singleItem.precoVenda ?? 0;
              } else {
                const proportionalSum = selectedItems.reduce((sum: number, it: any) => {
                  return sum + (it.precoVenda ?? 0) * (it._qty ?? 0) / 3;
                }, 0);
                sum += proportionalSum;
              }
            }
          } else {
            const proportionalSum = selectedItems.reduce((sum: number, it: any) => {
              const fraction = (it._qty ?? 0) / (grupo.grupo.max ?? 1);
              return sum + (it.precoVenda ?? 0) * fraction;
            }, 0);
            sum += proportionalSum;
          }
        }
      } else if (grupo.grupo.tipo === '2' && sel) {
        sum += sel.precoVenda ?? 0;
      } else if (Array.isArray(sel)) {
        const arraySum = sel.reduce(
          (s: number, item: any) => s + (item.precoVenda ?? 0) * (item._qty ?? 1),
          0
        );
        sum += arraySum;
      }
    });

    return isNaN(sum) || sum === null || sum === undefined ? 0 : Number(sum);
  }, [selected, grupos, produto, parameters]);

  const handleSelect = (grupo: RelationalGroup, item: any, op: 'inc' | 'dec' = 'inc') => {
    if (grupo.grupo.tipo === '2') {
      setSelected((prev) => ({ ...prev, [grupo.grupo.id]: item }));
    } else {
      setSelected((prev) => {
        const current = prev[grupo.grupo.id] || [];
        const idx = current.findIndex((i: any) => i.id === item.id);
        let updated;
        if (op === 'inc') {
          if (idx === -1) {
            updated = [...current, { ...item, _qty: 1 }];
          } else {
            updated = current.map((i: any, ix: number) =>
              ix === idx ? { ...i, _qty: (i._qty ?? 0) + 1 } : i
            );
          }
        } else if (op === 'dec' && idx !== -1) {
          if ((current[idx]._qty ?? 0) > 1) {
            updated = current.map((i: any, ix: number) =>
              ix === idx ? { ...i, _qty: (i._qty ?? 0) - 1 } : i
            );
          } else {
            updated = current.filter((i: any) => i.id !== item.id);
          }
        } else {
          updated = current;
        }
        return { ...prev, [grupo.grupo.id]: updated };
      });
    }
  };

  const isValid = grupos.every((grupo: RelationalGroup) => {
    const sel = selected[grupo.grupo.id];
    if (grupo.grupo.tipo === '2') {
      return !!sel;
    }
    if (grupo.grupo.min) {
      return (
        Array.isArray(sel) &&
        sel.reduce((acc: number, i: any) => acc + (i._qty ?? 0), 0) >= grupo.grupo.min
      );
    }
    return true;
  });

  const handleConfirm = () => {
    const fractionalPriceParam = parameters.find((p: any) => p.id === 44);
    const useFractionalMaxPrice = fractionalPriceParam?.status === 'S';

    const opcoesSelecionadas = selected;
    const relacionais: any[] = [];
    const uuidPrincipal = generateUUID();

    Object.entries(opcoesSelecionadas).forEach(([groupId, opcao]: [string, any]) => {
      const grupo = grupos.find((g: RelationalGroup) => g.grupo.id === Number(groupId));
      const isFracionado =
        grupo &&
        grupo.grupo.min === grupo.grupo.max &&
        grupo.grupo.max !== undefined &&
        grupo.grupo.max > 1;
      if (Array.isArray(opcao)) {
        if (isFracionado) {
          opcao.forEach((item: any) => {
            if (item._qty && item._qty > 0) {
              let fractionLabel, fractionQty, fractionValue;
              fractionLabel = `${item._qty}/${grupo!.grupo.max}`;

              if (grupo!.grupo.max === 3) {
                const selectedItems = opcao.filter((it: any) => (it._qty ?? 0) > 0);
                if (selectedItems.length === 3) {
                  const maxPriceItem = selectedItems.reduce((max: any, item: any) =>
                    (item.precoVenda ?? 0) > (max.precoVenda ?? 0) ? item : max
                  );
                  fractionQty = item.id === maxPriceItem.id ? 0.34 : 0.33;
                } else if (selectedItems.length === 2) {
                  const itemIndex = selectedItems.findIndex((it: any) => it.id === item.id);
                  fractionQty = itemIndex === 0 ? 0.67 : 0.33;
                } else if (selectedItems.length === 1) {
                  const singleItem = selectedItems[0];
                  if (singleItem._qty === 3) {
                    fractionQty = 1.0;
                  } else {
                    fractionQty = singleItem._qty === 1 ? 0.33 : 0.67;
                  }
                } else {
                  fractionQty = item._qty / grupo!.grupo.max!;
                }
              } else {
                fractionQty = item._qty / grupo!.grupo.max!;
              }

              if (useFractionalMaxPrice) {
                const selectedItemsForMaxPrice = opcao.filter((it: any) => (it._qty ?? 0) > 0);
                const maxPriceItem = selectedItemsForMaxPrice.reduce((max: any, item: any) =>
                  (item.precoVenda ?? 0) > (max.precoVenda ?? 0) ? item : max
                );
                if (item.id === maxPriceItem.id) {
                  fractionValue = item.precoVenda ?? 0;
                } else {
                  fractionValue = 0;
                }
              } else {
                fractionValue = (item.precoVenda ?? 0) * fractionQty;
              }

              relacionais.push({
                ...item,
                uuid: generateUUID(),
                codm_status: item.codm_status || item.status || 'M',
                codm_relacional: produto.codm,
                uuid_principal: uuidPrincipal,
                pv: fractionValue,
                fractionLabel,
                fractionQty,
              });
            }
          });
        } else {
          opcao.forEach((item: any) => {
            if (item._qty && item._qty > 0) {
              relacionais.push({
                ...item,
                uuid: generateUUID(),
                quantity: item._qty,
                codm_status: item.codm_status || item.status || 'M',
                codm_relacional: produto.codm,
                uuid_principal: uuidPrincipal,
                pv: item.precoVenda ?? 0,
              });
            }
          });
        }
      } else if (opcao && typeof opcao === 'object') {
        relacionais.push({
          ...opcao,
          uuid: generateUUID(),
          quantity: 1,
          codm_status: opcao.codm_status || opcao.status || 'M',
          codm_relacional: produto.codm,
          uuid_principal: uuidPrincipal,
          pv: opcao.precoVenda ?? 0,
        });
      }
    });

    const produtoCompleto = {
      ...produto,
      opcoesSelecionadas,
      relacionais,
      uuid: uuidPrincipal,
    };

    addToCart(produtoCompleto);
    router.replace('/(tabs)/orders');
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
          padding: 20,
          paddingTop: Math.max(insets.top, 10),
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
          padding: 20,
        },
        title: {
          fontSize: 20,
          fontWeight: 'bold',
          marginBottom: 8,
          color: colors.text,
        },
        productName: {
          fontSize: 16,
          fontWeight: '600',
          color: colors.textSecondary,
          marginBottom: 20,
        },
        groupContainer: {
          marginBottom: 24,
        },
        groupHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 12,
          flexWrap: 'wrap',
        },
        groupTitle: {
          fontSize: 16,
          fontWeight: '600',
          color: colors.text,
          marginRight: 8,
        },
        groupBadge: {
          fontSize: 12,
          color: colors.error,
          marginRight: 8,
        },
        groupInfo: {
          fontSize: 12,
          color: colors.textSecondary,
          marginRight: 8,
        },
        requiredBadge: {
          fontSize: 10,
          backgroundColor: colors.error + '20',
          color: colors.error,
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 4,
        },
        itemContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 12,
          paddingHorizontal: 4,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          minHeight: 56,
        },
        itemContainerTouchable: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 12,
          paddingHorizontal: 4,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          minHeight: 56,
        },
        itemInfo: {
          flex: 1,
          marginRight: 16,
          flexShrink: 1,
        },
        itemName: {
          fontSize: 14,
          fontWeight: '500',
          color: colors.text,
          marginBottom: 4,
        },
        itemDescription: {
          fontSize: 12,
          color: colors.textSecondary,
          marginBottom: 4,
        },
        itemPrice: {
          fontSize: 14,
          fontWeight: '600',
          color: colors.primary,
        },
        quantityControls: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          flexShrink: 0,
        },
        quantityButton: {
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: colors.primary + '20',
          justifyContent: 'center',
          alignItems: 'center',
          minWidth: 36,
          minHeight: 36,
        },
        quantityButtonDisabled: {
          opacity: 0.5,
        },
        quantityText: {
          fontSize: 16,
          fontWeight: '600',
          color: colors.text,
          minWidth: 50,
          textAlign: 'center',
        },
        radioButton: {
          width: 24,
          height: 24,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: colors.primary,
          justifyContent: 'center',
          alignItems: 'center',
        },
        radioButtonSelected: {
          width: 12,
          height: 12,
          borderRadius: 6,
          backgroundColor: colors.primary,
        },
        summaryContainer: {
          marginTop: 16,
          paddingTop: 16,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
        summaryTitle: {
          fontSize: 12,
          fontWeight: '600',
          color: colors.textSecondary,
          marginBottom: 8,
        },
        summaryItem: {
          fontSize: 12,
          color: colors.textSecondary,
          marginLeft: 16,
          marginBottom: 4,
        },
        footer: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: 12,
          padding: 20,
          paddingBottom: Math.max(insets.bottom, 20),
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
        },
        loadingContainer: {
          padding: 20,
          alignItems: 'center',
        },
        scrollContent: {
          paddingBottom: 20,
        },
      }),
    [colors, insets]
  );

  const selectedRelacionais = useMemo(() => {
    const relacionaisSelecionados: any[] = [];
    Object.entries(selected).forEach(([groupId, opcao]: [string, any]) => {
      const grupo = grupos.find((g: RelationalGroup) => g.grupo.id === Number(groupId));
      const isFracionado =
        grupo &&
        grupo.grupo.min === grupo.grupo.max &&
        grupo.grupo.max !== undefined &&
        grupo.grupo.max > 1;
      if (Array.isArray(opcao)) {
        opcao.forEach((item: any) => {
          if (item._qty && item._qty > 0) {
            if (isFracionado) {
              relacionaisSelecionados.push({
                ...item,
                fractionLabel: `${item._qty}/${grupo!.grupo.max}`,
              });
            } else {
              relacionaisSelecionados.push({
                ...item,
                quantity: item._qty,
              });
            }
          }
        });
      } else if (opcao && typeof opcao === 'object') {
        relacionaisSelecionados.push({
          ...opcao,
          quantity: 1,
        });
      }
    });
    return relacionaisSelecionados;
  }, [selected, grupos]);

  if (!produto || grupos.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Selecionar Opções</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={{ color: colors.text }}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Selecionar Opções</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Selecionar Opções</Text>
          <Text style={styles.productName}>
            {capitalizeFirstLetter(produto?.des2 || produto?.nome || 'Produto')}
          </Text>

          {loadingParams ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : (
            <>
              {grupos.map((grupo: RelationalGroup) => {
                const sel = selected[grupo.grupo.id];
                const isFracionado =
                  grupo.grupo.min === grupo.grupo.max &&
                  grupo.grupo.max !== undefined &&
                  grupo.grupo.max > 1;

                return (
                  <View
                    key={grupo.grupo.id}
                    style={styles.groupContainer}
                  >
                    <View style={styles.groupHeader}>
                      <Text style={styles.groupTitle}>
                        {capitalizeFirstLetter(grupo.grupo.nome)}
                      </Text>
                      {grupo.grupo.min && (
                        <Text style={styles.groupBadge}>(mínimo {grupo.grupo.min})</Text>
                      )}
                      {grupo.grupo.max && (
                        <Text style={styles.groupInfo}>
                          {grupo.grupo.max === 1
                            ? 'Escolha 1'
                            : `Escolha até ${grupo.grupo.max}`}
                        </Text>
                      )}
                      {grupo.grupo.obrigatorio && (
                        <View style={styles.requiredBadge}>
                          <Text style={{ color: colors.error, fontSize: 10 }}>OBRIGATÓRIO</Text>
                        </View>
                      )}
                    </View>

                    {grupo.grupo.tipo === '2' ? (
                      grupo.itens.map((item: any) => (
                        <TouchableOpacity
                          key={item.id}
                          style={styles.itemContainerTouchable}
                          onPress={() => handleSelect(grupo, item)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.itemInfo}>
                            <Text style={styles.itemName}>
                              {capitalizeFirstLetter(item.nomeProduto)}
                            </Text>
                            {item.descricao && (
                              <Text style={styles.itemDescription}>{item.descricao}</Text>
                            )}
                            <Text style={styles.itemPrice}>
                              {formatCurrency(item.precoVenda ?? 0)}
                            </Text>
                          </View>
                          <View style={styles.radioButton}>
                            {sel?.id === item.id && (
                              <View style={styles.radioButtonSelected} />
                            )}
                          </View>
                        </TouchableOpacity>
                      ))
                    ) : isFracionado ? (
                      grupo.itens.map((item: any) => {
                        const current = Array.isArray(sel) ? sel : [];
                        const found = current.find((i: any) => i.id === item.id);
                        const qty = found?._qty ?? 0;
                        const totalQty = current.reduce(
                          (acc: number, i: any) => acc + (i._qty ?? 0),
                          0
                        );

                        return (
                          <View
                            key={item.id}
                            style={styles.itemContainer}
                          >
                            <View style={styles.itemInfo}>
                              <Text style={styles.itemName}>
                                {capitalizeFirstLetter(item.nomeProduto)}
                              </Text>
                              <Text style={styles.itemPrice}>
                                {formatCurrency(item.precoVenda ?? 0)}
                              </Text>
                            </View>
                            <View style={styles.quantityControls}>
                              <TouchableOpacity
                                style={[styles.quantityButton, qty <= 0 && styles.quantityButtonDisabled]}
                                onPress={() => handleSelect(grupo, item, 'dec')}
                                disabled={qty <= 0}
                                activeOpacity={0.7}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                              >
                                <Ionicons
                                  name="remove"
                                  size={16}
                                  color={qty <= 0 ? colors.textSecondary : colors.primary}
                                />
                              </TouchableOpacity>
                              <Text style={styles.quantityText}>
                                {qty > 0 ? `${qty}/${grupo.grupo.max}` : '0'}
                              </Text>
                              <TouchableOpacity
                                style={[
                                  styles.quantityButton,
                                  grupo.grupo.max !== undefined && totalQty >= grupo.grupo.max && styles.quantityButtonDisabled
                                ]}
                                onPress={() => handleSelect(grupo, item, 'inc')}
                                disabled={
                                  grupo.grupo.max !== undefined &&
                                  totalQty >= grupo.grupo.max
                                }
                                activeOpacity={0.7}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                              >
                                <Ionicons
                                  name="add"
                                  size={16}
                                  color={
                                    grupo.grupo.max !== undefined && totalQty >= grupo.grupo.max
                                      ? colors.textSecondary
                                      : colors.primary
                                  }
                                />
                              </TouchableOpacity>
                            </View>
                          </View>
                        );
                      })
                    ) : (
                      grupo.itens.map((item: any) => {
                        const current = Array.isArray(sel) ? sel : [];
                        const found = current.find((i: any) => i.id === item.id);
                        const qty = found?._qty ?? 0;
                        const totalQty = current.reduce(
                          (acc: number, i: any) => acc + (i._qty ?? 0),
                          0
                        );

                        return (
                          <View key={item.id} style={styles.itemContainer}>
                            <View style={styles.itemInfo}>
                              <Text style={styles.itemName}>
                                {capitalizeFirstLetter(item.nomeProduto)}
                              </Text>
                              <Text style={styles.itemPrice}>
                                {formatCurrency(item.precoVenda ?? 0)}
                              </Text>
                            </View>
                            <View style={styles.quantityControls}>
                              <TouchableOpacity
                                style={[styles.quantityButton, qty <= 0 && styles.quantityButtonDisabled]}
                                onPress={() => handleSelect(grupo, item, 'dec')}
                                disabled={qty <= 0}
                                activeOpacity={0.7}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                              >
                                <Ionicons
                                  name="remove"
                                  size={16}
                                  color={qty <= 0 ? colors.textSecondary : colors.primary}
                                />
                              </TouchableOpacity>
                              <Text style={styles.quantityText}>{qty}</Text>
                              <TouchableOpacity
                                style={[
                                  styles.quantityButton,
                                  grupo.grupo.max !== undefined && totalQty >= grupo.grupo.max && styles.quantityButtonDisabled
                                ]}
                                onPress={() => handleSelect(grupo, item, 'inc')}
                                disabled={
                                  grupo.grupo.max !== undefined &&
                                  totalQty >= grupo.grupo.max
                                }
                                activeOpacity={0.7}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                              >
                                <Ionicons
                                  name="add"
                                  size={16}
                                  color={
                                    grupo.grupo.max !== undefined && totalQty >= grupo.grupo.max
                                      ? colors.textSecondary
                                      : colors.primary
                                  }
                                />
                              </TouchableOpacity>
                            </View>
                          </View>
                        );
                      })
                    )}
                  </View>
                );
              })}

              {selectedRelacionais.length > 0 && (
                <View style={styles.summaryContainer}>
                  <Text style={styles.summaryTitle}>Adicionais selecionados:</Text>
                  {selectedRelacionais.map((ad, idx) => (
                    <Text key={idx} style={styles.summaryItem}>
                      {ad.fractionLabel
                        ? `${ad.fractionLabel}x ${capitalizeFirstLetter(
                          ad.nomeProduto || ad.des2 || ad.codm
                        )}`
                        : `${ad.quantity}x ${capitalizeFirstLetter(
                          ad.nomeProduto || ad.des2 || ad.codm
                        )}`}
                    </Text>
                  ))}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Cancelar" variant="outline" onPress={() => router.back()} style={{ flex: 1 }} />
        <Button
          title={`Adicionar ${total > 0 ? formatCurrency(total) : ''}`}
          onPress={handleConfirm}
          disabled={!isValid || loadingParams}
          style={{ flex: 1 }}
        />
      </View>
    </SafeAreaView>
  );
}

