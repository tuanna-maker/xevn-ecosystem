/**
 * Công thức thành phần lương — chọn trường dữ liệu bằng tiếng Việt (không cần biết mã DB).
 *
 * Ghi chú kỹ thuật (DEF-PAY-FIELD-SEARCH-FOCUS-01):
 * Radix FocusScope refocus khi picker thêm `<button>` — chip dùng div; khôi phục focus search.
 */
import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormulaInput } from '@/components/payroll/FormulaInput';
import {
  payDataFieldsForFormulaInput,
  searchPayFormulaPickerFields,
  suggestPayFormulaQuickInserts,
  type PayAttendanceUnit,
  type PayDataFieldItem,
  type PayFormulaPickerSearchOpts,
  type PayFormulaQuickInsert,
} from '@/lib/payDataFieldCatalog';
import {
  bracketLabelForFormulaField,
  buildPayFormulaDisplayLabelMap,
  formatSalaryFormulaDisplayText,
  parseSalaryFormulaDisplayText,
} from '@/lib/payFormulaCatalog';

const OPERATORS = ['+', '-', '*', '/', '(', ')'] as const;

type PayDataFieldFormulaInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  variant?: 'default' | 'sidebar';
  attendanceUnit?: PayAttendanceUnit;
  /** Biến bổ sung từ Nest salary_components (formula → tên TP). */
  extraVarHints?: readonly { code: string; name: string }[];
  /** Thành phần lương Nest — tìm theo tên/mã (LUONG_CO_BAN). */
  salaryComponentHints?: PayFormulaPickerSearchOpts['salaryComponents'];
};

function normalizePrefixBeforeFieldInsert(prefix: string): string {
  let p = prefix;
  // Xóa ký tự đang gõ để tìm (vd. "l" trước khi chọn chip đầy đủ)
  p = p.replace(/[a-zA-Z_][a-zA-Z0-9_]*$/, '');
  // Xóa đoạn [ chưa đóng ngoặc
  p = p.replace(/\[[^\]]*$/, '');
  return p;
}

function insertAtFormula(
  current: string,
  insert: string,
  textarea: HTMLTextAreaElement | null,
  append = false,
): string {
  const raw = current ?? '';
  const start = append ? raw.length : (textarea?.selectionStart ?? raw.length);
  const end = append ? raw.length : (textarea?.selectionEnd ?? raw.length);
  let before = raw.slice(0, start);
  const after = raw.slice(end);

  const isOperator = OPERATORS.includes(insert as (typeof OPERATORS)[number]);
  const isFieldToken = insert.startsWith('[');
  if (isFieldToken) {
    before = normalizePrefixBeforeFieldInsert(before);
  }

  let prefix = before;
  let token = insert;

  if (!raw.trim()) {
    return insert.startsWith('=') ? insert : `=${insert}`;
  }

  if (!prefix.startsWith('=')) {
    prefix = `=${prefix}`;
  }

  const needsSpace =
    prefix.length > 1 &&
    !prefix.endsWith(' ') &&
    !prefix.endsWith('(') &&
    !prefix.endsWith('+') &&
    !prefix.endsWith('-') &&
    !prefix.endsWith('*') &&
    !prefix.endsWith('/') &&
    !token.startsWith(')') &&
    !isOperator;

  if (needsSpace) {
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
  onPick: (field: PayDataFieldItem) => void;
}) {
  const isSalaryComponent = field.group === 'salary_component';
  return (
    <div
      role="button"
      tabIndex={-1}
      title={`${field.sourceHint} · mã: ${field.key}`}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => onPick(field)}
      className={cn(
        'cursor-pointer text-left rounded-md border bg-white shadow-sm',
        isSalaryComponent
          ? 'border-blue-200 hover:bg-blue-50'
          : 'border-emerald-200 hover:bg-emerald-50',
        compact ? 'px-2 py-1 text-[11px]' : 'px-2.5 py-1.5 text-xs',
      )}
    >
      <span className={cn('font-medium', isSalaryComponent ? 'text-blue-900' : 'text-emerald-900')}>
        {field.label}
      </span>
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
  onPickQuickInsert,
  onPickOperator,
  attendanceUnit,
  isSidebar,
  searchClassName,
  pickerSearchOpts,
}: {
  onPick: (field: PayDataFieldItem) => void;
  onPickQuickInsert: (insert: string) => void;
  onPickOperator: (op: string) => void;
  attendanceUnit: PayAttendanceUnit;
  isSidebar: boolean;
  searchClassName?: string;
  pickerSearchOpts?: PayFormulaPickerSearchOpts;
}) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const searchFocusedRef = useRef(false);
  const fieldLimit = isSidebar ? 10 : 999;

  const filtered = useMemo(
    () => searchPayFormulaPickerFields(query, fieldLimit, pickerSearchOpts),
    [query, fieldLimit, pickerSearchOpts],
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
            placeholder="Tìm: giờ công, lương cơ bản, LUONG_CO_BAN…"
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
                <QuickInsertChip key={item.id} item={item} onPick={onPickQuickInsert} />
              ))}
            </div>
          </div>
        ) : null}

        {filtered.length === 0 ? (
          <p className="text-xs text-muted-foreground italic px-1">
            Không tìm thấy — thử &quot;giờ công&quot;, &quot;lương cơ bản&quot;, &quot;LUONG_CO_BAN&quot;…
          </p>
        ) : (
          <div>
            {!query.trim() && isSidebar ? (
              <p className="text-[10px] font-semibold text-gray-500 mb-1">Trường hay dùng</p>
            ) : null}
            {query.trim() && filtered.some((f) => f.group === 'salary_component') ? (
              <p className="text-[10px] font-semibold text-blue-700 mb-1">Thành phần lương</p>
            ) : null}
            <div className="flex flex-wrap gap-1">
              {filtered.map((field) => (
                <FieldChip key={field.id} field={field} compact={isSidebar} onPick={onPick} />
              ))}
            </div>
            {isSidebar && !query.trim() ? (
              <p className="text-[10px] text-muted-foreground mt-1.5">
                Gõ tên thành phần lương hoặc trường dữ liệu (vd. lương cơ bản, nghỉ phép…)
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
  extraVarHints,
  salaryComponentHints,
}: PayDataFieldFormulaInputProps) {
  const isSidebar = variant === 'sidebar';
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const pickerSearchOpts = useMemo<PayFormulaPickerSearchOpts>(
    () => ({
      extraVarHints,
      salaryComponents: salaryComponentHints,
    }),
    [extraVarHints, salaryComponentHints],
  );
  const formulaOptions = useMemo(
    () => payDataFieldsForFormulaInput(pickerSearchOpts),
    [pickerSearchOpts],
  );

  const labelMap = useMemo(
    () => buildPayFormulaDisplayLabelMap(pickerSearchOpts),
    [pickerSearchOpts],
  );
  const [displayValue, setDisplayValue] = useState(() =>
    formatSalaryFormulaDisplayText(value, labelMap),
  );
  const displayValueRef = useRef(displayValue);
  displayValueRef.current = displayValue;
  const editingRef = useRef(false);
  const suppressBlurUntilRef = useRef(0);

  useEffect(() => {
    if (editingRef.current) return;
    const formatted = formatSalaryFormulaDisplayText(value, labelMap);
    if (formatted === displayValueRef.current) return;
    displayValueRef.current = formatted;
    setDisplayValue(formatted);
  }, [value, labelMap]);

  const syncToParent = useCallback(
    (nextDisplay: string) => {
      const source = parseSalaryFormulaDisplayText(nextDisplay, labelMap, pickerSearchOpts);
      displayValueRef.current = nextDisplay;
      setDisplayValue(nextDisplay);
      editingRef.current = true;
      onChange(source);
    },
    [labelMap, onChange, pickerSearchOpts],
  );

  const insertTokenRef = useRef<(token: string) => void>(() => {});
  insertTokenRef.current = (token: string) => {
    suppressBlurUntilRef.current = Date.now() + 500;
    editingRef.current = true;
    const nextDisplay = insertAtFormula(displayValueRef.current, token, textareaRef.current, true);
    syncToParent(nextDisplay);
  };

  const onPickField = useCallback((field: PayDataFieldItem) => {
    insertTokenRef.current(bracketLabelForFormulaField(field.label));
  }, []);

  const onPickQuickInsert = useCallback((insert: string) => {
    insertTokenRef.current(insert);
  }, []);

  const onPickOperator = useCallback((op: string) => {
    insertTokenRef.current(op);
  }, []);

  const handleDisplayChange = useCallback(
    (nextDisplay: string) => {
      editingRef.current = true;
      displayValueRef.current = nextDisplay;
      setDisplayValue(nextDisplay);
      const source = parseSalaryFormulaDisplayText(nextDisplay, labelMap, pickerSearchOpts);
      onChange(source);
    },
    [labelMap, onChange, pickerSearchOpts],
  );

  const handleFormulaBlur = useCallback(() => {
    if (Date.now() < suppressBlurUntilRef.current) return;
    editingRef.current = false;
    const source = parseSalaryFormulaDisplayText(displayValueRef.current, labelMap, pickerSearchOpts);
    const formatted = formatSalaryFormulaDisplayText(source, labelMap);
    displayValueRef.current = formatted;
    setDisplayValue(formatted);
    onChange(source);
  }, [labelMap, onChange, pickerSearchOpts]);

  const formatInsertToken = useCallback(
    (item: { code: string; name: string }) => bracketLabelForFormulaField(item.name),
    [],
  );

  return (
    <div className={cn(isSidebar ? 'space-y-2' : 'space-y-3', className)}>
      <PayFieldSearchPanel
        onPick={onPickField}
        onPickQuickInsert={onPickQuickInsert}
        onPickOperator={onPickOperator}
        attendanceUnit={attendanceUnit}
        isSidebar={isSidebar}
        searchClassName={!isSidebar ? 'max-w-md w-full' : undefined}
        pickerSearchOpts={pickerSearchOpts}
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
        value={displayValue}
        onChange={handleDisplayChange}
        validationValue={value}
        disableAutocomplete
        availableComponents={formulaOptions}
        placeholder={placeholder}
        className={cn('text-sm', isSidebar && '[&_textarea]:min-h-[56px]')}
        textareaRef={textareaRef}
        formatInsertToken={formatInsertToken}
        onFocus={() => {
          editingRef.current = true;
        }}
        onBlur={handleFormulaBlur}
      />

      {!isSidebar ? (
        <p className="text-xs text-muted-foreground">
          Công thức hiển thị <strong>tên tiếng Việt</strong>; hệ thống tự lưu mã trường khi bạn lưu
          thành phần.
        </p>
      ) : (
        <p className="text-[10px] text-muted-foreground leading-snug">
          Hiển thị tên tiếng Việt — lưu Nest vẫn là mã biến (<span className="font-mono">base_salary</span>…).
        </p>
      )}
    </div>
  );
});
