import { StyleSheet, TextInput, View } from 'react-native';

import { colors, radius, spacing } from '../../utils/theme';

export default function SearchInput({ value, onChangeText, placeholder }) {
  return (
    <View style={styles.wrap}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.card,
    marginBottom: spacing.md,
  },
  input: { paddingHorizontal: spacing.md, paddingVertical: 10, fontSize: 14, color: colors.text },
});
