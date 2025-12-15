import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState, useEffect } from 'react';
import {
  BackHandler,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Alert } from '../utils/alert';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Switch } from '../components/ui/Switch';
import { ConfigButton } from '../components/login/ConfigButton';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useServerConfig } from '../hooks/useServerConfig';
import { useSystemSettings } from '../hooks/useSystemSettings';
import { scale, scaleFont, widthPercentage } from '../utils/responsive';

export default function SettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const { config, updateConfig } = useServerConfig();
  const { settings, updateSetting, updateSettings, loading: settingsLoading } = useSystemSettings();
  const insets = useSafeAreaInsets();
  const [saving, setSaving] = useState(false);

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
          justifyContent: 'center',
          paddingHorizontal: scale(20),
          paddingVertical: scale(20),
          paddingTop: Math.max(insets.top + scale(10), scale(20)),
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          minHeight: scale(70),
        },
        backButton: {
          position: 'absolute',
          left: scale(20),
          top: Math.max(insets.top + scale(10), scale(20)),
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
        scrollContent: {
          padding: scale(16),
        },
        section: {
          marginBottom: scale(24),
        },
        sectionTitle: {
          fontSize: scaleFont(16),
          fontWeight: '600',
          color: colors.text,
          marginBottom: scale(12),
        },
        blockTitle: {
          fontSize: scaleFont(14),
          fontWeight: '600',
          color: colors.text,
          marginTop: scale(16),
          marginBottom: scale(8),
          paddingHorizontal: scale(16),
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
        settingRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: scale(12),
          paddingHorizontal: scale(16),
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        settingLabel: {
          fontSize: scaleFont(14),
          color: colors.text,
          flex: 1,
        },
        settingValue: {
          fontSize: scaleFont(14),
          color: colors.textSecondary,
          marginRight: scale(8),
        },
        settingIcon: {
          marginRight: scale(12),
        },
        infoText: {
          fontSize: scaleFont(12),
          color: colors.textSecondary,
          marginTop: scale(8),
          paddingHorizontal: scale(16),
        },
        serverInfoContainer: {
          padding: scale(16),
          backgroundColor: colors.surface,
          borderRadius: scale(8),
          marginTop: scale(8),
        },
        serverInfoRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: scale(8),
        },
        serverInfoLabel: {
          fontSize: scaleFont(12),
          color: colors.textSecondary,
        },
        serverInfoValue: {
          fontSize: scaleFont(12),
          color: colors.text,
          fontWeight: '500',
        },
        input: {
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: scale(8),
          padding: scale(12),
          backgroundColor: colors.surface,
          color: colors.text,
          fontSize: scaleFont(14),
          marginBottom: scale(16),
        },
        inputLabel: {
          fontSize: scaleFont(14),
          fontWeight: '600',
          color: colors.text,
          marginBottom: scale(8),
        },
        toggleRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: scale(12),
          paddingHorizontal: scale(16),
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        toggleLabel: {
          fontSize: scaleFont(14),
          color: colors.text,
          flex: 1,
        },
        actionButtons: {
          gap: scale(12),
          marginTop: scale(24),
          marginBottom: scale(24),
        },
      }),
    [colors, insets]
  );

  // Sincroniza IP e porta das configurações com o servidor config ao carregar
  useEffect(() => {
    if (!settingsLoading && (config.apiUrlLocal || config.apiUrl)) {
      const url = config.apiUrlLocal || config.apiUrl;
      try {
        const urlObj = new URL(url);
        const ip = urlObj.hostname;
        const port = urlObj.port || '5000';
        
        // Só atualiza se for diferente para evitar loops
        if (settings.serverIp !== ip || settings.serverPort !== port) {
          updateSettings({
            serverIp: ip,
            serverPort: port,
          });
        }
      } catch {
        // Ignora erros de parsing
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.apiUrlLocal, config.apiUrl, settingsLoading]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Atualiza a URL do servidor se o IP ou porta mudaram
      const newUrl = `http://${settings.serverIp}:${settings.serverPort}`;
      
      // Salva as configurações do sistema
      await updateSettings(settings);
      
      // Atualiza a configuração do servidor se necessário
      if (config.apiUrlLocal !== newUrl) {
        await updateConfig({
          ...config,
          apiUrl: newUrl,
          apiUrlLocal: newUrl,
        });
      }
      
      Alert.alert('Sucesso', 'Configurações salvas com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenPaymentMethods = () => {
    router.push('/(tabs)/payment-methods');
  };

  const handleBack = () => {
    // Se não estiver autenticado, vai para login, senão volta normalmente
    if (!user) {
      router.replace('/login');
    } else {
      router.back();
    }
  };

  // Intercepta o botão físico de voltar do Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!user) {
        router.replace('/login');
      } else {
        router.back();
      }
      return true; // Previne o comportamento padrão (fechar app)
    });

    return () => backHandler.remove();
  }, [user, router]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
        >
          <Ionicons name="arrow-back" size={scale(24)} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CONFIGURAÇÕES</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Bloco: Servidor e Conexão */}
        <Text style={styles.blockTitle}>Servidor e Conexão</Text>
        <Card style={styles.section}>
          <View style={{ marginBottom: scale(16) }}>
            <Text style={styles.inputLabel}>IP do Servidor</Text>
            <TextInput
              style={styles.input}
              value={settings.serverIp}
              onChangeText={(text) => updateSetting('serverIp', text)}
              placeholder="192.168.0.100"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
          </View>

          <View style={{ marginBottom: scale(16) }}>
            <Text style={styles.inputLabel}>Porta</Text>
            <TextInput
              style={styles.input}
              value={settings.serverPort}
              onChangeText={(text) => updateSetting('serverPort', text)}
              placeholder="5000"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
          </View>

          <View>
            <Text style={styles.inputLabel}>Número do Equipamento</Text>
            <TextInput
              style={styles.input}
              value={settings.cellphoneNumber || '20'}
              onChangeText={(text) => updateSetting('cellphoneNumber', text)}
              placeholder="20"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
          </View>
        </Card>

        {/* Bloco: Interface e Visualização */}
        <Text style={styles.blockTitle}>Interface e Visualização</Text>
        <Card style={styles.section}>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Tela Deitada</Text>
            <Switch
              value={settings.landscapeScreen}
              onValueChange={(value) => updateSetting('landscapeScreen', value)}
            />
          </View>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Mostrar Borda</Text>
            <Switch
              value={settings.showBorder}
              onValueChange={(value) => updateSetting('showBorder', value)}
            />
          </View>

          <View style={[styles.toggleRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.toggleLabel}>Mostrar Turista</Text>
            <Switch
              value={settings.showTourist}
              onValueChange={(value) => updateSetting('showTourist', value)}
            />
          </View>
        </Card>

        {/* Bloco: Vendas e Pedidos */}
        <Text style={styles.blockTitle}>Vendas e Pedidos</Text>
        <Card style={styles.section}>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Venda Direta</Text>
            <Switch
              value={settings.directSale}
              onValueChange={(value) => updateSetting('directSale', value)}
            />
          </View>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Recebimento Direta com Cartão</Text>
            <Switch
              value={settings.directReceiptWithCard}
              onValueChange={(value) => updateSetting('directReceiptWithCard', value)}
            />
          </View>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Entrada Direta</Text>
            <Switch
              value={settings.directEntry}
              onValueChange={(value) => updateSetting('directEntry', value)}
            />
          </View>

          <View style={[styles.toggleRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.toggleLabel}>Agrupar Quantidade no Pedido</Text>
            <Switch
              value={settings.groupQuantityInOrder}
              onValueChange={(value) => updateSetting('groupQuantityInOrder', value)}
            />
          </View>
        </Card>

        {/* Bloco: Comandas e Impressão */}
        <Text style={styles.blockTitle}>Comandas e Impressão</Text>
        <Card style={styles.section}>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Segunda via Comanda</Text>
            <Switch
              value={settings.secondCopyOrder}
              onValueChange={(value) => updateSetting('secondCopyOrder', value)}
            />
          </View>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Comanda Resumida</Text>
            <Switch
              value={settings.summarizedOrder}
              onValueChange={(value) => updateSetting('summarizedOrder', value)}
            />
          </View>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Segunda via Conta Detalhada</Text>
            <Switch
              value={settings.secondCopyDetailedBill}
              onValueChange={(value) => updateSetting('secondCopyDetailedBill', value)}
            />
          </View>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Impressão de Contas</Text>
            <Switch
              value={settings.printAccounts}
              onValueChange={(value) => updateSetting('printAccounts', value)}
            />
          </View>

          <View style={[styles.toggleRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.toggleLabel}>Segunda Comanda Mesa</Text>
            <Switch
              value={settings.secondTableOrder}
              onValueChange={(value) => updateSetting('secondTableOrder', value)}
            />
          </View>
        </Card>

        {/* Bloco: Cartões e Mesas */}
        <Text style={styles.blockTitle}>Cartões e Mesas</Text>
        <Card style={styles.section}>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Abertura Cartão</Text>
            <Switch
              value={settings.cardOpening}
              onValueChange={(value) => updateSetting('cardOpening', value)}
            />
          </View>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Campos Obrigatórios Abertura Cartão</Text>
            <Switch
              value={settings.mandatoryFieldsCardOpening}
              onValueChange={(value) => updateSetting('mandatoryFieldsCardOpening', value)}
            />
          </View>

          <View style={[styles.toggleRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.toggleLabel}>Cartão NFC</Text>
            <Switch
              value={settings.nfcCard}
              onValueChange={(value) => updateSetting('nfcCard', value)}
            />
          </View>
        </Card>

        {/* Bloco: Caixa e Contas */}
        <Text style={styles.blockTitle}>Caixa e Contas</Text>
        <Card style={styles.section}>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Caixa</Text>
            <Switch
              value={settings.cashier}
              onValueChange={(value) => updateSetting('cashier', value)}
            />
          </View>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Remover as Opções de Contas</Text>
            <Switch
              value={settings.removeAccountOptions}
              onValueChange={(value) => updateSetting('removeAccountOptions', value)}
            />
          </View>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Remover Conta Caixa</Text>
            <Switch
              value={settings.removeCashierAccount}
              onValueChange={(value) => updateSetting('removeCashierAccount', value)}
            />
          </View>

          <View style={[styles.toggleRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.toggleLabel}>Ocultar Antecipação</Text>
            <Switch
              value={settings.hideAnticipation}
              onValueChange={(value) => updateSetting('hideAnticipation', value)}
            />
          </View>
        </Card>

        {/* Bloco: Equipamentos e Integrações */}
        <Text style={styles.blockTitle}>Equipamentos e Integrações</Text>
        <Card style={styles.section}>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Balança</Text>
            <Switch
              value={settings.scale}
              onValueChange={(value) => updateSetting('scale', value)}
            />
          </View>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Bar2</Text>
            <Switch
              value={settings.bar2}
              onValueChange={(value) => updateSetting('bar2', value)}
            />
          </View>

          <View style={[styles.toggleRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.toggleLabel}>Emitir Nota Fiscal Webenefix</Text>
            <Switch
              value={settings.emitWebenefixInvoice}
              onValueChange={(value) => updateSetting('emitWebenefixInvoice', value)}
            />
          </View>
        </Card>

        {/* Botões de Ação */}
        <View style={styles.actionButtons}>
          <Button
            title="METODOS DE PAGAMENTO"
            onPress={handleOpenPaymentMethods}
            style={{ backgroundColor: '#007AFF' }}
          />
          <Button
            title="SALVAR"
            onPress={handleSave}
            disabled={saving || settingsLoading}
            style={{ backgroundColor: '#34C759' }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

