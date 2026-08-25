/**
 * @CODE-MEMORY
 * Screen:     /settings?tab=pay-salary-formulas · /payroll tab Công thức lương
 * UC:         FR-UC-BP-PAY-02 · AC-PAY-FORMULA-SETTINGS-01
 * BR:         Công thức lương = gộp mã TP + toán tử (chip UI); lưu hyperformula_v1 + ui blob
 * Purpose:    List chip expression + dialog token builder; expand TP formulas → HF lines on save.
 * WorkItem:   PO-HRM-SETTINGS-PAY-COMPOSITE-UI-01
 * Callers:    Settings.tsx · Payroll.tsx (tab formulas)
 * must_keep:  payroll_e2e_ready=false; cấm FE evaluate net
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  PayFormulaEditorDialog,
  type FormulaEditorInitial,
  type PayFormulaTargetStatus,
} from '@/components/settings/payroll/PayFormulaEditorDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useHrmOperatingUnitFilter } from '@/contexts/HrmOperatingUnitFilterContext';
import { useSalaryComponentsEffective } from '@/hooks/useSalaryComponentsEffective';
import { isAbortLikeError, toErrorMessage } from '@/lib/apiError';
import {
  buildHyperFormulaFromComponentComposite,
  extractVarKeysFromHyperFormulaLines,
  formatPayFormulaReadableSummary,
  isValidPayFormulaCodeFormat,
  normalizePayFormulaCode,
  payFormulaStatusLabel,
  readOpaqueExpressionText,
  readPayFormulaComponentTokens,
  validateComponentCompositeExpression,
  type PayFormulaComponentToken,
} from '@/lib/payFormulaCatalog';
import {
  createPayFormula,
  listPayFormulas,
  publishPayFormula,
  retirePayFormula,
  submitPayFormulaPublish,
  updatePayFormula,
  withdrawPayFormulaPublish,
  type HrmPayFormulaRecord,
} from '@/integrations/hrmApi';

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-[12px] shadow-sm border border-gray-100 p-6 ${className}`}>
    {children}
  </div>
);

type FormulaRow = {
  id: string;
  name: string;
  description: string;
  status: string;
  tokens: PayFormulaComponentToken[];
  expression: string;
  readableSummary: string;
  isLegacyOpaque: boolean;
  legacyText: string;
  updatedAt: string;
};

async function applyPayFormulaTargetStatus(
  record: HrmPayFormulaRecord,
  targetStatus: PayFormulaTargetStatus,
  companyId: string,
): Promise<HrmPayFormulaRecord> {
  let current = record;
  const cur = String(current.status ?? 'draft').trim().toLowerCase();
  if (targetStatus === cur) return current;

  if (targetStatus === 'draft' && cur === 'pending_publish') {
    return withdrawPayFormulaPublish(current.id, companyId);
  }

  if (targetStatus === 'pending_publish' && cur === 'draft') {
    return submitPayFormulaPublish(current.id, companyId);
  }

  if (targetStatus === 'active') {
    if (cur === 'draft') {
      current = await submitPayFormulaPublish(current.id, companyId);
    }
    if (String(current.status ?? '').trim().toLowerCase() === 'pending_publish') {
      return publishPayFormula(current.id, companyId);
    }
  }

  return current;
}

export const PayFormulaSettingsPanel = () => {
  const { currentCompanyId } = useAuth();
  const { listCompanyId } = useHrmOperatingUnitFilter();
  const companyId = (listCompanyId || currentCompanyId || '').trim() || null;

  const { componentOptions, items: salaryComponents, isLoading: varsLoading } =
    useSalaryComponentsEffective();

  const componentLabelMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const opt of componentOptions) {
      m.set(opt.value.toUpperCase(), opt.label);
    }
    return m;
  }, [componentOptions]);

  const componentFormulaMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const row of salaryComponents) {
      const code = String(row.code ?? '').trim().toUpperCase();
      if (!code) continue;
      const formula = String((row as { formula?: string }).formula ?? '').trim();
      m.set(code, formula);
    }
    return m;
  }, [salaryComponents]);

  const knownCodes = useMemo(
    () => componentOptions.map((o) => o.value),
    [componentOptions],
  );

  const [rawRecords, setRawRecords] = useState<HrmPayFormulaRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFormula, setEditingFormula] = useState<FormulaEditorInitial | null>(null);

  const mapRecordToRow = useCallback(
    (row: HrmPayFormulaRecord): FormulaRow => {
      const composite = readPayFormulaComponentTokens(row.expressionJson, componentLabelMap);
      const opaque = readOpaqueExpressionText(row.expressionJson);
      const isLegacyOpaque = !composite && Boolean(opaque.expressionText.trim());
      const readableSummary = formatPayFormulaReadableSummary(
        row.expressionJson,
        componentLabelMap,
        componentFormulaMap,
      );

      return {
        id: row.id,
        name: row.code,
        description: row.label ?? '',
        status: String(row.status ?? 'draft'),
        tokens: composite?.tokens ?? [],
        expression: composite?.expression ?? opaque.expressionText,
        readableSummary,
        isLegacyOpaque,
        legacyText: opaque.expressionText.trim(),
        updatedAt: row.updatedAt?.slice(0, 10) ?? row.createdAt?.slice(0, 10) ?? '—',
      };
    },
    [componentLabelMap, componentFormulaMap],
  );

  const formulas = useMemo(
    () =>
      rawRecords.map((row) => mapRecordToRow(row)),
    [rawRecords, mapRecordToRow],
  );

  const reloadFormulas = useCallback(async () => {
    if (!companyId) {
      setRawRecords([]);
      return;
    }
    setLoading(true);
    try {
      const res = await listPayFormulas({ company_id: companyId });
      setRawRecords(res.items.filter((r) => r.status !== 'retired'));
    } catch (err) {
      toast.error(toErrorMessage(err, 'Không tải được danh sách công thức.'));
      setRawRecords([]);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    if (!companyId) {
      setRawRecords([]);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    void (async () => {
      try {
        const res = await listPayFormulas({ company_id: companyId }, { signal: controller.signal });
        setRawRecords(res.items.filter((r) => r.status !== 'retired'));
      } catch (err) {
        if (isAbortLikeError(err)) return;
        toast.error(toErrorMessage(err, 'Không tải được danh sách công thức.'));
        setRawRecords([]);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    })();
    return () => controller.abort();
  }, [companyId]);

  const handleOpenNew = () => {
    setEditingFormula(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (f: FormulaRow) => {
    setEditingFormula({
      id: f.id,
      name: f.name,
      description: f.description,
      tokens: f.tokens,
      storedExpression: f.expression,
      readableSummary: f.readableSummary || f.legacyText,
      status: f.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!companyId) {
      toast.error('Vui lòng chọn công ty.');
      return;
    }
    try {
      await retirePayFormula(id, companyId);
      toast.success('Đã ngừng sử dụng công thức.');
      await reloadFormulas();
    } catch (err) {
      toast.error(toErrorMessage(err, 'Không thể xóa công thức.'));
    }
  };

  const handleSaveFormula = async (payload: {
    id?: string;
    name: string;
    description: string;
    tokens: PayFormulaComponentToken[];
    expression: string;
    targetStatus: PayFormulaTargetStatus;
  }) => {
    if (!companyId) {
      toast.error('Vui lòng chọn công ty.');
      return;
    }
    const code = normalizePayFormulaCode(payload.name);
    if (!code) {
      toast.error('Vui lòng nhập mã công thức.');
      return;
    }
    if (!isValidPayFormulaCodeFormat(code)) {
      toast.error('Mã công thức không hợp lệ (vd: formula_lx_tai).');
      return;
    }

    const exprError = validateComponentCompositeExpression(payload.expression, knownCodes);
    if (exprError) {
      toast.error(exprError);
      return;
    }

    const { expressionJson, lines } = buildHyperFormulaFromComponentComposite({
      expression: payload.expression,
      tokens: payload.tokens,
      componentFormulas: componentFormulaMap,
    });
    const keys = extractVarKeysFromHyperFormulaLines(lines);
    const requiredVarsJson = { keys };

    setSaving(true);
    try {
      let saved: HrmPayFormulaRecord;
      if (payload.id) {
        saved = await updatePayFormula(payload.id, {
          company_id: companyId,
          label: payload.description || code,
          expressionJson,
          requiredVarsJson,
        });
      } else {
        saved = await createPayFormula({
          company_id: companyId,
          code,
          label: payload.description || code,
          expressionJson,
          requiredVarsJson,
        });
      }

      const beforeStatus = String(saved.status ?? 'draft').toLowerCase();
      saved = await applyPayFormulaTargetStatus(saved, payload.targetStatus, companyId);
      const afterStatus = String(saved.status ?? '').toLowerCase();

      if (payload.targetStatus === 'active' && afterStatus !== 'active') {
        toast.success(
          payload.id ? 'Cập nhật công thức thành công!' : 'Thêm công thức mới thành công!',
        );
        toast.message('Chưa phát hành được', {
          description:
            afterStatus === 'pending_publish'
              ? 'Công thức đang chờ phát hành — cần người khác bấm Phát hành (dual-control).'
              : 'Trạng thái hiện tại: ' + payFormulaStatusLabel(afterStatus),
        });
      } else if (beforeStatus !== afterStatus) {
        toast.success(
          `${payload.id ? 'Cập nhật' : 'Thêm'} công thức — ${payFormulaStatusLabel(afterStatus)}`,
        );
      } else {
        toast.success(payload.id ? 'Cập nhật công thức thành công!' : 'Thêm công thức mới thành công!');
      }

      setIsDialogOpen(false);
      await reloadFormulas();
    } catch (err) {
      toast.error(toErrorMessage(err, 'Không lưu được công thức.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Danh sách Công thức lương</h2>
          <p className="text-sm text-gray-500 mt-1">
            Gộp các <strong>thành phần lương</strong> đã định nghĩa bằng phép tính (+, −, ×, ÷).
          </p>
        </div>
        <Button onClick={handleOpenNew} className="bg-blue-600 hover:bg-blue-700 rounded-lg">
          + Thêm công thức
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-gray-500">
              <th className="px-4 py-3 font-medium">Tên công thức / Mô tả</th>
              <th className="px-4 py-3 font-medium">Biểu thức (Expression)</th>
              <th className="px-4 py-3 font-medium w-28">Trạng thái</th>
              <th className="px-4 py-3 font-medium w-32">Cập nhật</th>
              <th className="px-4 py-3 font-medium w-24 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading || varsLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  Đang tải...
                </td>
              </tr>
            ) : formulas.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  Chưa có công thức nào.
                </td>
              </tr>
            ) : (
              formulas.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50 transition-colors align-top">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-900">{f.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{f.description || '—'}</div>
                  </td>
                  <td className="px-4 py-3">
                    {f.isLegacyOpaque ? (
                      <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 font-mono break-all">
                        {f.legacyText || '—'}
                      </div>
                    ) : f.tokens.length > 0 ? (
                      <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                        {f.tokens.map((t, idx) => (
                          <span
                            key={idx}
                            className={`px-1.5 py-0.5 rounded ${
                              t.type === 'var'
                                ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                : 'bg-gray-100 text-gray-700 font-bold'
                            }`}
                          >
                            {t.label}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="font-mono text-xs text-gray-600">{f.expression || '—'}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {payFormulaStatusLabel(f.status)}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{f.updatedAt}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(f)}
                      className="text-blue-600 hover:text-blue-800 font-medium mr-3"
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(f.id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isDialogOpen && (
        <PayFormulaEditorDialog
          open={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSave={handleSaveFormula}
          initialData={editingFormula}
          componentOptions={componentOptions}
          saving={saving}
        />
      )}
    </Card>
  );
};
