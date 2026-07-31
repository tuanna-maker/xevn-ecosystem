import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { ListShimmerPlaceholder } from '../../components/primitives/ListShimmerPlaceholder';
import { FilterChipRow } from '../../components/ui/FilterChipRow';
import { ListRow } from '../../components/ui/ListRow';
import type { RequestsStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { readListRows } from '../../integrations/envelope';
import { hrmRequest } from '../../integrations/hrmApiClient';
import { formatHrmError, statusLabel } from '../../integrations/mapApiError';
import { vi } from '../../i18n/vi';
import { colors, radius, spacing, statusToneColor, typography } from '../../theme/tokens';
import { resolveAttendanceChangeTypeVi } from '../../utils/attendanceUpdateTypes';
import { formatHrmDate } from '../../utils/formatHrm';
import { userFacingScopeError } from '../../utils/scopeError';

type Req = { id: string; status: string; employee_name: string; update_type: string; attendance_date: string };

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

export function UpdateRequestsScreen() {
  const auth = useAuth();
  const nav = useNavigation<NativeStackNavigationProp<RequestsStackParamList>>();
  const [rows, setRows] = useState<Req[]>([]);
  const [err, setErr] = useState('');
  const [filter, setFilter] = useState<StatusFilter>('pending');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useLayoutEffect(() => {
    nav.setOptions({
      headerRight: () => (
        <View style={styles.headerActions}>
          <Pressable onPress={() => nav.navigate('LeaveRequestsList')} style={styles.headerAction}>
            <Text style={styles.headerActionMuted}>{vi.leaveList}</Text>
          </Pressable>
          <Pressable onPress={() => nav.navigate('CreateLeaveRequest')} style={styles.headerAction}>
            <Text style={styles.headerActionText}>+ {vi.createLeave}</Text>
          </Pressable>
          <Pressable onPress={() => nav.navigate('CreateUpdateRequest')} style={styles.headerAction}>
            <Text style={styles.headerActionText}>+ {vi.createRequest}</Text>
          </Pressable>
        </View>
      ),
    });
  }, [nav]);

  const load = useCallback(async () => {
    const cid = auth.getAttendanceCompanyId();
    if (!cid) {
      setErr(userFacingScopeError('company'));
      setRows([]);
      return;
    }
    const q = new URLSearchParams({ company_id: cid });
    if (filter !== 'all') q.set('status', filter);
    const eid = auth.employeeId.trim();
    if (eid) q.set('employee_id', eid);
    const res = await hrmRequest<unknown>(auth.getHrmAuth(), `/attendance/update-requests?${q.toString()}`, {
      method: 'GET',
    });
    if (res.ok) {
      setRows(readListRows<Req>(res.data));
      setErr('');
    } else {
      setRows([]);
      setErr(formatHrmError(res));
    }
  }, [auth, filter]);

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

  React.useEffect(() => {
    setLoading(true);
    void refresh();
  }, [filter, refresh]);

  const chipOptions = useMemo(
    () =>
      (['all', 'pending', 'approved', 'rejected'] as const).map((k) => ({
        key: k,
        label: k === 'all' ? 'Tất cả' : statusLabel(k),
      })),
    [],
  );

  if (loading && rows.length === 0 && !err) {
    return (
      <View style={styles.root}>
        <View style={styles.chipWrap}>
          <FilterChipRow value={filter} options={chipOptions} onChange={setFilter} />
        </View>
        <ListShimmerPlaceholder testID="update-requests-shimmer" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.chipWrap}>
        <FilterChipRow
          value={filter}
          options={chipOptions}
          onChange={(k) => {
            setFilter(k);
            setLoading(true);
          }}
        />
      </View>

      {err ? (
        <View style={styles.errWrap}>
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{err}</Text>
          </View>
        </View>
      ) : null}

      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={() => void refresh()}
        renderItem={({ item }) => (
          <ListRow
            title={`${item.employee_name} — ${resolveAttendanceChangeTypeVi(item.update_type)}`}
            subtitle={formatHrmDate(item.attendance_date)}
            status={item.status}
            onPress={() => nav.navigate('UpdateRequestDetail', { id: item.id })}
          />
        )}
        ListEmptyComponent={
          !err ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>Không có đơn</Text>
              <Text style={styles.emptyHint}>Kéo xuống để làm mới hoặc tạo đơn mới.</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  chipWrap: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  errWrap: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  errorBanner: {
    backgroundColor: statusToneColor('danger').bg,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: statusToneColor('danger').border,
    padding: spacing.md,
  },
  errorText: {
    color: statusToneColor('danger').text,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
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
    textAlign: 'center',
  },
  list: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.xl },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingRight: spacing.xs,
  },
  headerAction: { paddingHorizontal: spacing.sm },
  headerActionText: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
    fontSize: typography.fontSize.sm,
  },
  headerActionMuted: {
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.semibold,
    fontSize: typography.fontSize.xs,
  },
});
