import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '../primitives/PressableScale';
import { colors, radius, spacing, typography } from '../../theme/tokens';

export type SegmentedTabOption<T extends string> = {
  key: T;
  label: string;
};

type SegmentedTabBarProps<T extends string> = {
  value: T;
  options: SegmentedTabOption<T>[];
  onChange: (key: T) => void;
};

/** iOS-style segmented control — MOB-UX-07 My Leaves tabs. */
export function SegmentedTabBar<T extends string>({ value, options, onChange }: SegmentedTabBarProps<T>) {
  return (
    <View style={styles.track} accessibilityRole="tablist">
      {options.map((opt) => {
        const active = value === opt.key;
        return (
          <PressableScale
            key={opt.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={[styles.segment, active && styles.segmentOn]}
            onPress={() => onChange(opt.key)}
          >
            <Text style={[styles.label, active && styles.labelOn]} numberOfLines={1}>
              {opt.label}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: colors.border,
    borderRadius: radius.md,
    padding: 3,
    gap: 2,
  },
  segment: {
    flex: 1,
    minHeight: 36,
    borderRadius: radius.md - 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  segmentOn: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  label: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  labelOn: {
    color: colors.text,
    fontWeight: typography.fontWeight.semibold,
  },
});
