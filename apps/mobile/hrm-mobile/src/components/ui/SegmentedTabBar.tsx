/**
 * @CODE-MEMORY
 * Screen:     SegmentedTabBar — Profile ESS / Leave tabs
 * UC:         UC-HRM-MOB-12 · WCAG 2.4.12 / HIG touch
 * BR:         Touch target ≥44pt
 * SRS:        docs/program/UX-UI-ERP-ANALYSIS.md §2.2 WCAG 2.4.12
 * TechSpec:   MOBILE_XEVN_DESIGN_SYSTEM_DIRECTION.md §4.1
 * Purpose:    iOS-style segmented control; tab hit area ≥44pt (HIG).
 * WorkItem:   D-UX-R3-WCAG-MOBILE-01
 * Coded:      2026-07-28
 * Callers:    ProfileScreen · LeaveRequestsListScreen
 * Callees:    PressableScale · layout.touchTargetMin
 * Impact:     minHeight dưới 44 → device QA U49 / WCAG FAIL
 * must_keep:  minHeight ≥ layout.touchTargetMin (44)
 * SOLID:      Presentational control — no domain state
 * LastVerified: docs/qa/evidence/d-ux-r3-wcag-mobile-01-20260728.md
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '../primitives/PressableScale';
import { colors, layout, radius, spacing, typography } from '../../theme/tokens';

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
    minHeight: layout.touchTargetMin,
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
