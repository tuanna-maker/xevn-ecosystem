import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadow, spacing, typography } from '../../theme/tokens';

/**
 * @CODE-MEMORY
 * Screen:     ESS undo snackbar (overlay)
 * UC:         BR-ESS-UNDO-01
 * Purpose:    Inverse chrome snackbar — message + optional Hoàn tác; auto-dismiss.
 * WorkItem:   XEVN-THM-MOB-W2
 * Coded:      2026-07-22
 * must_keep:  backgroundColor = colors.text (ADR inverse); not AS-IS Gray-800 hex;
 *             Undo touch ≥44; text on surface / primaryDisabled CTA
 * LastVerified: theme/__tests__/mobW2Remaster.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-22 XEVN-THM-MOB-W2 — migrate snackbar fill + undo link to tokens
 */

type UndoSnackbarProps = {
  visible: boolean;
  message: string;
  onUndo?: () => void;
  onDismiss: () => void;
  durationMs?: number;
};

/** ESS mockup snackbar — 5s auto-dismiss with optional Undo (BR-ESS-UNDO-01). */
export function UndoSnackbar({
  visible,
  message,
  onUndo,
  onDismiss,
  durationMs = 5000,
}: UndoSnackbarProps) {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(timer);
  }, [visible, durationMs, onDismiss]);

  if (!visible) return null;

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <View style={styles.bar} accessibilityRole="alert" accessibilityLiveRegion="polite">
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
        {onUndo ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Hoàn tác"
            onPress={() => {
              onUndo();
              onDismiss();
            }}
            style={styles.undoPress}
            hitSlop={8}
          >
            <Text style={styles.undo}>Hoàn tác</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.lg,
    zIndex: 100,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    /** Inverse chrome — ADR colors.text; ban AS-IS Gray-800 snackbar fill */
    backgroundColor: colors.text,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    minHeight: 44,
    ...shadow.soft,
  },
  message: {
    flex: 1,
    color: colors.surface,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  undoPress: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  undo: {
    color: colors.primaryDisabled,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
});
