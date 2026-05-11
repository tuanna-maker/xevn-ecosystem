import { useMemo } from 'react';
import type { MetadataAttribute } from '@/types';
import { useXbosStore } from '@/store/useXbosStore';
import { cn } from '@/lib/cn';

export interface DynamicFormProps {
  /** Danh sách metadata (các trường bổ sung) đã sắp xếp */
  fields: MetadataAttribute[];
  /** Giá trị hiện tại — key = metadata.key */
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  tenantId: string;
  /** Mở Drawer thêm nhanh danh mục — khi field select gắn refCategoryCode */
  onQuickAddCategory?: (categoryCode: string) => void;
  disabled?: boolean;
}

/**
 * Đọc mảng metadata_config và render control tương ứng.
 * Select: ưu tiên refCategoryCode → đọc categoryItems từ store; fallback optionsJson.
 */
export function DynamicForm({
  fields,
  values,
  onChange,
  tenantId,
  onQuickAddCategory,
  disabled,
}: DynamicFormProps) {
  const getItemsByCategory = useXbosStore((s) => s.getItemsByCategory);
  const sorted = useMemo(
    () => [...fields].sort((a, b) => a.sortOrder - b.sortOrder),
    [fields]
  );

  return (
    <div className="space-y-4">
      {sorted.map((f) => (
        <div key={f.id} className="space-y-1.5">
          <label className="block text-sm font-medium text-xevn-text/90">
            {f.label}
            {(f.validationJson as { required?: boolean }).required && (
              <span className="text-red-500 ml-0.5">*</span>
            )}
          </label>
          <FieldControl
            field={f}
            value={values[f.key]}
            onChange={(v) => onChange(f.key, v)}
            tenantId={tenantId}
            getItemsByCategory={getItemsByCategory}
            onQuickAddCategory={onQuickAddCategory}
            disabled={disabled}
          />
        </div>
      ))}
    </div>
  );
}

function FieldControl({
  field,
  value,
  onChange,
  tenantId,
  getItemsByCategory,
  onQuickAddCategory,
  disabled,
}: {
  field: MetadataAttribute;
  value: unknown;
  onChange: (v: unknown) => void;
  tenantId: string;
  getItemsByCategory: (code: string, tid: string) => { id: string; code: string; label: string }[];
  onQuickAddCategory?: (code: string) => void;
  disabled?: boolean;
}) {
  const base =
    'w-full rounded-xl border border-black/[0.06] bg-white/80 px-3 py-2.5 text-sm shadow-sm outline-none transition focus:ring-2 focus:ring-xevn-primary/25';

  switch (field.dataType) {
    case 'text':
      return (
        <input
          type="text"
          className={base}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      );
    case 'number':
      return (
        <input
          type="number"
          className={base}
          value={value === undefined || value === null ? '' : Number(value)}
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
          disabled={disabled}
        />
      );
    case 'date':
      return (
        <input
          type="date"
          className={base}
          value={typeof value === 'string' ? value.slice(0, 10) : ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      );
    case 'boolean':
      // Boolean không có "danh sách lựa chọn" như select.
      // Nhãn bật/tắt có thể được cấu hình trong metadata.validationJson.
      const trueLabel =
        (field.validationJson as { trueLabel?: string; true_label?: string })
          .trueLabel ?? (field.validationJson as { trueLabel?: string; true_label?: string }).true_label ?? 'Bật';
      const falseLabel =
        (field.validationJson as { falseLabel?: string; false_label?: string })
          .falseLabel ?? (field.validationJson as { falseLabel?: string; false_label?: string }).false_label ?? 'Tắt';
      return (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="rounded border-black/20 text-xevn-primary focus:ring-xevn-primary/30"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
          />
          <span className="text-sm text-xevn-muted">
            {Boolean(value) ? trueLabel : falseLabel}
          </span>
        </label>
      );
    case 'select': {
      const fromDna = field.refCategoryCode
        ? getItemsByCategory(field.refCategoryCode, tenantId).map((i) => ({
            value: i.code,
            label: `${i.label} (${i.code})`,
          }))
        : field.optionsJson ?? [];

      return (
        <div className="flex gap-2">
          <select
            className={cn(base, 'flex-1 appearance-none')}
            value={String(value ?? '')}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
          >
            <option value="">— Chọn —</option>
            {fromDna.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {field.refCategoryCode && onQuickAddCategory && (
            <button
              type="button"
              onClick={() => onQuickAddCategory(field.refCategoryCode!)}
              className="shrink-0 rounded-xl border border-xevn-primary/20 bg-xevn-primary/5 px-3 text-sm font-medium text-xevn-primary hover:bg-xevn-primary/10"
              title="Thêm nhanh danh mục"
            >
              +
            </button>
          )}
        </div>
      );
    }
    default:
      return null;
  }
}
