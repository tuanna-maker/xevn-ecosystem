import React, { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import { formatHrmDate, parseHrmDateOnly } from '../../utils/formatHrm';
import { toIsoDateOnly } from '../../utils/leaveRequest';

type HrmDateRangeFieldProps = {
  label: string;
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
  minimumDate?: string;
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

type PickPhase = 'start' | 'end';

export function HrmDateRangeField({
  label,
  startDate,
  endDate,
  onChange,
  minimumDate,
}: HrmDateRangeFieldProps) {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<PickPhase>('start');
  const [draftStart, setDraftStart] = useState(startDate);
  const [draftEnd, setDraftEnd] = useState(endDate);
  const parsed = parseHrmDateOnly(startDate) ?? new Date();
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(parsed));

  const minD = minimumDate ? parseHrmDateOnly(minimumDate) : null;

  const cells = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const first = new Date(year, month, 1);
    const offset = mondayOffset(first);
    const total = daysInMonth(year, month);
    const slots: Array<{ key: string; day: number | null; date: Date | null }> = [];
    for (let i = 0; i < offset; i += 1) slots.push({ key: `pad-${i}`, day: null, date: null });
    for (let d = 1; d <= total; d += 1) {
      slots.push({ key: `d-${d}`, day: d, date: new Date(year, month, d) });
    }
    return slots;
  }, [viewMonth]);

  const openModal = () => {
    setDraftStart(startDate);
    setDraftEnd(endDate);
    setPhase('start');
    setViewMonth(startOfMonth(parseHrmDateOnly(startDate) ?? new Date()));
    setOpen(true);
  };

  const isDisabled = (date: Date): boolean => {
    if (minD && date.getTime() < minD.getTime()) return true;
    if (phase === 'end') {
      const start = parseHrmDateOnly(draftStart);
      if (start && date.getTime() < start.getTime()) return true;
    }
    return false;
  };

  const isInRange = (date: Date): boolean => {
    const start = parseHrmDateOnly(draftStart);
    const end = parseHrmDateOnly(draftEnd);
    if (!start || !end) return false;
    const t = date.getTime();
    return t >= start.getTime() && t <= end.getTime();
  };

  const pick = (date: Date) => {
    const iso = toIsoDateOnly(date);
    if (phase === 'start') {
      setDraftStart(iso);
      if (draftEnd < iso) setDraftEnd(iso);
      setPhase('end');
      return;
    }
    setDraftEnd(iso);
  };

  const apply = () => {
    onChange(draftStart, draftEnd);
    setOpen(false);
  };

  const display = `${formatHrmDate(startDate)} – ${formatHrmDate(endDate)}`;
  const monthLabel = `Tháng ${viewMonth.getMonth() + 1}/${viewMonth.getFullYear()}`;

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${display}`}
        onPress={openModal}
        style={({ pressed }) => [styles.trigger, pressed && styles.pressed]}
      >
        <Text style={styles.triggerText}>{display}</Text>
        <Text style={styles.chevron}>▾</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.sheetTitle}>Chọn khoảng ngày nghỉ</Text>
            <Text style={styles.phaseHint}>
              {phase === 'start' ? 'Bước 1: Chọn ngày bắt đầu' : 'Bước 2: Chọn ngày kết thúc'}
            </Text>
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
                if (!c.date || c.day == null) return <View key={c.key} style={styles.dayCell} />;
                const iso = toIsoDateOnly(c.date);
                const selected = iso === draftStart || iso === draftEnd;
                const inRange = isInRange(c.date);
                const disabled = isDisabled(c.date);
                return (
                  <Pressable
                    key={c.key}
                    disabled={disabled}
                    onPress={() => pick(c.date!)}
                    style={[
                      styles.dayCell,
                      styles.dayBtn,
                      inRange && styles.dayInRange,
                      selected && styles.daySelected,
                      disabled && styles.dayDisabled,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        inRange && !selected && styles.dayTextHighlight,
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
            <View style={styles.footer}>
              <Pressable onPress={() => setOpen(false)} style={styles.footerBtn}>
                <Text style={styles.footerGhost}>Huỷ</Text>
              </Pressable>
              <Pressable onPress={apply} style={styles.footerBtn}>
                <Text style={styles.footerPrimary}>Áp dụng</Text>
              </Pressable>
            </View>
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
  triggerText: { fontSize: typography.fontSize.body, color: colors.text },
  chevron: { color: colors.textSecondary, fontSize: typography.fontSize.sm },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  sheetTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    textAlign: 'center',
  },
  phaseHint: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: typography.fontWeight.medium,
  },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navBtn: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  navText: { fontSize: typography.fontSize['2xl'], color: colors.primary, fontWeight: typography.fontWeight.semibold },
  monthTitle: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: colors.text },
  weekRow: { flexDirection: 'row', justifyContent: 'space-around' },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  dayBtn: { borderRadius: radius.full },
  dayInRange: { backgroundColor: colors.primaryMuted },
  daySelected: { backgroundColor: colors.primary },
  dayDisabled: { opacity: 0.35 },
  dayText: { fontSize: typography.fontSize.sm, color: colors.text },
  dayTextHighlight: { color: colors.primary, fontWeight: typography.fontWeight.semibold },
  dayTextSelected: { color: colors.surface, fontWeight: typography.fontWeight.semibold },
  dayTextDisabled: { color: colors.textSecondary },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  footerBtn: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg },
  footerGhost: { color: colors.textSecondary, fontSize: typography.fontSize.base },
  footerPrimary: { color: colors.primary, fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold },
});
