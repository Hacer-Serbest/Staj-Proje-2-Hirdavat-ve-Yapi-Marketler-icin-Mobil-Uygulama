import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import Button from '../../components/common/Button';
import Screen from '../../components/common/Screen';
import TextField from '../../components/common/TextField';
import CustomerPicker from '../../components/pos/CustomerPicker';
import { createSale } from '../../api/sales';
import { useCart } from '../../hooks/useCart';
import { formatCurrency } from '../../utils/formatCurrency';
import { colors, radius, spacing } from '../../utils/theme';

const PAYMENT_TYPES = [
  { value: 'cash', label: 'Nakit' },
  { value: 'card', label: 'Kredi Kartı' },
  { value: 'transfer', label: 'Havale/EFT' },
  { value: 'credit', label: 'Veresiye' },
];

export default function Checkout() {
  const router = useRouter();
  const { items, customer, setCustomer, total, clearCart } = useCart();

  const [paymentType, setPaymentType] = useState('cash');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleCompleteSale = async () => {
    setError('');
    if (paymentType === 'credit' && !customer) {
      setError('Veresiye satış için müşteri seçmelisiniz.');
      return;
    }
    if (items.length === 0) {
      setError('Sepet boş.');
      return;
    }
    setSubmitting(true);
    try {
      const sale = await createSale({
        customer: customer?.id ?? null,
        payment_type: paymentType,
        note,
        items: items.map((item) => ({ product: item.product.id, quantity: item.quantity })),
      });
      clearCart();
      router.replace(`/sales/${sale.id}?justCompleted=1`);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Satış tamamlanamadı.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <Text style={styles.summaryText}>Sepette {items.length} ürün</Text>

      <Text style={styles.label}>Müşteri</Text>
      <CustomerPicker customer={customer} onSelect={setCustomer} required={paymentType === 'credit'} />

      <Text style={[styles.label, { marginTop: spacing.md }]}>Ödeme Tipi</Text>
      <View style={styles.paymentRow}>
        {PAYMENT_TYPES.map((pt) => (
          <Pressable
            key={pt.value}
            style={[styles.paymentChip, paymentType === pt.value && styles.paymentChipActive]}
            onPress={() => setPaymentType(pt.value)}
          >
            <Text style={[styles.paymentChipText, paymentType === pt.value && styles.paymentChipTextActive]}>{pt.label}</Text>
          </Pressable>
        ))}
      </View>

      <TextField label="Not (opsiyonel)" value={note} onChangeText={setNote} multiline style={{ marginTop: spacing.md }} />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Toplam</Text>
        <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
      </View>

      <Button title="Satışı Tamamla" size="lg" onPress={handleCompleteSale} loading={submitting} disabled={submitting} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  summaryText: { color: colors.textSecondary, fontSize: 13, marginBottom: spacing.md },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 6 },
  paymentRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  paymentChip: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: colors.card },
  paymentChipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  paymentChipText: { fontSize: 13, color: colors.text },
  paymentChipTextActive: { color: colors.white },
  error: { color: colors.danger, fontSize: 13, marginTop: spacing.sm },
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
