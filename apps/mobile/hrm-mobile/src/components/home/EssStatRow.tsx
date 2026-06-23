import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { essStatRowLayout } from '../../theme/essStatRowLayout';
import { colors, layout, typography } from '../../theme/tokens';

type EssStatRowProps = {
  label: string;
  value: string;
  onPress?: () => void;
  showSeparator?: boolean;
  testID?: string;
};

/** Apple Settings row — label left, tabular-nums value right (MOB-UX-14c). */
export function EssStatRow({ label, value, onPress, showSeparator = false, testID }: EssStatRowProps) {
  const content = (
    <View style={[styles.row, showSeparator && styles.rowWithSeparator]}>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.value} numberOfLines={1}>
        {value}
      </Text>
      {onPress ? (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={colors.textSecondary}
          style={styles.chevron}
          accessibilityElementsHidden
        />
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${value}`}
        testID={testID}
        style={({ pressed }) => [pressed && styles.pressed]}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View testID={testID} accessibilityRole="text">
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: essStatRowLayout.rowMinHeight,
    paddingHorizontal: essStatRowLayout.horizontalPadding,
    paddingVertical: essStatRowLayout.rowPaddingVertical,
    gap: layout.inlineGap,
  },
  rowWithSeparator: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  label: {
    flex: 1,
    fontSize: essStatRowLayout.labelFontSize,
    fontWeight: typography.fontWeight.normal,
    color: colors.text,
    lineHeight: typography.lineHeight.subhead,
  },
  value: {
    fontSize: essStatRowLayout.valueFontSize,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    lineHeight: typography.lineHeight.body,
    fontVariant: ['tabular-nums'],
    textAlign: 'right',
    flexShrink: 0,
  },
  chevron: {
    marginLeft: 2,
  },
  pressed: { opacity: 0.92 },
});
