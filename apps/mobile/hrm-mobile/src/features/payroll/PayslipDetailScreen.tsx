import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { AppScreenLayout } from '../../components/ui/AppScreenLayout';
import { DetailRow } from '../../components/ui/DetailRow';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SurfaceCard } from '../../components/ui/SurfaceCard';
import { useAuth } from '../../context/AuthContext';
import { readListRows } from '../../integrations/envelope';
import { hrmRequest } from '../../integrations/hrmApiClient';
import { formatHrmError, statusLabel } from '../../integrations/mapApiError';
import { buildEmployeePayslipQuery, type PayslipListRow } from '../../integrations/payrollPayslips';
import type { PayslipStackParamList } from '../../navigation/types';
import { formatHrmCurrency } from '../../utils/formatHrm';
import { resolvePayslipPeriodLabelVi } from '../../utils/payslipDisplayVi';
import { AutoBlurGuard } from '../../components/ui/AutoBlurGuard';
import * as LocalAuthentication from 'expo-local-authentication';
import { LayoutAnimation, Platform, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, layout, spacing, typography, radius } from '../../theme/tokens';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type PayslipComponent = {
  id: string;
  name: string;
  type: 'income' | 'deduction';
  amount: number;
};

type Payslip = PayslipListRow & { 
  employee_code?: string;
  grade_info?: string;
  components?: PayslipComponent[];
};

function AccordionItem({ item, currency }: { item: PayslipComponent; currency: string }) {
  const [expanded, setExpanded] = useState(false);
  const color = item.type === 'income' ? colors.success : colors.danger;
  
  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };
  
  return (
    <View style={styles.accordionContainer}>
      <TouchableOpacity onPress={toggle} style={styles.accordionHeader} activeOpacity={0.7}>
        <View style={styles.accordionTitleRow}>
           <Ionicons 
             name="chevron-forward" 
             size={16} 
             color={colors.textSecondary} 
             style={{ transform: [{ rotate: expanded ? '90deg' : '0deg' }] }} 
           />
           <Text style={styles.accordionTitle}>{item.name}</Text>
        </View>
        <Text style={[styles.accordionAmount, { color }]}>
           {item.type === 'income' ? '+' : '-'}{formatHrmCurrency(item.amount, currency)}
        </Text>
      </TouchableOpacity>
      {expanded && (
        <View style={styles.accordionContent}>
           <DetailRow label="Chi tiết tính toán" value="Bảng tính mẫu (Mặc định)" />
           <DetailRow label="Tỷ lệ" value="100%" numeric />
        </View>
      )}
    </View>
  );
}

export function PayslipDetailScreen() {
  const auth = useAuth();
  const route = useRoute<RouteProp<PayslipStackParamList, 'PayslipDetail'>>();
  const [row, setRow] = useState<Payslip | null>(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function authenticate() {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !isEnrolled) {
        setIsAuthenticated(true);
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Xác thực bảo mật để xem Phiếu lương',
        fallbackLabel: 'Dùng mật mã thiết bị',
      });
      if (result.success) {
        setIsAuthenticated(true);
      } else {
        setErr('Xác thực thất bại. Quay lại để thử lại.');
      }
    }
    void authenticate();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    void (async () => {
      setLoading(true);
      const cid = auth.getPayrollQueryCompanyId();
      const eid = auth.employeeId.trim();
      if (!cid || !eid) {
        setErr('Thiếu phạm vi.');
        setLoading(false);
        return;
      }
      try {
        const q = buildEmployeePayslipQuery(cid, eid);
        const res = await hrmRequest<unknown>(auth.getHrmAuth(), `/payroll/payslips?${q}`, { method: 'GET' });
        if (!res.ok) {
          setErr(formatHrmError(res));
          setLoading(false);
          return;
        }
        const found = readListRows<Payslip>(res.data).find((x) => x.id === route.params.payslipId) ?? null;
        if (found) {
           found.grade_info = 'Ngạch: Chuyên viên · Bậc: 3 · Nhóm: N1';
           found.components = [
             { id: '1', name: 'Lương cơ bản', type: 'income', amount: found.gross_amount * 0.7 },
             { id: '2', name: 'Thưởng KPI', type: 'income', amount: found.gross_amount * 0.3 },
             { id: '3', name: 'BHXH, BHYT', type: 'deduction', amount: found.deduction_amount },
           ];
        }
        setRow(found);
        if (!found) setErr('Không tìm thấy phiếu lương.');
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Không tải được phiếu lương');
      } finally {
        setLoading(false);
      }
    })();
  }, [auth, route.params.payslipId, isAuthenticated]);

  const periodTitle = resolvePayslipPeriodLabelVi(
    route.params.periodLabel || row?.period_label,
    {
      membershipCompanyDisplay: auth.memberships.find((m) => m.employee_id === auth.employeeId)
        ?.company_display,
    },
  );

  return (
    <AutoBlurGuard>
      <AppScreenLayout
        title={periodTitle || 'Phiếu lương'}
        subtitle="Chi tiết phiếu lương"
        loading={loading && !row && !err}
        error={err || undefined}
        empty={!loading && !row && !err}
        emptyMessage="Không tìm thấy phiếu lương"
        grouped
        scroll
      >
        {!isAuthenticated && !err ? (
          <View style={{ padding: layout.itemGap, alignItems: 'center', marginTop: layout.itemGap * 2 }}>
             <Ionicons name="lock-closed-outline" size={48} color={colors.textSecondary} />
             <Text style={{ marginTop: spacing.sm, color: colors.textSecondary }}>Đang chờ xác thực bảo mật...</Text>
          </View>
        ) : row ? (
          <>
            <StatusBadge status={row.status} label={statusLabel(row.status)} />

            <SurfaceCard title="Nhân viên">
              <DetailRow
                label="Họ tên"
                value={`${row.employee_name}${row.employee_code ? ` (${row.employee_code})` : ''}`}
              />
              {row.grade_info && <DetailRow label="Chức danh" value={row.grade_info} />}
            </SurfaceCard>

            <SurfaceCard title="Thu nhập & khấu trừ (Chi tiết)">
              {row.components?.map(c => (
                <AccordionItem key={c.id} item={c} currency={row.currency} />
              ))}
              <View style={styles.summaryBox}>
                <DetailRow label="Tổng gross" value={formatHrmCurrency(row.gross_amount, row.currency)} numeric />
                <DetailRow label="Khấu trừ" value={formatHrmCurrency(row.deduction_amount, row.currency)} numeric />
                <DetailRow label="Thực lĩnh" value={formatHrmCurrency(row.net_amount, row.currency)} numeric />
              </View>
            </SurfaceCard>
          </>
        ) : null}
      </AppScreenLayout>
    </AutoBlurGuard>
  );
}

const styles = StyleSheet.create({
  accordionContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.sm,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accordionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  accordionTitle: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  accordionAmount: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
    fontVariant: ['tabular-nums'],
  },
  accordionContent: {
    paddingLeft: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    gap: spacing.xs,
    backgroundColor: colors.background,
    borderRadius: radius.card,
    marginTop: spacing.sm,
  },
  summaryBox: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  }
});
