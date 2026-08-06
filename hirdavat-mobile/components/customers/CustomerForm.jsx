import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import Button from '../common/Button';
import Loader from '../common/Loader';
import Screen from '../common/Screen';
import TextField from '../common/TextField';
import { createCustomer, fetchCustomer, updateCustomer } from '../../api/customers';
import { colors, radius, spacing } from '../../utils/theme';

const EMPTY_FORM = { name: '', phone: '', address: '', is_wholesale: false, notes: '' };

export default function CustomerForm({ customerId }) {
  const isEdit = Boolean(customerId);
  const router = useRouter();

  const [form, setForm] = useState(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    fetchCustomer(customerId)
      .then((customer) =>
        setForm({
          name: customer.name,
          phone: customer.phone || '',
          address: customer.address || '',
          is_wholesale: customer.is_wholesale,
          notes: customer.notes || '',
        }),
      )
      .catch(() => setError('Müşteri yüklenemedi.'))
      .finally(() => setIsLoading(false));
  }, [customerId, isEdit]);

  const setField = (field) => (value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setError('');
    if (!form.name) {
      setError('Ad Soyad zorunludur.');
      return;
    }
    setIsSaving(true);
    try {
      const saved = isEdit ? await updateCustomer(customerId, form) : await createCustomer(form);
      router.replace(`/customers/${saved.id}`);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : detail?.phone?.[0] || 'Müşteri kaydedilemedi.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <Loader fullscreen />;

  return (
    <Screen>
      <TextField label="Ad Soyad / Firma" value={form.name} onChangeText={setField('name')} />
      <TextField label="Telefon" placeholder="5XXXXXXXXX" value={form.phone} onChangeText={setField('phone')} keyboardType="phone-pad" />
      <TextField label="Adres" value={form.address} onChangeText={setField('address')} multiline />

      <Pressable style={styles.checkboxRow} onPress={() => setField('is_wholesale')(!form.is_wholesale)}>
        <View style={[styles.checkbox, form.is_wholesale && styles.checkboxChecked]}>
          {form.is_wholesale ? <Text style={styles.checkmark}>✓</Text> : null}
        </View>
        <Text style={styles.checkboxLabel}>Toptan müşteri (özel fiyat listesi uygulanır)</Text>
      </Pressable>

      <TextField label="Notlar" value={form.notes} onChangeText={setField('notes')} multiline />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button title="Kaydet" size="lg" onPress={handleSubmit} loading={isSaving} disabled={isSaving} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: colors.accent, borderColor: colors.accent },
  checkmark: { color: colors.white, fontSize: 13, fontWeight: '700' },
  checkboxLabel: { fontSize: 13, color: colors.text, flex: 1 },
  error: { color: colors.danger, fontSize: 13, marginBottom: spacing.sm },
});
