/**
 * Công thức thành phần lương — chọn trường dữ liệu bằng tiếng Việt (không cần biết mã DB).
 *
 * Ghi chú kỹ thuật (DEF-PAY-FIELD-SEARCH-FOCUS-01):
 * Radix FocusScope refocus khi picker thêm `<button>` — chip dùng div; khôi phục focus search.
 */
import { memo, useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormulaInput } from '@/components/payroll/FormulaInput';
import {
  payDataFieldsForFormulaInput,
  searchPayDataFields,
  suggestPayFormulaQuickInserts,
  type PayAttendanceUnit,
  type PayDataFieldItem,
  type PayFormulaQuickInsert,
} from '@/lib/payDataFieldCatalog';

const OPERATORS = ['+', '-', '*', '/', '(', ')'] as const;

type PayDataFieldFormulaInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  variant?: 'default' | 'sidebar';
  attendanceUnit?: PayAttendanceUnit;
};

function insertAtFormula(
  current: string,
  insert: string,
  textarea: HTMLTextAreaElement | null,
): string {
  const raw = current ?? '';
  const start = textarea?.selectionStart ?? raw.length;
  const end = textarea?.selectionEnd ?? raw.length;
  const before = raw.slice(0, start);
  const after = raw.slice(end);

  let prefix = before;
  let token = insert;

  if (!raw.trim()) {
    return insert.startsWith('=') ? insert : `=${insert}`;
  }

  if (!prefix.startsWith('=')) {
    prefix = `=${prefix}`;
  }

  const isOperator = OPERATORS.includes(token as (typeof OPERATORS)[number]);
  const needsSpace =
    prefix.length > 1 &&
    !prefix.endsWith(' ') &&
    !prefix.endsWith('(') &&
    !prefix.endsWith('+') &&
    !prefix.endsWith('-') &&
    !prefix.endsWith('*') &&
    !prefix.endsWith('/') &&
    !token.startsWith(')');

  if (needsSpace && !isOperator) {
    token = ` ${token}`;
  }

  return `${prefix}${token}${after}`;
}

function FieldChip({
  field,
  compact,
  onPick,
}: {
  field: PayDataFieldItem;
  compact?: boolean;
  onPick: (key: string) => void;
}) {
  return (
    <div
      role="button"
      tabIndex={-1}
      title={`${field.sourceHint} · mã: ${field.key}`}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => onPick(field.key)}
      className={cn(
        'cursor-pointer text-left rounded-md border border-emerald-200 bg-white hover:bg-emerald-50 shadow-sm',
        compact ? 'px-2 py-1 text-[11px]' : 'px-2.5 py-1.5 text-xs',
      )}
    >
      <span className="font-medium text-emerald-900">{field.label}</span>
      {!compact ? (
        <span className="text-[10px] text-gray-400 font-mono block">{field.key}</span>
      ) : null}
    </div>
  );
}

function QuickInsertChip({
  item,
  onPick,
}: {
  item: PayFormulaQuickInsert;
  onPick: (insert: string) => void;
}) {
  return (
    <div
      role="button"
      tabIndex={-1}
      title={item.hint}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => onPick(item.insert)}
      className="cursor-pointer text-left rounded-md border border-amber-200 bg-amber-50/80 px-2 py-1 text-[11px] hover:bg-amber-100"
    >
      <span className="font-medium text-amber-900">{item.label}</span>
      <span className="text-[10px] text-amber-700/80 font-mono block">{item.insert}</span>
    </div>
  );
}

const PayFieldSearchPanel = memo(function PayFieldSearchPanel({
  onPick,
  onPickOperator,
  attendanceUnit,
  isSidebar,
  searchClassName,
}: {
  onPick: (token: string) => void;
  onPickOperator: (op: string) => void;
  attendanceUnit: PayAttendanceUnit;
  isSidebar: boolean;
  searchClassName?: string;
}) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const searchFocusedRef = useRef(false);
  const fieldLimit = isSidebar ? 10 : 999;

  const filtered = useMemo(
    () => searchPayDataFields(query, fieldLimit),
    [query, fieldLimit],
  );
  const quickInserts = useMemo(
    () => suggestPayFormulaQuickInserts(query, attendanceUnit).slice(0, isSidebar ? 3 : 4),
    [query, attendanceUnit, isSidebar],
  );

  /** Sau khi picker cập nhật, Radix có thể cướp focus — khôi phục nếu user đang gõ search. */
  useLayoutEffect(() => {
    if (!searchFocusedRef.current || !inputRef.current) return;
    const el = inputRef.current;
    if (document.activeElement === el) return;
    el.focus();
    const pos = el.value.length;
    el.setSelectionRange(pos, pos);
  }, [query, filtered.length, quickInserts.length]);

  return (
    <>
      <div className={cn(isSidebar ? 'flex flex-wrap items-center gap-2' : 'space-y-3')}>
        <div className={cn('relative flex-1 min-w-[180px]', searchClassName)}>
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              searchFocusedRef.current = true;
            }}
            onBlur={() => {
              searchFocusedRef.current = false;
            }}
            placeholder="Tìm: giờ công, nghỉ phép, KPI…"
            className="pl-9 h-9 text-sm"
            aria-label="Tìm trường dữ liệu"
            autoComplete="off"
            spellCheck={false}
            data-testid="pay-field-search-input"
          />
        </div>
        {isSidebar ? (
          <div className="flex flex-wrap items-center gap-1 shrink-0">
            {OPERATORS.map((op) => (
              <button
                key={op}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onPickOperator(op)}
                className="h-7 w-7 rounded border bg-white font-bold text-xs hover:bg-gray-100"
              >
                {op}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div
        className={cn(
          'rounded-md border border-gray-200 bg-gray-50/80 p-2',
          isSidebar ? 'max-h-[7.5rem] overflow-y-auto' : 'max-h-52 overflow-y-auto space-y-3 p-3',
        )}
      >
        {quickInserts.length > 0 ? (
          <div className={cn(isSidebar ? 'mb-2' : 'mb-3')}>
            <p className="text-[10px] font-semibold text-amber-800 mb-1">
              Quy đổi buổi / ngày (từ giờ chấm công)
            </p>
            <div className="flex flex-wrap gap-1">
              {quickInserts.map((item) => (
                <QuickInsertChip key={item.id} item={item} onPick={onPick} />
              ))}
            </div>
          </div>
        ) : null}

        {filtered.length === 0 ? (
          <p className="text-xs text-muted-foreground italic px-1">
            Không tìm thấy trường — thử &quot;giờ công&quot;, &quot;nghỉ phép&quot;, &quot;KPI&quot;…
          </p>
        ) : (
          <div>
            {!query.trim() && isSidebar ? (
              <p className="text-[10px] font-semibold text-gray-500 mb-1">Trường hay dùng</p>
            ) : null}
            <div className="flex flex-wrap gap-1">
              {filtered.map((field) => (
                <FieldChip key={field.id} field={field} compact={isSidebar} onPick={onPick} />
              ))}
            </div>
            {isSidebar && !query.trim() ? (
              <p className="text-[10px] text-muted-foreground mt-1.5">
                Gõ từ khóa để tìm thêm (vd. nghỉ phép, doanh thu, phụ cấp…)
              </p>
            ) : null}
          </div>
        )}
      </div>
    </>
  );
});

export const PayDataFieldFormulaInput = memo(function PayDataFieldFormulaInput({
  value,
  onChange,
  placeholder = '=Chọn trường bên dưới hoặc gõ công thức…',
  className,
  variant = 'default',
  attendanceUnit = 'hours',
}: PayDataFieldFormulaInputProps) {
  const isSidebar = variant === 'sidebar';
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const formulaOptions = useMemo(() => payDataFieldsForFormulaInput(), []);

  const insertTokenRef = useRef<(token: string) => void>(() => {});
  insertTokenRef.current = (token: string) => {
    const next = insertAtFormula(value, token, textareaRef.current);
    onChange(next);
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  const onPickField = useCallback((token: string) => {
    insertTokenRef.current(token);
  }, []);

  const onPickOperator = useCallback((op: string) => {
    insertTokenRef.current(op);
  }, []);

  return (
    <div className={cn(isSidebar ? 'space-y-2' : 'space-y-3', className)}>
      <PayFieldSearchPanel
        onPick={onPickField}
        onPickOperator={onPickOperator}
        attendanceUnit={attendanceUnit}
        isSidebar={isSidebar}
        searchClassName={!isSidebar ? 'max-w-md w-full' : undefined}
      />

      {!isSidebar ? (
        <div className="flex flex-wrap items-center gap-2">
          <Label className="text-xs text-muted-foreground shrink-0">Phép tính:</Label>
          {OPERATORS.map((op) => (
            <button
              key={op}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onPickOperator(op)}
              className="h-8 w-8 rounded border bg-white font-bold text-sm hover:bg-gray-100"
            >
              {op}
            </button>
          ))}
        </div>
      ) : null}

      <FormulaInput
        value={value}
        onChange={onChange}
        availableComponents={formulaOptions}
        placeholder={placeholder}
        className={cn('font-mono text-sm', isSidebar && '[&_textarea]:min-h-[56px]')}
        textareaRef={textareaRef}
      />

      {!isSidebar ? (
        <p className="text-xs text-muted-foreground">
          Bạn chỉ cần chọn <strong>tên tiếng Việt</strong>; hệ thống tự chèn mã trường.
        </p>
      ) : null}
    </div>
  );
});
