import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

async function openApkUrl(url) {
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
      return;
    }
  } catch (e) {
    // fall through to error alert
  }
  Alert.alert('열 수 없습니다', '업데이트 링크를 열 수 없습니다. 나중에 다시 시도해주세요.');
}

export default function UpdateBanner({ apkUrl, releaseNotes, colors, onDismiss }) {
  const styles = createStyles(colors);

  return (
    <View style={styles.banner}>
      <View style={styles.textBlock}>
        <Text style={styles.title}>새 업데이트가 있어요</Text>
        {releaseNotes ? (
          <Text style={styles.notes} numberOfLines={2}>
            {releaseNotes}
          </Text>
        ) : null}
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.laterButton} onPress={onDismiss} activeOpacity={0.85}>
          <Text style={styles.laterButtonText}>나중에</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.updateButton}
          onPress={() => openApkUrl(apkUrl)}
          activeOpacity={0.85}
        >
          <Text style={styles.updateButtonText}>업데이트</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    banner: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingTop: 14,
      paddingBottom: 12,
      paddingHorizontal: 16,
      zIndex: 30,
      elevation: 30,
    },
    textBlock: {
      flex: 1,
      marginRight: 12,
    },
    title: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '700',
    },
    notes: {
      color: colors.textMuted,
      fontSize: 12,
      marginTop: 2,
    },
    buttonRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    laterButton: {
      paddingVertical: 8,
      paddingHorizontal: 10,
    },
    laterButtonText: {
      color: colors.textMuted,
      fontSize: 13,
      fontWeight: '600',
    },
    updateButton: {
      backgroundColor: colors.primary,
      borderRadius: 999,
      paddingVertical: 8,
      paddingHorizontal: 16,
      marginLeft: 4,
    },
    updateButtonText: {
      color: '#0d1420',
      fontSize: 13,
      fontWeight: '800',
    },
  });
}
