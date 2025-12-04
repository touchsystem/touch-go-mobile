import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '../components/ui/Card';
import { Switch } from '../components/ui/Switch';
import { useTheme } from '../contexts/ThemeContext';
import { usePaymentMethods } from '../hooks/usePaymentMethods';
import { scale, scaleFont } from '../utils/responsive';

export default function PaymentMethodsScreen() {
  const { colors } = useTheme();
  const { paymentMethods, updatePaymentMethod, loading } = usePaymentMethods();
  const insets = useSafeAreaInsets();

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
    <View style={styles.container}>
      <View style={styles.header}>
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
    </View>
  );
}

