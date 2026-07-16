import { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';
import { COLORS, DASHBOARD_PATH } from '../config';

function buildDashboardUrl(rawAddress) {
  // Strip any protocol/trailing slashes the user may have typed, then rebuild.
  const host = rawAddress.trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '');
  return `https://${host}${DASHBOARD_PATH}`;
}

export default function DashboardScreen({ serverAddress, token, onLogout }) {
  const webviewRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const url = useMemo(() => buildDashboardUrl(serverAddress), [serverAddress]);

  // Best-effort: if a Long-Lived Access Token was provided, send it as a Bearer
  // header on the initial request. NOTE: Home Assistant's frontend (Lovelace UI)
  // manages its own login session separately from this header — this header alone
  // is not guaranteed to auto-authenticate the dashboard page on every HA version.
  // If it doesn't, the normal HA login form will simply appear inside the WebView;
  // logging in there once works fine and the session persists after that (cookies
  // + localStorage are retained by the WebView between app launches).
  const source = token
    ? { uri: url, headers: { Authorization: `Bearer ${token}` } }
    : { uri: url };

  function handleLogoutPress() {
    Alert.alert(
      '서버 변경 / تغییر سرور',
      '저장된 서버 주소와 토큰을 지우고 로그인 화면으로 돌아갑니다.\nآدرس سرور و توکن ذخیره‌شده پاک می‌شود و به صفحه‌ی ورود برمی‌گردید.',
      [
        { text: '취소 / لغو', style: 'cancel' },
        { text: '확인 / تأیید', style: 'destructive', onPress: onLogout },
      ]
    );
  }

  return (
    <View style={styles.flex}>
      <StatusBar hidden />

      <WebView
        ref={webviewRef}
        source={source}
        style={styles.flex}
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        cacheEnabled
        startInLoadingState={false}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={(syntheticEvent) => {
          setLoading(false);
          setLoadError(syntheticEvent.nativeEvent.description || '연결 실패 / خطا در اتصال');
        }}
      />

      {loading && !loadError && (
        <View style={styles.overlay} pointerEvents="none">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}

      {loadError && (
        <View style={styles.overlay}>
          <Text style={styles.errorText}>
            연결할 수 없습니다 / اتصال برقرار نشد{'\n'}
            {loadError}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setLoadError(null);
              setLoading(true);
              webviewRef.current?.reload();
            }}
          >
            <Text style={styles.retryButtonText}>다시 시도 / تلاش دوباره</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.changeServerLink} onPress={handleLogoutPress}>
            <Text style={styles.changeServerText}>서버 변경 / تغییر سرور</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Small, unobtrusive hit-area (top-left corner) to reach "change server /
          logout" without putting a permanent bar on top of the fullscreen dashboard. */}
      <TouchableOpacity
        style={styles.hiddenCorner}
        onLongPress={handleLogoutPress}
        delayLongPress={1500}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    color: COLORS.text,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 999,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: '#0d1420',
    fontWeight: '800',
  },
  changeServerLink: {
    marginTop: 16,
  },
  changeServerText: {
    color: COLORS.textMuted,
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  hiddenCorner: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 56,
    height: 56,
  },
});
