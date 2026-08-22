/**
 * @CODE-MEMORY
 * Screen:     Shared CatalogSearchPicker (combo + search)
 * UC:         AC-HRM-PICKER-01 · BR-HRM-MD-01
 * BR:         BR-HRM-MD-01 — chỉ chọn catalog; cấm free-text SoT
 * SRS:        docs/client-delivery/hrm/SRS_HRM_KHACH_DELTA_CAI_DAT_20260723.md §0.1 AC-HRM-PICKER-01
 * TechSpec:   docs/hrm/TECHSPEC.md §18.1
 * Purpose:    Ô chọn danh mục: mở list → gõ lọc mã/tên → chọn lưu code/id; empty/loading/error rõ.
 * WorkItem:   D-HRM-SETTINGS-MD-CRUD-FE-01
 * Coded:      2026-07-23
 * Callers:    EmployeeFormDialog · LeaveTab · Decisions · JobRequisitionsTab · AddInsuranceDialog · InsurancePolicyMasterPanel
 * Callees:    filterCatalogPickerOptions · resolveCatalogPickerSelection · cmdk Command
 * Impact:     Select không search khi >10 item → FAIL AC
 * must_keep:  Persist value = option.value (code/id); không Input text SoT; BH insurer/type empty CTA
 * SOLID:      Presentational — options from parent
 * LastVerified: catalogSearchPicker.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-MVP-GD1-PAY-02-CLUSTER-FE-BROWSER-01
 * change_mode: UPGRADE
 * What: cmdk item pointerdown select · catalog-picker-search testid · onSelect always binds opt.value
 * Why: Playwright J-HRM-PAY-02-02 CatalogSearchPicker vs fill harness
 * must_keep: value = option.value; không free-text SoT
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 D-PO-HRM-CTR-PICKER-INLINE-PORTAL-01
 * change_mode: UPGRADE
 * What: searchPlacement inline — list + catalog-picker-option-* dưới ô tìm (không chỉ Popover); combobox testid
 * Why: DEF-CTR-PICKER-INLINE-PORTAL-P1 — parent-portal CC Playwright không click option trong popover
 * must_keep: persist value=option.value; popover mode không đổi hành vi
 *
 * @CODE-MEMORY-CHANGE 2026-08-01 D-HDSD-MUTATE-FE-DEPS-02
 * change_mode: ADD
 * What: Reconstruct component (+ data-testid forward) after Vite 500 on :8088
 * Why: QA SMOKE-02 — AddInsuranceDialog / InsurancePolicyMasterPanel resolve fail
 * must_keep: SoftDel menu isolation · BH policy_id picker · TC-041 · U65 no seed
 */

import { useMemo, useState, type ReactNode } from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
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
import {
  filterCatalogPickerOptions,
  resolveCatalogPickerSelection,
  type CatalogPickerOption,
} from '@/lib/catalogSearchPicker';

export type CatalogSearchPickerProps = {
  options: readonly CatalogPickerOption[];
  value: string | null | undefined;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  loading?: boolean;
  errorText?: string;
  /** Link / hint when catalog empty (Settings). */
  emptyHint?: ReactNode;
  className?: string;
  triggerClassName?: string;
  id?: string;
  'aria-label'?: string;
  /** HDSD / QA harness (forwarded to trigger). */
  'data-testid'?: string;
  /** Inline search stays under picker root (CC parent-portal QA + HDSD). */
  searchPlacement?: 'popover' | 'inline';
  hideEmptyStateBox?: boolean;
};

const UUID_LIKE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function displayCodeForOption(opt: CatalogPickerOption): string | null {
  const code = (opt.code ?? '').trim();
  if (!code || code === opt.value.trim()) return null;
  if (UUID_LIKE.test(code) || UUID_LIKE.test(opt.value)) return null;
  return code;
}

function cmdkItemValue(opt: CatalogPickerOption): string {
  const label = opt.label.trim();
  return label.length > 0 ? `${label} ${opt.value}` : opt.value;
}

export function CatalogSearchPicker({
  options,
  value,
  onValueChange,
  placeholder = 'Chọn từ danh mục…',
  searchPlaceholder = 'Tìm theo mã hoặc tên…',
  emptyText = 'Không có mục khớp',
  disabled,
  loading,
  errorText,
  emptyHint,
  className,
  triggerClassName,
  id,
  'aria-label': ariaLabel,
  'data-testid': dataTestId,
  searchPlacement = 'popover',
  hideEmptyStateBox,
}: CatalogSearchPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selected = useMemo(
    () => resolveCatalogPickerSelection(options, value),
    [options, value],
  );

  const filtered = useMemo(
    () => filterCatalogPickerOptions(options, query),
    [options, query],
  );

  if (loading) {
    return (
      <div
        className={cn(
          'flex h-10 w-full items-center gap-2 rounded-input border border-xevn-border px-3 text-sm text-muted-foreground',
          className,
        )}
        role="status"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        Đang tải danh mục…
      </div>
    );
  }

  if (errorText) {
    return (
      <div
        className={cn(
          'rounded-input border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive',
          className,
        )}
        role="alert"
      >
        {errorText}
      </div>
    );
  }

  if (options.length === 0 && !hideEmptyStateBox) {
    return (
      <div
        className={cn(
          'space-y-2 rounded-input border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950',
          className,
        )}
        role="status"
      >
        <p>Chưa có mục trong danh mục — mở Cài đặt Nhân sự để đồng bộ hoặc thêm mục.</p>
        {emptyHint}
      </div>
    );
  }

  const comboboxTestId =
    dataTestId != null && dataTestId.length > 0 ? `${dataTestId}-combobox` : 'catalog-picker-combobox';
  const searchTestId =
    dataTestId != null && dataTestId.length > 0 ? `${dataTestId}-search` : 'catalog-picker-search';

  const pickOption = (opt: CatalogPickerOption) => {
    onValueChange(opt.value);
    setOpen(false);
    if (searchPlacement !== 'inline') setQuery('');
  };

  const renderOptionItems = () =>
    filtered.map((opt) => (
      <CommandItem
        key={opt.value}
        value={cmdkItemValue(opt)}
        data-testid={`catalog-picker-option-${opt.value}`}
        data-value={opt.value}
        className="cursor-pointer"
        onSelect={() => pickOption(opt)}
        onPointerDown={(e) => {
          e.preventDefault();
          pickOption(opt);
        }}
      >
        <Check
          className={cn('mr-2 h-4 w-4', selected?.value === opt.value ? 'opacity-100' : 'opacity-0')}
        />
        {displayCodeForOption(opt) ? (
          <span className="font-mono text-xs text-muted-foreground mr-2">{displayCodeForOption(opt)}</span>
        ) : null}
        <span className="truncate">{opt.label}</span>
      </CommandItem>
    ));

  const comboboxTrigger = (
    <Button
      id={id}
      type="button"
      variant="outline"
      role="combobox"
      aria-expanded={open}
      aria-label={ariaLabel ?? placeholder}
      disabled={disabled}
      data-testid={searchPlacement === 'inline' ? comboboxTestId : dataTestId}
      className={cn(
        'h-10 w-full justify-between rounded-input border-xevn-border font-normal',
        !selected && 'text-muted-foreground',
        triggerClassName,
        searchPlacement !== 'inline' && className,
      )}
      onClick={searchPlacement === 'inline' ? () => setOpen((v) => !v) : undefined}
    >
      <span className="truncate text-left">
        {selected ? (
          <>
            {displayCodeForOption(selected) ? (
              <span className="font-mono text-xs text-muted-foreground mr-1.5">
                {displayCodeForOption(selected)}
              </span>
            ) : null}
            {selected.label}
          </>
        ) : (
          placeholder
        )}
      </span>
      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
    </Button>
  );

  const showInlineList = open || query.trim().length > 0;

  if (searchPlacement === 'inline') {
    return (
      <div className={cn('space-y-1', className)} data-testid={dataTestId}>
        {comboboxTrigger}
        <Command shouldFilter={false} className="rounded-input border border-xevn-border bg-background">
          <CommandInput
            placeholder={searchPlaceholder}
            value={query}
            onValueChange={(next) => {
              setQuery(next);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            data-testid={searchTestId}
          />
          {showInlineList ? (
            <CommandList className="max-h-[240px] border-t border-xevn-border">
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>{renderOptionItems()}</CommandGroup>
            </CommandList>
          ) : null}
        </Command>
      </div>
    );
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery('');
      }}
    >
      <PopoverTrigger asChild>{comboboxTrigger}</PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={query}
            onValueChange={setQuery}
            data-testid={searchTestId}
          />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>{renderOptionItems()}</CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
