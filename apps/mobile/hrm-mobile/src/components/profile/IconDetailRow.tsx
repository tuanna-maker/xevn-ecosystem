import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme/tokens';

type IconDetailRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  numeric?: boolean;
  showChevron?: boolean;
};

/** Grouped profile row with leading icon — SET G / F-3. */
export function IconDetailRow({ icon, label, value, numeric, showChevron }: IconDetailRowProps) {
  return (
    <View style={styles.row} accessibilityRole="text">
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={styles.body}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, numeric && styles.numeric]} numberOfLines={2}>
          {value}
        </Text>
      </View>
      {showChevron ? (
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} style={styles.chevron} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 48,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: typography.fontSize.footnote,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.footnote,
  },
  value: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    lineHeight: typography.lineHeight.body,
  },
  numeric: {
    fontVariant: ['tabular-nums'],
  },
  chevron: {
    marginLeft: spacing.xs,
  },
});
