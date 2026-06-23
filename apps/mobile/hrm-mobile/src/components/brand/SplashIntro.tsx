import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

const LOGO = require('../../../assets/xevn-logo.png');

const LOGO_SIZE = 160;
const HOLD_MS = 900;
const FADE_OUT_MS = 450;

type SplashIntroProps = {
  onFinish: () => void;
};

/**
 * Branded app open sequence — scale + fade in, brief hold, fade out.
 * Shown once per cold start above the main navigator.
 */
export function SplashIntro({ onFinish }: SplashIntroProps) {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.55)).current;
  const glowScale = useRef(new Animated.Value(0.85)).current;
  const overlayOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const intro = Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 7,
        tension: 70,
        useNativeDriver: true,
      }),
      Animated.timing(glowScale, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]);

    Animated.sequence([
      intro,
      Animated.delay(HOLD_MS),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: FADE_OUT_MS,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) onFinish();
    });
  }, [glowScale, logoOpacity, logoScale, onFinish, overlayOpacity]);

  return (
    <Animated.View
      style={[styles.overlay, { opacity: overlayOpacity }]}
      pointerEvents="box-none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={styles.center}>
        <Animated.View
          style={[
            styles.glow,
            {
              opacity: logoOpacity,
              transform: [{ scale: glowScale }],
            },
          ]}
        />
        <Animated.Image
          source={LOGO}
          style={[
            styles.logo,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
          resizeMode="contain"
          accessibilityLabel="XeVN"
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    zIndex: 9999,
    elevation: 9999,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: LOGO_SIZE * 1.35,
    height: LOGO_SIZE * 1.35,
    borderRadius: LOGO_SIZE,
    backgroundColor: 'rgba(43, 89, 188, 0.18)',
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
});
