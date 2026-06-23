import { Skeleton } from 'moti/skeleton';
import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, layout, radius, spacing } from '../../theme/tokens';
import { SkeletonLine } from './SkeletonLine';

export type ShimmerCardProps = {
  /** Outer card height. Default 120. */
  height?: number;
  /** Show inner title + subtitle lines. Default true. */
  showLines?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Card-shaped skeleton placeholder for Home metrics, list cards, etc.
 * Uses moti/Skeleton + XeVN tokens (MOB-UX-11a / AC-UI-MOTION prep).
 */
export function ShimmerCard({
  height = 120,
  showLines = true,
  style,
  testID = 'shimmer-card',
}: ShimmerCardProps) {
  return (
    <View
      testID={testID}
      style={[styles.card, { minHeight: height }, style]}
      accessibilityRole="progressbar"
      accessibilityLabel="Đang tải"
    >
      {showLines ? (
        <View style={styles.lines}>
          <SkeletonLine width="55%" height={16} testID={`${testID}-title`} />
          <SkeletonLine width="35%" height={12} testID={`${testID}-subtitle`} />
          <Skeleton
            colorMode="light"
            width="100%"
            height={Math.max(height - 72, 32)}
            radius={radius.sm}
            colors={['#E5E7EB', '#F3F4F6', '#E5E7EB']}
          />
        </View>
      ) : (
        <Skeleton
          colorMode="light"
          width="100%"
          height={Math.max(height - layout.cardPadding * 2, 48)}
          radius={radius.sm}
          colors={['#E5E7EB', '#F3F4F6', '#E5E7EB']}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    padding: layout.cardPadding,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  lines: {
    gap: spacing.sm,
  },
});
