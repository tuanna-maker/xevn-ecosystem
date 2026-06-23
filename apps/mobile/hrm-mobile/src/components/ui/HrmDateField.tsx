import React, { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import { formatHrmDate, parseHrmDateOnly } from '../../utils/formatHrm';
import { toIsoDateOnly } from '../../utils/leaveRequest';

type HrmDateFieldProps = {
  label: string;
  value: string;
  onChange: (isoDate: string) => void;
  minimumDate?: string;
  maximumDate?: string;
};

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Monday-first offset for calendar grid (0 = Monday). */
function mondayOffset(d: Date): number {
  const day = d.getDay();
  return day === 0 ? 6 : day - 1;
}

export function HrmDateField({ label, value, onChange, minimumDate, maximumDate }: HrmDateFieldProps) {
  const [open, setOpen] = useState(false);
  const parsed = parseHrmDateOnly(value) ?? new Date();
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(parsed));

  const minD = minimumDate ? parseHrmDateOnly(minimumDate) : null;
  const maxD = maximumDate ? parseHrmDateOnly(maximumDate) : null;

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
      const date = new Date(year, month, d);
      slots.push({ key: `d-${d}`, day: d, date });
    }
    return slots;
  }, [viewMonth]);

  const isDisabled = (date: Date): boolean => {
    if (minD && date.getTime() < minD.getTime()) return true;
    if (maxD && date.getTime() > maxD.getTime()) return true;
    return false;
  };

  const pick = (date: Date) => {
    onChange(toIsoDateOnly(date));
    setOpen(false);
  };

  const monthLabel = `Tháng ${viewMonth.getMonth() + 1}/${viewMonth.getFullYear()}`;

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${formatHrmDate(value)}`}
        onPress={() => {
          setViewMonth(startOfMonth(parsed));
          setOpen(true);
        }}
        style={({ pressed }) => [styles.trigger, pressed && styles.pressed]}
      >
        <Text style={styles.triggerText}>{formatHrmDate(value)}</Text>
        <Text style={styles.chevron}>▾</Text>
      </Pressable>

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
                const selected = value === toIsoDateOnly(c.date);
                const disabled = isDisabled(c.date);
                return (
                  <Pressable
                    key={c.key}
                    disabled={disabled}
                    onPress={() => pick(c.date!)}
                    style={[
                      styles.dayCell,
                      styles.dayBtn,
                      selected && styles.daySelected,
                      disabled && styles.dayDisabled,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        selected && styles.dayTextSelected,
                        disabled && styles.dayTextDisabled,
                      ]}
                    >
                      {c.day}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Pressable onPress={() => setOpen(false)} style={styles.closeBtn}>
              <Text style={styles.closeText}>Đóng</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 4 },
  label: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.footnote,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.footnote,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md - 4,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.surface,
    minHeight: 44,
  },
  pressed: { opacity: 0.9 },
  triggerText: {
    fontSize: typography.fontSize.body,
    color: colors.text,
    lineHeight: typography.lineHeight.body,
  },
  chevron: { color: colors.textSecondary, fontSize: typography.fontSize.sm },
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
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBtn: { borderRadius: radius.full },
  daySelected: { backgroundColor: colors.primary },
  dayDisabled: { opacity: 0.35 },
  dayText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
  },
  dayTextSelected: { color: colors.surface, fontWeight: typography.fontWeight.semibold },
  dayTextDisabled: { color: colors.textSecondary },
  closeBtn: {
    alignSelf: 'center',
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  closeText: {
    color: colors.primary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
});
