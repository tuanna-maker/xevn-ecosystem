/**
 * @CODE-MEMORY
 * Screen:     Cold-start SplashIntro — overlay brand XeVN
 * UC:         AC-BRAND-DNA-03 / AC-BRAND-DNA-06
 * BR:         Splash bg unified #000000 (Expo + Android + intro)
 * SRS:        docs/program/XEVN_BRAND_FULL_FE_REMASTER_PROGRAM.md §3 L1m→L3m
 * TechSpec:   docs/program/XEVN_BRAND_UIUX_PROPOSAL.md §3 · brand.splash.bg
 * Purpose:    Hiển thị logo XeVN trên nền đen brand một lần mỗi cold start (shell L3).
 * WorkItem:   MOB-XEVN-BRAND-SHELL-L3-01
 * Coded:      2026-07-22
 * Callers:    App.tsx → SplashIntro
 * Callees:    colors.brandShell / colors.splashGlow ← theme/tokens
 * Impact:     Đổi nền ≠ #000 → lệch native splash / Expo
 * must_keep:  backgroundColor = colors.brandShell (#000000); glow = colors.splashGlow
 * SOLID:      Brand intro tách khỏi navigator
 * LastVerified: src/theme/__tests__/mobL3Shell.test.ts
 *
 * @CODE-MEMORY-CHANGE
 * WorkItem: MOB-XEVN-BRAND-SHELL-L3-01 · 2026-07-22
 * Change: L3 shell gate — giữ L1 token consume; cập nhật LastVerified + work_item shell.
 * must_keep: brandShell #000 + splashGlow không đổi hex ad-hoc.
 */
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { colors } from '../../theme/tokens';

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
    backgroundColor: colors.brandShell,
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
    backgroundColor: colors.splashGlow,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
});
