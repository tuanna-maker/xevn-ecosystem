import React, { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, layout, radius, spacing, typography } from '../../theme/tokens';
import { formatHrmDate, parseHrmDateOnly } from '../../utils/formatHrm';
import { toIsoDateOnly } from '../../utils/leaveRequest';

type DashboardDateBarProps = {
  greeting: string;
  selectedDate: string;
  onDateChange: (isoDate: string) => void;
  /** Employee Home hides date picker — manager ESS only (MOB-UX-08). */
  showDatePicker?: boolean;
  /** TopBar already shows identity — skip duplicate greeting (MOB-UX-16a ILA-01). */
  showGreeting?: boolean;
};

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function mondayOffset(d: Date): number {
  const day = d.getDay();
  return day === 0 ? 6 : day - 1;
}

export function DashboardDateBar({
  greeting,
  selectedDate,
  onDateChange,
  showDatePicker = true,
  showGreeting = false,
}: DashboardDateBarProps) {
  const [open, setOpen] = useState(false);
  const parsed = parseHrmDateOnly(selectedDate) ?? new Date();
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(parsed));

  const cells = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const first = new Date(year, month, 1);
    const offset = mondayOffset(first);
    const total = daysInMonth(year, month);
    const slots: Array<{ key: string; day: number | null; date: Date | null }> = [];
    for (let i = 0; i < offset; i += 1) {
      slots.push({ key: `pad-${i}`, day: null, date: null });
    }
    for (let d = 1; d <= total; d += 1) {
      slots.push({ key: `d-${d}`, day: d, date: new Date(year, month, d) });
    }
    return slots;
  }, [viewMonth]);

  const pick = (date: Date) => {
    onDateChange(toIsoDateOnly(date));
    setOpen(false);
  };

  const monthLabel = `Tháng ${viewMonth.getMonth() + 1}/${viewMonth.getFullYear()}`;
  const pillLabel = formatHrmDate(selectedDate);

  if (!showGreeting && !showDatePicker) {
    return null;
  }

  return (
    <View style={styles.root}>
      {showGreeting ? (
        <Text style={styles.greeting} accessibilityRole="header">
          {greeting}
        </Text>
      ) : null}
      {showDatePicker ? (
        <Pressable
          onPress={() => {
            setViewMonth(startOfMonth(parsed));
            setOpen(true);
          }}
          accessibilityRole="button"
          accessibilityLabel={`Chọn ngày, hiện tại ${pillLabel}`}
          style={({ pressed }) => [styles.datePill, pressed && styles.pressed]}
        >
          <Text style={styles.datePillText}>{pillLabel}</Text>
          <Text style={styles.chevron}>▾</Text>
        </Pressable>
      ) : null}

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetHeader}>
              <Pressable
                onPress={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
                style={styles.navBtn}
              >
                <Text style={styles.navText}>‹</Text>
              </Pressable>
              <Text style={styles.monthTitle}>{monthLabel}</Text>
              <Pressable
                onPress={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
                style={styles.navBtn}
              >
                <Text style={styles.navText}>›</Text>
              </Pressable>
            </View>
            <View style={styles.weekRow}>
              {WEEKDAYS.map((w) => (
                <Text key={w} style={styles.weekday}>
                  {w}
                </Text>
              ))}
            </View>
            <View style={styles.grid}>
              {cells.map((c) => {
                if (!c.date || c.day == null) {
                  return <View key={c.key} style={styles.dayCell} />;
                }
                const selected = selectedDate === toIsoDateOnly(c.date);
                return (
                  <Pressable
                    key={c.key}
                    onPress={() => pick(c.date!)}
                    style={[styles.dayCell, styles.dayBtn, selected && styles.daySelected]}
                  >
                    <Text style={[styles.dayText, selected && styles.dayTextSelected]}>{c.day}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: layout.sectionGap,
  },
  greeting: {
    flex: 1,
    fontSize: typography.fontSize.title2,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    lineHeight: typography.lineHeight.title2,
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    minHeight: 36,
    justifyContent: 'center',
  },
  pressed: { opacity: 0.9 },
  datePillText: {
    fontSize: typography.fontSize.subhead,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
  chevron: { color: colors.primary, fontSize: typography.fontSize.sm },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navBtn: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: typography.fontSize['2xl'],
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  monthTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  weekRow: { flexDirection: 'row', justifyContent: 'space-around' },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBtn: { borderRadius: radius.full },
  daySelected: { backgroundColor: colors.primary },
  dayText: { fontSize: typography.fontSize.sm, color: colors.text },
  dayTextSelected: { color: colors.surface, fontWeight: typography.fontWeight.semibold },
});
