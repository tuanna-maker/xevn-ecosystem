import React from 'react';
import { StyleSheet, View } from 'react-native';
import { layout, spacing } from '../../theme/tokens';
import { ShimmerCard } from './ShimmerCard';

/** Home hub initial load — ≥2 skeleton cards (AC-UI-MOTION / MOB-UX-11a). */
export function DashboardHomeShimmer({ testID = 'dashboard-home-shimmer' }: { testID?: string }) {
  return (
    <View style={styles.wrap} testID={testID} accessibilityLabel="Đang tải trang chủ">
      <ShimmerCard height={140} testID={`${testID}-hero`} />
      <View style={styles.row}>
        <ShimmerCard height={88} style={styles.half} showLines={false} testID={`${testID}-metric-a`} />
        <ShimmerCard height={88} style={styles.half} showLines={false} testID={`${testID}-metric-b`} />
      </View>
      <ShimmerCard height={100} testID={`${testID}-feed`} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: layout.itemGap,
    marginBottom: layout.sectionGap,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  half: {
    flex: 1,
  },
});
