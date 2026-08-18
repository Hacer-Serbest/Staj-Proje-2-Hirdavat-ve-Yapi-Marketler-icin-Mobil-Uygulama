import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { colors, spacing } from '../../utils/theme';

const WEEKDAYS_TR = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
const MONTHS_TR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

export default function AppHeader() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const router = useRouter();

  const now = new Date();
  const todayLabel = `${WEEKDAYS_TR[now.getDay()]}, ${now.getDate()} ${MONTHS_TR[now.getMonth()]}`;
  const displayName = user?.shop_name || user?.username || '';
  const avatarLetter = displayName ? displayName.charAt(0).toUpperCase() : '?';

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.row}>
        <LinearGradient
          colors={['#1e3355', '#243b5e', '#64748b']}
          locations={[0, 0.6, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatar}
        >
          <Text style={styles.avatarText}>{avatarLetter}</Text>
        </LinearGradient>

        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>Merhaba,</Text>
          <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
        </View>

        <Text style={styles.date} numberOfLines={1}>{todayLabel}</Text>

        {itemCount > 0 && (
          <Pressable style={styles.iconButton} onPress={() => router.push('/pos/cart')} hitSlop={8}>
            <Ionicons name="cart" size={20} color={colors.white} />
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{itemCount}</Text>
            </View>
          </Pressable>
        )}

        <Pressable style={styles.iconButton} onPress={logout} hitSlop={8}>
          <Ionicons name="log-out-outline" size={22} color={colors.white} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.accent },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.white, fontWeight: '800', fontSize: 16 },
  greeting: { color: 'rgba(255,255,255,0.85)', fontSize: 11 },
  name: { color: colors.white, fontWeight: '700', fontSize: 15, marginTop: 1 },
  date: { color: 'rgba(255,255,255,0.85)', fontSize: 11, maxWidth: 76, textAlign: 'right' },
  iconButton: { padding: 4 },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: { color: colors.white, fontSize: 9, fontWeight: '700' },
});
