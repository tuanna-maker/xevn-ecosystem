import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PressableScale } from '../primitives/PressableScale';
import { vi } from '../../i18n/vi';
import { colors, layout, radius, spacing, typography } from '../../theme/tokens';
import { PROFILE_SETTINGS_ENTRY_TEST_ID } from '../../utils/profileSettingsNav';

type ProfileSettingsEntryProps = {
  onPress: () => void;
};

/**
 * Settings CTA on Profile â†’ ThĂ´ng tin (default tab).
 * MOB-NAV-SETTINGS-01 / HDSD Â§12.9 â€” reachable after 4-tab IA (no Â«ThĂªmÂ» tab).
 */
export function ProfileSettingsEntry({ onPress }: ProfileSettingsEntryProps) {
  return (
    <PressableScale
      style={styles.card}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={vi.settings}
      testID={PROFILE_SETTINGS_ENTRY_TEST_ID}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="settings-outline" size={22} color={colors.primary} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{vi.settings}</Text>
        <Text style={styles.subtitle}>Pháº¡m vi, báº£o máº­t vĂ  Ä‘iá»u hÆ°á»›ng</Text>
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
