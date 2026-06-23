import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadow, spacing, typography } from '../../theme/tokens';

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
    backgroundColor: '#1F2937',
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    ...shadow.soft,
  },
  message: {
    flex: 1,
    color: colors.surface,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  undo: {
    color: '#93C5FD',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
});
