import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '../primitives/PressableScale';
import { colors, layout, radius, spacing, typography } from '../../theme/tokens';

export type FilterChipOption<T extends string> = {
  key: T;
  label: string;
  count?: number;
};

type FilterChipRowProps<T extends string> = {
  value: T;
  options: FilterChipOption<T>[];
  onChange: (key: T) => void;
};

/** DS §6.3 — 36pt pill chips, horizontal scroll, primary active fill. */
export function FilterChipRow<T extends string>({ value, options, onChange }: FilterChipRowProps<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      accessibilityRole="tablist"
    >
      {options.map((opt) => {
        const active = value === opt.key;
        const label = opt.count != null ? `${opt.label} (${opt.count})` : opt.label;
        return (
          <PressableScale
            key={opt.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={[styles.chip, active && styles.chipOn]}
            onPress={() => onChange(opt.key)}
          >
            <Text style={[styles.chipText, active && styles.chipTextOn]}>{label}</Text>
          </PressableScale>
        );
      })}
      <View style={styles.trail} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: layout.inlineGap,
    paddingVertical: spacing.xs,
  },
  trail: { width: layout.screenPaddingH },
  chip: {
    minHeight: layout.filterChipHeight,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: colors.border,
    justifyContent: 'center',
  },
  chipOn: {
    backgroundColor: colors.primary,
  },
  chipText: {
    fontSize: typography.fontSize.callout,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  chipTextOn: {
    color: colors.surface,
    fontWeight: typography.fontWeight.semibold,
  },
});
