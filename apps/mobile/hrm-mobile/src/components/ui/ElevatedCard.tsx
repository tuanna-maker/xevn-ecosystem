import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { PressableScale } from '../primitives/PressableScale';
import { colors, radius, shadow } from '../../theme/tokens';

type ElevatedCardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  testID?: string;
};

/** Depth-shadow card — SET G-4 secondary screens (not flat border-only stacks). */
export function ElevatedCard({ children, style, onPress, testID }: ElevatedCardProps) {
  const card = (
    <View style={[styles.card, style]} testID={testID}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <PressableScale onPress={onPress} accessibilityRole="button" style={styles.pressable}>
        {card}
      </PressableScale>
    );
  }

  return card;
}

const styles = StyleSheet.create({
  pressable: { width: '100%' },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    ...shadow.soft,
  },
});
