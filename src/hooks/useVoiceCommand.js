import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Linking, Platform, ToastAndroid } from 'react-native';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { getStates, callService } from '../../lib/haApi';
import { matchVoiceCommand } from '../../lib/voiceIntent';

const NO_SPEECH_TIMEOUT_MS = 5000;
const MESSAGE_DISPLAY_MS = 1500;

function showToast(message) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  }
}

// Drives the mic button: permissions -> ko-KR speech recognition -> entity matching
// -> HA service call. `state` is one of: idle | listening | recognized | processing.
export function useVoiceCommand(serverAddress, token, refreshSignal) {
  const [state, setState] = useState('idle');
  const [message, setMessage] = useState('');
  const entitiesRef = useRef([]);
  const noSpeechTimer = useRef(null);
  const messageTimer = useRef(null);

  const clearTimers = useCallback(() => {
    if (noSpeechTimer.current) {
      clearTimeout(noSpeechTimer.current);
      noSpeechTimer.current = null;
    }
    if (messageTimer.current) {
      clearTimeout(messageTimer.current);
      messageTimer.current = null;
    }
  }, []);

  const refreshEntities = useCallback(async () => {
    if (!serverAddress || !token) return;
    try {
      entitiesRef.current = await getStates(serverAddress, token);
    } catch (err) {
      // Silent: voice commands just won't resolve until the next successful refresh.
      console.warn('[voice] failed to refresh HA entities:', err.message);
    }
  }, [serverAddress, token]);

  useEffect(() => {
    refreshEntities();
    // refreshSignal lets the caller force a re-fetch (e.g. on dashboard WebView reload)
    // beyond the initial mount fetch.
  }, [refreshEntities, refreshSignal]);

  const resetToIdleAfterDelay = useCallback((delayMs = MESSAGE_DISPLAY_MS) => {
    messageTimer.current = setTimeout(() => {
      setState('idle');
      setMessage('');
    }, delayMs);
  }, []);

  const runCommand = useCallback(
    async (recognizedText) => {
      const match = matchVoiceCommand(recognizedText, entitiesRef.current);

      if (!match) {
        setState('recognized');
        setMessage('다시 말씀해주세요');
        resetToIdleAfterDelay();
        return;
      }

      setState('processing');
      try {
        await callService(serverAddress, token, match.entity.domain, match.service, match.entity.entity_id);
        const confirmMsg = `${match.entity.friendly_name} ${match.actionLabel} 완료`;
        setMessage(confirmMsg);
        showToast(confirmMsg);
      } catch (err) {
        const failMsg = '명령 전송 실패, 다시 시도해주세요';
        setMessage(failMsg);
        showToast(failMsg);
      }
      resetToIdleAfterDelay();
    },
    [serverAddress, token, resetToIdleAfterDelay]
  );

  useSpeechRecognitionEvent('result', (event) => {
    if (!event.isFinal) return;
    clearTimers();
    const transcript = event.results?.[0]?.transcript?.trim();
    if (!transcript) {
      setState('idle');
      setMessage('');
      return;
    }
    setState('recognized');
    setMessage(transcript);
    messageTimer.current = setTimeout(() => runCommand(transcript), MESSAGE_DISPLAY_MS);
  });

  useSpeechRecognitionEvent('error', (event) => {
    clearTimers();
    if (event.error === 'not-allowed') {
      promptForPermission();
      return;
    }
    // no-speech / speech-timeout / anything else: cancel quietly, no error dialog.
    setState('idle');
    setMessage('');
  });

  useSpeechRecognitionEvent('end', () => {
    // Safety net: if no result/error event landed (e.g. immediate engine failure),
    // don't leave the UI stuck on "listening".
    setState((current) => (current === 'listening' ? 'idle' : current));
  });

  function promptForPermission() {
    Alert.alert(
      '마이크 권한 필요',
      '음성 명령을 사용하려면 마이크 권한을 허용해야 합니다.',
      [
        { text: '취소', style: 'cancel' },
        { text: '설정 열기', onPress: () => Linking.openSettings() },
      ]
    );
  }

  const start = useCallback(async () => {
    if (state !== 'idle') return;

    const current = await ExpoSpeechRecognitionModule.getPermissionsAsync();
    let granted = current.granted;
    if (!granted) {
      if (!current.canAskAgain) {
        promptForPermission();
        return;
      }
      const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      granted = result.granted;
      if (!granted) {
        if (!result.canAskAgain) promptForPermission();
        return;
      }
    }

    clearTimers();
    setMessage('');
    setState('listening');
    ExpoSpeechRecognitionModule.start({
      lang: 'ko-KR',
      interimResults: true,
      continuous: false,
    });

    noSpeechTimer.current = setTimeout(() => {
      ExpoSpeechRecognitionModule.stop();
    }, NO_SPEECH_TIMEOUT_MS);
  }, [state, clearTimers]);

  useEffect(() => clearTimers, [clearTimers]);

  return { state, message, start, refreshEntities };
}
