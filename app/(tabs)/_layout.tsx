import { useTheme } from '@/src/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React, { useMemo } from 'react';

export default function TabLayout() {
  const { colors } = useTheme();

  const screenOptions = useMemo(
    () => ({
      tabBarActiveTintColor: colors?.primary || '#2563EB',
      headerShown: false,
    }),
    [colors]
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
        options={{
          title: 'Pedidos',
          tabBarIcon: ({ color }) => <Ionicons name="receipt-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="bills"
        options={{
          title: 'Contas',
          tabBarIcon: ({ color }) => <Ionicons name="document-text-outline" size={24} color={color} />,
        }}
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
          title: 'Configurações',
          tabBarIcon: ({ color }) => <Ionicons name="settings-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="payment-methods"
        options={{
          href: null, // Hide from tabs
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
