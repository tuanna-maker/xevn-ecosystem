import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PressableScale } from '../primitives/PressableScale';
import { colors, layout, radius, spacing, typography } from '../../theme/tokens';
import {
  formatProfileApprovalsEntryLabel,
  PROFILE_APPROVALS_ENTRY_TEST_ID,
} from '../../utils/profileManagerApprovals';

type ProfileManagerApprovalsEntryProps = {
  pendingCount: number;
  onPress: () => void;
};

/**
 * Manager approvals CTA on Profile â†’ ThĂ´ng tin (default tab).
 * J-MOB-05 / HDSD Ch.12 â€” visible without switching to CĂ´ng viá»‡c.
 */
export function ProfileManagerApprovalsEntry({
  pendingCount,
  onPress,
}: ProfileManagerApprovalsEntryProps) {
  if (pendingCount <= 0) return null;

  const label = formatProfileApprovalsEntryLabel(pendingCount);

  return (
    <PressableScale
      style={styles.card}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={PROFILE_APPROVALS_ENTRY_TEST_ID}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="checkmark-done" size={22} color={colors.danger} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{label}</Text>
        <Text style={styles.subtitle}>PhĂª duyá»‡t Ä‘Æ¡n nghá»‰ phĂ©p vĂ  chá»‰nh sá»­a cháº¥m cĂ´ng</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.primary} accessibilityElementsHidden />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    marginBottom: layout.sectionGap,
    minHeight: layout.touchTargetMin,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.card,
    backgroundColor: colors.homeTileTasks,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: typography.fontSize.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.fontSize.footnote,
    lineHeight: typography.lineHeight.footnote,
    color: colors.textSecondary,
  },
});
