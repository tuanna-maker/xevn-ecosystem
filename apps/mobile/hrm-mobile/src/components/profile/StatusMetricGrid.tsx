import { MotiView } from 'moti';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, layout, radius, spacing, statusToneColor, typography } from '../../theme/tokens';
import type { ProfileStatusMetric } from '../../utils/profileWorkMetrics';

type StatusMetricGridProps = {
  metrics: ProfileStatusMetric[];
  testID?: string;
};

const COLS = 2;

/** 2×3 colored metric tiles with moti stagger — MOB-UX-12c / F-3 AC-UI-PROF-02. */
export function StatusMetricGrid({ metrics, testID = 'profile-status-metric-grid' }: StatusMetricGridProps) {
  return (
    <View style={styles.grid} testID={testID} accessibilityRole="summary">
      {metrics.map((metric, index) => {
        const palette = statusToneColor(metric.tone);
        return (
          <MotiView
            key={metric.id}
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 280, delay: index * 60 }}
            style={[styles.cell, index % COLS === 1 && styles.cellRight]}
          >
            <Text style={[styles.value, { color: palette.text }]} numberOfLines={1} adjustsFontSizeToFit>
              {metric.value}
            </Text>
            <Text style={styles.label} numberOfLines={2}>
              {metric.label}
            </Text>
          </MotiView>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: layout.sectionGap,
  },
  cell: {
    width: '48.5%',
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
    minHeight: 76,
    justifyContent: 'center',
  },
  cellRight: {},
  value: {
    fontSize: typography.fontSize.title2,
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.title2,
    fontVariant: ['tabular-nums'],
  },
  label: {
    fontSize: typography.fontSize.footnote,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.footnote,
  },
});
