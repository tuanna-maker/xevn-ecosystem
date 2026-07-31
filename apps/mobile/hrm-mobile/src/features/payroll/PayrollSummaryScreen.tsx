import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { ListShimmerPlaceholder } from '../../components/primitives/ListShimmerPlaceholder';
import { ListRow } from '../../components/ui/ListRow';
import type { PayslipStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { readListRows } from '../../integrations/envelope';
import { hrmRequest } from '../../integrations/hrmApiClient';
import { formatHrmError } from '../../integrations/mapApiError';
import { colors, radius, spacing, statusToneColor, typography } from '../../theme/tokens';
import { formatHrmDateRange } from '../../utils/formatHrm';
import { statusLabel } from '../../integrations/mapApiError';
import { resolvePayslipPeriodLabelVi } from '../../utils/payslipDisplayVi';
import { userFacingScopeError } from '../../utils/scopeError';

type Period = {
  id: string;
  period_label: string;
  start_date: string;
  end_date: string;
  status: string;
};

export function PayrollSummaryScreen() {
  const auth = useAuth();
  const nav = useNavigation<NativeStackNavigationProp<PayslipStackParamList>>();
  const [rows, setRows] = useState<Period[]>([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const cid = auth.getPayrollQueryCompanyId();
    if (!cid) {
      setErr(userFacingScopeError('payrollCompany'));
      setRows([]);
      return;
    }
    const q = new URLSearchParams({ company_id: cid });
    const res = await hrmRequest<unknown>(auth.getHrmAuth(), `/payroll/periods?${q.toString()}`, { method: 'GET' });
    if (res.ok) {
      setRows(readListRows<Period>(res.data));
      setErr('');
    } else {
      setRows([]);
      setErr(formatHrmError(res));
    }
  }, [auth]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void refresh();
    }, [refresh]),
  );

  if (loading && rows.length === 0 && !err) {
    return (
      <View style={styles.root}>
        <View style={styles.header}>
          <Text style={styles.subtitle}>Danh sách kỳ lương trong phạm vi</Text>
        </View>
        <ListShimmerPlaceholder testID="payroll-summary-shimmer" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.subtitle}>Chọn kỳ để xem phiếu lương</Text>
            </View>
            {err ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{err}</Text>
              </View>
            ) : null}
          </>
        }
        refreshing={refreshing}
        onRefresh={() => void refresh()}
        renderItem={({ item }) => {
          const periodLabel = resolvePayslipPeriodLabelVi(item.period_label, {
            membershipCompanyDisplay: auth.memberships.find((m) => m.employee_id === auth.employeeId)
              ?.company_display,
          });
          return (
            <ListRow
              title={periodLabel}
              subtitle={formatHrmDateRange(item.start_date, item.end_date)}
              status={item.status}
              statusLabel={statusLabel(item.status)}
              onPress={() => nav.navigate('PayslipList', { periodId: item.id, periodLabel })}
            />
          );
        }}
        ListEmptyComponent={
          !err ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>Chưa có kỳ lương trong phạm vi</Text>
              <Text style={styles.emptyHint}>Kéo xuống để làm mới.</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.iosGroupedBackground },
  list: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.xl },
  header: { gap: spacing.xs, marginBottom: spacing.sm },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  errorBanner: {
    backgroundColor: statusToneColor('danger').bg,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: statusToneColor('danger').border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  errorText: {
    color: statusToneColor('danger').text,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    gap: spacing.xs,
  },
  emptyTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  emptyHint: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
});
