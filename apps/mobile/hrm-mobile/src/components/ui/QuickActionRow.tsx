import { Ionicons } from '@expo/vector-icons';
import React, { useCallback } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '../primitives/PressableScale';
import { colors, layout, radius, spacing, typography } from '../../theme/tokens';

export type QuickActionItem = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  href: string;
};

type QuickActionRowProps = {
  actions: QuickActionItem[];
  testID?: string;
};

async function openExternalUrl(href: string): Promise<void> {
  const can = await Linking.canOpenURL(href);
  if (can) {
    await Linking.openURL(href);
  }
}

/** Workday-style quick actions — Gọi / Email with tel: and mailto:. */
export function QuickActionRow({ actions, testID = 'quick-action-row' }: QuickActionRowProps) {
  const handlePress = useCallback((href: string) => {
    void openExternalUrl(href).catch(() => undefined);
  }, []);

  if (actions.length === 0) return null;

  return (
    <View style={styles.row} testID={testID} accessibilityRole="toolbar">
      {actions.map((action) => (
        <PressableScale
          key={action.id}
          onPress={() => handlePress(action.href)}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          style={styles.chip}
          testID={`${testID}-${action.id}`}
        >
          <View style={styles.iconCircle}>
            <Ionicons name={action.icon} size={22} color={colors.primary} />
          </View>
          <Text style={styles.label} numberOfLines={1}>
            {action.label}
          </Text>
        </PressableScale>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: spacing.md,
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing.sm,
  },
  chip: {
    alignItems: 'center',
    minWidth: 72,
    gap: spacing.xs,
  },
  iconCircle: {
    width: layout.touchTargetComfort,
    height: layout.touchTargetComfort,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 3,
      elevation: 2,
    },
  },
  label: {
    fontSize: typography.fontSize.footnote,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    lineHeight: typography.lineHeight.footnote,
  },
});
