/**
 * @CODE-MEMORY
 * Screen:     Home → AttendanceStatsRow (Đi làm / Đi muộn / Vắng)
 * UC:         AT-01 · hub đi muộn
 * BR:         ESS home stats · discoverable create đơn công
 * SRS:        PO_E2E spine AT-01 · MOBILE_HRM_ESS_UX_BENCHMARK
 * TechSpec:   dashboard ESS attendance stats
 * Purpose:    Hiển thị 3 chỉ số chấm công; ô «Đi muộn» mở CreateUpdateRequest khi có handler.
 * WorkItem:   R-SPINE-AT-NAV-01
 * Coded:      2026-05 (baseline)
 * Callers:    DashboardScreen
 * Callees:    (none)
 * must_keep:  labels Đi làm / Đi muộn / Vắng; không đổi nghĩa số liệu
 * LastVerified: docs/qa/evidence/r-spine-at-nav-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-03 R-SPINE-AT-NAV-01
 * change_mode: ADD
 * What: Pressable ô late → onLatePress (testID attendance-stat-late)
 * Why: QA AT-01 — hub «Đi muộn» trước đây chỉ stat, không mở create
 * must_keep: loading skeleton; optional onLatePress (không bắt buộc)
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SkeletonLine } from '../primitives/SkeletonLine';
import type { AttendanceStats } from '../../utils/dashboardEss';
import { brand, colors, layout, radius, spacing, typography } from '../../theme/tokens';

type AttendanceStatsRowProps = {
  stats: AttendanceStats;
  loading?: boolean;
  error?: string;
  /** AT-01 — tap «Đi muộn» opens create update-request when provided. */
  onLatePress?: () => void;
};

const METRICS: Array<{ key: keyof AttendanceStats; label: string }> = [
  { key: 'totalWork', label: 'Đi làm' },
  { key: 'late', label: 'Đi muộn' },
  { key: 'absence', label: 'Vắng' },
];

export function AttendanceStatsRow({ stats, loading, error, onLatePress }: AttendanceStatsRowProps) {
  return (
    <View style={styles.root} accessibilityRole="summary">
      <View style={styles.brandBar} accessibilityElementsHidden testID="dashboard-attendance-brand-bar" />
      <View style={styles.row}>
      {METRICS.map((m, index) => {
        const isLate = m.key === 'late';
        const pressable = isLate && typeof onLatePress === 'function' && !loading;
        const body = (
          <>
            {loading ? (
              <SkeletonLine width={32} height={22} testID={`attendance-stat-${m.key}-skeleton`} />
            ) : (
              <Text style={styles.value}>{String(stats[m.key])}</Text>
            )}
            <Text style={styles.label}>{m.label}</Text>
          </>
        );

        if (pressable) {
          return (
            <Pressable
              key={m.key}
              testID="attendance-stat-late"
              accessibilityRole="button"
              accessibilityLabel="Đi muộn, tạo đơn công"
              onPress={onLatePress}
              style={({ pressed }) => [
                styles.cell,
                index === METRICS.length - 1 && styles.cellLast,
                pressed && styles.cellPressed,
              ]}
            >
              {body}
            </Pressable>
          );
        }

        return (
          <View key={m.key} style={[styles.cell, index === METRICS.length - 1 && styles.cellLast]}>
            {body}
          </View>
        );
      })}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: layout.sectionGap,
    overflow: 'hidden',
  },
  brandBar: {
    height: brand.barWidth,
    width: '100%',
    backgroundColor: colors.primary,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    minHeight: 44,
  },
  cellLast: {
    borderRightWidth: 0,
  },
  cellPressed: {
    backgroundColor: colors.iosGroupedBackground,
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
