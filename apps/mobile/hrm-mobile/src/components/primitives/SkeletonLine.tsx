import { Skeleton } from 'moti/skeleton';
import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { radius } from '../../theme/tokens';

export type SkeletonLineProps = {
  /** Width in px or percentage string. Default 100%. */
  width?: number | `${number}%`;
  /** Line height in px. Default 14 (footnote scale). */
  height?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/** Single shimmer line for list rows, labels, or captions (MOB-UX-11a). */
export function SkeletonLine({
  width = '100%',
  height = 14,
  style,
  testID = 'skeleton-line',
}: SkeletonLineProps) {
  return (
    <View style={style} testID={testID}>
      <Skeleton
        colorMode="light"
        width={width}
        height={height}
        radius={radius.sm}
        colors={['#E5E7EB', '#F3F4F6', '#E5E7EB']}
      />
    </View>
  );
}
