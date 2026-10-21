import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { useTheme } from '@contexts/ThemeContext';
import { loginApi, registerApi } from '@services/api';
import { useCartStore } from '@services/useCartStore';
import ShopButton from '@components/ShopButton';

export default function AuthScreen() {
  const { colors } = useTheme();
  const loginSuccess = useCartStore(state => state.loginSuccess);

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('Bùi Công Nguyên');
  const [email, setEmail] = useState('nguyenbui@shopai.vn');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (mode === 'login') {
        const res = await loginApi(email, password);
        loginSuccess(res.token, res.user);
      } else {
        const res = await registerApi(name, email, password);
        loginSuccess(res.token, res.user);
      }
    } catch (err: any) {
      Alert.alert('Lỗi xác thực', err.message || 'Không thể đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.logo, { color: colors.primary }]}>ShopAI</Text>
        <Text style={[styles.subtitle, { color: colors.textLight }]}>
          {mode === 'login'
            ? 'Đăng nhập (POST /api/auth/login -> JWT SecureStore)'
            : 'Đăng ký tài khoản mới (POST /api/auth/register)'}
        </Text>

        {mode === 'register' && (
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Họ và tên"
            placeholderTextColor={colors.textLight}
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          />
        )}

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email (@shopai.vn)"
          autoCapitalize="none"
          placeholderTextColor={colors.textLight}
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
        />

        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Mật khẩu"
          secureTextEntry
          placeholderTextColor={colors.textLight}
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
        />

        <ShopButton
          title={mode === 'login' ? 'Đăng nhập ngay' : 'Tạo tài khoản'}
          onPress={handleSubmit}
          loading={loading}
          style={{ marginTop: 8 }}
        />

        <Pressable
          onPress={() => setMode(mode === 'login' ? 'register' : 'login')}
          style={styles.switchBtn}
        >
          <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 13 }}>
            {mode === 'login'
              ? 'Chưa có tài khoản? Chuyển sang Đăng ký (Register) →'
              : 'Đã có tài khoản? Quay lại Đăng nhập (Login) →'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  card: { padding: 22, borderRadius: 16, borderWidth: 1 },
  logo: { fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
  subtitle: { fontSize: 12, textAlign: 'center', marginTop: 6, marginBottom: 20 },
  input: {
    height: 46,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
    fontSize: 14,
  },
  switchBtn: { marginTop: 16, alignItems: 'center' },
});