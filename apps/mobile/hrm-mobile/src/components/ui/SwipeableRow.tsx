import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

import { colors, layout, spacing, typography } from '../../theme/tokens';
import { triggerSwipeOpenHaptic } from '../../utils/hapticFeedback';
import type { SwipeActionSpec, SwipeActionTone } from '../../utils/swipeRowActions';

const ACTION_WIDTH = 88;

const TONE_BG: Record<SwipeActionTone, string> = {
  success: colors.success,
  danger: colors.danger,
  primary: colors.primary,
  warning: colors.warning,
};

const TONE_ICON: Record<SwipeActionTone, keyof typeof Ionicons.glyphMap> = {
  success: 'checkmark-circle-outline',
  danger: 'close-circle-outline',
  primary: 'chevron-forward-circle-outline',
  warning: 'trash-outline',
};

export type SwipeableRowAction = SwipeActionSpec & {
  onPress: () => void;
};

export type SwipeableRowProps = {
  children: React.ReactNode;
  actions: SwipeableRowAction[];
  testID?: string;
};

export function SwipeableRow({ children, actions, testID }: SwipeableRowProps) {
  const swipeRef = useRef<Swipeable>(null);

  const onSwipeOpen = useCallback(() => {
    void triggerSwipeOpenHaptic();
  }, []);

  const renderRightActions = useCallback(() => {
    if (actions.length === 0) return null;

    return (
      <View style={styles.actionsRow} testID={testID ? `${testID}-actions` : undefined}>
        {actions.map((action) => (
          <Pressable
            key={action.key}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            style={[styles.actionBtn, { backgroundColor: TONE_BG[action.tone], width: ACTION_WIDTH }]}
            onPress={() => {
              swipeRef.current?.close();
              action.onPress();
            }}
          >
            <Ionicons name={TONE_ICON[action.tone]} size={22} color="#FFFFFF" />
            <Text style={styles.actionLabel} numberOfLines={2}>
              {action.label}
            </Text>
          </Pressable>
        ))}
      </View>
    );
  }, [actions, testID]);

  if (actions.length === 0) {
    return <>{children}</>;
  }

  return (
    <Swipeable
      ref={swipeRef}
      renderRightActions={renderRightActions}
      onSwipeableOpen={onSwipeOpen}
      overshootRight={false}
      friction={2}
      rightThreshold={ACTION_WIDTH * 0.4}
    >
      <View testID={testID}>{children}</View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: spacing.sm,
  },
  actionBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    gap: 4,
    minHeight: layout.listRowMinHeight,
  },
  actionLabel: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
    lineHeight: typography.lineHeight.caption,
  },
});
