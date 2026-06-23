import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlashList } from '@shopify/flash-list';
import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ListShimmerPlaceholder } from '../../components/primitives/ListShimmerPlaceholder';
import { ListRow } from '../../components/ui/ListRow';
import { PayslipHeroCard } from '../../components/ui/PayslipHeroCard';
import { useAuth } from '../../context/AuthContext';
import { readListRows } from '../../integrations/envelope';
import { hrmRequest } from '../../integrations/hrmApiClient';
import { formatHrmError } from '../../integrations/mapApiError';
import {
  buildEmployeePayslipQuery,
  filterPayslipsForPeriod,
  splitPayslipHeroAndHistory,
  type PayslipListRow,
} from '../../integrations/payrollPayslips';
import type { PayslipStackParamList } from '../../navigation/types';
import { colors, layout, radius, spacing, typography } from '../../theme/tokens';
import { formatHrmCurrency } from '../../utils/formatHrm';
import { resolvePayslipPeriodLabelVi } from '../../utils/payslipDisplayVi';

const ESTIMATED_ROW_HEIGHT = 72;

export function PayslipListScreen() {
  const auth = useAuth();
  const route = useRoute<RouteProp<PayslipStackParamList, 'PayslipList'>>();
  const nav = useNavigation<NativeStackNavigationProp<PayslipStackParamList>>();
  const [rows, setRows] = useState<PayslipListRow[]>([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const periodId = route.params?.periodId;
  const formatPeriodLabel = useCallback(
    (raw: string) =>
      resolvePayslipPeriodLabelVi(raw, {
        membershipCompanyDisplay: auth.memberships.find((m) => m.employee_id === auth.employeeId)
          ?.company_display,
      }),
    [auth.employeeId, auth.memberships],
  );
  const periodLabelParam = route.params?.periodLabel?.trim();
  const periodTitle = periodLabelParam ? formatPeriodLabel(periodLabelParam) : null;
  /** Tab-root stack already shows vi.payslips — body subtitle only (CHROME-01). */
  const showInContentPeriodTitle = Boolean(periodTitle);

  const { hero, history } = useMemo(() => splitPayslipHeroAndHistory(rows), [rows]);

  const openPayslipDetail = useCallback(
    (item: PayslipListRow) => {
      nav.navigate('PayslipDetail', {
        payslipId: item.id,
        periodLabel: formatPeriodLabel(item.period_label),
      });
    },
    [formatPeriodLabel, nav],
  );

  const load = useCallback(async () => {
    const cid = auth.getPayrollQueryCompanyId();
    const eid = auth.employeeId.trim();
    if (!cid || !eid) {
      setErr('Cần phạm vi công ty và mã nhân viên.');
      setRows([]);
      return;
    }
    try {
      const q = buildEmployeePayslipQuery(cid, eid);
      const res = await hrmRequest<unknown>(auth.getHrmAuth(), `/payroll/payslips?${q}`, { method: 'GET' });
      if (res.ok) {
        const all = readListRows<PayslipListRow>(res.data);
        setRows(filterPayslipsForPeriod(all, periodId));
        setErr('');
      } else {
        setRows([]);
        setErr(formatHrmError(res));
      }
    } catch (e) {
      setRows([]);
      setErr(e instanceof Error ? e.message : 'Không tải được phiếu lương');
    }
  }, [auth, periodId]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [load]);

  React.useEffect(() => {
    setLoading(true);
    void refresh();
  }, [refresh]);

  const renderItem = useCallback(
    ({ item }: { item: PayslipListRow }) => (
      <ListRow
        title={formatPeriodLabel(item.period_label)}
        subtitle={`Thực lĩnh ${formatHrmCurrency(item.net_amount, item.currency)}`}
        status={item.status}
        onPress={() => openPayslipDetail(item)}
        style={styles.listRow}
      />
    ),
    [formatPeriodLabel, openPayslipDetail],
  );

  const listSubtitle = periodId
    ? 'Danh sách phiếu lương theo kỳ'
    : 'Phiếu lương mới nhất và lịch sử';

  const listHeader = (
    <View>
      <View style={styles.header}>
        {showInContentPeriodTitle ? (
          <Text style={styles.periodTitle} numberOfLines={2}>
            {periodTitle}
          </Text>
        ) : null}
        <Text style={styles.subtitle}>{listSubtitle}</Text>
      </View>

      {err ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{err}</Text>
        </View>
      ) : null}

      {hero ? (
        <PayslipHeroCard
          periodLabel={formatPeriodLabel(hero.period_label)}
          netAmount={hero.net_amount}
          currency={hero.currency}
          status={hero.status}
          onPress={() => openPayslipDetail(hero)}
        />
      ) : null}

      {history.length > 0 ? (
        <Text style={styles.historyHeading} accessibilityRole="header">
          Lịch sử phiếu lương
        </Text>
      ) : null}
    </View>
  );

  if (loading && rows.length === 0 && !err) {
    return (
      <View style={styles.root}>
        <View style={styles.header}>
          {showInContentPeriodTitle ? (
            <Text style={styles.periodTitle} numberOfLines={2}>
              {periodTitle}
            </Text>
          ) : null}
          <Text style={styles.subtitle}>Đang tải phiếu lương…</Text>
        </View>
        <ListShimmerPlaceholder testID="payslip-list-shimmer" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <FlashList
        data={history}
        estimatedItemSize={ESTIMATED_ROW_HEIGHT}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={listHeader}
        refreshing={refreshing}
        onRefresh={() => void refresh()}
        renderItem={renderItem}
        ListEmptyComponent={
          !err && !hero ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>Chưa có phiếu lương</Text>
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
  header: {
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  periodTitle: {
    fontSize: typography.fontSize.title2,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    lineHeight: typography.lineHeight.title2,
    flexShrink: 1,
  },
  subtitle: {
    fontSize: typography.fontSize.body,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.body,
  },
  historyHeading: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    paddingHorizontal: layout.screenPaddingH,
  },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  listRow: { marginBottom: spacing.sm },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: spacing.md,
    marginBottom: spacing.sm,
    marginHorizontal: layout.screenPaddingH,
  },
  errorText: {
    color: '#991B1B',
    fontSize: typography.fontSize.subhead,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.subhead,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    gap: spacing.xs,
  },
  emptyTitle: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    lineHeight: typography.lineHeight.body,
  },
  emptyHint: {
    fontSize: typography.fontSize.subhead,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.subhead,
  },
});
