/**
 * @CODE-MEMORY
 * Screen:     EmployeeProfile → Contracts → tab Đãi ngộ
 * UC:         UC-HRM-CI-08 · UC-HRM-CI-11 · AC-CD-F5-02..04
 * BR:         BR-CD-F5-02..05
 * SRS:        docs/program/deltas/CUSTOMER_DEMO_HRM_DELTA_20260620.md §5
 * TechSpec:   docs/api/openapi/hrm-api.yaml createCompensationPackage / revise
 * Purpose:    UI to create/revise compensation package (base + probation + ≥2
 *             allowances). Raise salary via revise (new version), not edit lines.
 * WorkItem:   CD-FB-08-CONTRACT
 * Coded:      2026-07-19
 * Callers:    EmployeeContracts.tsx (tab Đãi ngộ)
 * Callees:    useEmployeeCompensation · buildCompensationLines
 * must_keep:  Probation only when contract/NV probation (HRM-COMP-002)
 * LastVerified: EmployeeCompensationPanel.test.ts · compensationLines.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-20 D-UX-VI-FORMAT-HRM-01
 * what: ViMoneyInput for base/probation/allowance; Calendar dd/MM/yyyy effective
 * why: Sponsor VI thousand-group + date display lock (UX_VI_DATE_NUMBER_FORMAT_AC)
 *
 * @CODE-MEMORY-CHANGE 2026-07-20 D-UX-VI-COMP-PANEL-LINES-MAP-01
 * what: compensationPackageLines guard — active package may omit lines array
 * why: QA-UX-VI-FORMAT-01 P0 crash active.lines.map when lines undefined
 *
 * @CODE-MEMORY-CHANGE 2026-08-03
 * WorkItem: W1-B-02-EMP-FE-PROFILE-01 · D-HRM-EMP-PROFILE-PERM-FALLBACK-01
 * change_mode: ADD (restore transitive)
 * What: Khôi phục EmployeeCompensationPanel từ stash 43c479a — import của EmployeeContracts
 * Why: Profile eager Contracts tab → Vite resolve fail chặn mount
 * must_keep: revise not PATCH lines · Employees list · FE-LIBS-01 · Fleet · U65
 * LastVerified: docs/qa/evidence/w1b-02-emp-fe-profile-01.md
 
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-EMP-B
 * change_mode: UPGRADE
 * What: Labels/empty → text-xevn-textSecondary; purple AI chrome → xevn primary/accent
 * Why: ADR-20260805 §8–§10 · inventory W3-EMP-B
 * must_keep: SoftDel; navigate employees/:id; stub honesty; no Nest/seed; no OCR/QR invent
 * ADR: docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-FE-CB-01
 * change_mode: ADD
 * What: HDSD testids create/revise + money fields; stop auto-check probation (blocked U65 POST);
 *       hydrate/display component_code; buildCompensationLines emits component_code.
 * Why: R-EMP-SH-FE-CB-CLICK — FE save must POST 2xx with component_code (no product-path mirror)
 * must_keep: revise not PATCH · U65 · payroll_e2e_ready=false · ≥2 allowances · no invent salary on HĐ
 * LastVerified: docs/qa/evidence/po-hrm-amis-parity-emp-salary-history-fe-cb-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-CNS-FE-01
 * change_mode: ADD
 * What: component_code picker SoT = Nest F-PLT-PAY-COMP-01; Nest empty → empty + VI;
 *       Nest >0 → membership gate before save (AC-PAY-COMP-01 / S-PAY-CNS-03).
 * Why: BA-01 Option B consumer rebind
 * must_keep: revise not PATCH · payroll_e2e_ready=false · DENY formula LIVE · U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-02-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: Bank/MST fields on C&B form only (create/revise body); active summary mask NH/MST;
 *       amounts vi-VN · dates dd/MM/yyyy; toast AuthZ/OVERLAP/VAL via hook; Network packages*.
 * Why: UC-BP-CORE-02 O1/O6 · AC-CORE-CB-02 · API-01 F-CORE-EMP-02
 * must_keep: DENY Nest /core · same-form public+salary · FE invent payslip · CORE-01≠C&B DONE · U65 · honesty false
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-core-02-cluster-fe-01.md
 */

import { useEffect, useMemo, useState } from 'react';
import { format, parseISO, isValid } from 'date-fns';
import { CalendarIcon, Loader2, Plus, RefreshCcw, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CatalogSearchPicker } from '@/components/common/CatalogSearchPicker';
import { XBOS_ALLOWANCE_CODE_OPTIONS } from '@/lib/compensationAllowanceCodes';
import { resolveAllowanceCodeDisplayLabel, resolveCompensationLineTypeDisplay } from '@/lib/labelMaps';
import {
  buildCompensationLines,
  deriveComponentCode,
  isProbationContractType,
  type AllowanceDraft,
} from '@/lib/compensationLines';
import { useEmployeeCompensation } from '@/hooks/useEmployeeCompensation';
import { useSalaryComponentsEffective } from '@/hooks/useSalaryComponentsEffective';
import {
  isCodeInNestSalaryCatalog,
  PAY_SALARY_COMPONENT_EMPTY_NEST_HINT,
} from '@/lib/salaryComponentCatalog';
import { HrmListLoadBanner } from '@/components/hrm/HrmListLoadBanner';
import {
  ViMoneyInput,
  amountStringToNumber,
  numberToAmountString,
} from '@/components/ui/ViMoneyInput';
import { formatDisplayDate } from '@/lib/formatDisplayDate';
import { maskBankAccountView, maskTaxIdView } from '@/lib/empCoreCbRing';
import { cn } from '@/lib/utils';

type ContractLite = {
  id: string;
  contract_type: string;
  status: string;
  compensation_package_id?: string | null;
};

type Props = {
  employeeId: string;
  contracts: ContractLite[];
};

const emptyAllowances = (): AllowanceDraft[] => [
  { allowance_code: 'PHU_CAP_AN', amount: '', component_code: '' },
  { allowance_code: 'PHU_CAP_XANG', amount: '', component_code: '' },
];

/** Prefer Nest membership; else leave empty (no invent when Nest empty / miss). */
function preferNestComponentCode(
  allowanceCode: string,
  nestOptions: readonly { value: string; code?: string }[],
  explicit?: string | null,
): string {
  const explicitTrim = (explicit ?? '').trim();
  if (explicitTrim && isCodeInNestSalaryCatalog(nestOptions, explicitTrim)) {
    return explicitTrim;
  }
  const derived =
    deriveComponentCode({ line_type: 'allowance', allowance_code: allowanceCode }) ?? '';
  if (derived && isCodeInNestSalaryCatalog(nestOptions, derived)) {
    return derived;
  }
  return '';
}

function formatVnd(amount: number | null | undefined): string {
  if (amount == null || !Number.isFinite(amount)) return '—';
  return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
}

function lineTypeLabel(lineType: string): string {
  return resolveCompensationLineTypeDisplay(lineType);
}

/** API may return active package header without embedded lines — never assume .lines exists. */
export function compensationPackageLines(
  pkg: {
    lines?: Array<{
      id?: string;
      line_type: string;
      amount: number | string;
      allowance_code?: string | null;
      component_code?: string | null;
    }>;
  } | null | undefined,
) {
  return Array.isArray(pkg?.lines) ? pkg.lines : [];
}

export function EmployeeCompensationPanel({ employeeId, contracts }: Props) {
  const {
    active,
    packages,
    isLoading,
    fetchError,
    refetch,
    createPackage,
    revisePackage,
  } = useEmployeeCompensation(employeeId);

  const {
    componentOptions: nestComponentOptions,
    hasEffectiveCatalog: nestCatalogReady,
    isLoading: nestCatalogLoading,
    isError: nestCatalogError,
  } = useSalaryComponentsEffective();

  const activeContract = useMemo(
    () =>
      contracts.find((c) => c.status === 'active') ??
      contracts.find((c) => c.status === 'pending') ??
      contracts[0],
    [contracts],
  );

  const activeLines = useMemo(() => compensationPackageLines(active), [active]);

  const probationAllowed = useMemo(
    () => contracts.some((c) => isProbationContractType(c.contract_type)),
    [contracts],
  );

  const [baseAmount, setBaseAmount] = useState('');
  const [probationAmount, setProbationAmount] = useState('');
  /** Opt-in only — do not auto-check from contract type (empty probation blocked U65 POST). */
  const [includeProbation, setIncludeProbation] = useState(false);
  const [allowances, setAllowances] = useState<AllowanceDraft[]>(emptyAllowances);
  const [changeReason, setChangeReason] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [bankAccount, setBankAccount] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankBranch, setBankBranch] = useState('');
  const [taxId, setTaxId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (active) {
      setBankAccount(active.bank_account?.trim() ?? '');
      setBankName(active.bank_name?.trim() ?? '');
      setBankBranch(active.bank_branch?.trim() ?? '');
      setTaxId(active.tax_id?.trim() ?? '');
    }
    if (!activeLines.length) return;
    const base = activeLines.find((l) => l.line_type === 'base');
    const probation = activeLines.find((l) => l.line_type === 'probation');
    const allowanceLines = activeLines.filter((l) => l.line_type === 'allowance');
    if (base) setBaseAmount(String(base.amount));
    if (probation) {
      setIncludeProbation(true);
      setProbationAmount(String(probation.amount));
    } else {
      setIncludeProbation(false);
      setProbationAmount('');
    }
    if (allowanceLines.length >= 2) {
      setAllowances(
        allowanceLines.map((l) => ({
          allowance_code: l.allowance_code ?? '',
          amount: String(l.amount),
          component_code: preferNestComponentCode(
            l.allowance_code ?? '',
            nestComponentOptions,
            l.component_code,
          ),
        })),
      );
    }
  }, [active?.id, activeLines, nestComponentOptions, active]);

  const updateAllowance = (index: number, patch: Partial<AllowanceDraft>) => {
    setAllowances((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const addAllowanceRow = () => {
    const used = new Set(allowances.map((a) => a.allowance_code));
    const next = XBOS_ALLOWANCE_CODE_OPTIONS.find((o) => !used.has(o.code));
    const code = next?.code ?? 'PHU_CAP_TRACH_NHIEM';
    setAllowances((prev) => [
      ...prev,
      {
        allowance_code: code,
        amount: '',
        component_code: preferNestComponentCode(code, nestComponentOptions),
      },
    ]);
  };

  const removeAllowanceRow = (index: number) => {
    if (allowances.length <= 2) {
      toast.error('Giữ tối thiểu 2 dòng phụ cấp');
      return;
    }
    setAllowances((prev) => prev.filter((_, i) => i !== index));
  };

  const submit = async (mode: 'create' | 'revise') => {
    if (includeProbation && !probationAllowed) {
      toast.error('Lương thử việc chỉ khi HĐ/NV đang thử việc');
      return;
    }
    if (nestCatalogReady) {
      const requiredCodes = [
        'base',
        ...(includeProbation ? (['probation'] as const) : []),
        ...allowances.map((a) => (a.component_code ?? '').trim()),
      ];
      const missing = requiredCodes.filter(
        (c) => !c || !isCodeInNestSalaryCatalog(nestComponentOptions, c),
      );
      if (missing.length > 0) {
        toast.error(
          'Mã thành phần phải thuộc Nest salary_components (GET /api/hrm/payroll/salary-components). Chọn từ picker — không invent.',
        );
        return;
      }
    } else if (!nestCatalogLoading) {
      toast.error(PAY_SALARY_COMPONENT_EMPTY_NEST_HINT);
      return;
    }
    const built = buildCompensationLines({
      baseAmount,
      probationAmount,
      includeProbation,
      allowances,
      changeReason,
      effectiveFrom,
    });
    if (!built.ok) {
      toast.error(built.error);
      return;
    }
    if (!effectiveFrom) {
      toast.error('Chọn ngày hiệu lực');
      return;
    }

    const bankTax = {
      bank_account: bankAccount.trim() || null,
      bank_name: bankName.trim() || null,
      bank_branch: bankBranch.trim() || null,
      tax_id: taxId.trim() || null,
    };

    setSubmitting(true);
    try {
      if (mode === 'revise') {
        if (!active?.id) {
          toast.error('Chưa có gói active — hãy tạo gói mới trước');
          return;
        }
        await revisePackage({
          packageId: active.id,
          effective_from: effectiveFrom,
          lines: built.lines,
          change_reason: changeReason.trim() || 'Điều chỉnh đãi ngộ',
          ...bankTax,
        });
      } else {
        await createPackage({
          effective_from: effectiveFrom,
          lines: built.lines,
          change_reason: changeReason.trim() || 'Tạo gói đãi ngộ',
          contract_id: activeContract?.id,
          link_to_contract: Boolean(activeContract?.id),
          ...bankTax,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4" data-testid="hdsd-emp-compensation-panel">
      <HrmListLoadBanner loadFailed={Boolean(fetchError)} errorMessage={fetchError} />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="h-5 w-5" />
            Gói đãi ngộ hiện hành
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={isLoading}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Tải lại
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-xevn-textSecondary" />
            </div>
          ) : !active ? (
            <p className="text-sm text-xevn-textSecondary py-4">
              Chưa có gói đãi ngộ đang áp dụng. Tạo gói bên dưới (lương không nhập trên form hợp đồng).
            </p>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Badge variant="secondary">v{active.version}</Badge>
                <span>
                  Hiệu lực: {formatDisplayDate(active.effective_from)}
                  {active.effective_to
                    ? ` → ${formatDisplayDate(active.effective_to)}`
                    : ' → hiện tại'}
                </span>
              </div>
              {activeLines.length === 0 ? (
                <p className="text-sm text-xevn-textSecondary py-2">
                  Gói đang áp dụng chưa có chi tiết dòng lương/phụ cấp. Dùng form bên dưới để điều chỉnh.
                </p>
              ) : (
                <ul className="divide-y rounded-input border" data-testid="hdsd-emp-comp-active-lines">
                  {activeLines.map((line, idx) => {
                    const cc =
                      line.component_code ??
                      deriveComponentCode({
                        line_type: line.line_type as 'base' | 'probation' | 'allowance',
                        allowance_code: line.allowance_code,
                      });
                    return (
                      <li
                        key={line.id ?? `${line.line_type}-${idx}`}
                        className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                      >
                        <span>
                          {lineTypeLabel(line.line_type)}
                          {line.allowance_code ? (
                            <span className="text-xevn-textSecondary">
                              {' '}
                              · {resolveAllowanceCodeDisplayLabel(line.allowance_code)}
                            </span>
                          ) : null}
                          {cc ? (
                            <span className="ml-2 font-mono text-xs text-xevn-textSecondary">
                              [{cc}]
                            </span>
                          ) : null}
                        </span>
                        <span className="font-medium">{formatVnd(Number(line.amount))}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
              {(active.bank_account || active.bank_name || active.tax_id) && (
                <div
                  className="rounded-input border bg-slate-50 px-3 py-2 text-sm space-y-1"
                  data-testid="hdsd-emp-comp-active-bank-tax"
                >
                  <p className="text-xs text-xevn-textSecondary">
                    Ngân hàng / MST (mask xem — chỉnh bên dưới khi lưu phiên bản)
                  </p>
                  <p>
                    NH: {active.bank_name?.trim() || '—'} · TK{' '}
                    {maskBankAccountView(active.bank_account)}
                    {active.bank_branch?.trim()
                      ? ` · CN ${active.bank_branch.trim()}`
                      : ''}
                  </p>
                  <p>MST: {maskTaxIdView(active.tax_id)}</p>
                </div>
              )}
              {packages.length > 1 ? (
                <p className="text-xs text-xevn-textSecondary">
                  {packages.length} phiên bản gói — xem tab «Lịch sử» để theo dõi thay đổi.
                </p>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      <Card data-testid="hdsd-emp-comp-form">
        <CardHeader>
          <CardTitle className="text-base">
            {active ? 'Điều chỉnh / tăng lương (revise)' : 'Tạo gói đãi ngộ'}
          </CardTitle>
          <p className="text-sm text-xevn-textSecondary">
            Bắt buộc lương cơ bản + ≥2 phụ cấp mã DM §33 (kèm component_code). NH/MST chỉ trên
            vòng C&B — không gửi qua hồ sơ công khai. Tăng lương tạo phiên bản mới — không ghi đè
            dòng cũ.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Ngày hiệu lực *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    data-testid="hdsd-emp-comp-effective-from"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !effectiveFrom && 'text-xevn-textSecondary',
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {effectiveFrom
                      ? formatDisplayDate(effectiveFrom)
                      : 'Chọn ngày'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      effectiveFrom && isValid(parseISO(effectiveFrom))
                        ? parseISO(effectiveFrom)
                        : undefined
                    }
                    onSelect={(d) =>
                      setEffectiveFrom(d ? format(d, 'yyyy-MM-dd') : '')
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Lý do thay đổi</Label>
              <Input
                data-testid="hdsd-emp-comp-change-reason"
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                placeholder="Tăng lương định kỳ / điều chỉnh phụ cấp"
              />
            </div>
          </div>

          <div
            className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
            data-testid="hdsd-emp-comp-bank-tax"
          >
            <div className="space-y-2">
              <Label htmlFor="hdsd-emp-comp-bank-name">Ngân hàng</Label>
              <Input
                id="hdsd-emp-comp-bank-name"
                data-testid="hdsd-emp-comp-bank-name"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Vietcombank"
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hdsd-emp-comp-bank-account">Số tài khoản</Label>
              <Input
                id="hdsd-emp-comp-bank-account"
                data-testid="hdsd-emp-comp-bank-account"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                placeholder="0123456789"
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hdsd-emp-comp-bank-branch">Chi nhánh</Label>
              <Input
                id="hdsd-emp-comp-bank-branch"
                data-testid="hdsd-emp-comp-bank-branch"
                value={bankBranch}
                onChange={(e) => setBankBranch(e.target.value)}
                placeholder="CN Hà Nội"
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hdsd-emp-comp-tax-id">MST cá nhân</Label>
              <Input
                id="hdsd-emp-comp-tax-id"
                data-testid="hdsd-emp-comp-tax-id"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="0312345678"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="hdsd-emp-comp-base">Lương cơ bản (base) * — VNĐ</Label>
              <ViMoneyInput
                id="hdsd-emp-comp-base"
                data-testid="hdsd-emp-comp-base"
                name="compensation_base_amount"
                aria-label="Lương cơ bản base"
                value={amountStringToNumber(baseAmount)}
                onValueChange={(n) => setBaseAmount(numberToAmountString(n))}
                placeholder="15.000.000"
              />
              <p className="text-xs font-mono text-xevn-textSecondary">component_code: base</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 pt-1">
                <Checkbox
                  id="include-probation"
                  data-testid="hdsd-emp-comp-include-probation"
                  checked={includeProbation}
                  disabled={!probationAllowed}
                  onCheckedChange={(v) => setIncludeProbation(v === true)}
                />
                <Label htmlFor="include-probation" className={!probationAllowed ? 'text-xevn-textSecondary' : ''}>
                  Lương thử việc (probation)
                </Label>
              </div>
              <ViMoneyInput
                id="hdsd-emp-comp-probation"
                data-testid="hdsd-emp-comp-probation"
                name="compensation_probation_amount"
                aria-label="Lương thử việc probation"
                disabled={!includeProbation}
                value={amountStringToNumber(probationAmount)}
                onValueChange={(n) => setProbationAmount(numberToAmountString(n))}
                placeholder={probationAllowed ? '12.000.000' : 'Chỉ khi HĐ thử việc'}
              />
            </div>
          </div>

          <div className="space-y-3" data-testid="hdsd-emp-comp-allowances">
            <div className="flex items-center justify-between">
              <Label>Phụ cấp (≥2 mã khác nhau)</Label>
              <Button type="button" variant="outline" size="sm" onClick={addAllowanceRow}>
                <Plus className="mr-1 h-4 w-4" />
                Thêm dòng
              </Button>
            </div>
            {!nestCatalogReady && !nestCatalogLoading ? (
              <p
                className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-2 py-1.5"
                data-testid="hdsd-emp-comp-nest-empty-hint"
              >
                {PAY_SALARY_COMPONENT_EMPTY_NEST_HINT}
              </p>
            ) : null}
            {nestCatalogError ? (
              <p className="text-xs text-destructive">Không tải được Nest salary_components.</p>
            ) : null}
            {allowances.map((row, index) => {
              return (
                <div
                  key={`${row.allowance_code}-${index}`}
                  className="grid grid-cols-12 gap-2"
                  data-testid={`hdsd-emp-comp-allowance-row-${index}`}
                >
                  <div className="col-span-4">
                    <Select
                      value={row.allowance_code}
                      onValueChange={(value) =>
                        updateAllowance(index, {
                          allowance_code: value,
                          component_code: preferNestComponentCode(
                            value,
                            nestComponentOptions,
                          ),
                        })
                      }
                    >
                      <SelectTrigger data-testid={`hdsd-emp-comp-allowance-code-${index}`}>
                        <SelectValue placeholder="Mã phụ cấp" />
                      </SelectTrigger>
                      <SelectContent>
                        {XBOS_ALLOWANCE_CODE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.code} value={opt.code}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-4 space-y-1">
                    <CatalogSearchPicker
                      options={nestComponentOptions}
                      value={row.component_code || ''}
                      onValueChange={(code) =>
                        updateAllowance(index, { component_code: code })
                      }
                      placeholder="Chọn Nest component_code"
                      loading={nestCatalogLoading}
                      emptyText="Không khớp"
                      emptyHint={
                        <span className="text-xs text-xevn-textSecondary">
                          {PAY_SALARY_COMPONENT_EMPTY_NEST_HINT}
                        </span>
                      }
                      data-testid={`hdsd-emp-comp-component-code-${index}`}
                    />
                  </div>
                  <div className="col-span-3">
                    <ViMoneyInput
                      data-testid={`hdsd-emp-comp-allowance-amount-${index}`}
                      name={`compensation_allowance_amount_${index}`}
                      aria-label={`Số tiền phụ cấp ${row.allowance_code || index + 1}`}
                      value={amountStringToNumber(row.amount)}
                      onValueChange={(n) =>
                        updateAllowance(index, { amount: numberToAmountString(n) })
                      }
                      placeholder="500.000"
                    />
                  </div>
                  <div className="col-span-1 flex items-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => removeAllowanceRow(index)}
                    >
                      Xóa
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            {!active ? (
              <Button
                data-testid="hdsd-emp-comp-create"
                disabled={submitting}
                onClick={() => void submit('create')}
              >
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Tạo gói đãi ngộ
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  data-testid="hdsd-emp-comp-create-unlinked"
                  disabled={submitting}
                  onClick={() => void submit('create')}
                >
                  Tạo gói mới (không link HĐ)
                </Button>
                <Button
                  data-testid="hdsd-emp-comp-revise"
                  disabled={submitting}
                  onClick={() => void submit('revise')}
                >
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Tăng lương / revise
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
