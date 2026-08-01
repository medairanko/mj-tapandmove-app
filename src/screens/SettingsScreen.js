import { useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BRAND, KAKAO } from '../config';
import KakaoIcon from '../components/KakaoIcon';
import VoiceCommandButton from '../components/VoiceCommandButton';

async function openLink(url) {
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
      return;
    }
  } catch (e) {
    // fall through to error alert
  }
  Alert.alert('열 수 없습니다', '카카오톡 링크를 열 수 없습니다. 나중에 다시 시도해주세요.');
}

export default function SettingsScreen({
  visible,
  colors,
  serverAddress,
  token,
  refreshSignal,
  onSaveToken,
  onLogout,
  onClose,
}) {
  const styles = createStyles(colors);
  const [editingToken, setEditingToken] = useState(false);
  const [tokenDraft, setTokenDraft] = useState('');

  function handleStartEditToken() {
    setTokenDraft('');
    setEditingToken(true);
  }

  function handleCancelEditToken() {
    setTokenDraft('');
    setEditingToken(false);
  }

  function handleSaveTokenPress() {
    const trimmed = tokenDraft.trim();
    if (!trimmed) {
      Alert.alert('토큰을 입력하세요', '빈 값은 저장할 수 없습니다.');
      return;
    }
    onSaveToken(trimmed);
    setTokenDraft('');
    setEditingToken(false);
  }

  function handleLogoutPress() {
    Alert.alert(
      '서버 변경',
      '저장된 서버 주소와 토큰을 지우고 로그인 화면으로 돌아갑니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '확인',
          style: 'destructive',
          onPress: () => {
            onClose();
            onLogout();
          },
        },
      ]
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>설정</Text>
              <TouchableOpacity onPress={onClose} hitSlop={12}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.brand}>{BRAND.name}</Text>

            <View style={styles.tokenSection}>
              <Text style={styles.tokenLabel}>토큰</Text>
              {editingToken ? (
                <>
                  <TextInput
                    style={styles.tokenInput}
                    placeholder="Long-Lived Access Token"
                    placeholderTextColor={colors.textMuted}
                    value={tokenDraft}
                    onChangeText={setTokenDraft}
                    autoCapitalize="none"
                    autoCorrect={false}
                    secureTextEntry
                    autoFocus
                  />
                  <View style={styles.tokenButtonRow}>
                    <TouchableOpacity
                      style={styles.tokenCancelButton}
                      onPress={handleCancelEditToken}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.tokenCancelButtonText}>취소</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.tokenSaveButton}
                      onPress={handleSaveTokenPress}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.tokenSaveButtonText}>저장</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <TouchableOpacity
                  style={styles.tokenDisplayRow}
                  onPress={handleStartEditToken}
                  activeOpacity={0.85}
                >
                  <Text style={styles.tokenValueText}>
                    {token ? '••••••••' : '설정되지 않음'}
                  </Text>
                  <Text style={styles.tokenEditHint}>{token ? '변경' : '추가'}</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.voiceSection}>
              <Text style={styles.tokenLabel}>음성 명령</Text>
              <View style={styles.voiceButtonWrap}>
                <VoiceCommandButton
                  serverAddress={serverAddress}
                  token={token}
                  colors={colors}
                  refreshSignal={refreshSignal}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.kakaoButton}
              activeOpacity={0.85}
              onPress={() => openLink(KAKAO.link)}
            >
              <KakaoIcon size={20} color="#191919" />
              <Text style={styles.kakaoButtonText}>카카오톡 문의</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutButton}
              activeOpacity={0.85}
              onPress={handleLogoutPress}
            >
              <Text style={styles.logoutButtonText}>로그아웃</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      paddingBottom: 36,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.text,
    },
    closeIcon: {
      fontSize: 20,
      color: colors.textMuted,
      padding: 4,
    },
    brand: {
      fontSize: 13,
      color: colors.textMuted,
      marginTop: 4,
      marginBottom: 24,
    },
    tokenSection: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 16,
      marginBottom: 14,
    },
    tokenLabel: {
      color: colors.textMuted,
      fontSize: 13,
      marginBottom: 8,
    },
    tokenDisplayRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    tokenValueText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '600',
    },
    tokenEditHint: {
      color: colors.primary,
      fontSize: 13,
      fontWeight: '700',
    },
    tokenInput: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: colors.text,
      fontSize: 14,
      marginBottom: 10,
    },
    tokenButtonRow: {
      flexDirection: 'row',
      gap: 8,
    },
    tokenCancelButton: {
      flex: 1,
      borderRadius: 999,
      paddingVertical: 10,
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tokenCancelButtonText: {
      color: colors.textMuted,
      fontWeight: '700',
      fontSize: 13,
    },
    tokenSaveButton: {
      flex: 1,
      borderRadius: 999,
      paddingVertical: 10,
      alignItems: 'center',
      backgroundColor: colors.primary,
    },
    tokenSaveButtonText: {
      color: '#0d1420',
      fontWeight: '800',
      fontSize: 13,
    },
    voiceSection: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 16,
      marginBottom: 14,
    },
    // VoiceCommandButton positions its FAB/banner with `position: absolute`, so it
    // contributes no layout height on its own -- this wrapper gives it a sized,
    // relatively-positioned box to anchor against instead of floating over
    // whatever ancestor happens to be positioned next.
    voiceButtonWrap: {
      height: 80,
      position: 'relative',
    },
    kakaoButton: {
      backgroundColor: '#FEE500',
      borderRadius: 14,
      paddingVertical: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginBottom: 14,
    },
    kakaoButtonText: {
      color: '#191919',
      fontSize: 15,
      fontWeight: '700',
    },
    logoutButton: {
      backgroundColor: '#ff6b6b',
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 8,
    },
    logoutButtonText: {
      color: '#ffffff',
      fontSize: 15,
      fontWeight: '800',
    },
  });
}
