import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { formatCurrency } from '../../utils/formatCurrency';
import { colors, radius, spacing } from '../../utils/theme';

export default function ProductCard({ product, onPress, priceOverride }) {
  const price = priceOverride ?? product.price;

  return (
    <TouchableOpacity
      style={[styles.card, !product.is_active && styles.cardInactive]}
      onPress={() => onPress?.(product)}
      activeOpacity={0.7}
    >
      <View style={styles.imageWrap}>
        {product.image ? (
          <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />
        ) : (
          <Text style={styles.imagePlaceholder}>🧰</Text>
        )}
      </View>
      <View style={styles.body}>
        <Text style={styles.category} numberOfLines={1}>
          {product.category_name}
        </Text>
        <Text style={styles.name} numberOfLines={1}>
          {product.name}
        </Text>
        <View style={styles.footerRow}>
          <Text style={styles.price}>{formatCurrency(price)}</Text>
          {!product.is_active ? (
            <View style={styles.inactiveBadge}>
              <Text style={styles.inactiveBadgeText}>Pasif</Text>
            </View>
          ) : product.is_low_stock ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Kritik</Text>
            </View>
          ) : (
            <Text style={styles.stock}>
              {product.stock_quantity} {product.unit}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  cardInactive: { opacity: 0.55 },
  imageWrap: {
    aspectRatio: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { fontSize: 32 },
  body: { padding: 10 },
  category: { fontSize: 11, color: colors.textSecondary },
  name: { fontWeight: '600', color: colors.text, marginTop: 2 },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  price: { fontWeight: '700', color: colors.accent },
  stock: { fontSize: 11, color: colors.textSecondary },
  badge: { backgroundColor: colors.warning, borderRadius: radius.sm, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { fontSize: 10, fontWeight: '600', color: '#664d03' },
  inactiveBadge: { backgroundColor: colors.border, borderRadius: radius.sm, paddingHorizontal: 6, paddingVertical: 2 },
  inactiveBadgeText: { fontSize: 10, fontWeight: '600', color: colors.textSecondary },
});
