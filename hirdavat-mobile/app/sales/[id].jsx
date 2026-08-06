import { useCallback, useState } from 'react';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Alert, StyleSheet, Text, View } from 'react-native';

import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Screen from '../../components/common/Screen';
import { cancelSale, fetchSale, receiptPdfDownloadUrl } from '../../api/sales';
import { downloadAndSharePdf } from '../../utils/downloadPdf';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';
import { colors, radius, spacing } from '../../utils/theme';

const PAYMENT_LABELS = { cash: 'Nakit', card: 'Kredi Kartı', transfer: 'Havale/EFT', credit: 'Veresiye' };

export default function SaleReceipt() {
  const { id, justCompleted } = useLocalSearchParams();
  const [sale, setSale] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const loadSale = useCallback(() => fetchSale(id).then(setSale).catch(() => setSale(null)), [id]);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      loadSale().finally(() => setIsLoading(false));
    }, [loadSale]),
  );

  const handleDownloadPdf = async () => {
    setBusy(true);
    try {
      await downloadAndSharePdf(receiptPdfDownloadUrl(id), `fis-${id}.pdf`);
    } catch {
      Alert.alert('Hata', 'Fiş indirilemedi.');
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = () => {
    Alert.alert('Satışı İptal Et', 'Bu satışı iptal etmek istediğinize emin misiniz?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'İptal Et',
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          try {
            await cancelSale(id, {});
            await loadSale();
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  };

  if (isLoading) return <Loader fullscreen />;
  if (!sale) {
    return (
      <Screen>
        <Text>Satış bulunamadı.</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      {justCompleted === '1' && (
        <View style={styles.successBanner}>
          <Text style={styles.successText}>✅ Satış başarıyla tamamlandı</Text>
        </View>
      )}

      {sale.status === 'cancelled' && (
        <View style={styles.cancelledBanner}>
          <Text style={styles.cancelledText}>Bu satış iptal edilmiştir.</Text>
        </View>
      )}

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Tarih</Text>
          <Text style={styles.infoValue}>{formatDateTime(sale.created_at)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Ödeme</Text>
          <Text style={styles.infoValue}>{PAYMENT_LABELS[sale.payment_type]}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Müşteri</Text>
          <Text style={styles.infoValue}>{sale.customer_name || 'Peşin Müşteri'}</Text>
        </View>
      </View>

      <View style={{ gap: spacing.sm, marginBottom: spacing.md }}>
        {sale.items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.product_name}</Text>
              <Text style={styles.itemMeta}>
                {item.quantity} {item.unit} × {formatCurrency(item.unit_price)}
              </Text>
            </View>
            <Text style={styles.itemTotal}>{formatCurrency(item.line_total)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Toplam</Text>
        <Text style={styles.totalValue}>{formatCurrency(sale.total_amount)}</Text>
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <Button title="Fiş PDF" variant="outline" style={{ flex: 1 }} onPress={handleDownloadPdf} disabled={busy} />
        {sale.status !== 'cancelled' && (
          <Button title="Satışı İptal Et" variant="danger" style={{ flex: 1 }} onPress={handleCancel} disabled={busy} />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  successBanner: { backgroundColor: '#d1e7dd', borderRadius: radius.sm, padding: spacing.md, marginBottom: spacing.md },
  successText: { color: '#0f5132', fontWeight: '600' },
  cancelledBanner: { backgroundColor: '#f8d7da', borderRadius: radius.sm, padding: spacing.md, marginBottom: spacing.md },
  cancelledText: { color: '#842029', fontWeight: '600' },
  infoCard: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, gap: 4 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoLabel: { color: colors.textSecondary, fontSize: 12 },
  infoValue: { color: colors.textSecondary, fontSize: 12 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: spacing.sm },
  itemName: { fontWeight: '600', fontSize: 13 },
  itemMeta: { color: colors.textSecondary, fontSize: 12 },
  itemTotal: { fontWeight: '600' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    marginBottom: spacing.md,
  },
  totalLabel: { fontWeight: '600', fontSize: 15 },
  totalValue: { fontWeight: '800', fontSize: 22, color: colors.accent },
});
