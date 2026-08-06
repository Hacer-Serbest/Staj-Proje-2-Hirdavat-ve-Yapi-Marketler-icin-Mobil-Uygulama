import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { colors, radius } from '../../utils/theme';

const VARIANTS = {
  primary: { backgroundColor: colors.accent, borderColor: colors.accent, textColor: colors.white },
  outline: { backgroundColor: colors.card, borderColor: colors.border, textColor: colors.text },
  danger: { backgroundColor: colors.card, borderColor: colors.danger, textColor: colors.danger },
};

export default function Button({ title, onPress, variant = 'primary', disabled, loading, style, size = 'md' }) {
  const v = VARIANTS[variant] ?? VARIANTS.primary;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      style={[
        styles.base,
        size === 'lg' && styles.lg,
        { backgroundColor: v.backgroundColor, borderColor: v.borderColor },
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.textColor} />
      ) : (
        <Text style={[styles.text, { color: v.textColor }, size === 'lg' && styles.textLg]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lg: { paddingVertical: 14, borderRadius: radius.md },
  disabled: { opacity: 0.6 },
  text: { fontWeight: '600', fontSize: 14 },
  textLg: { fontSize: 16 },
});
