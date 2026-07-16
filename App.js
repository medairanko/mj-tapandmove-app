import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { COLORS } from './src/config';
import { loadSavedConnection, saveConnection, clearConnection } from './src/storage';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [ready, setReady] = useState(false);
  const [connection, setConnection] = useState({ serverAddress: null, token: null });

  useEffect(() => {
    (async () => {
      try {
        const saved = await loadSavedConnection();
        if (saved.serverAddress) {
          setConnection(saved);
        }
      } finally {
        setReady(true);
      }
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

  if (!ready) {
    return <View style={styles.blank} />;
  }

  if (connection.serverAddress) {
    return (
      <DashboardScreen
        serverAddress={connection.serverAddress}
        token={connection.token}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <LoginScreen
      onConnect={handleConnect}
      initialAddress={connection.serverAddress}
      initialToken={connection.token}
    />
  );
}

const styles = StyleSheet.create({
  blank: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
