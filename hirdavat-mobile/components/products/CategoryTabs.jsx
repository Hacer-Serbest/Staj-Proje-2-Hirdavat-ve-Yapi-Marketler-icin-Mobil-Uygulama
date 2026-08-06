import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { colors, radius, spacing } from '../../utils/theme';

export default function CategoryTabs({ categories, activeId, onChange }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row} contentContainerStyle={styles.rowContent}>
      <TouchableOpacity
        style={[styles.tab, activeId === null && styles.tabActive]}
        onPress={() => onChange(null)}
      >
        <Text style={[styles.tabText, activeId === null && styles.tabTextActive]}>Tümü</Text>
      </TouchableOpacity>
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[styles.tab, activeId === category.id && styles.tabActive]}
          onPress={() => onChange(category.id)}
        >
          <Text style={[styles.tabText, activeId === category.id && styles.tabTextActive]}>{category.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { marginBottom: spacing.md },
  rowContent: { gap: spacing.sm, paddingRight: spacing.lg },
  tab: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  tabActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  tabText: { fontSize: 13, color: '#374151' },
  tabTextActive: { color: colors.white },
});
