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
