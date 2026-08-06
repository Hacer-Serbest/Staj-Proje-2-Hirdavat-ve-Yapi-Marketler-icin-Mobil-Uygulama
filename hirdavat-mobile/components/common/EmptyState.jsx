import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../utils/theme';

export default function EmptyState({ title = 'Kayıt bulunamadı', description, icon = '📦' }) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, gap: 4 },
  icon: { fontSize: 40 },
  title: { fontWeight: '600', color: colors.text, marginTop: 8 },
  description: { color: colors.textSecondary, fontSize: 12, textAlign: 'center' },
});
