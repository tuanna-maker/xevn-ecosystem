import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View, type TextStyle } from 'react-native';
import { colors, layout, spacing, textStyles } from '../../theme/tokens';

type IconDetailRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  numeric?: boolean;
  showChevron?: boolean;
  testID?: string;
};

/** Personio-style detail row with leading icon — SET G / MOB-UX-12a. */
export function IconDetailRow({
  icon,
  label,
  value,
  numeric = false,
  showChevron = false,
  testID,
}: IconDetailRowProps) {
  return (
    <View style={styles.row} testID={testID} accessibilityRole="text">
      <View style={styles.iconWrap} accessibilityElementsHidden>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        <Text
          style={[
            styles.value,
            numeric && { fontVariant: ['tabular-nums'], fontWeight: textStyles.tabularAmount.fontWeight },
          ]}
        >
          {value}
        </Text>
      </View>
      {showChevron ? (
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} accessibilityElementsHidden />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: layout.listRowMinHeight,
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 2,
  },
  label: textStyles.footnoteLabel as TextStyle,
  value: textStyles.bodyValue as TextStyle,
});
