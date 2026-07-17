import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BRAND } from '../config';

export default function LoginScreen({ onConnect, initialAddress, initialToken, colors }) {
  const [serverAddress, setServerAddress] = useState(initialAddress || '');
  const [token, setToken] = useState(initialToken || '');
  const [error, setError] = useState('');
  const styles = createStyles(colors);

  function handleConnect() {
    const trimmed = serverAddress.trim();
    if (!trimmed) {
      setError('서버 주소를 입력하세요 / آدرس سرور را وارد کنید');
      return;
    }
    setError('');
    onConnect(trimmed, token.trim());
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar hidden />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logo}>
          <Text style={styles.logoEmoji}>🏠</Text>
        </View>

        <Text style={styles.title}>{BRAND.name}</Text>
        <Text style={styles.subtitle}>{BRAND.subtitle}</Text>

        <View style={styles.form}>
          <Text style={styles.label}>서버 주소 / آدرس سرور</Text>
          <TextInput
            style={styles.input}
            placeholder="farm.mjsmart.co.kr"
            placeholderTextColor={colors.textMuted}
            value={serverAddress}
            onChangeText={setServerAddress}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />

          <Text style={styles.label}>Token (선택 / اختیاری)</Text>
          <TextInput
            style={styles.input}
            placeholder="Long-Lived Access Token"
            placeholderTextColor={colors.textMuted}
            value={token}
            onChangeText={setToken}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
          />

          {!!error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity style={styles.button} onPress={handleConnect} activeOpacity={0.85}>
            <Text style={styles.buttonText}>연결 / اتصال</Text>
          </TouchableOpacity>

          <Text style={styles.help}>
            토큰이 없으면 비워두세요 — 다음 화면에서 평소처럼 아이디/비밀번호로 로그인하면
            자동으로 로그인 상태가 저장됩니다.{'\n'}
            {'\n'}
            اگر توکن ندارید، خالی بگذارید — در صفحه‌ی بعد مثل همیشه با نام‌کاربری/رمز عبور
            وارد شوید؛ ورود شما به‌صورت خودکار ذخیره می‌شود.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    flex: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    logo: {
      width: 88,
      height: 88,
      borderRadius: 26,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    logoEmoji: {
      fontSize: 40,
    },
    title: {
      fontSize: 26,
      fontWeight: '800',
      color: colors.text,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textMuted,
      marginTop: 4,
      marginBottom: 32,
    },
    form: {
      width: '100%',
      maxWidth: 360,
    },
    label: {
      color: colors.textMuted,
      fontSize: 13,
      marginBottom: 6,
      marginTop: 14,
    },
    input: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      color: colors.text,
      fontSize: 15,
    },
    error: {
      color: '#ff6b6b',
      marginTop: 10,
      fontSize: 13,
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: 999,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 24,
    },
    buttonText: {
      color: '#0d1420',
      fontWeight: '800',
      fontSize: 15,
    },
    help: {
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 18,
      marginTop: 24,
      textAlign: 'center',
    },
  });
}
