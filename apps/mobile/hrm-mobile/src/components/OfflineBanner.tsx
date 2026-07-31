import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetwork } from '../context/NetworkContext';
import { colors, spacing, statusToneColor, typography } from '../theme/tokens';

const warn = statusToneColor('warning');

export function OfflineBanner() {
  const net = useNetwork();
  const insets = useSafeAreaInsets();
  if (!net.ready || !net.offline) return null;
  return (
    <View style={[styles.wrap, { paddingTop: Math.max(insets.top, 6) }]}>
      <Text style={styles.text}>Ngoại tuyến — chỉ đọc/cache; không ghi API (UC-HRM-MOB-14)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: warn.bg,
    paddingHorizontal: spacing.md - 4,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: warn.border,
  },
  text: {
    color: warn.text,
    fontSize: typography.fontSize.footnote,
    lineHeight: typography.lineHeight.footnote,
    fontWeight: typography.fontWeight.medium,
  },
});
