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
import { DASHBOARD_PATH } from '../config';
import SettingsScreen from './SettingsScreen';

function buildDashboardUrl(rawAddress) {
  // Strip any protocol/trailing slashes the user may have typed, then rebuild.
  const host = rawAddress.trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '');
  return `https://${host}${DASHBOARD_PATH}`;
}

export default function DashboardScreen({ serverAddress, token, onLogout, colors, theme, onToggleTheme }) {
  const webviewRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const url = useMemo(() => buildDashboardUrl(serverAddress), [serverAddress]);
  const styles = useMemo(() => createStyles(colors), [colors]);

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
      '서버 변경',
      '저장된 서버 주소와 토큰을 지우고 로그인 화면으로 돌아갑니다.',
      [
        { text: '취소', style: 'cancel' },
        { text: '확인', style: 'destructive', onPress: onLogout },
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
          setLoadError(syntheticEvent.nativeEvent.description || '연결 실패');
        }}
      />

      {loading && !loadError && (
        <View style={styles.overlay} pointerEvents="none">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {loadError && (
        <View style={styles.overlay}>
          <Text style={styles.errorText}>
            연결할 수 없습니다{'\n'}
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
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.changeServerLink} onPress={handleLogoutPress}>
            <Text style={styles.changeServerText}>서버 변경</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={styles.hamburgerButton}
        onPress={() => setSettingsOpen(true)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.hamburgerIcon}>☰</Text>
      </TouchableOpacity>

      <SettingsScreen
        visible={settingsOpen}
        colors={colors}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onLogout={onLogout}
        onClose={() => setSettingsOpen(false)}
      />
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    flex: {
      flex: 1,
      backgroundColor: colors.background,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    errorText: {
      color: colors.text,
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 20,
      lineHeight: 20,
    },
    retryButton: {
      backgroundColor: colors.primary,
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
      color: colors.textMuted,
      fontSize: 13,
      textDecorationLine: 'underline',
    },
    hamburgerButton: {
      position: 'absolute',
      top: 14,
      left: 14,
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: 'rgba(20,36,58,0.72)',
      alignItems: 'center',
      justifyContent: 'center',
      // Android's WebView renders in its own hardware-composited surface and can
      // paint over sibling views that only rely on JSX/render order for stacking.
      // elevation (Android) + zIndex (iOS/RN layout) force this button above it.
      zIndex: 20,
      elevation: 20,
    },
    hamburgerIcon: {
      color: '#e8eaed',
      fontSize: 20,
      fontWeight: '700',
    },
  });
}
