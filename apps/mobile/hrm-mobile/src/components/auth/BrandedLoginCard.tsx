import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, layout, radius, shadow, spacing } from '../../theme/tokens';

export type BrandedLoginCardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * SET F-1 white inset form card — radius 16pt, elevation 2, pad 24pt.
 * Sits over gradient hero on LoginScreen (MOB-UX-11a).
 */
export function BrandedLoginCard({ children, style, testID = 'branded-login-card' }: BrandedLoginCardProps) {
  return (
    <View style={[styles.card, style]} testID={testID}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    marginHorizontal: layout.screenPaddingH,
    marginTop: -spacing['2xl'],
    ...shadow.soft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
});
