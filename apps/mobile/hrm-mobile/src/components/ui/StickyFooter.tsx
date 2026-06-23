import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, layout, spacing } from '../../theme/tokens';
import { resolveStickyFooterPaddingBottom } from '../../theme/layoutInsets';

type StickyFooterProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /**
   * When true (default), parent AppScreenLayout already offsets above absolute tab bar.
   * Inner padding stays compact; do not add home-indicator inset again.
   */
  aboveTabBar?: boolean;
  /** MOB-UX-16d ILA-09 — ≥24dp clearance above tab bar for primary CTAs. */
  thumbZone?: boolean;
  testID?: string;
};

/** Primary CTA zone — bottom 40% thumb zone (§5.1). */
export function StickyFooter({
  children,
  style,
  aboveTabBar = true,
  thumbZone = false,
  testID,
}: StickyFooterProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      testID={testID}
      style={[
        styles.wrap,
        {
          paddingBottom: resolveStickyFooterPaddingBottom(aboveTabBar, insets.bottom, {
            thumbZone,
          }),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.separator,
    backgroundColor: colors.surface,
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
});
