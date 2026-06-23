import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Skeleton } from 'moti/skeleton';
import { layout, radius, spacing } from '../../theme/tokens';
import { ShimmerCard } from './ShimmerCard';
import { SkeletonLine } from './SkeletonLine';

/** Colleague detail first load — hero + 3 section cards (MOB-UX-12a / MOB-UX-11f). */
export function TeamColleagueDetailShimmer({ testID = 'team-colleague-detail-shimmer' }: { testID?: string }) {
  return (
    <View style={styles.wrap} testID={testID} accessibilityLabel="Đang tải hồ sơ đồng nghiệp">
      <View style={styles.hero} testID={`${testID}-hero`}>
        <Skeleton colorMode="light" width={112} height={112} radius={radius.full} />
        <SkeletonLine width="60%" height={22} />
        <SkeletonLine width="45%" height={16} />
        <Skeleton colorMode="light" width={96} height={28} radius={radius.full} />
      </View>
      <ShimmerCard height={120} testID={`${testID}-contact`} />
      <ShimmerCard height={100} testID={`${testID}-work`} />
      <ShimmerCard height={88} testID={`${testID}-attendance`} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: layout.sectionGap,
    paddingBottom: layout.screenPaddingBottom,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: layout.screenPaddingH,
    paddingVertical: spacing.lg,
  },
});
