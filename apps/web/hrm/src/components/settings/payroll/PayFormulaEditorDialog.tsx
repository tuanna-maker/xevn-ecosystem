/**
 * @CODE-MEMORY
 * Screen:     Dialog công thức lương — gộp từ thành phần lương + toán tử
 * UC:         FR-UC-BP-PAY-02 · AC-PAY-FORMULA-SETTINGS-01
 * BR:         TP = mã catalog; công thức lương = LUONG_CHINH + PC_XE - BHXH (chip builder)
 * Purpose:    UI 2 cột (metadata | biểu thức + tìm TP); parent expand → hyperformula_v1 khi lưu Nest.
 * WorkItem:   PO-HRM-SETTINGS-PAY-COMPOSITE-UI-01
 * Callers:    PayFormulaSettingsPanel
 * must_keep:  payroll_e2e_ready=false; vars từ useSalaryComponentsEffective
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SettingsDialogSelectContent } from '@/components/settings/SettingsDialogSelectContent';
import { cn } from '@/lib/utils';
import type { PayFormulaComponentToken } from '@/lib/payFormulaCatalog';
import {
  PAY_FORMULA_STATUS_LABELS,
  payFormulaStatusLabel,
  tokensToComponentExpression,
} from '@/lib/payFormulaCatalog';

export type FormulaEditorInitial = {
  id?: string;
  name?: string;
  description?: string;
  tokens?: PayFormulaComponentToken[];
  status?: string;
};

export type PayFormulaTargetStatus = 'draft' | 'pending_publish' | 'active';

type ComponentOption = { label: string; value: string };

type PayFormulaEditorDialogProps = {
  open: boolean;
  onClose: () => void;
  onSave: (payload: {
    id?: string;
    name: string;
    description: string;
    tokens: PayFormulaComponentToken[];
    expression: string;
    targetStatus: PayFormulaTargetStatus;
  }) => void | Promise<void>;
  initialData?: FormulaEditorInitial | null;
  componentOptions?: ComponentOption[];
  saving?: boolean;
};

const OPERATORS = ['+', '-', '*', '/', '(', ')'] as const;

const TARGET_STATUSES: PayFormulaTargetStatus[] = ['draft', 'pending_publish', 'active'];

const COMPONENT_SEARCH_LIMIT = 12;

function normalizeTargetStatus(raw: string | null | undefined): PayFormulaTargetStatus {
  const s = String(raw ?? 'draft').trim().toLowerCase();
  if (s === 'pending_publish' || s === 'active') return s;
  return 'draft';
}

function filterComponentOptions(options: ComponentOption[], query: string): ComponentOption[] {
  const q = query.trim().toLowerCase();
  if (!q) return options.slice(0, COMPONENT_SEARCH_LIMIT);
  if (q.length < 2) return options.slice(0, COMPONENT_SEARCH_LIMIT);
  return options
    .filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        opt.value.toLowerCase().includes(q) ||
        q.split(/\s+/).some((part) => part.length > 1 && opt.label.toLowerCase().includes(part)),
    )
    .slice(0, 24);
}

export function PayFormulaEditorDialog({
  open,
  onClose,
  onSave,
  initialData = null,
  componentOptions = [],
  saving = false,
}: PayFormulaEditorDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tokens, setTokens] = useState<PayFormulaComponentToken[]>([]);
  const [targetStatus, setTargetStatus] = useState<PayFormulaTargetStatus>('draft');
  const [componentQuery, setComponentQuery] = useState('');

  const currentStatus = initialData?.status ? String(initialData.status).toLowerCase() : 'draft';
  const statusLocked = currentStatus === 'active' || currentStatus === 'retired';

  useEffect(() => {
    if (!open) return;
    setName(initialData?.name || '');
    setDescription(initialData?.description || '');
    setTokens(initialData?.tokens ? [...initialData.tokens] : []);
    setTargetStatus(normalizeTargetStatus(initialData?.status));
    setComponentQuery('');
  }, [open, initialData]);

  const filteredComponents = useMemo(
    () => filterComponentOptions(componentOptions, componentQuery),
    [componentOptions, componentQuery],
  );

  const expressionPreview = tokens.length > 0 ? tokensToComponentExpression(tokens) : '—';

  const insertVar = (opt: ComponentOption) => {
    setTokens((prev) => [
      ...prev,
      { type: 'var', label: `[${opt.label}]`, value: opt.value },
    ]);
  };

  const insertOp = (op: string) => {
    setTokens((prev) => [...prev, { type: 'op', label: op, value: op }]);
  };

  const removeLast = () => setTokens((prev) => prev.slice(0, -1));
  const clearAll = () => setTokens([]);

  const handleSave = () => {
    void onSave({
      id: initialData?.id,
      name: name.trim(),
      description: description.trim(),
      tokens,
      expression: tokensToComponentExpression(tokens),
      targetStatus,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        className="sm:max-w-[980px] w-[95vw] rounded-[16px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{initialData?.id ? 'Sửa công thức lương' : 'Thêm công thức lương'}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(280px,340px)_1fr] gap-0 py-1">
          {/* Cột trái — thông tin công thức */}
          <div className="flex flex-col gap-3 lg:pr-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Thông tin công thức
            </p>

            <div className="flex flex-col gap-2">
              <Label htmlFor="pay-formula-code" className="text-sm font-medium">
                Mã công thức <span className="text-red-500">*</span>
              </Label>
              <Input
                id="pay-formula-code"
                placeholder="VD: formula_vp_hanoi"
                value={name}
                onChange={(e) => setName(e.target.value.toLowerCase())}
                disabled={Boolean(initialData?.id)}
                data-testid="pay-formula-code-input"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="pay-formula-description" className="text-sm font-medium">
                Mô tả / Tên hiển thị
              </Label>
              <Input
                id="pay-formula-description"
                placeholder="VD: Công thức lương VP Hà Nội"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                data-testid="pay-formula-description-input"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium">Trạng thái</Label>
              {statusLocked ? (
                <Input
                  value={payFormulaStatusLabel(currentStatus)}
                  disabled
                  data-testid="pay-formula-status-readonly"
                />
              ) : (
                <Select
                  value={targetStatus}
                  onValueChange={(v) => setTargetStatus(normalizeTargetStatus(v))}
                >
                  <SelectTrigger data-testid="pay-formula-status">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SettingsDialogSelectContent>
                    {TARGET_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {PAY_FORMULA_STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SettingsDialogSelectContent>
                </Select>
              )}
              {!statusLocked && targetStatus === 'active' ? (
                <p className="text-[11px] text-amber-700 leading-snug">
                  Phát hành cần dual-control — nếu bạn là người soạn, hệ thống có thể từ chối và giữ
                  ở «Chờ phát hành».
                </p>
              ) : null}
            </div>

            <p className="text-[11px] text-muted-foreground leading-snug pt-2 border-t border-gray-100">
              Ghép các <strong>thành phần lương</strong> đã có công thức trên trường dữ liệu bằng{' '}
              <strong>+ − × ÷</strong>. Ví dụ: Lương chính + Phụ cấp − Khấu trừ BHXH.
            </p>
          </div>

          {/* Cột phải — biểu thức + tìm TP */}
          <div className="flex flex-col gap-2 lg:border-l lg:border-gray-200 lg:pl-6 mt-4 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-200">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-0.5">
                Biểu thức gộp thành phần
              </p>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Chọn thành phần theo <strong>tên tiếng Việt</strong> — hệ thống tự gắn mã catalog.
              </p>
            </div>

            <div className="min-h-[72px] p-3 bg-white border border-gray-200 rounded-md flex flex-wrap gap-2 items-start text-sm leading-relaxed shadow-inner">
              {tokens.length === 0 ? (
                <span className="text-gray-400 italic text-xs">
                  Chưa có thành phần. Tìm và chọn bên dưới…
                </span>
              ) : (
                tokens.map((t, idx) => (
                  <span
                    key={idx}
                    className={cn(
                      'px-2 py-1 rounded inline-flex items-center justify-center text-xs',
                      t.type === 'var'
                        ? 'bg-blue-100 text-blue-800 font-medium'
                        : 'bg-gray-200 text-gray-800 font-bold',
                    )}
                  >
                    {t.label}
                  </span>
                ))
              )}
            </div>

            <p className="text-[10px] text-gray-500 font-mono truncate" title={expressionPreview}>
              Mã lưu: {expressionPreview}
            </p>

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={removeLast} disabled={tokens.length === 0}>
                Xóa phần tử cuối
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="text-red-600"
                disabled={tokens.length === 0}
              >
                Xóa tất cả
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  value={componentQuery}
                  onChange={(e) => setComponentQuery(e.target.value)}
                  placeholder="Tìm: lương cơ bản, LUONG_CO_BAN…"
                  className="pl-9 h-9 text-sm"
                  aria-label="Tìm thành phần lương"
                  autoComplete="off"
                  spellCheck={false}
                  data-testid="pay-formula-component-search"
                />
              </div>
              <div className="flex flex-wrap items-center gap-1 shrink-0">
                {OPERATORS.map((op) => (
                  <button
                    key={op}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => insertOp(op)}
                    className="h-7 w-7 rounded border bg-white font-bold text-xs hover:bg-gray-100"
                  >
                    {op}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-md border border-gray-200 bg-gray-50/80 p-2 max-h-[7.5rem] overflow-y-auto">
              {componentOptions.length === 0 ? (
                <p className="text-xs text-amber-700 px-1">
                  Chưa có TP trong Nest — thêm tại tab Thành phần lương trước.
                </p>
              ) : filteredComponents.length === 0 ? (
                <p className="text-xs text-muted-foreground italic px-1">
                  Không tìm thấy — thử &quot;lương&quot;, &quot;phụ cấp&quot;, &quot;LUONG&quot;…
                </p>
              ) : (
                <div>
                  {!componentQuery.trim() ? (
                    <p className="text-[10px] font-semibold text-gray-500 mb-1">Thành phần hay dùng</p>
                  ) : (
                    <p className="text-[10px] font-semibold text-blue-700 mb-1">Kết quả tìm kiếm</p>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {filteredComponents.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => insertVar(opt)}
                        title={`Mã: ${opt.value}`}
                        className="text-left rounded-md border border-blue-200 bg-white hover:bg-blue-50 shadow-sm px-2 py-1 text-[11px]"
                      >
                        <span className="font-medium text-blue-900">{opt.label}</span>
                        <span className="text-[10px] text-gray-400 font-mono block">{opt.value}</span>
                      </button>
                    ))}
                  </div>
                  {!componentQuery.trim() && componentOptions.length > COMPONENT_SEARCH_LIMIT ? (
                    <p className="text-[10px] text-muted-foreground mt-1.5">
                      Gõ tên hoặc mã để tìm thêm ({componentOptions.length} TP trong catalog).
                    </p>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving} className="rounded-lg">
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 rounded-lg"
            data-testid="pay-formula-save"
          >
            {saving ? 'Đang lưu...' : 'Lưu công thức'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
