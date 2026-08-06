import { useCallback, useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CategoryTabs from '../../components/products/CategoryTabs';
import ProductCard from '../../components/products/ProductCard';
import AppHeader from '../../components/common/AppHeader';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import SearchInput from '../../components/common/SearchInput';
import { fetchCategories, fetchProducts } from '../../api/products';
import { colors, spacing } from '../../utils/theme';

export default function ProductList() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadProducts = useCallback(() => {
    setIsLoading(true);
    const params = {};
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
              <ProductCard product={item} onPress={(p) => router.push(`/products/${p.id}`)} />
            )}
            ListEmptyComponent={<EmptyState title="Ürün bulunamadı" description="Farklı bir arama deneyin veya yeni ürün ekleyin." />}
          />
        )}

        <View style={styles.fabWrap} pointerEvents="box-none">
          <TouchableOpacity style={styles.fab} activeOpacity={0.8} onPress={() => router.push('/products/new')}>
            <Ionicons name="add" size={28} color={colors.white} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  row: { gap: spacing.md, paddingHorizontal: spacing.lg },
  listContent: { gap: spacing.md, paddingBottom: 100 },
  fabWrap: { position: 'absolute', bottom: 24, right: 20 },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
});
