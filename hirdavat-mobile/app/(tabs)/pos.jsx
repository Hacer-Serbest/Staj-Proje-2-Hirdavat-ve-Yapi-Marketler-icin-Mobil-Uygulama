import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CategoryTabs from '../../components/products/CategoryTabs';
import ProductCard from '../../components/products/ProductCard';
import AppHeader from '../../components/common/AppHeader';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import SearchInput from '../../components/common/SearchInput';
import { fetchCategories, fetchProducts } from '../../api/products';
import { useCart } from '../../hooks/useCart';
import { formatCurrency } from '../../utils/formatCurrency';
import { colors, spacing } from '../../utils/theme';

export default function QuickSale() {
  const router = useRouter();
  const { addItem, unitPriceFor, itemCount, total } = useCart();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadProducts = useCallback(() => {
    setIsLoading(true);
    const params = { is_active: true };
    if (activeCategory) params.category = activeCategory;
    if (search.trim()) params.search = search.trim();
    return fetchProducts(params)
      .then((data) => setProducts(data.results ?? data))
      .catch(() => setProducts([]))
      .finally(() => setIsLoading(false));
  }, [activeCategory, search]);

  useEffect(() => {
    const timeoutId = setTimeout(loadProducts, 300);
    return () => clearTimeout(timeoutId);
  }, [loadProducts]);

  useFocusEffect(
    useCallback(() => {
      fetchCategories().then(setCategories).catch(() => setCategories([]));
      loadProducts();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  return (
    <View style={{ flex: 1 }}>
      <AppHeader />
      <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
        <View style={styles.header}>
          <SearchInput value={search} onChangeText={setSearch} placeholder="Ürün adı veya barkod ara" />
          <CategoryTabs categories={categories} activeId={activeCategory} onChange={setActiveCategory} />
        </View>

        {isLoading ? (
          <Loader />
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => String(item.id)}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <ProductCard product={item} priceOverride={unitPriceFor(item)} onPress={(p) => addItem(p, 1)} />
            )}
            ListEmptyComponent={<EmptyState title="Ürün bulunamadı" icon="🔍" />}
          />
        )}

        {itemCount > 0 && (
          <TouchableOpacity style={styles.cartBar} activeOpacity={0.85} onPress={() => router.push('/pos/cart')}>
            <Text style={styles.cartBarText}>{itemCount} ürün</Text>
            <Text style={styles.cartBarText}>Sepete Git</Text>
            <Text style={styles.cartBarText}>{formatCurrency(total)}</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  row: { gap: spacing.md, paddingHorizontal: spacing.lg },
  listContent: { gap: spacing.md, paddingBottom: 100 },
  cartBar: {
    position: 'absolute',
    bottom: 16,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cartBarText: { color: colors.white, fontWeight: '700' },
});
