import { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useVoiceCommand } from '../hooks/useVoiceCommand';

export default function VoiceCommandButton({ serverAddress, token, colors, refreshSignal }) {
  const { state, message, start } = useVoiceCommand(serverAddress, token, refreshSignal);
  const pulse = useRef(new Animated.Value(1)).current;
  const styles = useMemo(() => createStyles(colors), [colors]);

  const listening = state === 'listening';

  useEffect(() => {
    if (!listening) {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.35, duration: 550, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 550, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [listening, pulse]);

  return (
    <>
      {!!message && (
        <View style={styles.banner} pointerEvents="none">
          <Text style={styles.bannerText} numberOfLines={2}>
            {message}
          </Text>
        </View>
      )}

      <View style={styles.fabWrap}>
        {listening && (
          <Animated.View
            style={[styles.pulseRing, { transform: [{ scale: pulse }] }]}
            pointerEvents="none"
          />
        )}
        <TouchableOpacity
          style={[styles.fab, listening && styles.fabActive]}
          onPress={start}
          disabled={state === 'processing'}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.fabIcon}>{listening ? '●' : '🎤'}</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    fabWrap: {
      position: 'absolute',
      right: 18,
      bottom: 28,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 20,
      elevation: 20,
    },
    fab: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.3,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
    },
    fabActive: {
      backgroundColor: '#E74C3C',
    },
    fabIcon: {
      fontSize: 24,
      color: '#0d1420',
    },
    pulseRing: {
      position: 'absolute',
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: 'rgba(231,76,60,0.35)',
    },
    banner: {
      position: 'absolute',
      left: 18,
      right: 18,
      bottom: 96,
      backgroundColor: 'rgba(20,36,58,0.92)',
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 16,
      zIndex: 20,
      elevation: 20,
    },
    bannerText: {
      color: colors.text,
      fontSize: 15,
      textAlign: 'center',
      fontWeight: '600',
    },
  });
}
