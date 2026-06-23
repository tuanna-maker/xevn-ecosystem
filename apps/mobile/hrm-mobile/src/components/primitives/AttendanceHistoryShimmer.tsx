import React from 'react';
import { StyleSheet, View } from 'react-native';
import { layout, spacing } from '../../theme/tokens';
import { ListShimmerPlaceholder } from './ListShimmerPlaceholder';
import { ShimmerCard } from './ShimmerCard';

/** Attendance history initial load — month calendar block + list rows (MOB-UX-11f). */
export function AttendanceHistoryShimmer({ testID = 'attendance-history-shimmer' }: { testID?: string }) {
  return (
    <View style={styles.wrap} testID={testID} accessibilityLabel="Đang tải lịch chấm công">
      <ShimmerCard height={320} showLines={false} testID={`${testID}-calendar`} />
      <ListShimmerPlaceholder testID={`${testID}-rows`} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
});
