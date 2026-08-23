import React, { useEffect, useState, useRef } from 'react';
import { AppState, StyleSheet, View, Text } from 'react-native';
import { colors, typography } from '../../theme/tokens';
import { Ionicons } from '@expo/vector-icons';

export function AutoBlurGuard({ children }: { children: React.ReactNode }) {
  const [isBlurred, setIsBlurred] = useState(false);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/active/) && nextAppState !== 'active') {
        setIsBlurred(true);
      } else if (nextAppState === 'active') {
        setIsBlurred(false);
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      {children}
      {isBlurred && (
        <View style={styles.overlay}>
          <Ionicons name="lock-closed" size={48} color={colors.textSecondary} />
          <Text style={styles.overlayText}>Nội dung đã được bảo mật</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(249, 250, 251, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  overlayText: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
