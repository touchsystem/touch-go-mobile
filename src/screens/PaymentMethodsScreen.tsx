import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useEffect } from 'react';
import {
  BackHandler,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '../components/ui/Card';
import { Switch } from '../components/ui/Switch';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { usePaymentMethods } from '../hooks/usePaymentMethods';
import { scale, scaleFont } from '../utils/responsive';

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const { paymentMethods, updatePaymentMethod, loading } = usePaymentMethods();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    // Sempre volta para a tela de configurações
    router.replace('/(tabs)/settings');
  };

  // Intercepta o botão físico de voltar do Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      router.replace('/(tabs)/settings');
      return true; // Previne o comportamento padrão (fechar app)
    });

    return () => backHandler.remove();
  }, [router]);

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
          padding: scale(20),
          paddingTop: Math.max(insets.top, scale(10)),
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          position: 'relative',
        },
        backButton: {
          position: 'absolute',
          left: scale(20),
          top: Math.max(insets.top, scale(10)),
          padding: scale(8),
        },
        headerTitle: {
          fontSize: scaleFont(18),
          fontWeight: '600',
          color: colors.text,
        },
        scrollContent: {
          padding: scale(16),
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
      }),
    [colors, insets]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
        >
          <Ionicons name="arrow-back" size={scale(24)} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Métodos de pagamentos</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card>
          {paymentMethods.map((method, index) => (
            <View
              key={method.id}
              style={[
                styles.toggleRow,
                index === paymentMethods.length - 1 && { borderBottomWidth: 0 }
              ]}
            >
              <Text style={styles.toggleLabel}>{method.name}</Text>
              <Switch
                value={method.enabled}
                onValueChange={(value) => updatePaymentMethod(method.id, value)}
                disabled={loading}
              />
            </View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

