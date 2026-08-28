import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { AppScreenLayout } from '../../components/ui/AppScreenLayout';
import { ProfileSectionCard } from '../../components/profile/ProfileSectionCard';
import { colors, layout, typography, statusToneColor, radius, spacing } from '../../theme/tokens';
import { vi } from '../../i18n/vi';

LocaleConfig.locales['vi'] = {
  monthNames: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
  monthNamesShort: ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'],
  dayNames: ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'],
  dayNamesShort: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
  today: 'Hôm nay'
};
LocaleConfig.defaultLocale = 'vi';

export function MyScheduleScreen() {
  const [selected, setSelected] = useState('');

  return (
    <AppScreenLayout
      stackHeaderPresent
      scroll
      grouped
    >
      <View style={styles.calendarContainer}>
        <Calendar
          onDayPress={(day: any) => setSelected(day.dateString)}
          markedDates={{
            [selected]: { selected: true, disableTouchEvent: true, selectedColor: colors.primary },
            '2026-08-24': { marked: true, dotColor: colors.primary },
            '2026-08-25': { marked: true, dotColor: colors.primary },
            '2026-08-26': { marked: true, dotColor: statusToneColor('danger').text },
          }}
          theme={{
            backgroundColor: colors.surface,
            calendarBackground: colors.surface,
            textSectionTitleColor: colors.textSecondary,
            selectedDayBackgroundColor: colors.primary,
            selectedDayTextColor: '#FFFFFF',
            todayTextColor: colors.primary,
            dayTextColor: colors.text,
            textDisabledColor: colors.border,
            dotColor: colors.primary,
            selectedDotColor: '#FFFFFF',
            arrowColor: colors.primary,
            monthTextColor: colors.text,
            indicatorColor: colors.primary,
          }}
        />
      </View>

      <ProfileSectionCard title="Chi tiết ca làm việc" icon="list-outline">
        <View style={styles.shiftDetail}>
          {selected ? (
            <>
              <Text style={styles.shiftTitle}>Ca Hành Chính</Text>
              <Text style={styles.shiftTime}>08:00 - 17:30</Text>
              <Text style={styles.shiftDate}>{selected}</Text>
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Chọn một ngày để xem chi tiết</Text>
            </View>
          )}
        </View>
      </ProfileSectionCard>
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  calendarContainer: {
    margin: layout.itemGap,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  shiftDetail: {
    paddingVertical: layout.inlineGap,
  },
  shiftTitle: {
    color: colors.primary,
    fontSize: typography.fontSize.title3,
    fontWeight: typography.fontWeight.bold,
  },
  shiftTime: {
    color: colors.text,
    fontSize: typography.fontSize.body,
    marginTop: spacing.xs,
  },
  shiftDate: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.subhead,
    marginTop: spacing.xs,
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.callout,
    color: colors.textSecondary,
    fontStyle: 'italic',
  }
});
