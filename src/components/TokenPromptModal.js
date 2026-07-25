import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';

// One-time-ish backfill prompt: shown when a connection is already saved (WebView
// dashboard works fine via its own session) but no long-lived token was ever entered,
// which silently breaks voice commands. See shouldPromptForToken() in storage.js for
// the re-prompt policy. Does not touch the WebView/dashboard session in any way.
export default function TokenPromptModal({ visible, colors, onSave, onDismiss }) {
  const [token, setToken] = useState('');
  const styles = createStyles(colors);

  function handleSave() {
    const trimmed = token.trim();
    if (!trimmed) return;
    setToken('');
    onSave(trimmed);
  }

  function handleDismiss() {
    setToken('');
    onDismiss();
  }

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={handleDismiss}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.card}>
          <Text style={styles.title}>접속 토큰 필요</Text>
          <Text style={styles.description}>
            음성 명령을 사용하려면 접속 토큰이 필요합니다.{'\n'}
            나중에 설정 화면에서도 추가할 수 있습니다.
          </Text>
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
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.laterButton} onPress={handleDismiss} activeOpacity={0.85}>
              <Text style={styles.laterButtonText}>나중에</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.85}>
              <Text style={styles.saveButtonText}>저장</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    card: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 24,
    },
    title: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 8,
    },
    description: {
      fontSize: 13,
      color: colors.textMuted,
      lineHeight: 19,
      marginBottom: 18,
    },
    input: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      color: colors.text,
      fontSize: 15,
      marginBottom: 18,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: 10,
    },
    laterButton: {
      flex: 1,
      borderRadius: 999,
      paddingVertical: 13,
      alignItems: 'center',
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    laterButtonText: {
      color: colors.textMuted,
      fontWeight: '700',
      fontSize: 14,
    },
    saveButton: {
      flex: 1,
      borderRadius: 999,
      paddingVertical: 13,
      alignItems: 'center',
      backgroundColor: colors.primary,
    },
    saveButtonText: {
      color: '#0d1420',
      fontWeight: '800',
      fontSize: 14,
    },
  });
}
