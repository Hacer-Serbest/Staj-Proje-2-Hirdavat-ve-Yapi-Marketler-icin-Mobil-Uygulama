import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import Button from '../common/Button';
import Loader from '../common/Loader';
import Screen from '../common/Screen';
import TextField from '../common/TextField';
import { createProduct, fetchCategories, fetchProduct, updateProduct } from '../../api/products';
import { colors, radius, spacing } from '../../utils/theme';

const UNITS = ['adet', 'kg', 'metre', 'litre', 'paket'];

const EMPTY_FORM = {
  name: '',
  category: '',
  barcode: '',
  unit: 'adet',
  cost_price: '',
  price: '',
  wholesale_price: '',
  stock_quantity: '',
  min_stock_level: '',
};

export default function ProductForm({ productId }) {
  const isEdit = Boolean(productId);
  const router = useRouter();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageAsset, setImageAsset] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    fetchProduct(productId)
      .then((product) => {
        setForm({
          name: product.name,
          category: product.category,
          barcode: product.barcode || '',
          unit: product.unit,
          cost_price: String(product.cost_price ?? ''),
          price: String(product.price ?? ''),
          wholesale_price: product.wholesale_price ? String(product.wholesale_price) : '',
          stock_quantity: String(product.stock_quantity ?? ''),
          min_stock_level: String(product.min_stock_level ?? ''),
        });
        setExistingImageUrl(product.image);
      })
      .catch(() => setError('Ürün yüklenemedi.'))
      .finally(() => setIsLoading(false));
  }, [productId, isEdit]);

  const setField = (field) => (value) => setForm((prev) => ({ ...prev, [field]: value }));

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Fotoğraf seçmek için galeri izni gerekiyor.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled && result.assets?.[0]) {
      setImageAsset(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.name || !form.category || !form.price) {
      setError('Ürün adı, kategori ve satış fiyatı zorunludur.');
      return;
    }
    setIsSaving(true);
    try {
      const fields = {
        name: form.name,
        category: form.category,
        unit: form.unit,
        cost_price: form.cost_price || 0,
        price: form.price,
        wholesale_price: form.wholesale_price || undefined,
        barcode: form.barcode || undefined,
        min_stock_level: form.min_stock_level || 0,
      };
      if (!isEdit) fields.stock_quantity = form.stock_quantity || 0;

      const saved = isEdit
        ? await updateProduct(productId, fields, imageAsset)
        : await createProduct(fields, imageAsset);

      router.replace(`/products/${saved.id}`);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Ürün kaydedilemedi. Alanları kontrol edin.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <Loader fullscreen />;

  const previewUri = imageAsset?.uri || existingImageUrl;

  return (
    <Screen>
      <TextField label="Ürün Adı" value={form.name} onChangeText={setField('name')} />

      <Text style={styles.label}>Kategori</Text>
      <View style={styles.chipsRow}>
        {categories.map((c) => (
          <Pressable
            key={c.id}
            style={[styles.chip, form.category === c.id && styles.chipActive]}
            onPress={() => setField('category')(c.id)}
          >
            <Text style={[styles.chipText, form.category === c.id && styles.chipTextActive]}>{c.name}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Birim</Text>
      <View style={styles.chipsRow}>
        {UNITS.map((u) => (
          <Pressable key={u} style={[styles.chip, form.unit === u && styles.chipActive]} onPress={() => setField('unit')(u)}>
            <Text style={[styles.chipText, form.unit === u && styles.chipTextActive]}>{u}</Text>
          </Pressable>
        ))}
      </View>

      <TextField label="Barkod" value={form.barcode} onChangeText={setField('barcode')} />

      <View style={styles.row3}>
        <TextField style={{ flex: 1 }} label="Alış Fiyatı" value={form.cost_price} onChangeText={setField('cost_price')} keyboardType="decimal-pad" />
        <TextField style={{ flex: 1 }} label="Satış Fiyatı" value={form.price} onChangeText={setField('price')} keyboardType="decimal-pad" />
        <TextField style={{ flex: 1 }} label="Toptan Fiyat" value={form.wholesale_price} onChangeText={setField('wholesale_price')} keyboardType="decimal-pad" />
      </View>

      <View style={styles.row3}>
        {!isEdit && (
          <TextField style={{ flex: 1 }} label="Başlangıç Stoğu" value={form.stock_quantity} onChangeText={setField('stock_quantity')} keyboardType="decimal-pad" />
        )}
        <TextField style={{ flex: 1 }} label="Min. Stok" value={form.min_stock_level} onChangeText={setField('min_stock_level')} keyboardType="decimal-pad" />
      </View>

      <Text style={styles.label}>Fotoğraf</Text>
      <Pressable style={styles.imagePicker} onPress={pickImage}>
        {previewUri ? (
          <Image source={{ uri: previewUri }} style={styles.imagePreview} resizeMode="cover" />
        ) : (
          <Text style={{ color: colors.textSecondary }}>Fotoğraf seç</Text>
        )}
      </Pressable>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button title="Kaydet" size="lg" onPress={handleSubmit} loading={isSaving} disabled={isSaving} style={{ marginTop: spacing.md }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 6 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: colors.card },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { fontSize: 13, color: colors.text },
  chipTextActive: { color: colors.white },
  row3: { flexDirection: 'row', gap: spacing.sm },
  imagePicker: {
    height: 140,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    overflow: 'hidden',
    backgroundColor: colors.card,
  },
  imagePreview: { width: '100%', height: '100%' },
  error: { color: colors.danger, fontSize: 13, marginBottom: spacing.sm },
});
