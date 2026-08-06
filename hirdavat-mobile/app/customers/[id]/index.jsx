import { useCallback, useState } from 'react';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import Button from '../../../components/common/Button';
import Loader from '../../../components/common/Loader';
import Screen from '../../../components/common/Screen';
import TextField from '../../../components/common/TextField';
import { fetchCustomer, fetchStatement, recordDebt, recordPayment, statementPdfDownloadUrl } from '../../../api/customers';
import { downloadAndSharePdf } from '../../../utils/downloadPdf';
import { formatCurrency } from '../../../utils/formatCurrency';
import { formatDateTime } from '../../../utils/formatDate';
import { colors, radius, spacing } from '../../../utils/theme';

const TX_LABELS = { debt: 'Veresiye Borcu', payment: 'Tahsilat' };

export default function CustomerDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [customer, setCustomer] = useState(null);
  const [statement, setStatement] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState(null); // 'payment' | 'debt' | null
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    const [customerData, statementData] = await Promise.all([fetchCustomer(id), fetchStatement(id)]);
    setCustomer(customerData);
    setStatement(statementData);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      loadData()
        .catch(() => setCustomer(null))
        .finally(() => setIsLoading(false));
    }, [loadData]),
  );

  const openModal = (type) => {
    setModal(type);
    setAmount('');
    setNote('');
    setError('');
  };

  const handleSubmitTransaction = async () => {
    if (!amount) {
      setError('Tutar giriniz.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const action = modal === 'payment' ? recordPayment : recordDebt;
      await action(id, { amount, note });
      await loadData();
      setModal(null);
    } catch {
      setError('İşlem kaydedilemedi.');
    } finally {
      setBusy(false);
    }
  };

  const handleDownloadStatement = async () => {
    setBusy(true);
    try {
      await downloadAndSharePdf(statementPdfDownloadUrl(id), `cari-ozet-${id}.pdf`);
    } finally {
      setBusy(false);
    }
  };

  if (isLoading) return <Loader fullscreen />;
  if (!customer) {
    return (
      <Screen>
        <Text>Müşteri bulunamadı.</Text>
      </Screen>
    );
  }

  const balance = Number(customer.balance);

  return (
    <Screen>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Cari Bakiye</Text>
        <Text style={[styles.balanceValue, { color: balance > 0 ? colors.danger : colors.accent }]}>
          {formatCurrency(balance)}
        </Text>
        <Text style={styles.balanceHint}>{balance > 0 ? 'Müşteri borçlu' : 'Borç yok'}</Text>
      </View>

      <View style={styles.actionsRow}>
        <Button title="Tahsilat Al" style={{ flex: 1 }} onPress={() => openModal('payment')} />
        <Button title="Veresiye Ekle" variant="danger" style={{ flex: 1 }} onPress={() => openModal('debt')} />
      </View>

      <View style={styles.actionsRow}>
        <Button title="Düzenle" variant="outline" style={{ flex: 1 }} onPress={() => router.push(`/customers/${id}/edit`)} />
        <Button title="Cari Özet PDF" variant="outline" style={{ flex: 1 }} onPress={handleDownloadStatement} disabled={busy} />
      </View>

      <Text style={styles.sectionTitle}>Hareketler (Bu Ay)</Text>
      {statement?.transactions?.length ? (
        <View style={{ gap: spacing.sm }}>
          {statement.transactions
            .slice()
            .reverse()
            .map((tx) => (
              <View key={tx.id} style={styles.txRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.txType}>{TX_LABELS[tx.transaction_type]}</Text>
                  <Text style={styles.txDate}>{formatDateTime(tx.created_at)}</Text>
                  {tx.note ? <Text style={styles.txNote}>{tx.note}</Text> : null}
                </View>
                <Text style={[styles.txAmount, { color: tx.transaction_type === 'debt' ? colors.danger : colors.accent }]}>
                  {tx.transaction_type === 'debt' ? '+' : '−'}
                  {formatCurrency(tx.amount)}
                </Text>
              </View>
            ))}
        </View>
      ) : (
        <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Bu ay için hareket bulunmuyor.</Text>
      )}

      <Modal visible={Boolean(modal)} transparent animationType="slide" onRequestClose={() => setModal(null)}>
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setModal(null)} />
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{modal === 'payment' ? 'Tahsilat Kaydı' : 'Veresiye Borcu Ekle'}</Text>
            <TextField label="Tutar" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" autoFocus />
            <TextField label="Not (opsiyonel)" value={note} onChangeText={setNote} />
            {error ? <Text style={{ color: colors.danger, fontSize: 13, marginBottom: spacing.sm }}>{error}</Text> : null}
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <Button title="Vazgeç" variant="outline" style={{ flex: 1 }} onPress={() => setModal(null)} />
              <Button title="Kaydet" style={{ flex: 1 }} onPress={handleSubmitTransaction} loading={busy} disabled={busy} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  balanceCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  balanceLabel: { color: colors.textSecondary, fontSize: 12 },
  balanceValue: { fontSize: 28, fontWeight: '800', marginTop: 4 },
  balanceHint: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  actionsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  sectionTitle: { fontWeight: '700', fontSize: 15, marginTop: spacing.md, marginBottom: spacing.sm },
  txRow: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: spacing.sm },
  txType: { fontWeight: '600', fontSize: 13 },
  txDate: { color: colors.textSecondary, fontSize: 11 },
  txNote: { color: colors.textSecondary, fontSize: 11 },
  txAmount: { fontWeight: '700' },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: { backgroundColor: colors.card, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: spacing.lg },
  modalTitle: { fontWeight: '700', fontSize: 16, marginBottom: spacing.md },
});
