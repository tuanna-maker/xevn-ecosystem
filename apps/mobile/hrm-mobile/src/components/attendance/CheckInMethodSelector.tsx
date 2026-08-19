/**
 * @CODE-MEMORY
 * Screen:     CheckInMethodSelector — GPS vs Face MVP channel (MOB-04)
 * UC:         UC-BP-ATT-10 · R-FACE-01
 * BR:         Touch ≥44 · primary selected ring · honesty copy on Face
 * SRS:        docs/program/HRM_UI_BRAND_SCREEN_INVENTORY.md MOB-04
 * TechSpec:   ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md §16 Face HOLD
 * Purpose:    Segmented chọn kênh chấm công — chrome only; GPS default submit path.
 * WorkItem:   PO-HRM-UI-BRAND-W4-MOB-A
 * Coded:      2026-08-05
 * Callers:    CheckInScreen
 * Callees:    checkInChannel options · tokens layout.touchTargetMin
 * Impact:     Claim Face LIVE → FAIL honesty gate
 * must_keep:  gps default; minHeight 44
 * SOLID:      UI tách khỏi submit logic CheckInScreen
 * LastVerified: src/utils/__tests__/checkInChannel.test.ts
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  CHECK_IN_CHANNEL_OPTIONS,
  type CheckInChannelId,
} from '../../utils/checkInChannel';
import { brandBodyText } from '../../theme/brandTypography';
import { borderWidth, colors, layout, radius, spacing, typography } from '../../theme/tokens';

type CheckInMethodSelectorProps = {
  value: CheckInChannelId;
  onChange: (id: CheckInChannelId) => void;
  testID?: string;
};

export function CheckInMethodSelector({
  value,
  onChange,
  testID = 'check-in-method-selector',
}: CheckInMethodSelectorProps) {
  return (
    <View style={styles.wrap} testID={testID}>
      <Text style={styles.sectionLabel}>Phương thức chấm công</Text>
      <View style={styles.row}>
        {CHECK_IN_CHANNEL_OPTIONS.map((option) => {
          const selected = value === option.id;
          return (
            <Pressable
              key={option.id}
              testID={option.testID}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onChange(option.id)}
              style={({ pressed }) => [
                styles.chip,
                selected && styles.chipSelected,
                pressed && styles.chipPressed,
              ]}
            >
              <Ionicons
                name={option.id === 'gps' ? 'navigate-outline' : 'scan-outline'}
                size={22}
                color={selected ? colors.primary : colors.textSecondary}
                accessibilityElementsHidden
              />
              <View style={styles.chipCopy}>
                <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{option.label}</Text>
                <Text style={styles.chipSubtitle} numberOfLines={2}>
                  {option.subtitle}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
    marginBottom: layout.itemGap,
  },
  sectionLabel: {
    ...brandBodyText({ fontWeight: '600' }),
    fontSize: typography.fontSize.subhead,
    lineHeight: typography.lineHeight.subhead,
    color: colors.text,
  },
  row: {
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    minHeight: layout.touchTargetMin,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.card,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    borderColor: colors.primary,
    borderWidth: borderWidth.focus,
    backgroundColor: colors.primaryMuted,
  },
  chipPressed: {
    opacity: 0.92,
  },
  chipCopy: {
    flex: 1,
    gap: 2,
  },
  chipLabel: {
    ...brandBodyText({ fontWeight: '600' }),
    fontSize: typography.fontSize.body,
    lineHeight: typography.lineHeight.body,
    color: colors.text,
  },
  chipLabelSelected: {
    color: colors.primary,
  },
  chipSubtitle: {
    ...brandBodyText(),
    fontSize: typography.fontSize.footnote,
    lineHeight: typography.lineHeight.footnote,
    color: colors.textSecondary,
  },
});
