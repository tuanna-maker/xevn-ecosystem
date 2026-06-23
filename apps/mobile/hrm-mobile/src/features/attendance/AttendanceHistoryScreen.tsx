import { useFocusEffect } from '@react-navigation/native';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { FlatList, StyleSheet, Text, View } from 'react-native';

import { AttendanceMonthCalendar } from '../../components/attendance/AttendanceMonthCalendar';
import { AttendanceHistoryShimmer } from '../../components/primitives/AttendanceHistoryShimmer';

import { ListRow } from '../../components/ui/ListRow';

import { useAuth } from '../../context/AuthContext';

import { readListRows } from '../../integrations/envelope';

import { hrmRequest } from '../../integrations/hrmApiClient';

import { formatHrmError } from '../../integrations/mapApiError';

import { vi } from '../../i18n/vi';

import { colors, spacing, typography } from '../../theme/tokens';

import {

  filterRowsByDate,

  monthIsoBounds,

  toIsoDateLocal,

} from '../../utils/attendanceCalendarMarkers';

import { resolveAttendanceTimelineBadge } from '../../utils/attendanceTimelineBadge';

import { formatHrmDate, formatHrmDateTime } from '../../utils/formatHrm';
import { userFacingScopeError } from '../../utils/scopeError';



type Row = { id: string; attendance_date: string; status: string; check_in_at?: string | null };



function currentIsoMonth(): string {

  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

}



export function AttendanceHistoryScreen() {

  const auth = useAuth();

  const [rows, setRows] = useState<Row[]>([]);

  const [err, setErr] = useState('');

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [visibleMonth, setVisibleMonth] = useState(currentIsoMonth);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const skipMonthEffectRef = useRef(true);

  const load = useCallback(async () => {

    const cid = auth.getAttendanceCompanyId();

    const eid = auth.employeeId.trim();

    if (!cid || !eid) {

      setErr(userFacingScopeError('companyAndEmployee'));

      setRows([]);

      return;

    }

    const [year, month] = visibleMonth.split('-').map(Number);

    const { from, to } = monthIsoBounds(year, month);

    const q = new URLSearchParams({

      company_id: cid,

      employee_id: eid,

      from_date: from,

      to_date: to,

      page: '1',

      page_size: '62',

    });

    const res = await hrmRequest<unknown>(auth.getHrmAuth(), `/attendance/records?${q.toString()}`, {

      method: 'GET',

    });

    if (res.ok) {

      setRows(readListRows<Row>(res.data));

      setErr('');

    } else {

      setRows([]);

      setErr(formatHrmError(res));

    }

  }, [auth, visibleMonth]);



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



  const handleMonthChange = useCallback((isoMonth: string) => {
    setVisibleMonth(isoMonth);
    setSelectedDate(null);
  }, []);

  useEffect(() => {
    if (skipMonthEffectRef.current) {
      skipMonthEffectRef.current = false;
      return;
    }
    setLoading(true);
    void refresh();
  }, [visibleMonth, refresh]);

  const handleDayPress = useCallback((dateKey: string) => {

    setSelectedDate((prev) => (prev === dateKey ? null : dateKey));

  }, []);



  const displayRows = useMemo(() => filterRowsByDate(rows, selectedDate), [rows, selectedDate]);



  const dayDetailHeader = selectedDate ? (

    <View style={styles.dayDetailHeader} testID="attendance-day-detail">

      <Text style={styles.dayDetailTitle}>Chi tiết ngày {formatHrmDate(selectedDate)}</Text>

      <Text style={styles.dayDetailSub}>

        {displayRows.length > 0 ? `${displayRows.length} bản ghi` : 'Không có bản ghi chấm công'}

      </Text>

    </View>

  ) : (

    <View style={styles.dayDetailHeader}>

      <Text style={styles.dayDetailSub}>Chọn một ngày trên lịch để xem chi tiết</Text>

    </View>

  );



  if (loading && rows.length === 0 && !err) {
    return (
      <View style={styles.root}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{vi.history}</Text>
          <Text style={styles.headerSub}>Lịch tháng · {visibleMonth}</Text>
        </View>
        <AttendanceHistoryShimmer />
      </View>
    );
  }



  return (

    <View style={styles.root}>

      {err ? (

        <View style={styles.errWrap}>

          <View style={styles.errorBanner}>

            <Text style={styles.errorText}>{err}</Text>

          </View>

        </View>

      ) : null}



      <FlatList

        data={selectedDate ? displayRows : []}

        keyExtractor={(item) => item.id}

        contentContainerStyle={styles.list}

        refreshing={refreshing}

        onRefresh={() => void refresh()}

        ListHeaderComponent={

          <View style={styles.headerBlock}>

            <View style={styles.header}>

              <Text style={styles.headerTitle}>{vi.history}</Text>

              <Text style={styles.headerSub}>Lịch tháng · hôm nay {formatHrmDate(toIsoDateLocal(new Date()))}</Text>

            </View>

            <AttendanceMonthCalendar

              rows={rows}

              visibleMonth={visibleMonth}

              selectedDate={selectedDate}

              onMonthChange={handleMonthChange}

              onDayPress={handleDayPress}

            />

            {dayDetailHeader}

          </View>

        }

        renderItem={({ item }) => {

          const checkIn = item.check_in_at ? formatHrmDateTime(item.check_in_at) : '—';

          const badge = resolveAttendanceTimelineBadge(item);

          return (

            <ListRow

              title={formatHrmDate(item.attendance_date)}

              subtitle={`Giờ vào: ${checkIn}`}

              status={badge.status}

              statusLabel={badge.label}

              statusTone={badge.tone}

              statusTestID="attendance-timeline-badge"

            />

          );

        }}

        ListEmptyComponent={

          selectedDate && !err ? (

            <View style={styles.emptyBox}>

              <Text style={styles.emptyTitle}>Không có bản ghi cho ngày đã chọn</Text>

              <Text style={styles.emptyHint}>Thử chọn ngày khác hoặc kéo xuống để làm mới.</Text>

            </View>

          ) : null

        }

      />

    </View>

  );

}



const styles = StyleSheet.create({

  root: { flex: 1, backgroundColor: colors.iosGroupedBackground },

  headerBlock: { gap: spacing.sm },

  header: { gap: 4, marginBottom: spacing.xs },

  headerTitle: {

    fontSize: typography.fontSize['2xl'],

    fontWeight: typography.fontWeight.bold,

    color: colors.text,

  },

  headerSub: {

    fontSize: typography.fontSize.sm,

    color: colors.textSecondary,

  },

  loadingHint: {

    padding: spacing.md,

    fontSize: typography.fontSize.sm,

    color: colors.textSecondary,

  },

  dayDetailHeader: {

    gap: 2,

    marginTop: spacing.xs,

    marginBottom: spacing.sm,

  },

  dayDetailTitle: {

    fontSize: typography.fontSize.base,

    fontWeight: typography.fontWeight.semibold,

    color: colors.text,

  },

  dayDetailSub: {

    fontSize: typography.fontSize.sm,

    color: colors.textSecondary,

  },

  errWrap: { paddingHorizontal: spacing.md, paddingTop: spacing.md },

  errorBanner: {

    backgroundColor: '#FEE2E2',

    borderRadius: 8,

    borderWidth: 1,

    borderColor: '#FCA5A5',

    padding: spacing.md,

  },

  errorText: {

    color: '#991B1B',

    fontSize: typography.fontSize.sm,

    fontWeight: typography.fontWeight.semibold,

  },

  list: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.xl },

  emptyBox: {

    alignItems: 'center',

    paddingVertical: spacing.lg,

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

});

