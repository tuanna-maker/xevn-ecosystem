/**
 * @CODE-MEMORY
 * Screen:     EmployeeFormDialog — «Quản lý trực tiếp» (UC-H01 tab Vị trí)
 * UC:         FR-UC-H01 · FR-UC-H03
 * BR:         BR-LEAVE-MGR-02 · BR-WF-04 (≠ self) · U65 no seed · U72 display-ready label
 * SRS:        docs/qa/evidence/r-spine-mgr-hier-01.md §3 Option B
 * TechSpec:   employees.manager_id self-ref · L1 direct_manager
 * Purpose:    Typeahead chọn QL trực tiếp → persist manager_id (UUID); nhãn CODE — Tên, không lộ raw UUID.
 * WorkItem:   R-SPINE-MGR-HIER-01-FE
 * Coded:      2026-08-03
 * Callers:    EmployeeFormDialog
 * Callees:    useEmployeePickerSearch · getEmployeeById · formatEmployeePickerLabel
 * must_keep:  LeaveOverviewRecentPanel / leave approve UX; SoftDel form mount; exclude self
 * SOLID:      Presentational picker — write path stays in mutations
 * LastVerified: EmployeeFormDialog.mount-guard.test.ts · hdsdMutateTestIds.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-EMP-A
 * change_mode: UPGRADE
 * What: Placeholder/clear row → text-xevn-textMuted / textSecondary (ADR §8)
 * Why: E07 form remaster; pale ban on picker chrome
 
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-EMP-B
 * change_mode: UPGRADE
 * What: Labels/empty → text-xevn-textSecondary; purple AI chrome → xevn primary/accent
 * Why: ADR-20260805 §8–§10 · inventory W3-EMP-B
 * must_keep: SoftDel; navigate employees/:id; stub honesty; no Nest/seed; no OCR/QR invent
 * ADR: docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md
 */
import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronsUpDown, Loader2, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { getEmployeeById, type HrmEmployeeRecord } from '@/integrations/hrmApi';
import { formatEmployeePickerLabel } from '@/lib/employeePickerLabel';
import {
  useDebouncedPickerKeyword,
  useEmployeePickerSearch,
} from '@/hooks/useEmployeePicker';
import { HDSD_MUTATE_TEST_IDS } from '@/lib/hdsdMutateTestIds';

const CLEAR_VALUE = '__clear_manager__';

export type EmployeeManagerPickerProps = {
  companyId: string | null | undefined;
  value: string | null | undefined;
  /** Editing self — never offer as manager (BR-WF-04 / cycle guard UX). */
  excludeEmployeeId?: string | null;
  onValueChange: (managerId: string | null) => void;
  enabled?: boolean;
  disabled?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  /** Display-ready hint from parent (BE manager_label / prior selection). */
  selectedLabelHint?: string | null;
  className?: string;
};

function labelFor(row: HrmEmployeeRecord): string {
  return formatEmployeePickerLabel(row);
}

export function EmployeeManagerPicker({
  companyId,
  value,
  excludeEmployeeId,
  onValueChange,
  enabled = true,
  disabled,
  placeholder = 'Chọn quản lý trực tiếp…',
  searchPlaceholder = 'Tìm mã hoặc tên nhân viên…',
  selectedLabelHint,
  className,
}: EmployeeManagerPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const debounced = useDebouncedPickerKeyword(query, 300);

  const {
    employees,
    isFetching,
    isLoading,
  } = useEmployeePickerSearch({
    companyId,
    keyword: debounced,
    enabled: Boolean(companyId) && enabled && (open || Boolean(value)),
    status: 'active',
  });

  const selectedId = value?.trim() || null;

  const { data: selectedRow } = useQuery({
    queryKey: ['employee-manager-selected', selectedId, companyId ?? null],
    queryFn: async (): Promise<HrmEmployeeRecord | null> => {
      if (!selectedId || !companyId) return null;
      return getEmployeeById(selectedId, [companyId]);
    },
    enabled: Boolean(selectedId && companyId && enabled),
    staleTime: 60_000,
  });

  const options = useMemo(() => {
    const exclude = excludeEmployeeId?.trim().toLowerCase() ?? '';
    const map = new Map<string, HrmEmployeeRecord>();
    for (const row of employees) {
      if (exclude && row.id.toLowerCase() === exclude) continue;
      map.set(row.id, row);
    }
    if (selectedRow && !(exclude && selectedRow.id.toLowerCase() === exclude)) {
      map.set(selectedRow.id, selectedRow);
    }
    return [...map.values()];
  }, [employees, excludeEmployeeId, selectedRow]);

  const selectedLabel = useMemo(() => {
    if (!selectedId) return null;
    if (selectedLabelHint?.trim()) return selectedLabelHint.trim();
    const fromOptions = options.find((r) => r.id === selectedId);
    if (fromOptions) return labelFor(fromOptions);
    if (selectedRow) return labelFor(selectedRow);
    return null;
  }, [options, selectedId, selectedLabelHint, selectedRow]);

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const loading = isLoading || isFetching;

  return (
    <div className={cn('flex w-full items-center gap-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label={placeholder}
            disabled={disabled || !companyId}
            data-testid={HDSD_MUTATE_TEST_IDS.employeeFormManagerPicker}
            className={cn(
              'h-10 w-full justify-between rounded-input border-xevn-border font-normal',
              !selectedLabel && 'text-xevn-textMuted',
            )}
          >
            <span
              className={cn(
                'truncate text-left',
                selectedLabel ? 'text-xevn-text' : 'text-xevn-textMuted',
              )}
            >
              {selectedLabel ?? placeholder}
            </span>
            {loading && open ? (
              <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin opacity-50" />
            ) : (
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={searchPlaceholder}
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              <CommandEmpty>
                {loading ? 'Đang tải…' : 'Không có nhân viên khớp'}
              </CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value={CLEAR_VALUE}
                  onSelect={() => {
                    onValueChange(null);
                    setOpen(false);
                  }}
                >
                  <X className="mr-2 h-4 w-4 opacity-60" />
                  <span className="text-xevn-textSecondary">Không chọn quản lý</span>
                </CommandItem>
                {options.map((emp) => {
                  const label = labelFor(emp);
                  return (
                    <CommandItem
                      key={emp.id}
                      value={emp.id}
                      onSelect={() => {
                        onValueChange(emp.id);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          selectedId === emp.id ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      <span className="truncate">{label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
