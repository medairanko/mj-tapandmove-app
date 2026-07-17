import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './config';

export async function loadSavedConnection() {
  const [serverAddress, token] = await Promise.all([
    AsyncStorage.getItem(STORAGE_KEYS.serverAddress),
    AsyncStorage.getItem(STORAGE_KEYS.token),
  ]);
  return { serverAddress, token };
}

export async function saveConnection(serverAddress, token) {
  await AsyncStorage.setItem(STORAGE_KEYS.serverAddress, serverAddress);
  await AsyncStorage.setItem(STORAGE_KEYS.token, token || '');
}

export async function clearConnection() {
  await AsyncStorage.multiRemove([STORAGE_KEYS.serverAddress, STORAGE_KEYS.token]);
}

export async function loadSavedTheme() {
  const theme = await AsyncStorage.getItem(STORAGE_KEYS.theme);
  return theme === 'light' ? 'light' : 'dark';
}

export async function saveTheme(theme) {
  await AsyncStorage.setItem(STORAGE_KEYS.theme, theme);
}
