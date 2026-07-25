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

// Policy: the token backfill prompt (see TokenPromptModal) re-appears on every launch
// until the user either saves a token, or dismisses it twice — whichever comes first.
// After 2 dismissals it stops appearing automatically; the token can still be added
// any time via the Settings screen's editable token field.
const MAX_TOKEN_PROMPT_DISMISSALS = 2;

export async function getTokenPromptDismissCount() {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.tokenPromptDismissCount);
  return raw ? parseInt(raw, 10) || 0 : 0;
}

export async function incrementTokenPromptDismissCount() {
  const current = await getTokenPromptDismissCount();
  await AsyncStorage.setItem(STORAGE_KEYS.tokenPromptDismissCount, String(current + 1));
}

export async function shouldPromptForToken(serverAddress, token) {
  if (!serverAddress || token) return false;
  const dismissals = await getTokenPromptDismissCount();
  return dismissals < MAX_TOKEN_PROMPT_DISMISSALS;
}
