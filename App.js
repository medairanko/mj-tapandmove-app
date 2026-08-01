import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { COLORS } from './src/config';
import {
  loadSavedConnection,
  saveConnection,
  clearConnection,
  shouldPromptForToken,
  incrementTokenPromptDismissCount,
  getUpdateDismissedDate,
  setUpdateDismissedDate,
} from './src/storage';
import { checkForUpdate, getTodayDateString } from './lib/updateCheck';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import TokenPromptModal from './src/components/TokenPromptModal';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [ready, setReady] = useState(false);
  const [connection, setConnection] = useState({ serverAddress: null, token: null });
  const [tokenPromptVisible, setTokenPromptVisible] = useState(false);
  const [updateBanner, setUpdateBanner] = useState({
    visible: false,
    apkUrl: null,
    releaseNotes: '',
  });

  useEffect(() => {
    (async () => {
      try {
        const saved = await loadSavedConnection();
        if (saved.serverAddress) {
          setConnection(saved);
          setTokenPromptVisible(await shouldPromptForToken(saved.serverAddress, saved.token));
        }
      } finally {
        setReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const result = await checkForUpdate();
      if (!result.updateAvailable) return;

      const dismissedDate = await getUpdateDismissedDate();
      if (dismissedDate === getTodayDateString()) return;

      setUpdateBanner({
        visible: true,
        apkUrl: result.apkUrl,
        releaseNotes: result.releaseNotes,
      });
    })();
  }, []);

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  async function handleConnect(serverAddress, token) {
    await saveConnection(serverAddress, token);
    setConnection({ serverAddress, token });
  }

  async function handleLogout() {
    await clearConnection();
    setConnection({ serverAddress: null, token: null });
  }

  async function handleSaveToken(newToken) {
    await saveConnection(connection.serverAddress, newToken);
    setConnection((prev) => ({ ...prev, token: newToken }));
    setTokenPromptVisible(false);
  }

  async function handleDismissTokenPrompt() {
    await incrementTokenPromptDismissCount();
    setTokenPromptVisible(false);
  }

  async function handleDismissUpdate() {
    await setUpdateDismissedDate(getTodayDateString());
    setUpdateBanner((prev) => ({ ...prev, visible: false }));
  }

  if (!ready) {
    return <View style={[styles.blank, { backgroundColor: COLORS.background }]} />;
  }

  if (connection.serverAddress) {
    return (
      <>
        <DashboardScreen
          serverAddress={connection.serverAddress}
          token={connection.token}
          onLogout={handleLogout}
          onSaveToken={handleSaveToken}
          colors={COLORS}
          updateBanner={updateBanner}
          onDismissUpdate={handleDismissUpdate}
        />
        <TokenPromptModal
          visible={tokenPromptVisible}
          colors={COLORS}
          onSave={handleSaveToken}
          onDismiss={handleDismissTokenPrompt}
        />
      </>
    );
  }

  return (
    <LoginScreen
      onConnect={handleConnect}
      initialAddress={connection.serverAddress}
      initialToken={connection.token}
      colors={COLORS}
    />
  );
}

const styles = StyleSheet.create({
  blank: {
    flex: 1,
  },
});
