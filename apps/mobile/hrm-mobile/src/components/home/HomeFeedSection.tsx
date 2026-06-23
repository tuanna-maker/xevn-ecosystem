import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SurfaceCard } from '../ui/SurfaceCard';
import { colors, layout, spacing, typography } from '../../theme/tokens';
import { formatPayslipHeroNet } from '../../integrations/payrollPayslips';
import { resolveWorkflowStatusVi } from '../../utils/dashboardEss';
import { HomeSectionHeader } from './HomeSectionHeader';

export type HomePayslipTeaser = {
  id: string;
  periodLabel: string;
  netAmount: number | null;
  currency: string;
  status: string;
};

type HomeFeedSectionProps = {
  payslip: HomePayslipTeaser | null;
  error?: string;
  onViewDetail: () => void;
  onViewAll?: () => void;
  /** When true, omit section header (parent expandable provides it). */
  embedded?: boolean;
};

export function HomeFeedSection({
  payslip,
  error,
  onViewDetail,
  onViewAll,
  embedded = false,
}: HomeFeedSectionProps) {
  return (
    <View style={embedded ? styles.embedded : styles.wrap}>
      {!embedded ? (
        <HomeSectionHeader
          title="Bảng lương"
          actionLabel={onViewAll ? 'Xem tất cả' : undefined}
          onActionPress={onViewAll}
        />
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {payslip ? (
        <SurfaceCard
          title={payslip.periodLabel}
          onPress={onViewDetail}
          footer={
            <Pressable onPress={onViewDetail} accessibilityRole="button" hitSlop={8}>
              <Text style={styles.sectionLink}>Xem chi tiết</Text>
            </Pressable>
          }
        >
          <Text style={styles.amount}>
            {formatPayslipHeroNet(payslip.netAmount, payslip.currency)}
          </Text>
          <Text style={styles.meta}>Thực lĩnh · {resolveWorkflowStatusVi(payslip.status)}</Text>
        </SurfaceCard>
      ) : !error ? (
        <SurfaceCard
          title="Chưa có phiếu lương"
          onPress={onViewAll}
          footer={
            onViewAll ? (
              <Pressable onPress={onViewAll} accessibilityRole="button">
                <Text style={styles.sectionLink}>Xem kỳ lương</Text>
              </Pressable>
            ) : undefined
          }
        >
          <Text style={styles.emptyText}>Phiếu lương mới nhất sẽ hiển thị tại đây.</Text>
        </SurfaceCard>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: layout.itemGap,
    marginBottom: layout.sectionGap,
  },
  embedded: {
    gap: layout.itemGap,
  },
  sectionLink: {
    fontSize: typography.fontSize.subhead,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  amount: {
    fontSize: typography.fontSize.title2,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    lineHeight: typography.lineHeight.title2,
  },
  meta: {
    fontSize: typography.fontSize.footnote,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.footnote,
  },
  error: {
    fontSize: typography.fontSize.footnote,
    color: colors.danger,
    lineHeight: typography.lineHeight.footnote,
  },
  emptyText: {
    fontSize: typography.fontSize.subhead,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.subhead,
  },
});
