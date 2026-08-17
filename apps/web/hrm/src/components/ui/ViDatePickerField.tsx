/**
 * @CODE-MEMORY
 * Screen:     Shared HRM date entry + calendar picker (modal-safe)
 * UC:         UC-UX-DATE-02 · FR-HRM-AT-14 (sheet period) · company founded_date
 * BR:         BR-UX-DATE-01 · BR-UX-DATE-02 · BR-FID-DATE-01..04 · VAL-ATT-PER-01..04
 * SRS:        docs/program/UX_VI_DATE_NUMBER_FORMAT_AC.md §3 · FR-HRM-AT-14
 * TechSpec:   docs/hrm/TECHSPEC.md §12.1 · §14.4 · CreateAttendanceSheetDto @IsDateString
 * ADR:        docs/architecture/ADR-HRM-DATE-WIRE-YYYY-MM-DD-20260722.md (Accepted — wire YYYY-MM-DD only)
 * Purpose:    Nhập ngày vi-VN dd/MM/yyyy (chấp nhận d/M/yyyy) + mở Popover Calendar trong Dialog;
 *             value/onValueChange luôn ISO yyyy-MM-dd zero-pad cho API (parseViDisplayToIsoDate).
 * WorkItem:   FID-P0-FE-DATE-01
 * Coded:      2026-07-22
 * Callers:    Attendance.tsx (tạo bảng chấm công) · CompanyManagement founded_date
 * Callees:    ViDateField → @xevn/ui parseViDisplayToIsoDate · Calendar · Popover
 * FEActions:  Gõ ngày → pad ISO · Click lịch → chọn ngày → ISO · Popover modal=true trong Dialog
 * must_keep:  Payload API = YYYY-MM-DD padded (ADR — không gửi dd/MM); header-only sheets; không nới BE
 * SOLID:      Wrapper ghép text SoT + picker; không nhân bản parse
 * LastVerified: src/components/ui/__tests__/viDatePickerField.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-03
 * WorkItem: W1-B-02-EMP-FE-PROFILE-01
 * change_mode: ADD (restore transitive)
 * What: Khôi phục ViDatePickerField kèm ViDateField (stash 43c479a)
 * must_keep: ISO YYYY-MM-DD · Employees list · FE-LIBS-01 · Fleet
 * LastVerified: docs/qa/evidence/w1b-02-emp-fe-profile-01.md
 */

import { format, isValid, parseISO } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ViDateField, type ViDateFieldProps } from '@/components/ui/ViDateField';
import { cn } from '@/lib/utils';

export type ViDatePickerFieldProps = ViDateFieldProps & {
  /** Disable future dates (company founded_date). */
  disableFuture?: boolean;
  /** Optional aria label for calendar trigger. */
  calendarAriaLabel?: string;
};

function isoToCalendarDate(iso: string | undefined): Date | undefined {
  if (!iso || !String(iso).trim()) return undefined;
  const d = parseISO(String(iso).trim());
  return isValid(d) ? d : undefined;
}

/**
 * Date field: text dd/MM/yyyy + Calendar popover. Store remains ISO yyyy-MM-dd.
 */
export function ViDatePickerField({
  value,
  onValueChange,
  className,
  disableFuture = false,
  calendarAriaLabel = 'Chọn ngày trên lịch',
  disabled,
  ...props
}: ViDatePickerFieldProps) {
  const selected = isoToCalendarDate(value);

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <ViDateField
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        className="flex-1 min-w-0"
        {...props}
      />
      <Popover modal>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0"
            disabled={disabled}
            aria-label={calendarAriaLabel}
          >
            <CalendarIcon className="h-4 w-4 opacity-70" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-background" align="end">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(d) => {
              onValueChange(d && isValid(d) ? format(d, 'yyyy-MM-dd') : '');
            }}
            disabled={
              disableFuture
                ? (date) => date > new Date()
                : undefined
            }
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
