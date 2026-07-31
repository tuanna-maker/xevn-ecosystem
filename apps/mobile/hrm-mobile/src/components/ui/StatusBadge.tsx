/**
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: D-MOB-U72-LABEL-FE-01
 * change_mode: FIX
 * What: Default label via hardened statusLabel (unknown → —); never raw English
 * Why: U72 M-F-01..M-F-03 shared badge path
 * must_keep: optional label override; U65 · HOLD_DEPLOY
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { radius, spacing, typography, resolveStatusTone, statusToneColor, type StatusTone } from '../../theme/tokens';
import { statusLabel } from '../../integrations/mapApiError';

type StatusBadgeProps = {
  status: string;
  tone?: StatusTone;
  label?: string;
  testID?: string;
};

export function StatusBadge({ status, tone, label, testID }: StatusBadgeProps) {
  const resolvedTone = tone ?? resolveStatusTone(status);
  const palette = statusToneColor(resolvedTone);
  const text = label ?? statusLabel(status);

  return (
    <View
      testID={testID}
      style={[styles.badge, { backgroundColor: palette.bg, borderColor: palette.border }]}
      accessibilityRole="text"
    >
      <Text style={[styles.text, { color: palette.text }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  text: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
});
