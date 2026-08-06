import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { fetchCustomers } from '../../api/customers';
import { colors, radius, spacing } from '../../utils/theme';

export default function CustomerPicker({ customer, onSelect, required }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timeoutId = setTimeout(() => {
      fetchCustomers({ search: query.trim() })
        .then((data) => setResults(data.results ?? data))
        .catch(() => setResults([]));
    }, 250);
    return () => clearTimeout(timeoutId);
  }, [query]);

  if (customer) {
    return (
      <View style={styles.selected}>
        <View>
          <Text style={styles.selectedName}>{customer.name}</Text>
          {customer.phone ? <Text style={styles.selectedPhone}>{customer.phone}</Text> : null}
        </View>
        <Pressable onPress={() => onSelect(null)}>
          <Text style={styles.changeLink}>Değiştir</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View>
      <TextInput
        style={styles.input}
        placeholder={required ? 'Müşteri ara (zorunlu — veresiye)' : 'Müşteri ara (opsiyonel)'}
        placeholderTextColor={colors.textSecondary}
        value={query}
        onChangeText={setQuery}
      />
      {results.length > 0 && (
        <View style={styles.resultsBox}>
          <FlatList
            data={results}
            keyExtractor={(item) => String(item.id)}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable
                style={styles.resultRow}
                onPress={() => {
                  onSelect(item);
                  setQuery('');
                  setResults([]);
                }}
              >
                <Text style={styles.selectedName}>{item.name}</Text>
                {item.phone ? <Text style={styles.selectedPhone}>{item.phone}</Text> : null}
              </Pressable>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: colors.card,
  },
  resultsBox: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    marginTop: 4,
    maxHeight: 180,
    backgroundColor: colors.card,
  },
  resultRow: { paddingHorizontal: spacing.md, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  selected: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.md,
    backgroundColor: colors.card,
  },
  selectedName: { fontWeight: '600', color: colors.text },
  selectedPhone: { color: colors.textSecondary, fontSize: 12 },
  changeLink: { color: colors.accent, fontWeight: '600', fontSize: 13 },
});
