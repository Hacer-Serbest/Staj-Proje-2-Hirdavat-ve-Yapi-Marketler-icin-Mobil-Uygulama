import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Loader from '../components/common/Loader';
import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../utils/theme';

function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loader fullscreen />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: true,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="products/new" options={{ title: 'Yeni Ürün' }} />
        <Stack.Screen name="products/[id]/index" options={{ title: 'Ürün Detayı' }} />
        <Stack.Screen name="products/[id]/edit" options={{ title: 'Ürünü Düzenle' }} />
        <Stack.Screen name="pos/cart" options={{ title: 'Sepet' }} />
        <Stack.Screen name="pos/checkout" options={{ title: 'Ödeme' }} />
        <Stack.Screen name="sales/[id]" options={{ title: 'Fiş' }} />
        <Stack.Screen name="customers/new" options={{ title: 'Yeni Müşteri' }} />
        <Stack.Screen name="customers/[id]/index" options={{ title: 'Müşteri Detayı' }} />
        <Stack.Screen name="customers/[id]/edit" options={{ title: 'Müşteriyi Düzenle' }} />
      </Stack.Protected>

      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <CartProvider>
            <StatusBar style="dark" />
            <RootNavigator />
          </CartProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
