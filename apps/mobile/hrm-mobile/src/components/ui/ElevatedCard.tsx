/**
 * @CODE-MEMORY
 * Screen:     ElevatedCard — card có shadow.soft + viền hairline
 * UC:         AC-BRAND-DNA-01
 * BR:         XeVN Symmetrical Grid — radius.card 12 · borderWidth.hairline · colors.border
 * SRS:        docs/program/XEVN_BRAND_FULL_FE_REMASTER_PROGRAM.md § L2m
 * TechSpec:   apps/mobile/hrm-mobile/src/theme/THEME_USAGE.md § L2 Card
 * Purpose:    Surface card có chiều sâu cho màn phụ; không hardcode borderWidth / radius.
 * WorkItem:   MOB-XEVN-BRAND-PRIMITIVES-L2-01
 * Coded:      2026-07-22
 *
 * Callers: domain feature cards / list sections dùng ElevatedCard
 * Callees: PressableScale · theme/tokens (radius.card, borderWidth.hairline, shadow.soft)
 *
 * FE-Actions:
 *   | Thao tác | Handler  | UI              |
 *   |----------|----------|-----------------|
 *   | Tap      | onPress? | PressableScale  |
 *
 * Impact:     Sai border/radius → lệch DNA card toàn app.
 * must_keep:  radius.card; borderWidth.hairline; colors.border; shadow.soft
 * SOLID:      Card chrome tách khỏi nội dung nghiệp vụ
 * LastVerified: src/theme/__tests__/mobL2Primitives.test.ts
 */

import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { PressableScale } from '../primitives/PressableScale';
import { borderWidth, colors, radius, shadow } from '../../theme/tokens';

type ElevatedCardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  testID?: string;
};

/** Depth-shadow card — SET G-4 secondary screens (not flat border-only stacks). */
export function ElevatedCard({ children, style, onPress, testID }: ElevatedCardProps) {
  const card = (
    <View style={[styles.card, style]} testID={testID}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <PressableScale onPress={onPress} accessibilityRole="button" style={styles.pressable}>
        {card}
      </PressableScale>
    );
  }

  return card;
}

const styles = StyleSheet.create({
  pressable: { width: '100%' },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.card,
    borderWidth: borderWidth.hairline,
    borderColor: colors.border,
    ...shadow.soft,
  },
});
