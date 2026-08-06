import { useCallback, useState } from 'react';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';

import Button from '../../../components/common/Button';
import Loader from '../../../components/common/Loader';
import Screen from '../../../components/common/Screen';
import { adjustStock, deleteProduct, fetchProduct, updateProduct } from '../../../api/products';
import { formatCurrency } from '../../../utils/formatCurrency';
import { colors, radius, spacing } from '../../../utils/theme';

export default function ProductDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [adjustError, setAdjustError] = useState('');

  const loadProduct = useCallback(() => fetchProduct(id).then(setProduct).catch(() => setProduct(null)), [id]);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      loadProduct().finally(() => setIsLoading(false));
    }, [loadProduct]),
  );

  const handleQuickAdjust = async (movementType, quantity) => {
    setAdjustError('');
    setBusy(true);
    try {
      await adjustStock(id, { movement_type: movementType, quantity, reason: 'Hızlı düzeltme' });
      await loadProduct();
    } catch {
      setAdjustError('Stok güncellenemedi.');
    } finally {
      setBusy(false);
    }
  };

  const handleToggleActive = () => {
    const makingInactive = product.is_active;
    Alert.alert(
      makingInactive ? 'Ürünü Pasife Al' : 'Ürünü Aktif Et',
      makingInactive
        ? 'Bu ürün satış ekranında ve stok listelerinde artık görünmeyecek. Devam edilsin mi?'
        : 'Bu ürün tekrar satışa açılacak. Devam edilsin mi?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: makingInactive ? 'Pasife Al' : 'Aktif Et',
          onPress: async () => {
            setBusy(true);
            try {
              await updateProduct(id, { is_active: !makingInactive });
              await loadProduct();
            } catch {
              Alert.alert('Hata', 'Ürün durumu güncellenemedi.');
            } finally {
              setBusy(false);
            }
          },
        },
      ],
    );
  };

  const handleDelete = () => {
    Alert.alert('Ürünü Sil', 'Bu ürünü silmek istediğinize emin misiniz?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          try {
            await deleteProduct(id);
            router.back();
          } catch {
            Alert.alert('Hata', 'Ürün silinemedi (satış geçmişi olan ürünler silinemez, pasif hale getirin).');
            setBusy(false);
          }
        },
      },
    ]);
  };

  if (isLoading) return <Loader fullscreen />;
  if (!product) {
    return (
      <Screen>
        <Text>Ürün bulunamadı.</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.imageWrap}>
        {product.image ? (
          <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />
        ) : (
          <Text style={{ fontSize: 48 }}>🧰</Text>
        )}
      </View>

      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.category}>{product.category_name}</Text>
          <Text style={styles.name}>{product.name}</Text>
          {product.barcode ? <Text style={styles.barcode}>Barkod: {product.barcode}</Text> : null}
        </View>
        <View style={{ gap: 6, alignItems: 'flex-end' }}>
          {product.is_low_stock && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Kritik Stok</Text>
            </View>
          )}
          {!product.is_active && (
            <View style={styles.inactiveBadge}>
              <Text style={styles.inactiveBadgeText}>Pasif</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.priceRow}>
        <View style={styles.priceCard}>
          <Text style={styles.priceLabel}>Satış</Text>
          <Text style={[styles.priceValue, { color: colors.accent }]}>{formatCurrency(product.price)}</Text>
        </View>
        <View style={styles.priceCard}>
          <Text style={styles.priceLabel}>Alış</Text>
          <Text style={styles.priceValue}>{formatCurrency(product.cost_price)}</Text>
        </View>
        <View style={styles.priceCard}>
          <Text style={styles.priceLabel}>Toptan</Text>
          <Text style={styles.priceValue}>{product.wholesale_price ? formatCurrency(product.wholesale_price) : '-'}</Text>
        </View>
      </View>

      <View style={styles.stockCard}>
        <View style={styles.stockRow}>
          <Text style={styles.stockLabel}>Stok Durumu</Text>
          <Text style={styles.stockValue}>
            {product.stock_quantity} {product.unit} <Text style={styles.stockMin}>(min {product.min_stock_level})</Text>
          </Text>
        </View>
        <View style={styles.stockButtons}>
          <Button title="− 1" variant="outline" style={{ flex: 1 }} disabled={busy} onPress={() => handleQuickAdjust('out', 1)} />
          <Button title="+ 1" variant="outline" style={{ flex: 1 }} disabled={busy} onPress={() => handleQuickAdjust('in', 1)} />
        </View>
        {adjustError ? <Text style={{ color: colors.danger, fontSize: 12, marginTop: 6 }}>{adjustError}</Text> : null}
      </View>

      <View style={styles.actionsRow}>
        <Button title="Düzenle" variant="outline" style={{ flex: 1 }} onPress={() => router.push(`/products/${id}/edit`)} />
        <Button title="Sil" variant="danger" style={{ flex: 1 }} onPress={handleDelete} disabled={busy} />
      </View>
      <Button
        title={product.is_active ? 'Pasife Al' : 'Aktif Et'}
        variant="outline"
        style={{ marginTop: spacing.sm }}
        disabled={busy}
        onPress={handleToggleActive}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  imageWrap: {
    aspectRatio: 1.6,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.md },
  category: { color: colors.textSecondary, fontSize: 12 },
  name: { fontSize: 18, fontWeight: '700', color: colors.text },
  barcode: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  badge: { backgroundColor: colors.warning, borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#664d03' },
  inactiveBadge: { backgroundColor: colors.border, borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 4 },
  inactiveBadgeText: { fontSize: 11, fontWeight: '700', color: colors.textSecondary },
  priceRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  priceCard: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, padding: 8, alignItems: 'center' },
  priceLabel: { fontSize: 11, color: colors.textSecondary },
  priceValue: { fontWeight: '700', marginTop: 2 },
  stockCard: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md },
  stockRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  stockLabel: { fontWeight: '600' },
  stockValue: { color: colors.text },
  stockMin: { color: colors.textSecondary, fontSize: 12 },
  stockButtons: { flexDirection: 'row', gap: spacing.sm },
  actionsRow: { flexDirection: 'row', gap: spacing.sm },
});
