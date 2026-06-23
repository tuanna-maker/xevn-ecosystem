import React from 'react';
import { StyleSheet, View } from 'react-native';
import { layout, spacing } from '../../theme/tokens';
import { ShimmerCard } from './ShimmerCard';
import { UI_MOTION_LIST_SHIMMER_ROWS } from './uiMotion';

export type ListShimmerPlaceholderProps = {
  /** Number of shimmer rows. Default 3 (AC-UI-MOTION). */
  count?: number;
  rowHeight?: number;
  testID?: string;
};

/** List-root loading skeleton — 3 shimmer rows, no full-screen spinner. */
export function ListShimmerPlaceholder({
  count = UI_MOTION_LIST_SHIMMER_ROWS,
  rowHeight = 72,
  testID = 'list-shimmer-placeholder',
}: ListShimmerPlaceholderProps) {
  return (
    <View style={styles.wrap} testID={testID}>
      {Array.from({ length: count }, (_, i) => (
        <ShimmerCard
          key={i}
          height={rowHeight}
          showLines
          testID={`${testID}-row-${i}`}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
});
