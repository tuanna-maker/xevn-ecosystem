/**
 * @CODE-MEMORY
 * Screen:     Dialog công thức lương — gộp từ thành phần lương + toán tử
 * UC:         FR-UC-BP-PAY-02 · AC-PAY-FORMULA-SETTINGS-01
 * BR:         TP = mã catalog; công thức lương = LUONG_CHINH + PC_XE - BHXH (chip builder)
 * Purpose:    UI gốc token/chip; parent expand → hyperformula_v1 khi lưu Nest.
 * WorkItem:   PO-HRM-SETTINGS-PAY-COMPOSITE-UI-01
 * Callers:    PayFormulaSettingsPanel
 * must_keep:  payroll_e2e_ready=false; vars từ useSalaryComponentsEffective
 */
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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

function normalizeTargetStatus(raw: string | null | undefined): PayFormulaTargetStatus {
  const s = String(raw ?? 'draft').trim().toLowerCase();
  if (s === 'pending_publish' || s === 'active') return s;
  return 'draft';
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

  const currentStatus = initialData?.status ? String(initialData.status).toLowerCase() : 'draft';
  const statusLocked = currentStatus === 'active' || currentStatus === 'retired';

  useEffect(() => {
    if (!open) return;
    setName(initialData?.name || '');
    setDescription(initialData?.description || '');
    setTokens(initialData?.tokens ? [...initialData.tokens] : []);
    setTargetStatus(normalizeTargetStatus(initialData?.status));
  }, [open, initialData]);

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
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{initialData?.id ? 'Sửa công thức lương' : 'Thêm công thức lương'}</DialogTitle>
          <DialogDescription>
            Ghép các <strong>thành phần lương</strong> (đã có công thức trên trường dữ liệu) bằng{' '}
            <strong>+ − × ÷</strong>. Ví dụ: Lương chính + Phụ cấp − Khấu trừ BHXH.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Mã công thức</Label>
              <Input
                placeholder="VD: formula_lx_tai"
                value={name}
                onChange={(e) => setName(e.target.value.toLowerCase())}
                disabled={Boolean(initialData?.id)}
              />
            </div>
            <div className="space-y-2">
              <Label>Mô tả / Tên hiển thị</Label>
              <Input
                placeholder="VD: Lương lái xe tải"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Trạng thái</Label>
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
                  Phát hành cần dual-control — nếu bạn là người soạn, hệ thống có thể từ chối và
                  giữ ở «Chờ phát hành».
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2 border rounded-md p-4 bg-gray-50">
            <Label className="text-gray-700">Biểu thức gộp thành phần</Label>
            <div className="min-h-[100px] p-3 bg-white border border-gray-200 rounded-md flex flex-wrap gap-2 items-start font-mono text-sm leading-relaxed shadow-inner">
              {tokens.length === 0 ? (
                <span className="text-gray-400 italic">
                  Chưa có thành phần. Chọn TP và toán tử bên dưới…
                </span>
              ) : (
                tokens.map((t, idx) => (
                  <span
                    key={idx}
                    className={`px-2 py-1 rounded inline-flex items-center justify-center
                      ${t.type === 'var' ? 'bg-blue-100 text-blue-700 font-semibold' : 'bg-gray-200 text-gray-800 font-bold'}`}
                  >
                    {t.label}
                  </span>
                ))
              )}
            </div>
            <p className="text-xs text-gray-500 font-mono">
              {tokens.length > 0 ? tokensToComponentExpression(tokens) : '—'}
            </p>
            <div className="flex justify-end mt-2 gap-2">
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
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-2">
              <Label className="text-sm font-semibold text-gray-600">Thành phần lương</Label>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2 content-start">
                {componentOptions.length === 0 ? (
                  <p className="text-xs text-amber-700">
                    Chưa có TP trong Nest — thêm tại tab Thành phần lương trước.
                  </p>
                ) : (
                  componentOptions.map((v) => (
                    <button
                      key={v.value}
                      type="button"
                      onClick={() => insertVar(v)}
                      className="text-xs bg-white border border-blue-200 text-blue-700 px-3 py-1.5 rounded-full hover:bg-blue-50 transition-colors shadow-sm"
                    >
                      {v.label}
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-600">Toán tử</Label>
              <div className="grid grid-cols-3 gap-2">
                {OPERATORS.map((op) => (
                  <button
                    key={op}
                    type="button"
                    onClick={() => insertOp(op)}
                    className="text-sm font-bold bg-gray-100 border border-gray-300 text-gray-800 h-10 rounded hover:bg-gray-200 shadow-sm"
                  >
                    {op}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-blue-600">
            {saving ? 'Đang lưu...' : 'Lưu công thức'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
