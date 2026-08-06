import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../utils/theme';

export default function Loader({ fullscreen = false, label = 'Yükleniyor...' }) {
  return (
    <View style={[styles.container, fullscreen && styles.fullscreen]}>
      <ActivityIndicator size="large" color={colors.accent} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingVertical: 32, gap: 8 },
  fullscreen: { flex: 1 },
  label: { color: colors.textSecondary, fontSize: 13 },
});
