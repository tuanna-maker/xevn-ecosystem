import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { SkeletonLine } from '../primitives/SkeletonLine';

import type { AttendanceStats } from '../../utils/dashboardEss';

import { colors, layout, radius, spacing, typography } from '../../theme/tokens';



type AttendanceStatsRowProps = {

  stats: AttendanceStats;

  loading?: boolean;

  error?: string;

};



const METRICS: Array<{ key: keyof AttendanceStats; label: string }> = [

  { key: 'totalWork', label: 'Đi làm' },

  { key: 'late', label: 'Đi muộn' },

  { key: 'absence', label: 'Vắng' },

];



export function AttendanceStatsRow({ stats, loading, error }: AttendanceStatsRowProps) {

  return (

    <View style={styles.root} accessibilityRole="summary">

      {METRICS.map((m, index) => (

        <View key={m.key} style={[styles.cell, index === METRICS.length - 1 && styles.cellLast]}>

          {loading ? (

            <SkeletonLine width={32} height={22} testID={`attendance-stat-${m.key}-skeleton`} />

          ) : (

            <Text style={styles.value}>{String(stats[m.key])}</Text>

          )}

          <Text style={styles.label}>{m.label}</Text>

        </View>

      ))}

      {error ? <Text style={styles.error}>{error}</Text> : null}

    </View>

  );

}



const styles = StyleSheet.create({

  root: {

    flexDirection: 'row',

    backgroundColor: colors.surface,

    borderRadius: radius.card,

    borderWidth: 1,

    borderColor: colors.border,

    marginBottom: layout.sectionGap,

    overflow: 'hidden',

  },

  cell: {

    flex: 1,

    alignItems: 'center',

    justifyContent: 'center',

    paddingVertical: spacing.md,

    gap: spacing.xs,

    borderRightWidth: 1,

    borderRightColor: colors.border,

  },

  cellLast: {

    borderRightWidth: 0,

  },

  value: {

    fontSize: typography.fontSize.title2,

    fontWeight: typography.fontWeight.bold,

    color: colors.primary,

    lineHeight: typography.lineHeight.title2,

  },

  label: {

    fontSize: typography.fontSize.footnote,

    color: colors.textSecondary,

    lineHeight: typography.lineHeight.footnote,

    textAlign: 'center',

  },

  error: {

    position: 'absolute',

    bottom: 2,

    left: 0,

    right: 0,

    textAlign: 'center',

    fontSize: typography.fontSize.caption,

    color: colors.danger,

  },

});

