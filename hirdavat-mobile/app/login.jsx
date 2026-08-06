import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { API_BASE_URL } from '../api/axiosClient';
import Button from '../components/common/Button';
import Screen from '../components/common/Screen';
import TextField from '../components/common/TextField';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../utils/theme';

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);
    try {
      await login(username, password);
    } catch (err) {
      if (err.response) {
        setError('Kullanıcı adı veya şifre hatalı.');
      } else if (err.code === 'ECONNABORTED') {
        setError(`Sunucuya bağlanılamadı (zaman aşımı). Sunucu ve telefon aynı ağda mı? (${API_BASE_URL})`);
      } else {
        setError(`Sunucuya ulaşılamıyor. Ağ/adres ayarını kontrol et. (${API_BASE_URL})`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.emoji}>🔧</Text>
        <Text style={styles.title}>Hırdavat Yönetim</Text>
        <Text style={styles.subtitle}>Dükkanınıza giriş yapın</Text>
      </View>

      <TextField
        label="Kullanıcı Adı"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="default"
        textContentType="username"
        autoComplete="username"
      />
      <TextField
        label="Şifre"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        textContentType="password"
        autoComplete="current-password"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button title={submitting ? 'Giriş yapılıyor...' : 'Giriş Yap'} onPress={handleSubmit} size="lg" disabled={submitting || !username || !password} loading={submitting} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginTop: 80, marginBottom: 32 },
  emoji: { fontSize: 40 },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, marginTop: 8 },
  subtitle: { color: colors.textSecondary, marginTop: 2 },
  error: { color: colors.danger, marginBottom: 12, fontSize: 13 },
});
