import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import Button from '../../components/common/Button';
import Screen from '../../components/common/Screen';
import CartPanel from '../../components/pos/CartPanel';
import { useCart } from '../../hooks/useCart';
import { formatCurrency } from '../../utils/formatCurrency';
import { colors, spacing } from '../../utils/theme';

export default function Cart() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();

  return (
    <Screen>
      <CartPanel />

      {items.length > 0 && (
        <>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Toplam</Text>
            <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
          </View>

          <Button title="Ödemeye Geç" size="lg" onPress={() => router.push('/pos/checkout')} />
          <Button
            title="Sepeti Temizle"
            variant="outline"
            style={{ marginTop: spacing.sm }}
            onPress={clearCart}
          />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  totalLabel: { fontWeight: '600', fontSize: 15 },
  totalValue: { fontWeight: '800', fontSize: 22, color: colors.accent },
});
