import { useCallback, useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppHeader from '../../components/common/AppHeader';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import SearchInput from '../../components/common/SearchInput';
import { fetchCustomers } from '../../api/customers';
import { formatCurrency } from '../../utils/formatCurrency';
import { colors, radius, spacing } from '../../utils/theme';

export default function CustomerList() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadCustomers = useCallback(() => {
    setIsLoading(true);
    return fetchCustomers(search.trim() ? { search: search.trim() } : {})
      .then((data) => setCustomers(data.results ?? data))
      .catch(() => setCustomers([]))
      .finally(() => setIsLoading(false));
  }, [search]);

  useEffect(() => {
    const timeoutId = setTimeout(loadCustomers, 300);
    return () => clearTimeout(timeoutId);
  }, [loadCustomers]);

  useFocusEffect(
    useCallback(() => {
      loadCustomers();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  return (
    <View style={{ flex: 1 }}>
      <AppHeader />
      <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
        <View style={styles.header}>
          <SearchInput value={search} onChangeText={setSearch} placeholder="Müşteri adı veya telefon ara" />
        </View>

        {isLoading ? (
          <Loader />
        ) : (
          <FlatList
            data={customers}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.row} onPress={() => router.push(`/customers/${item.id}`)}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.name}>{item.name}</Text>
                    {item.is_wholesale && (
                      <View style={styles.wholesaleBadge}>
                        <Text style={styles.wholesaleBadgeText}>Toptan</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.phone}>{item.phone || 'Telefon yok'}</Text>
                </View>
                <Text style={[styles.balance, { color: Number(item.balance) > 0 ? colors.danger : colors.accent }]}>
                  {formatCurrency(item.balance)}
                </Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<EmptyState title="Müşteri bulunamadı" icon="👤" />}
          />
        )}

        <View style={styles.fabWrap}>
          <TouchableOpacity style={styles.fab} activeOpacity={0.8} onPress={() => router.push('/customers/new')}>
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
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: 100 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.md,
    backgroundColor: colors.card,
  },
  name: { fontWeight: '600', color: colors.text },
  phone: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  balance: { fontWeight: '700' },
  wholesaleBadge: { backgroundColor: '#e2e3e5', borderRadius: radius.sm, paddingHorizontal: 6, paddingVertical: 1 },
  wholesaleBadgeText: { fontSize: 10, color: '#41464b', fontWeight: '600' },
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
