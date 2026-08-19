/**
 * @CODE-MEMORY
 * Screen:     /payroll · tab Công thức lương (GĐ1 form — không DnD)
 * UC:         FR-UC-BP-PAY-02 · AC-PAY-FORMULA-01..05
 * BR:         Option A dual-control · DV-18 · immutable active · R-PAY-DD-01 Form GĐ1
 * SRS:        docs/program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md §4 · §7
 * TechSpec:   ADR-HRM-4-PILLAR-API-BOUNDARY.md §10 Option A · ADR-HRM-DYNAMIC-CONFIG-PLATFORM FormSchema GĐ1
 * API_DESIGN: F-PAY-FORMULA-AUTHOR/PUBLISH/LIST/PREVIEW
 * DB_DESIGN:  pay_formula_definitions (Nest ensureSchema)
 * Purpose:    List + soạn bản nháp gd1_eval_v1 + gửi phát hành + dual-control + preview Nest (200/412).
 * WorkItem:   PO-HRM-PAYROLL-FORMULA-RUN-GAP-FE-01
 * Coded:      2026-08-07
 * Callers:    pages/Payroll.tsx tab formulas
 * Callees:    hrmApi formulas* · payFormulaCatalog · toErrorMessage
 * FEActions:  | Thao tác | Handler | API |
 *             | Tải danh sách | loadFormulas | GET /payroll/formulas |
 *             | Lưu nháp | onSaveDraft | POST/PUT /payroll/formulas |
 *             | Gửi phát hành | onSubmitPublish | POST …/submit-publish |
 *             | Phát hành | onPublish | POST …/publish (403-DUAL nếu tự phát hành) |
 *             | Rút lại | onWithdraw | POST …/withdraw-publish |
 *             | Phiên bản mới | onNewVersion | POST …/:code/versions |
 *             | Xem trước | onPreview | POST …/preview → 200 compute hoặc 412 honest |
 *             | Ngừng | onRetire | POST …/retire |
 * Impact:     Thiếu form GĐ1 → QC residual R-PAY-FE-FORM; FE evaluate net → vi phạm OS28
 * must_keep:  payroll_e2e_ready=false · cấm FE engine · cấm DnD · cấm salary_components.formula SoT
 * SOLID:      Panel owns formula author UX; SalaryComponentsTab giữ catalog TP riêng
 * solid_convention_ack: FE–BE — display-ready bind; serialize gd1_eval_v1; không FE formula engine / net calc
 * LastVerified: docs/qa/evidence/po-hrm-payroll-formula-run-gap-fe-eval-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-PAYROLL-FORMULA-RUN-GAP-FE-EVAL-01
 * change_mode: ADD
 * What: Form lines → expression_json form=gd1_eval_v1; preview Nest 200/412; override bag UI; giữ dual-control/immutable
 * must_keep: không FE evaluate · payroll_e2e_ready=false · opaque legacy vẫn đọc được
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-CNS-FE-01
 * change_mode: ADD
 * What: Formula line component_code → Nest CatalogSearchPicker (soft warn VAL-PAY-CNS-07);
 *       Nest empty → empty picker + VI; DENY claim formula LIVE.
 * Why: BA-01 S-PAY-CNS-05 · Option B
 * must_keep: payroll_e2e_ready=false · cấm FE engine · no DnD
 *
 * @CODE-MEMORY-CHANGE 2026-08-10
 * WorkItem: PO-HRM-MVP-GD1-PAY-02-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: AC-PAY-COMP-01 hard block alien component_code when Nest catalog >0;
 *       preview lines[] table (componentCode + amountVnd vi-VN display-only);
 *       must_keep PAY01QC1 · payroll_e2e_ready=false · ≠ PAY-02 DONE
 * Why: API-01 §5 · BA O8/O10 · J-HRM-PAY-02-04/06
 * must_keep: dual-control · immutable · cấm FE net · cấm DnD GĐ2
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-MVP-GD1-PAY-02-CLUSTER-FE-BROWSER-01
 * change_mode: UPGRADE
 * What: onSeedLinesFromVars align Nest catalog codes; cmdk picker QA testids (SalaryComponentsTab)
 * Why: J-HRM-PAY-02-01..04 browser — COMP-01 block + CatalogSearchPicker harness
 * must_keep: PAY02QC1 seals · payroll_e2e_ready=false · assertComp01 retained
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Eye,
  Plus,
  RefreshCw,
  Save,
  Send,
  ShieldCheck,
  Trash2,
  Undo2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useHrmOperatingUnitFilter } from '@/contexts/HrmOperatingUnitFilterContext';
import { CatalogSearchPicker } from '@/components/common/CatalogSearchPicker';
import { useSalaryComponentsEffective } from '@/hooks/useSalaryComponentsEffective';
import {
  PAY_SALARY_COMPONENT_EMPTY_NEST_HINT,
  collectAlienNestSalaryComponentCodes,
  comp01RejectMessageVi,
} from '@/lib/salaryComponentCatalog';
import {
  createPayFormula,
  createPayFormulaVersion,
  listPayFormulas,
  previewPayFormula,
  publishPayFormula,
  retirePayFormula,
  submitPayFormulaPublish,
  updatePayFormula,
  withdrawPayFormulaPublish,
  type HrmPayFormulaRecord,
} from '@/integrations/hrmApi';
import { ApiClientError, toErrorMessage } from '@/lib/apiError';
import {
  buildGd1EvalV1ExpressionJson,
  countSerializableGd1EvalLines,
  defaultGd1EvalLinesFromVars,
  alignGd1EvalLinesToNestCatalog,
  emptyGd1EvalLineDraft,
  extractRequiredVarKeys,
  formatPayFormulaDisplay,
  formatPayFormulaMoneyVi,
  isAllowedPayFormulaRequiredVarKey,
  isPayFormulaDraftEditable,
  isPayFormulaImmutableStatus,
  isValidPayFormulaCodeFormat,
  normalizePayFormulaCode,
  normalizePayFormulaPreviewLines,
  parsePreviewVariableOverrides,
  PAY_FORMULA_EVAL_FORM,
  PAY_FORMULA_EVAL_OP_LABELS,
  PAY_FORMULA_EVAL_OPS,
  PAY_FORMULA_EVAL_SIGN_LABELS,
  PAY_FORMULA_EVAL_SIGNS,
  PAY_FORMULA_EVAL_SOURCE_LABELS,
  PAY_FORMULA_EVAL_SOURCES,
  PAY_FORMULA_REQUIRED_VAR_STARTER,
  PAYROLL_E2E_READY_HONESTY,
  payFormulaRequiredVarLabel,
  payFormulaStatusLabel,
  readGd1EvalV1Expression,
  type Gd1EvalLineDraft,
  type Gd1EvalOp,
  type Gd1EvalSign,
  type Gd1EvalSource,
} from '@/lib/payFormulaCatalog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type FormState = {
  code: string;
  label: string;
  note: string;
  lines: Gd1EvalLineDraft[];
  requiredKeys: string[];
  customVar: string;
  effectiveFrom: string;
  effectiveTo: string;
  /** Override số cho Nest preview — FE không tính net. */
  previewOverrides: Record<string, string>;
  legacyOpaqueHint: string;
};

const emptyForm = (): FormState => ({
  code: '',
  label: '',
  note: '',
  lines: defaultGd1EvalLinesFromVars(['payable_hours', 'base_salary']),
  requiredKeys: ['payable_hours', 'base_salary'],
  customVar: '',
  effectiveFrom: '',
  effectiveTo: '',
  previewOverrides: { base_salary: '8000000' },
  legacyOpaqueHint: '',
});

type PreviewOk = {
  gross?: number;
  net?: number;
  deduction?: number;
  lines?: unknown[];
  warnings?: unknown[];
  payroll_e2e_ready?: boolean;
};

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    case 'pending_publish':
      return 'bg-amber-50 text-amber-900 border-amber-200';
    case 'retired':
      return 'bg-slate-100 text-slate-600 border-slate-200';
    default:
      return 'bg-sky-50 text-sky-900 border-sky-200';
  }
}

export function PayFormulaAuthorPanel() {
  const { currentCompanyId } = useAuth();
  const { listCompanyId } = useHrmOperatingUnitFilter();
  const companyId = listCompanyId || currentCompanyId;

  const {
    componentOptions: nestComponentOptions,
    hasEffectiveCatalog: nestCatalogReady,
    softWarnForCode,
    isLoading: nestCatalogLoading,
  } = useSalaryComponentsEffective();

  const [items, setItems] = useState<HrmPayFormulaRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editing, setEditing] = useState<HrmPayFormulaRecord | null>(null);
  const [previewMsg, setPreviewMsg] = useState<string | null>(null);
  const [previewCode, setPreviewCode] = useState<string | null>(null);
  const [previewOk, setPreviewOk] = useState<PreviewOk | null>(null);

  const loadFormulas = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await listPayFormulas({
        company_id: companyId,
        q: q.trim() || undefined,
      });
      setItems(res.items);
    } catch (err) {
      setError(toErrorMessage(err, 'Không tải được danh sách công thức lương.'));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [companyId, q]);

  useEffect(() => {
    void loadFormulas();
  }, [loadFormulas]);

  const draftEditable = !editing || isPayFormulaDraftEditable(editing.status);
  const immutable = editing ? isPayFormulaImmutableStatus(editing.status) : false;

  const selectedKeysLabel = useMemo(
    () => form.requiredKeys.map((k) => payFormulaRequiredVarLabel(k)).join(' · '),
    [form.requiredKeys],
  );

  const onPickRow = (row: HrmPayFormulaRecord) => {
    setEditing(row);
    setPreviewMsg(null);
    setPreviewCode(null);
    setPreviewOk(null);
    const parsed = readGd1EvalV1Expression(row.expressionJson);
    const requiredKeys = extractRequiredVarKeys(row.requiredVarsJson);
    const lines =
      parsed.lines.length > 0
        ? parsed.lines
        : defaultGd1EvalLinesFromVars(requiredKeys.length ? requiredKeys : ['base_salary']);
    const previewOverrides: Record<string, string> = {};
    for (const k of requiredKeys) {
      if (k === 'base_salary') previewOverrides[k] = '8000000';
      else if (k.includes('hours')) previewOverrides[k] = '176';
      else previewOverrides[k] = '';
    }
    setForm({
      code: row.code,
      label: row.label ?? '',
      note: parsed.note,
      lines,
      requiredKeys,
      customVar: '',
      effectiveFrom: row.effectiveFrom?.slice(0, 10) ?? '',
      effectiveTo: row.effectiveTo?.slice(0, 10) ?? '',
      previewOverrides,
      legacyOpaqueHint: parsed.isEvalV1
        ? ''
        : parsed.opaqueExpressionText
          ? `Bản cũ opaque (form≠${PAY_FORMULA_EVAL_FORM}) — lưu lại sẽ serialize gd1_eval_v1. Gợi ý cũ: ${parsed.opaqueExpressionText.slice(0, 120)}`
          : `Bản cũ không phải ${PAY_FORMULA_EVAL_FORM} — lưu lại để phát dialect staged.`,
    });
  };

  const onResetForm = () => {
    setEditing(null);
    setForm(emptyForm());
    setPreviewMsg(null);
    setPreviewCode(null);
    setPreviewOk(null);
  };

  const toggleRequiredKey = (key: string, checked: boolean) => {
    setForm((prev) => {
      const set = new Set(prev.requiredKeys);
      if (checked) set.add(key);
      else set.delete(key);
      const requiredKeys = [...set];
      const previewOverrides = { ...prev.previewOverrides };
      if (checked && previewOverrides[key] == null) {
        previewOverrides[key] =
          key === 'base_salary' ? '8000000' : key.includes('hours') ? '176' : '';
      }
      return { ...prev, requiredKeys, previewOverrides };
    });
  };

  const onAddCustomVar = () => {
    const key = form.customVar.trim().toLowerCase();
    if (!isAllowedPayFormulaRequiredVarKey(key)) {
      toast({
        title: 'Biến không hợp lệ',
        description:
          'Chỉ chấp nhận biến DV-18 (ATT đóng / C&B) hoặc allowance_* — không nhận Leave/OT HTTP.',
        variant: 'destructive',
      });
      return;
    }
    toggleRequiredKey(key, true);
    setForm((prev) => ({ ...prev, customVar: '' }));
  };

  const updateLine = (id: string, patch: Partial<Gd1EvalLineDraft>) => {
    setForm((prev) => ({
      ...prev,
      lines: prev.lines.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    }));
  };

  const onAddLine = () => {
    setForm((prev) => ({
      ...prev,
      lines: [
        ...prev.lines,
        emptyGd1EvalLineDraft({
          component_code: 'LINE',
          sign: 'earning',
          source: 'var',
          var: prev.requiredKeys[0] ?? 'base_salary',
        }),
      ],
    }));
  };

  const onRemoveLine = (id: string) => {
    setForm((prev) => ({
      ...prev,
      lines: prev.lines.length <= 1 ? prev.lines : prev.lines.filter((l) => l.id !== id),
    }));
  };

  const onSeedLinesFromVars = () => {
    setForm((prev) => {
      let lines = defaultGd1EvalLinesFromVars(prev.requiredKeys);
      if (nestCatalogReady && nestComponentOptions.length > 0) {
        lines = alignGd1EvalLinesToNestCatalog(lines, nestComponentOptions);
      }
      return {
        ...prev,
        lines,
        legacyOpaqueHint: '',
      };
    });
  };

  const buildExpression = () =>
    buildGd1EvalV1ExpressionJson({
      note: form.note,
      lines: form.lines,
    });

  const assertLinesReady = (): boolean => {
    if (countSerializableGd1EvalLines(form.lines) === 0) {
      toast({
        title: 'Thiếu dòng công thức',
        description: `Cần ≥1 dòng hợp lệ để serialize ${PAY_FORMULA_EVAL_FORM} (component_code + var/const/expr).`,
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const assertComp01FormulaLines = (): boolean => {
    if (!nestCatalogReady) return true;
    const aliens = collectAlienNestSalaryComponentCodes(
      form.lines.map((l) => l.component_code),
      nestComponentOptions,
      nestComponentOptions.length,
    );
    if (aliens.length === 0) return true;
    toast({
      title: 'Chặn mã lạ (AC-PAY-COMP-01)',
      description: comp01RejectMessageVi(aliens),
      variant: 'destructive',
    });
    return false;
  };

  const previewLineRows = useMemo(
    () => (previewOk?.lines ? normalizePayFormulaPreviewLines(previewOk.lines) : []),
    [previewOk?.lines],
  );

  const onSaveDraft = async () => {
    if (!companyId) {
      toast({ title: 'Thiếu phạm vi đơn vị', variant: 'destructive' });
      return;
    }
    const code = normalizePayFormulaCode(form.code);
    if (!isValidPayFormulaCodeFormat(code)) {
      toast({
        title: 'Mã công thức không hợp lệ',
        description: 'Định dạng slug a-z / số / gạch dưới — không bị chặn vì «ngoài starter».',
        variant: 'destructive',
      });
      return;
    }
    if (!form.label.trim()) {
      toast({
        title: 'Thiếu nhãn tiếng Việt',
        description: 'Bắt buộc nhãn hiển thị — không chỉ hiện raw code.',
        variant: 'destructive',
      });
      return;
    }
    if (form.requiredKeys.length === 0) {
      toast({
        title: 'Thiếu biến bắt buộc',
        description: 'Chọn ít nhất một biến DV-18 trước khi lưu / gửi phát hành.',
        variant: 'destructive',
      });
      return;
    }
    if (!assertLinesReady()) return;
    if (!assertComp01FormulaLines()) return;

    setSaving(true);
    try {
      if (editing && isPayFormulaDraftEditable(editing.status)) {
        const saved = await updatePayFormula(editing.id, {
          company_id: companyId,
          expressionJson: buildExpression(),
          requiredVarsJson: { keys: form.requiredKeys },
          label: form.label.trim(),
          effectiveFrom: form.effectiveFrom || null,
          effectiveTo: form.effectiveTo || null,
        });
        toast({
          title: 'Đã cập nhật bản nháp',
          description: formatPayFormulaDisplay(saved.code, saved.label, saved.version),
        });
        setEditing(saved);
        setForm((prev) => ({ ...prev, legacyOpaqueHint: '' }));
      } else if (editing && !isPayFormulaDraftEditable(editing.status)) {
        toast({
          title: 'Bản đã khóa',
          description: toErrorMessage(
            new ApiClientError({ code: 'HRM-PAY-FORMULA-409-IMMUTABLE' }),
            'Không sửa tại chỗ — tạo phiên bản mới.',
          ),
          variant: 'destructive',
        });
        return;
      } else {
        const saved = await createPayFormula({
          company_id: companyId,
          code,
          expressionJson: buildExpression(),
          requiredVarsJson: { keys: form.requiredKeys },
          label: form.label.trim(),
          effectiveFrom: form.effectiveFrom || undefined,
          effectiveTo: form.effectiveTo || undefined,
        });
        toast({
          title: 'Đã tạo bản nháp công thức',
          description: formatPayFormulaDisplay(saved.code, saved.label, saved.version),
        });
        setEditing(saved);
        setForm((prev) => ({ ...prev, code: saved.code, legacyOpaqueHint: '' }));
      }
      await loadFormulas();
    } catch (err) {
      toast({
        title: 'Lưu nháp thất bại',
        description: toErrorMessage(err, 'Không lưu được công thức.'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const onSubmitPublish = async () => {
    if (!companyId || !editing) return;
    if (!assertLinesReady()) return;
    if (!assertComp01FormulaLines()) return;
    setSaving(true);
    try {
      if (isPayFormulaDraftEditable(editing.status)) {
        await updatePayFormula(editing.id, {
          company_id: companyId,
          expressionJson: buildExpression(),
          requiredVarsJson: { keys: form.requiredKeys },
          label: form.label.trim() || undefined,
        });
      }
      const saved = await submitPayFormulaPublish(editing.id, companyId);
      toast({
        title: 'Đã gửi chờ phát hành',
        description: `${formatPayFormulaDisplay(saved.code, saved.label, saved.version)} — cần người khác phát hành (dual-control).`,
      });
      setEditing(saved);
      await loadFormulas();
    } catch (err) {
      toast({
        title: 'Gửi phát hành thất bại',
        description: toErrorMessage(err, 'Không gửi được công thức.'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const onPublish = async () => {
    if (!companyId || !editing) return;
    setSaving(true);
    try {
      const saved = await publishPayFormula(editing.id, companyId);
      toast({
        title: 'Đã phát hành công thức',
        description: formatPayFormulaDisplay(saved.code, saved.label, saved.version),
      });
      setEditing(saved);
      await loadFormulas();
    } catch (err) {
      const code = err instanceof ApiClientError ? err.code : undefined;
      toast({
        title:
          code === 'HRM-PAY-FORMULA-403-DUAL'
            ? 'Bị chặn dual-control'
            : 'Phát hành thất bại',
        description: toErrorMessage(err, 'Không phát hành được công thức.'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const onWithdraw = async () => {
    if (!companyId || !editing) return;
    setSaving(true);
    try {
      const saved = await withdrawPayFormulaPublish(editing.id, companyId);
      toast({ title: 'Đã rút về bản nháp', description: saved.code });
      setEditing(saved);
      await loadFormulas();
    } catch (err) {
      toast({
        title: 'Rút lại thất bại',
        description: toErrorMessage(err, 'Không rút được công thức.'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const onNewVersion = async () => {
    if (!companyId || !editing) return;
    if (!assertLinesReady()) return;
    if (!assertComp01FormulaLines()) return;
    setSaving(true);
    try {
      const saved = await createPayFormulaVersion(editing.code, {
        company_id: companyId,
        expressionJson: buildExpression(),
        requiredVarsJson: { keys: form.requiredKeys },
        label: form.label.trim() || undefined,
        effectiveFrom: form.effectiveFrom || undefined,
        effectiveTo: form.effectiveTo || undefined,
      });
      toast({
        title: 'Đã tạo phiên bản nháp mới',
        description: formatPayFormulaDisplay(saved.code, saved.label, saved.version),
      });
      onPickRow(saved);
      await loadFormulas();
    } catch (err) {
      toast({
        title: 'Tạo phiên bản thất bại',
        description: toErrorMessage(err, 'Không tạo được phiên bản mới.'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const onRetire = async () => {
    if (!companyId || !editing) return;
    const ok = window.confirm(
      `Ngừng công thức «${formatPayFormulaDisplay(editing.code, editing.label, editing.version)}»? (soft-delete)`,
    );
    if (!ok) return;
    setSaving(true);
    try {
      await retirePayFormula(editing.id, companyId);
      toast({ title: 'Đã ngừng công thức', description: editing.code });
      onResetForm();
      await loadFormulas();
    } catch (err) {
      toast({
        title: 'Ngừng thất bại',
        description: toErrorMessage(err, 'Không ngừng được công thức.'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const onPreview = async () => {
    if (!companyId || !editing) {
      toast({
        title: 'Chọn hoặc lưu bản nháp trước',
        description: 'Xem trước cần id công thức trên máy chủ.',
        variant: 'destructive',
      });
      return;
    }
    setPreviewMsg(null);
    setPreviewCode(null);
    setPreviewOk(null);
    const variableOverrides = parsePreviewVariableOverrides(form.previewOverrides);
    try {
      const res = await previewPayFormula(editing.id, {
        company_id: companyId,
        variableOverrides:
          Object.keys(variableOverrides).length > 0 ? variableOverrides : undefined,
      });
      const ready = res.payroll_e2e_ready === true;
      setPreviewOk({
        gross: typeof res.gross === 'number' ? res.gross : Number(res.gross),
        net: typeof res.net === 'number' ? res.net : Number(res.net),
        deduction: typeof res.deduction === 'number' ? res.deduction : Number(res.deduction),
        lines: Array.isArray(res.lines) ? res.lines : [],
        warnings: Array.isArray(res.warnings) ? res.warnings : [],
        payroll_e2e_ready: ready,
      });
      setPreviewCode('OK-COMPUTE');
      setPreviewMsg(
        ready
          ? 'Máy chủ trả kết quả — kiểm tra warnings (không claim LIVE nếu ready=true bất thường).'
          : 'Máy chủ đã tính staged (gd1_eval_v1) — payroll_e2e_ready=false · không phải LIVE / UAT khách.',
      );
      toast({
        title: 'Xem trước: máy chủ đã tính',
        description: `Gross ${formatPayFormulaMoneyVi(Number(res.gross))} · Net ${formatPayFormulaMoneyVi(Number(res.net))} · ready=false`,
      });
    } catch (err) {
      const code = err instanceof ApiClientError ? err.code : undefined;
      const msg = toErrorMessage(err, 'Xem trước không khả dụng.');
      setPreviewCode(code ?? 'ERROR');
      setPreviewMsg(msg);
      if (
        code === 'HRM-PAY-FORMULA-412-PREVIEW-STUB' ||
        code === 'HRM-PAY-FORMULA-412-VARS' ||
        code === 'HRM-PAY-FORMULA-412-NOT-EVALUABLE'
      ) {
        toast({
          title: 'Xem trước bị chặn (trung thực)',
          description: msg,
        });
      } else {
        toast({
          title: 'Xem trước thất bại',
          description: msg,
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <div
      className="p-6 xevn-safe-inline space-y-6"
      data-testid="pay-formula-author-panel"
    >
      <Card className="rounded-card border border-xevn-border bg-xevn-surface shadow-soft">
        <CardHeader className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-[20px] font-bold font-display text-xevn-text">
                Công thức lương (GĐ1 — form)
              </CardTitle>
              <CardDescription className="text-xevn-textSecondary mt-1 max-w-3xl">
                Soạn bản nháp dialect <code className="text-xs">{PAY_FORMULA_EVAL_FORM}</code> · gửi phát
                hành · dual-control. FE chỉ serialize dòng — net/gross chỉ từ Nest preview. Canvas
                kéo-thả (GĐ2) chưa mở.
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className="border-amber-300 bg-amber-50 text-amber-900"
              data-testid="pay-formula-honesty-badge"
            >
              payroll_e2e_ready={String(PAYROLL_E2E_READY_HONESTY)} · C-SLICE ≠ PAY-02 DONE
            </Badge>
          </div>
          <p
            className="text-xs text-muted-foreground"
            data-testid="pay-formula-must-keep-footer"
          >
            must_keep PAY01QC1-MSMBGWC1 · F-PAY-ATT-CLOSED-01 · preview/net chỉ từ Nest — không seed · không
            DnD GĐ2.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-sky-200 bg-sky-50/80 p-3 text-sm text-sky-950 flex gap-2">
            <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
            <p>
              <strong>Dual-control:</strong> sau khi C&B gửi phát hành, Technical Publisher khác tài khoản
              mới được bấm <em>Phát hành</em>. Tự phát hành → mã{' '}
              <code className="text-xs">HRM-PAY-FORMULA-403-DUAL</code>.
            </p>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-4 space-y-2">
              <Label htmlFor="pay-formula-code">Mã công thức</Label>
              <Input
                id="pay-formula-code"
                data-testid="hdsd-pay-formula-code"
                value={form.code}
                disabled={!!editing}
                onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
                placeholder="vd. base_net_v1"
                className="rounded-input h-10"
              />
            </div>
            <div className="col-span-12 md:col-span-4 space-y-2">
              <Label htmlFor="pay-formula-label">Nhãn tiếng Việt</Label>
              <Input
                id="pay-formula-label"
                data-testid="hdsd-pay-formula-label"
                value={form.label}
                disabled={!draftEditable}
                onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
                placeholder="vd. Lương cơ bản + giờ công"
                className="rounded-input h-10"
              />
            </div>
            <div className="col-span-12 md:col-span-2 space-y-2">
              <Label htmlFor="pay-formula-eff-from">Hiệu lực từ</Label>
              <Input
                id="pay-formula-eff-from"
                type="date"
                data-testid="hdsd-pay-formula-eff-from"
                value={form.effectiveFrom}
                disabled={!draftEditable}
                onChange={(e) => setForm((p) => ({ ...p, effectiveFrom: e.target.value }))}
                className="rounded-input h-10"
              />
            </div>
            <div className="col-span-12 md:col-span-2 space-y-2">
              <Label htmlFor="pay-formula-eff-to">Hiệu lực đến</Label>
              <Input
                id="pay-formula-eff-to"
                type="date"
                data-testid="hdsd-pay-formula-eff-to"
                value={form.effectiveTo}
                disabled={!draftEditable}
                onChange={(e) => setForm((p) => ({ ...p, effectiveTo: e.target.value }))}
                className="rounded-input h-10"
              />
            </div>
          </div>

          {immutable ? (
            <div
              className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950 flex gap-2"
              data-testid="pay-formula-immutable-guard"
            >
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <p>
                Bản <strong>{payFormulaStatusLabel(editing?.status)}</strong> đã khóa biểu thức.
                Dùng <em>Tạo phiên bản mới</em> để soạn tiếp — PUT tại chỗ sẽ trả{' '}
                <code className="text-xs">409-IMMUTABLE</code>.
              </p>
            </div>
          ) : null}

          {form.legacyOpaqueHint ? (
            <div
              className="rounded-lg border border-slate-300 bg-slate-50 p-3 text-sm text-slate-800"
              data-testid="pay-formula-legacy-opaque-hint"
            >
              {form.legacyOpaqueHint}
            </div>
          ) : null}

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-6 space-y-2">
              <Label htmlFor="pay-formula-note">Ghi chú soạn</Label>
              <Input
                id="pay-formula-note"
                data-testid="hdsd-pay-formula-note"
                value={form.note}
                disabled={!draftEditable}
                onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
                placeholder="Mô tả ngắn — lưu trong expression_json.note"
                className="rounded-input h-10"
              />
            </div>
            <div className="col-span-12 md:col-span-6 space-y-2">
              <Label>Biến đã chọn</Label>
              <p
                className="text-sm text-xevn-textSecondary min-h-10 flex items-center"
                data-testid="pay-formula-required-summary"
              >
                {selectedKeysLabel || '— chưa chọn'}
              </p>
            </div>
          </div>

          <div className="space-y-3" data-testid="pay-formula-eval-lines">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <Label>Dòng công thức ({PAY_FORMULA_EVAL_FORM})</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Serialize sang Nest — FE không tính gross/net. Subset: var / const / expr (add|sub|mul|div).
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-9"
                  disabled={!draftEditable}
                  onClick={onSeedLinesFromVars}
                  data-testid="hdsd-pay-formula-seed-lines"
                >
                  Gợi ý từ biến DV-18
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 gap-1"
                  disabled={!draftEditable}
                  onClick={onAddLine}
                  data-testid="hdsd-pay-formula-add-line"
                >
                  <Plus className="w-4 h-4" />
                  Thêm dòng
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {form.lines.map((line, idx) => (
                <div
                  key={line.id}
                  className="rounded-lg border border-xevn-border bg-white/60 p-3 space-y-2"
                  data-testid={`hdsd-pay-formula-line-${idx}`}
                >
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-12 sm:col-span-3 space-y-1">
                      <Label className="text-xs">Mã thành phần</Label>
                      <CatalogSearchPicker
                        options={nestComponentOptions}
                        value={line.component_code}
                        disabled={!draftEditable}
                        onValueChange={(code) =>
                          updateLine(line.id, { component_code: code })
                        }
                        placeholder={
                          nestCatalogReady
                            ? 'Chọn Nest code…'
                            : 'Nest trống — tạo TP trước'
                        }
                        loading={nestCatalogLoading}
                        emptyHint={
                          <span className="text-xs text-xevn-textSecondary">
                            {PAY_SALARY_COMPONENT_EMPTY_NEST_HINT}
                          </span>
                        }
                        data-testid={`hdsd-pay-formula-line-code-${idx}`}
                      />
                      {softWarnForCode(line.component_code) ? (
                        <p
                          className="text-[11px] text-amber-800"
                          data-testid={`hdsd-pay-formula-line-code-warn-${idx}`}
                        >
                          {softWarnForCode(line.component_code)}
                        </p>
                      ) : null}
                    </div>
                    <div className="col-span-6 sm:col-span-2 space-y-1">
                      <Label className="text-xs">Dấu</Label>
                      <Select
                        value={line.sign}
                        disabled={!draftEditable}
                        onValueChange={(v) =>
                          updateLine(line.id, { sign: v as Gd1EvalSign })
                        }
                      >
                        <SelectTrigger
                          className="h-9 rounded-input"
                          data-testid={`hdsd-pay-formula-line-sign-${idx}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PAY_FORMULA_EVAL_SIGNS.map((s) => (
                            <SelectItem key={s} value={s}>
                              {PAY_FORMULA_EVAL_SIGN_LABELS[s]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-6 sm:col-span-3 space-y-1">
                      <Label className="text-xs">Nguồn</Label>
                      <Select
                        value={line.source}
                        disabled={!draftEditable}
                        onValueChange={(v) =>
                          updateLine(line.id, { source: v as Gd1EvalSource })
                        }
                      >
                        <SelectTrigger
                          className="h-9 rounded-input"
                          data-testid={`hdsd-pay-formula-line-source-${idx}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PAY_FORMULA_EVAL_SOURCES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {PAY_FORMULA_EVAL_SOURCE_LABELS[s]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-12 sm:col-span-4 flex items-end justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-9 text-destructive"
                        disabled={!draftEditable || form.lines.length <= 1}
                        onClick={() => onRemoveLine(line.id)}
                        data-testid={`hdsd-pay-formula-line-remove-${idx}`}
                      >
                        Xóa dòng
                      </Button>
                    </div>
                  </div>

                  {line.source === 'var' ? (
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-12 sm:col-span-6 space-y-1">
                        <Label className="text-xs">Biến (DV-18)</Label>
                        <Input
                          value={line.var}
                          disabled={!draftEditable}
                          onChange={(e) => updateLine(line.id, { var: e.target.value })}
                          placeholder="base_salary"
                          className="rounded-input h-9"
                          data-testid={`hdsd-pay-formula-line-var-${idx}`}
                        />
                      </div>
                    </div>
                  ) : null}

                  {line.source === 'const' ? (
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-12 sm:col-span-4 space-y-1">
                        <Label className="text-xs">Số tiền hằng</Label>
                        <Input
                          value={line.amount}
                          disabled={!draftEditable}
                          onChange={(e) => updateLine(line.id, { amount: e.target.value })}
                          placeholder="500000"
                          className="rounded-input h-9"
                          data-testid={`hdsd-pay-formula-line-amount-${idx}`}
                        />
                      </div>
                    </div>
                  ) : null}

                  {line.source === 'expr' ? (
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-12 sm:col-span-3 space-y-1">
                        <Label className="text-xs">Phép toán</Label>
                        <Select
                          value={line.exprOp}
                          disabled={!draftEditable}
                          onValueChange={(v) =>
                            updateLine(line.id, { exprOp: v as Gd1EvalOp })
                          }
                        >
                          <SelectTrigger
                            className="h-9 rounded-input"
                            data-testid={`hdsd-pay-formula-line-op-${idx}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PAY_FORMULA_EVAL_OPS.map((op) => (
                              <SelectItem key={op} value={op}>
                                {PAY_FORMULA_EVAL_OP_LABELS[op]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-6 sm:col-span-4 space-y-1">
                        <Label className="text-xs">Vế trái (biến hoặc số)</Label>
                        <Input
                          value={line.exprLeft}
                          disabled={!draftEditable}
                          onChange={(e) => updateLine(line.id, { exprLeft: e.target.value })}
                          placeholder="base_salary"
                          className="rounded-input h-9"
                          data-testid={`hdsd-pay-formula-line-left-${idx}`}
                        />
                      </div>
                      <div className="col-span-6 sm:col-span-4 space-y-1">
                        <Label className="text-xs">Vế phải (biến hoặc số)</Label>
                        <Input
                          value={line.exprRight}
                          disabled={!draftEditable}
                          onChange={(e) => updateLine(line.id, { exprRight: e.target.value })}
                          placeholder="0.1"
                          className="rounded-input h-9"
                          data-testid={`hdsd-pay-formula-line-right-${idx}`}
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
            {/* Keep HDSD id for QA inventory — maps to structured lines (no free opaque blob). */}
            <input
              type="hidden"
              data-testid="hdsd-pay-formula-expression"
              value={PAY_FORMULA_EVAL_FORM}
              readOnly
            />
          </div>

          <div className="space-y-2" data-testid="pay-formula-required-vars">
            <Label>Biến bắt buộc (DV-18)</Label>
            <div className="grid grid-cols-12 gap-2">
              {PAY_FORMULA_REQUIRED_VAR_STARTER.map((key) => (
                <label
                  key={key}
                  className="col-span-12 sm:col-span-6 md:col-span-4 flex items-center gap-2 text-sm"
                >
                  <Checkbox
                    checked={form.requiredKeys.includes(key)}
                    disabled={!draftEditable}
                    onCheckedChange={(v) => toggleRequiredKey(key, v === true)}
                    data-testid={`hdsd-pay-formula-var-${key}`}
                  />
                  <span>
                    {payFormulaRequiredVarLabel(key)}{' '}
                    <span className="text-xs text-muted-foreground">({key})</span>
                  </span>
                </label>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 items-end pt-1">
              <div className="space-y-1 flex-1 min-w-[200px]">
                <Label htmlFor="pay-formula-custom-var" className="text-xs">
                  Thêm allowance_* (mở)
                </Label>
                <Input
                  id="pay-formula-custom-var"
                  data-testid="hdsd-pay-formula-custom-var"
                  value={form.customVar}
                  disabled={!draftEditable}
                  onChange={(e) => setForm((p) => ({ ...p, customVar: e.target.value }))}
                  placeholder="allowance_meal"
                  className="rounded-input h-10"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                className="h-10"
                disabled={!draftEditable}
                onClick={onAddCustomVar}
                data-testid="hdsd-pay-formula-add-var"
              >
                Thêm biến
              </Button>
            </div>
          </div>

          <div
            className="space-y-2 rounded-lg border border-dashed border-slate-300 p-3"
            data-testid="pay-formula-preview-overrides"
          >
            <Label>Biến xem trước (gửi Nest variableOverrides — không tính trên FE)</Label>
            <p className="text-xs text-muted-foreground">
              Khi thiếu ATT/C&B bag thật, nhập override để PREVIEW có thể trả 200 compute staged; thiếu
              biến → 412 trung thực.
            </p>
            <div className="grid grid-cols-12 gap-2">
              {form.requiredKeys.map((key) => (
                <div key={key} className="col-span-12 sm:col-span-6 md:col-span-4 space-y-1">
                  <Label className="text-xs">{payFormulaRequiredVarLabel(key)}</Label>
                  <Input
                    value={form.previewOverrides[key] ?? ''}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        previewOverrides: { ...p.previewOverrides, [key]: e.target.value },
                      }))
                    }
                    placeholder="số"
                    className="rounded-input h-9"
                    data-testid={`hdsd-pay-formula-preview-var-${key}`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              type="button"
              onClick={() => void onSaveDraft()}
              disabled={saving || (!draftEditable && !!editing)}
              className="h-10 gap-1.5"
              data-testid="hdsd-pay-formula-save"
            >
              <Save className="w-4 h-4" />
              Lưu bản nháp
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => void onSubmitPublish()}
              disabled={saving || !editing || editing.status !== 'draft'}
              className="h-10 gap-1.5"
              data-testid="hdsd-pay-formula-submit-publish"
            >
              <Send className="w-4 h-4" />
              Gửi phát hành
            </Button>
            <Button
              type="button"
              variant="default"
              onClick={() => void onPublish()}
              disabled={saving || !editing || editing.status !== 'pending_publish'}
              className="h-10 gap-1.5"
              data-testid="hdsd-pay-formula-publish"
            >
              <ShieldCheck className="w-4 h-4" />
              Phát hành
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => void onWithdraw()}
              disabled={saving || !editing || editing.status !== 'pending_publish'}
              className="h-10 gap-1.5"
              data-testid="hdsd-pay-formula-withdraw"
            >
              <Undo2 className="w-4 h-4" />
              Rút về nháp
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => void onNewVersion()}
              disabled={saving || !editing || editing.status === 'draft'}
              className="h-10 gap-1.5"
              data-testid="hdsd-pay-formula-new-version"
            >
              <Plus className="w-4 h-4" />
              Tạo phiên bản mới
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => void onPreview()}
              disabled={saving || !editing}
              className="h-10 gap-1.5"
              data-testid="hdsd-pay-formula-preview"
            >
              <Eye className="w-4 h-4" />
              Xem trước (Nest)
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onResetForm}
              disabled={saving}
              className="h-10"
              data-testid="hdsd-pay-formula-reset"
            >
              Làm mới form
            </Button>
            {editing && editing.status !== 'retired' ? (
              <Button
                type="button"
                variant="destructive"
                onClick={() => void onRetire()}
                disabled={saving}
                className="h-10 gap-1.5 ml-auto"
                data-testid="hdsd-pay-formula-retire"
              >
                <Trash2 className="w-4 h-4" />
                Ngừng
              </Button>
            ) : null}
          </div>

          {previewMsg ? (
            <div
              className={cn(
                'rounded-lg border p-3 text-sm',
                previewCode === 'OK-COMPUTE'
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
                  : previewCode === 'HRM-PAY-FORMULA-412-PREVIEW-STUB' ||
                      previewCode === 'HRM-PAY-FORMULA-412-VARS' ||
                      previewCode === 'HRM-PAY-FORMULA-412-NOT-EVALUABLE'
                    ? 'border-amber-300 bg-amber-50 text-amber-950'
                    : 'border-slate-200 bg-slate-50 text-slate-800',
              )}
              data-testid="pay-formula-preview-result"
            >
              <p className="font-medium">
                Kết quả xem trước
                {previewCode ? (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    ({previewCode})
                  </span>
                ) : null}
              </p>
              <p className="mt-1">{previewMsg}</p>
              {previewOk ? (
                <div className="mt-2 space-y-1 text-sm" data-testid="pay-formula-preview-amounts">
                  <p>
                    Gross: <strong>{formatPayFormulaMoneyVi(previewOk.gross)}</strong>
                    {' · '}
                    Khấu trừ: <strong>{formatPayFormulaMoneyVi(previewOk.deduction)}</strong>
                    {' · '}
                    Net: <strong>{formatPayFormulaMoneyVi(previewOk.net)}</strong>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Dòng: {previewLineRows.length}
                    {' · '}
                    payroll_e2e_ready={String(previewOk.payroll_e2e_ready === true)}
                    {Array.isArray(previewOk.warnings) && previewOk.warnings.length > 0
                      ? ` · warnings: ${previewOk.warnings.slice(0, 4).join(', ')}`
                      : null}
                  </p>
                  {previewLineRows.length > 0 ? (
                    <Table
                      className="mt-2 text-xs"
                      data-testid="pay-formula-preview-lines-table"
                    >
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mã thành phần</TableHead>
                          <TableHead>Loại</TableHead>
                          <TableHead className="text-right">Số tiền (Nest)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previewLineRows.map((row, i) => (
                          <TableRow
                            key={`${row.componentCode}-${i}`}
                            data-testid={`pay-formula-preview-line-${row.componentCode}`}
                          >
                            <TableCell className="font-mono">{row.componentCode}</TableCell>
                            <TableCell>
                              {row.sign === 'deduction' ? 'Khấu trừ' : 'Thu nhập'}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatPayFormulaMoneyVi(row.amountVnd)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : null}
                </div>
              ) : null}
              <p className="mt-2 text-xs text-muted-foreground">
                Cấm hiểu đây là LIVE evaluator / phiếu lương thật — staged subset only.
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="rounded-card border border-xevn-border bg-xevn-surface shadow-soft">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="text-lg font-semibold text-xevn-text">Danh sách công thức</CardTitle>
            <CardDescription>Hiển thị nhãn + mã + trạng thái (display-ready từ API).</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm mã / nhãn…"
              className="rounded-input h-10 w-48"
              data-testid="hdsd-pay-formula-search"
            />
            <Button
              type="button"
              variant="outline"
              className="h-10 gap-1.5"
              onClick={() => void loadFormulas()}
              disabled={loading}
              data-testid="hdsd-pay-formula-reload"
            >
              <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
              Tải lại
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-sm text-destructive mb-3" data-testid="pay-formula-list-error">
              {error}
            </p>
          ) : null}
          <Table data-testid="pay-formula-list-table">
            <TableHeader>
              <TableRow>
                <TableHead>Công thức</TableHead>
                <TableHead>Phiên bản</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Người soạn</TableHead>
                <TableHead>Người phát hành</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Chưa có công thức trong phạm vi — tạo bản nháp ở form trên (U65 zero-seed).
                  </TableCell>
                </TableRow>
              ) : (
                items.map((row) => (
                  <TableRow
                    key={row.id}
                    className={cn(
                      'cursor-pointer',
                      editing?.id === row.id && 'bg-sky-50/80',
                    )}
                    onClick={() => onPickRow(row)}
                    data-testid={`pay-formula-row-${row.code}-v${row.version}`}
                  >
                    <TableCell className="font-medium">
                      {formatPayFormulaDisplay(row.code, row.label, null)}
                    </TableCell>
                    <TableCell>v{row.version}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn('border', statusBadgeClass(String(row.status)))}
                      >
                        {payFormulaStatusLabel(row.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {row.authoredBy || '—'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {row.publishedBy || '—'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
