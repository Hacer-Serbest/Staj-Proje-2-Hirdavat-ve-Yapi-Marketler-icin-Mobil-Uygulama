import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { formatCurrency } from '../../utils/formatCurrency';
import { useCart } from '../../hooks/useCart';
import { colors, radius, spacing } from '../../utils/theme';

export default function CartPanel() {
  const { items, updateQuantity, removeItem, unitPriceFor } = useCart();

  if (items.length === 0) {
    return (
      <View style={{ paddingVertical: 24 }}>
        <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
          Sepet boş. Ürün eklemek için ürünlere dokunun.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ gap: spacing.sm }}>
      {items.map(({ product, quantity }) => {
        const unitPrice = unitPriceFor(product);
        return (
          <View key={product.id} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={1}>
                {product.name}
              </Text>
              <Text style={styles.unitPrice}>
                {formatCurrency(unitPrice)} / {product.unit}
              </Text>
            </View>
            <View style={styles.qtyControls}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(product.id, quantity - 1)}>
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{quantity}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(product.id, quantity + 1)}>
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.lineTotal}>{formatCurrency(unitPrice * quantity)}</Text>
            <TouchableOpacity onPress={() => removeItem(product.id)} hitSlop={8}>
              <Text style={{ color: colors.danger, fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  name: { fontWeight: '600', fontSize: 13, color: colors.text },
  unitPrice: { color: colors.textSecondary, fontSize: 12 },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: { fontSize: 16, color: colors.text },
  qtyValue: { minWidth: 24, textAlign: 'center' },
  lineTotal: { fontWeight: '700', minWidth: 70, textAlign: 'right', color: colors.text },
});
