import { useTheme } from '@/src/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Tabs, useSegments } from 'expo-router';
import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSystemSettings } from '@/src/hooks/useSystemSettings';
import { useCart } from '@/src/contexts/CartContext';

export default function TabLayout() {
  const { colors } = useTheme();
  const segments = useSegments();
  const { settings } = useSystemSettings();
  const { cart, getTotalItems } = useCart();
  const totalItems = useMemo(() => getTotalItems(), [cart]);

  // Verifica se está na tela de settings ou payment-methods
  const isSettingsScreen = segments.includes('settings') || segments.includes('payment-methods');

  const screenOptions = useMemo(
    () => ({
      tabBarActiveTintColor: colors?.primary || '#2563EB',
      headerShown: false,
      tabBarStyle: isSettingsScreen ? { display: 'none' } : undefined,
    }),
    [colors, isSettingsScreen]
  );

  // Opções da aba de Contas baseadas na configuração
  const billsScreenOptions = useMemo(
    () => ({
      title: 'Contas',
      tabBarIcon: ({ color }: { color: string }) => <Ionicons name="document-text-outline" size={24} color={color} />,
      href: settings.printAccounts ? undefined : null, // Mostra/esconde baseado na configuração
    }),
    [settings.printAccounts]
  );

  // Opções da aba de Pedidos com badge de quantidade
  const ordersScreenOptions = useMemo(
    () => ({
      title: 'Pedidos',
      tabBarIcon: ({ color }: { color: string }) => (
        <View style={{ position: 'relative' }}>
          <Ionicons name="cart-outline" size={24} color={color} />
          {totalItems > 0 && (
            <View style={[styles.badge, { backgroundColor: colors?.error || '#EF4444' }]}>
              <Text style={styles.badgeText}>
                {totalItems > 99 ? '99+' : totalItems}
              </Text>
            </View>
          )}
        </View>
      ),
    }),
    [totalItems, colors?.error]
  );

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Cardápio',
          tabBarIcon: ({ color }) => <Ionicons name="restaurant-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={ordersScreenOptions}
      />
      <Tabs.Screen
        name="bills"
        options={billsScreenOptions}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null, // Hide from tabs
          tabBarStyle: { display: 'none' }, // Hide bottom navigation
        }}
      />
      <Tabs.Screen
        name="payment-methods"
        options={{
          href: null, // Hide from tabs
          tabBarStyle: { display: 'none' }, // Hide bottom navigation
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          href: null, // Hide from tabs
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null, // Hide from tabs
        }}
      />
      <Tabs.Screen
        name="product-groups"
        options={{
          href: null, // Hide from tabs but show bottom navigator
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          href: null, // Hide from tabs but show bottom navigator
        }}
      />
      <Tabs.Screen
        name="product-options"
        options={{
          href: null, // Hide from tabs
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
