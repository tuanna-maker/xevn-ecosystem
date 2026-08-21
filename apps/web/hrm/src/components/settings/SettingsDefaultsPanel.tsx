/**
 * @CODE-MEMORY
 * Screen:     /settings — tab «Mặc định thuế/BH/PC»
 * UC:         UC-SET-DEF-01..05 · AC-AMIS-SET-TAX/SI/POS
 * BR:         BR-AMIS-SET-DEF-01..08 · SRC-02 resolve read-only · soft-delete
 * SRS:        docs/program/specs/PO-HRM-SETTINGS-DEFAULTS-DATA-01.md
 * TechSpec:   docs/program/specs/PO-HRM-SETTINGS-DEFAULTS-API-01.md F-SET-*
 * API_DESIGN: F-SET-TAX-01 · F-SET-SI-01..03 · F-SET-POS-01..05
 * DB_DESIGN:  hrm_company_settings · pay_insurance_rate_cfg · hrm_position_compensation_policy
 * Purpose:    Browser U65 mutate Settings defaults — Lưu → 2xx → F5 còn; display-ready only.
 * WorkItem:   PO-HRM-SETTINGS-DEFAULTS-FE-01
 * Coded:      2026-08-07
 * Callers:    pages/Settings.tsx tab settings-defaults
 * Callees:    hrmApi settings company-settings / insurance-rate-cfg / position-compensation* ·
 *             settingsDefaultsCatalog · listSalaryComponents · ViMoneyInput · toErrorMessage
 * FEActions:  | Thao tác | Handler | API |
 *             | Tải thuế | loadTax | GET …/company-settings?prefix=pay_tax_ |
 *             | Lưu thuế | onSaveTax | PUT …/company-settings × keys |
 *             | Tạo BH | onSaveSi | POST …/insurance-rate-cfg |
 *             | Sửa / Ngừng BH | onPatchSi / onRetireSi | PATCH · POST retire |
 *             | Tạo PC vị trí | onSavePos | POST …/position-compensation-policies |
 *             | Xem trước | onResolvePos | GET …/resolve (SRC-02) |
 *             | Ngừng PC | onRetirePos | POST …/retire |
 * must_keep:  payroll_e2e_ready=false · cấm positionLabelSnapshot create · soft-delete · U65 ·
 *             cấm FE formula / invent GTGC / silent 0% · L1 API GWC must_keep
 * SOLID:      Panel Settings mutate; PAY process consumers riêng (không wire đây)
 * solid_convention_ack: FE–BE display-ready — bind amount/%/dates từ BE; không tính thuế/BH trên FE
 * LastVerified: docs/qa/evidence/po-hrm-settings-defaults-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-SETTINGS-DEFAULTS-FE-01
 * change_mode: ADD
 * What: Initial Settings UF surface for tax / SI / POS defaults
 * Why: QC-02 CONDITION FE Settings UF deferred · resume K6.3
 * must_keep: honesty false · SRC-02 resolve preview only · no invent rules
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-FE-01
 * change_mode: FIX
 * What: SI rate-cfg insuranceTypeKey CatalogSearchPicker binds Nest EFF (eligibleForRateCfg)
 * Why: AC-PLT-SI-INS-RATE · VAL-SI-CNS-03 — optional consumer deepen; empty CTA Settings Loại BH
 * must_keep: tax/POS UF · soft-delete · U65 · printable/personnel false · no FE invent %
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, RefreshCw, Save, Search, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useHrmOperatingUnitFilter } from '@/contexts/HrmOperatingUnitFilterContext';
import {
  createInsuranceRateCfg,
  createPositionCompensationPolicy,
  listInsuranceRateCfg,
  listPositionCompensationPolicies,
  listSalaryComponents,
  listSettingsTaxParams,
  patchInsuranceRateCfg,
  putSettingsCompanySetting,
  resolvePositionCompensationPolicy,
  retireInsuranceRateCfg,
  retirePositionCompensationPolicy,
  type HrmInsuranceRateCfgRow,
  type HrmPositionCompensationPolicyRow,
  type HrmPositionCompensationPrefillDraft,
  type HrmSalaryComponentRow,
} from '@/integrations/hrmApi';
import { useSiInsuranceTypesEffective } from '@/hooks/useSiInsuranceTypesEffective';
import { CatalogSearchPicker } from '@/components/common/CatalogSearchPicker';
import { isCatalogPickerValueAllowed } from '@/lib/catalogSearchPicker';
import { hrmPathWithEmbedSearch } from '@/lib/hrmEmbedNavigation';
import { toErrorMessage } from '@/lib/apiError';
import {
  PAY_TAX_DEPENDENT_DEDUCTION,
  PAY_TAX_FLAGS,
  PAY_TAX_PERSONAL_DEDUCTION,
  PAY_TAX_REGIME,
  PAY_TAX_REGIME_OPTIONS,
  POS_CALC_MODES,
  SETTINGS_DEFAULTS_PAYROLL_E2E_READY,
  SI_STATUSES,
  buildPosCreateBody,
  buildSiCreateBody,
  buildTaxDeductionValue,
  buildTaxFlagsValue,
  buildTaxPutBody,
  buildTaxRegimeValue,
  emptyTaxForm,
  formatPosResolveWarnings,
  isValidInsuranceTypeKeyFormat,
  normalizeInsuranceTypeKey,
  posCalcModeLabel,
  posStatusLabel,
  siStatusLabel,
  taxFormFromSettingsItems,
  type PosCalcMode,
  type PosLineDraft,
  type SiStatus,
  type TaxFormState,
} from '@/lib/settingsDefaultsCatalog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { ViMoneyInput } from '@/components/ui/ViMoneyInput';
import { toast } from '@/hooks/use-toast';

type SiForm = {
  insuranceTypeKey: string;
  employeeRatePct: string;
  employerRatePct: string;
  ceilingAmount: number;
  effectiveFrom: string;
  effectiveTo: string;
  status: SiStatus;
  notes: string;
};

const emptySiForm = (): SiForm => ({
  insuranceTypeKey: '',
  employeeRatePct: '8',
  employerRatePct: '17.5',
  ceilingAmount: 0,
  effectiveFrom: new Date().toISOString().slice(0, 10),
  effectiveTo: '',
  status: 'active',
  notes: '',
});

type PosForm = {
  positionKey: string;
  nameVi: string;
  effectiveFrom: string;
  status: 'draft' | 'active';
  lines: PosLineDraft[];
};

const emptyPosForm = (): PosForm => ({
  positionKey: '',
  nameVi: '',
  effectiveFrom: new Date().toISOString().slice(0, 10),
  status: 'active',
  lines: [{ componentCode: '', amount: 0, calcMode: 'fixed' }],
});

function salaryComponentCode(row: HrmSalaryComponentRow): string {
  return String(row.code ?? '').trim();
}

function salaryComponentLabel(row: HrmSalaryComponentRow): string {
  const code = salaryComponentCode(row);
  const name = String(row.name ?? '').trim();
  return name ? `${code} — ${name}` : code || row.id;
}

export function SettingsDefaultsPanel() {
  const { currentCompanyId } = useAuth();
  const { listCompanyId } = useHrmOperatingUnitFilter();
  const companyId = listCompanyId || currentCompanyId;
  const {
    rateCfgTypeOptions,
    isLoading: siTypesLoading,
  } = useSiInsuranceTypesEffective({ enabled: Boolean(companyId) });
  const siTypeSettingsCta = hrmPathWithEmbedSearch('/settings?tab=si-insurance-types');

  const [taxForm, setTaxForm] = useState<TaxFormState>(emptyTaxForm);
  const [taxLoading, setTaxLoading] = useState(false);
  const [taxSaving, setTaxSaving] = useState(false);
  const [taxError, setTaxError] = useState<string | null>(null);

  const [siItems, setSiItems] = useState<HrmInsuranceRateCfgRow[]>([]);
  const [siForm, setSiForm] = useState<SiForm>(emptySiForm);
  const [siEditingId, setSiEditingId] = useState<string | null>(null);
  const [siLoading, setSiLoading] = useState(false);
  const [siSaving, setSiSaving] = useState(false);
  const [siError, setSiError] = useState<string | null>(null);
  const [siIncludeRetired, setSiIncludeRetired] = useState(false);

  const [posItems, setPosItems] = useState<HrmPositionCompensationPolicyRow[]>([]);
  const [posForm, setPosForm] = useState<PosForm>(emptyPosForm);
  const [posLoading, setPosLoading] = useState(false);
  const [posSaving, setPosSaving] = useState(false);
  const [posError, setPosError] = useState<string | null>(null);
  const [pcOptions, setPcOptions] = useState<HrmSalaryComponentRow[]>([]);
  const [resolveDraft, setResolveDraft] = useState<HrmPositionCompensationPrefillDraft | null>(null);
  const [resolveKey, setResolveKey] = useState('');

  const loadTax = useCallback(async () => {
    if (!companyId) return;
    setTaxLoading(true);
    setTaxError(null);
    try {
      const res = await listSettingsTaxParams(companyId);
      setTaxForm(taxFormFromSettingsItems(res.items));
    } catch (err) {
      const msg = toErrorMessage(err, 'Không tải được thông số thuế.');
      setTaxError(msg);
      toast({ title: 'Lỗi tải thuế', description: msg, variant: 'destructive' });
    } finally {
      setTaxLoading(false);
    }
  }, [companyId]);

  const loadSi = useCallback(async () => {
    if (!companyId) return;
    setSiLoading(true);
    setSiError(null);
    try {
      const res = await listInsuranceRateCfg({
        company_id: companyId,
        include_retired: siIncludeRetired,
      });
      setSiItems(res.items);
    } catch (err) {
      const msg = toErrorMessage(err, 'Không tải được cấu hình tỷ lệ BH.');
      setSiError(msg);
      toast({ title: 'Lỗi tải BH', description: msg, variant: 'destructive' });
    } finally {
      setSiLoading(false);
    }
  }, [companyId, siIncludeRetired]);

  const loadPos = useCallback(async () => {
    if (!companyId) return;
    setPosLoading(true);
    setPosError(null);
    try {
      const [policies, sc] = await Promise.all([
        listPositionCompensationPolicies({ company_id: companyId }),
        listSalaryComponents(companyId),
      ]);
      setPosItems(policies.items);
      setPcOptions((sc.data ?? []).filter((r) => salaryComponentCode(r)));
    } catch (err) {
      const msg = toErrorMessage(err, 'Không tải được chính sách PC theo vị trí.');
      setPosError(msg);
      toast({ title: 'Lỗi tải PC vị trí', description: msg, variant: 'destructive' });
    } finally {
      setPosLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    void loadTax();
    void loadSi();
    void loadPos();
  }, [loadTax, loadSi, loadPos]);

  const onSaveTax = async () => {
    if (!companyId) return;
    setTaxSaving(true);
    setTaxError(null);
    try {
      const puts = [
        buildTaxPutBody(
          companyId,
          PAY_TAX_PERSONAL_DEDUCTION,
          buildTaxDeductionValue(taxForm.personalAmount),
        ),
        buildTaxPutBody(
          companyId,
          PAY_TAX_DEPENDENT_DEDUCTION,
          buildTaxDeductionValue(taxForm.dependentAmount),
        ),
        buildTaxPutBody(companyId, PAY_TAX_REGIME, buildTaxRegimeValue(taxForm.regimeCode)),
        buildTaxPutBody(companyId, PAY_TAX_FLAGS, buildTaxFlagsValue(taxForm)),
      ];
      for (const body of puts) {
        await putSettingsCompanySetting(body);
      }
      toast({ title: 'Đã lưu thông số thuế', description: 'F5 / Tải lại để xác nhận còn dữ liệu.' });
      await loadTax();
    } catch (err) {
      const msg = toErrorMessage(err, 'Không lưu được thông số thuế.');
      setTaxError(msg);
      toast({ title: 'Lỗi lưu thuế', description: msg, variant: 'destructive' });
    } finally {
      setTaxSaving(false);
    }
  };

  const onResetSiForm = () => {
    setSiForm(emptySiForm());
    setSiEditingId(null);
  };

  const onEditSi = (row: HrmInsuranceRateCfgRow) => {
    setSiEditingId(row.id);
    setSiForm({
      insuranceTypeKey: row.insuranceTypeKey,
      employeeRatePct: String(row.employeeRatePct),
      employerRatePct: String(row.employerRatePct),
      ceilingAmount: row.ceilingAmount ?? 0,
      effectiveFrom: row.effectiveFrom?.slice(0, 10) || '',
      effectiveTo: row.effectiveTo?.slice(0, 10) || '',
      status: (SI_STATUSES as readonly string[]).includes(row.status)
        ? (row.status as SiStatus)
        : 'active',
      notes: row.notes ?? '',
    });
  };

  const onSaveSi = async () => {
    if (!companyId) return;
    const typeKey = normalizeInsuranceTypeKey(siForm.insuranceTypeKey);
    if (!isValidInsuranceTypeKeyFormat(typeKey)) {
      toast({
        title: 'Mã loại BH không hợp lệ',
        description: 'Bắt đầu bằng chữ cái; chỉ A–Z, a–z, 0–9, _ (open catalog).',
        variant: 'destructive',
      });
      return;
    }
    if (
      rateCfgTypeOptions.length > 0 &&
      !isCatalogPickerValueAllowed(rateCfgTypeOptions, typeKey, { allowEmpty: false })
    ) {
      toast({
        title: 'Loại BH không thuộc catalog hiệu lực',
        description:
          'HRM-INS-TYPE-KEY — chọn mã từ Nest effective (hoặc tạo trong Cài đặt → Loại BH / SI type).',
        variant: 'destructive',
      });
      return;
    }
    if (rateCfgTypeOptions.length === 0 && !siEditingId) {
      toast({
        title: 'Chưa có loại BH hiệu lực',
        description: 'Tạo mã trong Cài đặt → Loại BH / SI type trước (cấm seed).',
        variant: 'destructive',
      });
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(siForm.effectiveFrom.trim())) {
      toast({
        title: 'Ngày hiệu lực',
        description: 'effectiveFrom phải dạng YYYY-MM-DD.',
        variant: 'destructive',
      });
      return;
    }
    const emp = Number(siForm.employeeRatePct);
    const er = Number(siForm.employerRatePct);
    if (!Number.isFinite(emp) || emp < 0 || !Number.isFinite(er) || er < 0) {
      toast({
        title: 'Tỷ lệ BH',
        description: 'Tỷ lệ NLĐ / NSDLĐ phải là số ≥ 0.',
        variant: 'destructive',
      });
      return;
    }
    setSiSaving(true);
    setSiError(null);
    try {
      if (siEditingId) {
        await patchInsuranceRateCfg(siEditingId, companyId, {
          employeeRatePct: emp,
          employerRatePct: er,
          ceilingAmount: siForm.ceilingAmount > 0 ? siForm.ceilingAmount : null,
          effectiveFrom: siForm.effectiveFrom.trim(),
          effectiveTo: siForm.effectiveTo.trim() || null,
          status: siForm.status,
          notes: siForm.notes.trim() || null,
        });
        toast({ title: 'Đã cập nhật cấu hình BH' });
      } else {
        await createInsuranceRateCfg(
          buildSiCreateBody(companyId, {
            insuranceTypeKey: typeKey,
            employeeRatePct: emp,
            employerRatePct: er,
            ceilingAmount: siForm.ceilingAmount > 0 ? siForm.ceilingAmount : null,
            effectiveFrom: siForm.effectiveFrom.trim(),
            effectiveTo: siForm.effectiveTo.trim() || null,
            status: siForm.status,
            notes: siForm.notes.trim() || null,
          }),
        );
        toast({ title: 'Đã tạo cấu hình BH', description: 'Network POST → 201 rồi F5 list.' });
      }
      onResetSiForm();
      await loadSi();
    } catch (err) {
      const msg = toErrorMessage(err, 'Không lưu được cấu hình BH.');
      setSiError(msg);
      toast({ title: 'Lỗi lưu BH', description: msg, variant: 'destructive' });
    } finally {
      setSiSaving(false);
    }
  };

  const onRetireSi = async (id: string) => {
    if (!companyId) return;
    setSiSaving(true);
    try {
      await retireInsuranceRateCfg(id, companyId, 'FE Settings retire');
      toast({ title: 'Đã ngừng cấu hình BH (soft)' });
      if (siEditingId === id) onResetSiForm();
      await loadSi();
    } catch (err) {
      toast({
        title: 'Không ngừng được BH',
        description: toErrorMessage(err, 'Retire thất bại'),
        variant: 'destructive',
      });
    } finally {
      setSiSaving(false);
    }
  };

  const onSavePos = async () => {
    if (!companyId) return;
    if (!posForm.positionKey.trim()) {
      toast({ title: 'Thiếu mã chức danh', description: 'positionKey bắt buộc.', variant: 'destructive' });
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(posForm.effectiveFrom.trim())) {
      toast({
        title: 'Ngày hiệu lực',
        description: 'effectiveFrom phải dạng YYYY-MM-DD.',
        variant: 'destructive',
      });
      return;
    }
    const lines = posForm.lines.filter((l) => l.componentCode.trim());
    if (lines.length === 0) {
      toast({
        title: 'Thiếu dòng PC',
        description: 'Chọn ít nhất một mã thành phần từ catalog (không gõ orphan).',
        variant: 'destructive',
      });
      return;
    }
    setPosSaving(true);
    setPosError(null);
    try {
      await createPositionCompensationPolicy(
        buildPosCreateBody(companyId, {
          positionKey: posForm.positionKey.trim(),
          nameVi: posForm.nameVi.trim() || null,
          effectiveFrom: posForm.effectiveFrom.trim(),
          status: posForm.status,
          lines,
        }),
      );
      toast({
        title: 'Đã tạo chính sách PC theo vị trí',
        description: 'SRC-02: resolve chỉ draft — chưa ghi C&B NV.',
      });
      setPosForm(emptyPosForm());
      await loadPos();
    } catch (err) {
      const msg = toErrorMessage(err, 'Không tạo được chính sách PC.');
      setPosError(msg);
      toast({ title: 'Lỗi tạo PC vị trí', description: msg, variant: 'destructive' });
    } finally {
      setPosSaving(false);
    }
  };

  const onRetirePos = async (id: string) => {
    if (!companyId) return;
    setPosSaving(true);
    try {
      await retirePositionCompensationPolicy(id, companyId, 'FE Settings retire');
      toast({ title: 'Đã ngừng chính sách PC (soft)' });
      await loadPos();
    } catch (err) {
      toast({
        title: 'Không ngừng được PC',
        description: toErrorMessage(err, 'Retire thất bại'),
        variant: 'destructive',
      });
    } finally {
      setPosSaving(false);
    }
  };

  const onResolvePos = async () => {
    if (!companyId) return;
    const key = resolveKey.trim() || posForm.positionKey.trim();
    if (!key) {
      toast({ title: 'Nhập positionKey để xem trước', variant: 'destructive' });
      return;
    }
    try {
      const draft = await resolvePositionCompensationPolicy({
        company_id: companyId,
        positionKey: key,
        asOf: new Date().toISOString().slice(0, 10),
      });
      setResolveDraft(draft);
      toast({
        title: 'Xem trước prefill (read-only)',
        description: formatPosResolveWarnings(draft.warnings),
      });
    } catch (err) {
      toast({
        title: 'Resolve thất bại',
        description: toErrorMessage(err, 'GET resolve lỗi'),
        variant: 'destructive',
      });
    }
  };

  const activePcOptions = useMemo(
    () => pcOptions.filter((r) => salaryComponentCode(r)),
    [pcOptions],
  );

  if (!companyId) {
    return (
      <Card data-testid="settings-defaults-panel">
        <CardContent className="py-8 text-sm text-muted-foreground">
          Chọn pháp nhân / công ty để cấu hình mặc định thuế · BH · PC theo vị trí.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4" data-testid="settings-defaults-panel">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" data-testid="settings-defaults-honesty-badge">
          payroll_e2e_ready={String(SETTINGS_DEFAULTS_PAYROLL_E2E_READY)}
        </Badge>
        <p className="text-xs text-muted-foreground">
          Phần dưới: thuế KV <code className="text-xs">pay_tax_*</code> · tỷ lệ BH · PC theo vị trí
          (bổ sung sau khối tham số hệ thống phía trên).
        </p>
      </div>

      {/* ── Tax ── */}
      <Card data-testid="settings-defaults-tax-card">
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="text-base">Thông số thuế mặc định</CardTitle>
            <CardDescription>
              KV <code className="text-xs">pay_tax_*</code> — UC-SET-DEF-01 · Lưu → F5.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void loadTax()}
            disabled={taxLoading}
            data-testid="hdsd-settings-tax-reload"
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${taxLoading ? 'animate-spin' : ''}`} />
            Tải lại
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {taxError ? (
            <p className="text-sm text-destructive" data-testid="settings-tax-error">
              {taxError}
            </p>
          ) : null}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 sm:col-span-4 space-y-2">
              <Label>Giảm trừ bản thân (VND)</Label>
              <ViMoneyInput
                value={taxForm.personalAmount}
                onValueChange={(n) => setTaxForm((f) => ({ ...f, personalAmount: n }))}
                data-testid="hdsd-settings-tax-personal"
              />
            </div>
            <div className="col-span-12 sm:col-span-4 space-y-2">
              <Label>Giảm trừ người phụ thuộc (VND)</Label>
              <ViMoneyInput
                value={taxForm.dependentAmount}
                onValueChange={(n) => setTaxForm((f) => ({ ...f, dependentAmount: n }))}
                data-testid="hdsd-settings-tax-dependent"
              />
            </div>
            <div className="col-span-12 sm:col-span-4 space-y-2">
              <Label>Chế độ thuế</Label>
              <Select
                value={taxForm.regimeCode}
                onValueChange={(v) => setTaxForm((f) => ({ ...f, regimeCode: v }))}
              >
                <SelectTrigger data-testid="hdsd-settings-tax-regime">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAY_TAX_REGIME_OPTIONS.map((o) => (
                    <SelectItem key={o.code} value={o.code}>
                      {o.labelVi}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Switch
                checked={taxForm.applyPersonalDeduction}
                onCheckedChange={(v) =>
                  setTaxForm((f) => ({ ...f, applyPersonalDeduction: v }))
                }
                data-testid="hdsd-settings-tax-flag-personal"
              />
              <Label>Áp dụng giảm trừ bản thân</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={taxForm.applyDependentDeduction}
                onCheckedChange={(v) =>
                  setTaxForm((f) => ({ ...f, applyDependentDeduction: v }))
                }
                data-testid="hdsd-settings-tax-flag-dependent"
              />
              <Label>Áp dụng giảm trừ phụ thuộc</Label>
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={() => void onSaveTax()}
              disabled={taxSaving || taxLoading}
              data-testid="hdsd-settings-tax-save"
            >
              <Save className="w-4 h-4 mr-2" />
              {taxSaving ? 'Đang lưu…' : 'Lưu thuế'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── SI ── */}
      <Card data-testid="settings-defaults-si-card">
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="text-base">Tỷ lệ bảo hiểm (SI CFG)</CardTitle>
            <CardDescription>
              Open <code className="text-xs">insuranceTypeKey</code> · overlap → 409 · soft retire.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Switch
                checked={siIncludeRetired}
                onCheckedChange={setSiIncludeRetired}
                data-testid="hdsd-settings-si-include-retired"
              />
              <Label className="text-xs">Gồm đã ngừng</Label>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void loadSi()}
              disabled={siLoading}
              data-testid="hdsd-settings-si-reload"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${siLoading ? 'animate-spin' : ''}`} />
              Tải lại
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {siError ? (
            <p className="text-sm text-destructive" data-testid="settings-si-error">
              {siError}
            </p>
          ) : null}
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12 sm:col-span-3 space-y-1">
              <Label>Mã loại BH</Label>
              {siEditingId ? (
                <Input
                  value={siForm.insuranceTypeKey}
                  disabled
                  data-testid="hdsd-settings-si-type-key"
                />
              ) : (
                <CatalogSearchPicker
                  options={rateCfgTypeOptions}
                  value={siForm.insuranceTypeKey}
                  onValueChange={(v) =>
                    setSiForm((f) => ({ ...f, insuranceTypeKey: v }))
                  }
                  loading={siTypesLoading}
                  placeholder="Chọn loại BH…"
                  emptyHint={
                    <a
                      href={siTypeSettingsCta}
                      className="text-primary underline text-xs font-medium"
                      data-testid="hdsd-settings-si-open-si-insurance-types"
                    >
                      Mở Cài đặt → Loại BH / SI type
                    </a>
                  }
                  aria-label="Mã loại BH rate-cfg"
                  data-testid="hdsd-settings-si-type-key"
                />
              )}
            </div>
            <div className="col-span-6 sm:col-span-2 space-y-1">
              <Label>% NLĐ</Label>
              <Input
                value={siForm.employeeRatePct}
                onChange={(e) =>
                  setSiForm((f) => ({ ...f, employeeRatePct: e.target.value }))
                }
                inputMode="decimal"
                data-testid="hdsd-settings-si-emp-pct"
              />
            </div>
            <div className="col-span-6 sm:col-span-2 space-y-1">
              <Label>% NSDLĐ</Label>
              <Input
                value={siForm.employerRatePct}
                onChange={(e) =>
                  setSiForm((f) => ({ ...f, employerRatePct: e.target.value }))
                }
                inputMode="decimal"
                data-testid="hdsd-settings-si-er-pct"
              />
            </div>
            <div className="col-span-12 sm:col-span-2 space-y-1">
              <Label>Trần (VND)</Label>
              <ViMoneyInput
                value={siForm.ceilingAmount}
                onValueChange={(n) => setSiForm((f) => ({ ...f, ceilingAmount: n }))}
                data-testid="hdsd-settings-si-ceiling"
              />
            </div>
            <div className="col-span-6 sm:col-span-3 space-y-1">
              <Label>Hiệu lực từ (YYYY-MM-DD)</Label>
              <Input
                type="date"
                value={siForm.effectiveFrom}
                onChange={(e) =>
                  setSiForm((f) => ({ ...f, effectiveFrom: e.target.value }))
                }
                data-testid="hdsd-settings-si-from"
              />
            </div>
            <div className="col-span-6 sm:col-span-3 space-y-1">
              <Label>Đến (tuỳ chọn)</Label>
              <Input
                type="date"
                value={siForm.effectiveTo}
                onChange={(e) =>
                  setSiForm((f) => ({ ...f, effectiveTo: e.target.value }))
                }
                data-testid="hdsd-settings-si-to"
              />
            </div>
            <div className="col-span-6 sm:col-span-2 space-y-1">
              <Label>Trạng thái</Label>
              <Select
                value={siForm.status}
                onValueChange={(v) =>
                  setSiForm((f) => ({ ...f, status: v as SiStatus }))
                }
              >
                <SelectTrigger data-testid="hdsd-settings-si-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SI_STATUSES.filter((s) => s !== 'retired').map((s) => (
                    <SelectItem key={s} value={s}>
                      {siStatusLabel(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-12 space-y-1">
              <Label>Ghi chú</Label>
              <Textarea
                value={siForm.notes}
                onChange={(e) => setSiForm((f) => ({ ...f, notes: e.target.value }))}
                rows={2}
                data-testid="hdsd-settings-si-notes"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            {siEditingId ? (
              <Button type="button" variant="outline" size="sm" onClick={onResetSiForm}>
                Huỷ sửa
              </Button>
            ) : null}
            <Button
              type="button"
              onClick={() => void onSaveSi()}
              disabled={siSaving}
              data-testid="hdsd-settings-si-save"
            >
              <Plus className="w-4 h-4 mr-2" />
              {siEditingId ? 'Cập nhật BH' : 'Tạo cấu hình BH'}
            </Button>
          </div>
          <Table data-testid="settings-si-list-table">
            <TableHeader>
              <TableRow>
                <TableHead>Loại</TableHead>
                <TableHead>% NLĐ / NSDLĐ</TableHead>
                <TableHead>Hiệu lực</TableHead>
                <TableHead>TT</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {siItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground text-sm">
                    Chưa có cấu hình BH — tạo từ form trên (U65 zero-seed).
                  </TableCell>
                </TableRow>
              ) : (
                siItems.map((row) => (
                  <TableRow key={row.id} data-testid={`settings-si-row-${row.id}`}>
                    <TableCell className="font-medium">{row.insuranceTypeKey}</TableCell>
                    <TableCell>
                      {row.employeeRatePct} / {row.employerRatePct}
                    </TableCell>
                    <TableCell className="text-xs">
                      {row.effectiveFrom}
                      {row.effectiveTo ? ` → ${row.effectiveTo}` : ''}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{siStatusLabel(row.status)}</Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditSi(row)}
                        data-testid={`hdsd-settings-si-edit-${row.id}`}
                      >
                        Sửa
                      </Button>
                      {row.status !== 'retired' ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => void onRetireSi(row.id)}
                          data-testid={`hdsd-settings-si-retire-${row.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── POS ── */}
      <Card data-testid="settings-defaults-pos-card">
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="text-base">PC mặc định theo vị trí</CardTitle>
            <CardDescription>
              F-SET-POS · dòng PC từ catalog · resolve prefill read-only (SRC-02).
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void loadPos()}
            disabled={posLoading}
            data-testid="hdsd-settings-pos-reload"
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${posLoading ? 'animate-spin' : ''}`} />
            Tải lại
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {posError ? (
            <p className="text-sm text-destructive" data-testid="settings-pos-error">
              {posError}
            </p>
          ) : null}
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12 sm:col-span-3 space-y-1">
              <Label>Mã chức danh (positionKey)</Label>
              <Input
                value={posForm.positionKey}
                onChange={(e) =>
                  setPosForm((f) => ({ ...f, positionKey: e.target.value }))
                }
                placeholder="VD: CEO"
                data-testid="hdsd-settings-pos-key"
              />
            </div>
            <div className="col-span-12 sm:col-span-4 space-y-1">
              <Label>Tên chính sách (tuỳ chọn)</Label>
              <Input
                value={posForm.nameVi}
                onChange={(e) => setPosForm((f) => ({ ...f, nameVi: e.target.value }))}
                data-testid="hdsd-settings-pos-name"
              />
            </div>
            <div className="col-span-6 sm:col-span-3 space-y-1">
              <Label>Hiệu lực từ</Label>
              <Input
                type="date"
                value={posForm.effectiveFrom}
                onChange={(e) =>
                  setPosForm((f) => ({ ...f, effectiveFrom: e.target.value }))
                }
                data-testid="hdsd-settings-pos-from"
              />
            </div>
            <div className="col-span-6 sm:col-span-2 space-y-1">
              <Label>TT</Label>
              <Select
                value={posForm.status}
                onValueChange={(v) =>
                  setPosForm((f) => ({ ...f, status: v as 'draft' | 'active' }))
                }
              >
                <SelectTrigger data-testid="hdsd-settings-pos-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">{posStatusLabel('draft')}</SelectItem>
                  <SelectItem value="active">{posStatusLabel('active')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2" data-testid="settings-pos-lines">
            <Label>Dòng thành phần (catalog PC)</Label>
            {posForm.lines.map((line, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-12 sm:col-span-5">
                  <Select
                    value={line.componentCode || undefined}
                    onValueChange={(code) =>
                      setPosForm((f) => {
                        const lines = [...f.lines];
                        lines[idx] = { ...lines[idx]!, componentCode: code };
                        return { ...f, lines };
                      })
                    }
                  >
                    <SelectTrigger data-testid={`hdsd-settings-pos-line-code-${idx}`}>
                      <SelectValue placeholder="Chọn mã PC" />
                    </SelectTrigger>
                    <SelectContent>
                      {activePcOptions.map((opt) => (
                        <SelectItem key={opt.id} value={salaryComponentCode(opt)}>
                          {salaryComponentLabel(opt)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-6 sm:col-span-3">
                  <ViMoneyInput
                    value={line.amount}
                    onValueChange={(n) =>
                      setPosForm((f) => {
                        const lines = [...f.lines];
                        lines[idx] = { ...lines[idx]!, amount: n };
                        return { ...f, lines };
                      })
                    }
                    data-testid={`hdsd-settings-pos-line-amount-${idx}`}
                  />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <Select
                    value={line.calcMode ?? 'fixed'}
                    onValueChange={(m) =>
                      setPosForm((f) => {
                        const lines = [...f.lines];
                        lines[idx] = {
                          ...lines[idx]!,
                          calcMode: m as PosCalcMode,
                        };
                        return { ...f, lines };
                      })
                    }
                  >
                    <SelectTrigger data-testid={`hdsd-settings-pos-line-mode-${idx}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {POS_CALC_MODES.map((m) => (
                        <SelectItem key={m} value={m}>
                          {posCalcModeLabel(m)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 sm:col-span-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={posForm.lines.length <= 1}
                    onClick={() =>
                      setPosForm((f) => ({
                        ...f,
                        lines: f.lines.filter((_, i) => i !== idx),
                      }))
                    }
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setPosForm((f) => ({
                  ...f,
                  lines: [...f.lines, { componentCode: '', amount: 0, calcMode: 'fixed' }],
                }))
              }
              data-testid="hdsd-settings-pos-add-line"
            >
              <Plus className="w-4 h-4 mr-1" />
              Thêm dòng
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 justify-end">
            <Button
              type="button"
              onClick={() => void onSavePos()}
              disabled={posSaving}
              data-testid="hdsd-settings-pos-save"
            >
              <Save className="w-4 h-4 mr-2" />
              Tạo chính sách PC
            </Button>
          </div>

          <div className="flex flex-wrap items-end gap-2 border-t pt-4">
            <div className="space-y-1 flex-1 min-w-[12rem]">
              <Label>Xem trước resolve (SRC-02)</Label>
              <Input
                value={resolveKey}
                onChange={(e) => setResolveKey(e.target.value)}
                placeholder="positionKey (mặc định form)"
                data-testid="hdsd-settings-pos-resolve-key"
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => void onResolvePos()}
              data-testid="hdsd-settings-pos-resolve"
            >
              <Search className="w-4 h-4 mr-1" />
              Resolve draft
            </Button>
          </div>
          {resolveDraft ? (
            <div
              className="rounded-md border bg-muted/30 p-3 text-sm space-y-1"
              data-testid="settings-pos-resolve-result"
            >
              <p>{formatPosResolveWarnings(resolveDraft.warnings)}</p>
              <p className="text-xs text-muted-foreground">
                policyId={resolveDraft.policyId ?? 'null'} · lines={resolveDraft.lines.length} ·
                không ghi employeePackage
              </p>
              {resolveDraft.lines.length > 0 ? (
                <ul className="text-xs list-disc pl-4">
                  {resolveDraft.lines.map((l, i) => (
                    <li key={`${l.componentCode}-${i}`}>
                      {l.componentCode}: {l.amount} ({l.calcMode})
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          <Table data-testid="settings-pos-list-table">
            <TableHeader>
              <TableRow>
                <TableHead>Vị trí</TableHead>
                <TableHead>Tên</TableHead>
                <TableHead>Dòng</TableHead>
                <TableHead>TT</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground text-sm">
                    Chưa có chính sách — tạo từ form (PC từ catalog active).
                  </TableCell>
                </TableRow>
              ) : (
                posItems.map((row) => (
                  <TableRow key={row.id} data-testid={`settings-pos-row-${row.id}`}>
                    <TableCell className="font-medium">{row.positionKey}</TableCell>
                    <TableCell>{row.nameVi || '—'}</TableCell>
                    <TableCell className="text-xs">
                      {(row.lines ?? [])
                        .map((l) => `${l.componentCode}:${l.amount}`)
                        .join(', ') || '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{posStatusLabel(row.status)}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {row.status !== 'retired' ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => void onRetirePos(row.id)}
                          data-testid={`hdsd-settings-pos-retire-${row.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      ) : null}
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
