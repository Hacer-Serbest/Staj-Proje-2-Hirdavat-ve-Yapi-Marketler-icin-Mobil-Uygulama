import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { colors } from '../../utils/theme';

const ICONS = {
  index: 'home',
  products: 'cube',
  pos: 'cart',
  customers: 'people',
};

export default function TabsLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarIcon: ({ color, size }) => <Ionicons name={ICONS[route.name]} size={size} color={color} />,
        })}
      >
        <Tabs.Screen name="index" options={{ tabBarLabel: 'Ana Sayfa' }} />
        <Tabs.Screen name="products" options={{ tabBarLabel: 'Ürünler' }} />
        <Tabs.Screen name="pos" options={{ tabBarLabel: 'Satış' }} />
        <Tabs.Screen name="customers" options={{ tabBarLabel: 'Müşteriler' }} />
      </Tabs>
    </>
  );
}
