import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';
import { ensureHrmCalendarViLocale } from '../../i18n/hrmCalendarLocale';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import {
  buildAttendanceMarkedDates,
  type AttendanceCalendarRow,
  toIsoDateLocal,
} from '../../utils/attendanceCalendarMarkers';

ensureHrmCalendarViLocale();

type AttendanceMonthCalendarProps = {
  rows: AttendanceCalendarRow[];
  visibleMonth: string;
  selectedDate: string | null;
  onMonthChange: (isoMonth: string) => void;
  onDayPress: (dateKey: string) => void;
};

const LEGEND_ITEMS = [
  { color: colors.success, label: 'Đúng giờ' },
  { color: colors.warning, label: 'Đi muộn' },
  { color: colors.danger, label: 'Vắng mặt' },
] as const;

export function AttendanceMonthCalendar({
  rows,
  visibleMonth,
  selectedDate,
  onMonthChange,
  onDayPress,
}: AttendanceMonthCalendarProps) {
  const today = toIsoDateLocal(new Date());
  const markedDates = useMemo(
    () => buildAttendanceMarkedDates(rows, { selectedDate, today }),
    [rows, selectedDate, today],
  );

  const handleMonthChange = (month: DateData) => {
    const isoMonth = `${month.year}-${String(month.month).padStart(2, '0')}`;
    onMonthChange(isoMonth);
  };

  return (
    <View style={styles.wrap} testID="attendance-month-calendar">
      <Calendar
        current={`${visibleMonth}-01`}
        markingType="custom"
        markedDates={markedDates}
        onDayPress={(day) => onDayPress(day.dateString)}
        onMonthChange={handleMonthChange}
        enableSwipeMonths
        theme={{
          todayTextColor: colors.primary,
          arrowColor: colors.primary,
          monthTextColor: colors.text,
          textMonthFontWeight: typography.fontWeight.bold,
          textDayFontSize: typography.fontSize.sm,
          textMonthFontSize: typography.fontSize.lg,
          textDayHeaderFontSize: typography.fontSize.xs,
        }}
        style={styles.calendar}
      />
      <View style={styles.legend} testID="attendance-calendar-legend">
        {LEGEND_ITEMS.map((item) => (
          <View key={item.label} style={styles.legendItem}>
            <View style={[styles.legendSwatch, { backgroundColor: item.color }]} />
            <Text style={styles.legendLabel}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  calendar: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendSwatch: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
});
