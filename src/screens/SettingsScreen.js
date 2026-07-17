import {
  Alert,
  Linking,
  Modal,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BRAND, KAKAO } from '../config';

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
  Alert.alert(
    '열 수 없습니다 / قابل باز شدن نیست',
    '카카오톡 링크를 열 수 없습니다. 나중에 다시 시도해주세요.\nلینک کاکائو‌تاک باز نشد. لطفاً بعداً دوباره امتحان کنید.'
  );
}

export default function SettingsScreen({ visible, colors, theme, onToggleTheme, onLogout, onClose }) {
  const styles = createStyles(colors);

  function handleLogoutPress() {
    Alert.alert(
      '서버 변경 / تغییر سرور',
      '저장된 서버 주소와 토큰을 지우고 로그인 화면으로 돌아갑니다.\nآدرس سرور و توکن ذخیره‌شده پاک می‌شود و به صفحه‌ی ورود برمی‌گردید.',
      [
        { text: '취소 / لغو', style: 'cancel' },
        {
          text: '확인 / تأیید',
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
          <View style={styles.headerRow}>
            <Text style={styles.title}>설정 / تنظیمات</Text>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.brand}>{BRAND.name}</Text>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>
              {theme === 'light' ? '밝은 테마 / تم روشن' : '어두운 테마 / تم تاریک'}
            </Text>
            <Switch
              value={theme === 'light'}
              onValueChange={onToggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#ffffff"
            />
          </View>

          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.85}
            onPress={() => openLink(KAKAO.contactUrl)}
          >
            <Text style={styles.actionButtonText}>💬 Contact MJ (Kakao)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.85}
            onPress={() => openLink(KAKAO.adminUrl)}
          >
            <Text style={styles.actionButtonText}>📩 Message Admin (Kakao DM)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutButton}
            activeOpacity={0.85}
            onPress={handleLogoutPress}
          >
            <Text style={styles.logoutButtonText}>로그아웃 / خروج</Text>
          </TouchableOpacity>
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
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 14,
      marginBottom: 14,
    },
    rowLabel: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '600',
    },
    actionButton: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: 'center',
      marginBottom: 14,
    },
    actionButtonText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '600',
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
