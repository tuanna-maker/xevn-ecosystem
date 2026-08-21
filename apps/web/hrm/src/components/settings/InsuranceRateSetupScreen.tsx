/**
 * @CODE-MEMORY
 * Screen:     /settings → tab payroll-insurance-rates (InsuranceRateSetupScreen)
 * UC:         UC-IR-01 (xem mức đóng BH), UC-IR-02 (tạo/sửa), UC-MW-01 (lương tối thiểu vùng)
 * BR:         BR-IR-05 (unique type+year) · BR-IR-07 (không sửa nếu đã tính lương)
 * SRS:        docs/program/deltas/BA_HRM_LEAVE_TYPE_SRS_01_20260815.md (cùng wave W12)
 * WorkItem:   BA-HRM-INSURANCE-RATE-TECHSPEC-01
 * Coded:      2026-08-15
 * Purpose:    Insurance rate config + minimum wage region — 2-tab PAT-SETTINGS-CATALOG-01 variant.
 * solid_convention_ack: true · fe_boundary: true · display_ready_ack: true
 * NO FE join/merge/tính BR (AP-01..06 từ §28) — display-ready từ BE.
 */
import { useCallback, useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useHrmOperatingUnitFilter } from '@/contexts/HrmOperatingUnitFilterContext';
import { toErrorMessage } from '@/lib/apiError';
import { SettingsCatalogScreenShell } from '@/components/settings/SettingsCatalogScreenShell';
import { CatalogSearchPicker } from '@/components/common/CatalogSearchPicker';
import { isCatalogPickerValueAllowed } from '@/lib/catalogSearchPicker';
import { hrmPathWithEmbedSearch } from '@/lib/hrmEmbedNavigation';
import { useSiInsuranceTypesEffective } from '@/hooks/useSiInsuranceTypesEffective';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { SettingsDialogSelectContent } from '@/components/settings/SettingsDialogSelectContent';
import {
  type HrmInsuranceRateRow,
  type HrmMinimumWageRegionRow,
  listInsuranceRates,
  createInsuranceRate,
  updateInsuranceRate,
  updateMinimumWageRegion,
} from '@/integrations/hrmApi';

// ─── Insurance Rate types ────────────────────────────────────────────────────
type InsRateForm = {
  /** SI catalog key (F-SI-CAT-EFF) — không hardcode BHXH/BHYT/BHTN. */
  insuranceType: string;
  effectiveYear: string;
  employerRatePercent: string;
  employeeRatePercent: string;
  salaryCapMultiplier: string;
  effectiveFrom: string;
  effectiveTo: string;
  /** Excel `ghi_chu`. */
  notes: string;
};
const emptyRateForm = (defaultType = ''): InsRateForm => ({
  insuranceType: defaultType,
  effectiveYear: String(new Date().getFullYear()),
  employerRatePercent: '',
  employeeRatePercent: '',
  salaryCapMultiplier: '20',
  effectiveFrom: '',
  effectiveTo: '',
  notes: '',
});

type MinWageForm = {
  monthlyMinWage: string;
  status: 'active' | 'inactive';
  effectiveTo: string;
};

const REGION_LABELS: Record<string, string> = {
  REGION_1: 'Vùng I',
  REGION_2: 'Vùng II',
  REGION_3: 'Vùng III',
  REGION_4: 'Vùng IV',
};

function formatCurrency(val: string | number): string {
  const n = typeof val === 'string' ? parseFloat(val) : val;
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString('vi-VN') + ' ₫';
}

function formatRatePct(val: string | number | null | undefined): string {
  const n = typeof val === 'string' ? parseFloat(val) : Number(val);
  if (!Number.isFinite(n)) return '—';
  return `${n.toFixed(2)}%`;
}

function sumRatePct(employer: string, employee: string): string {
  const a = parseFloat(employer);
  const b = parseFloat(employee);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return '—';
  return `${(a + b).toFixed(2)}%`;
}

// ─── InsuranceRateSetupScreen ────────────────────────────────────────────────
export function InsuranceRateSetupScreen() {
  const { currentCompanyId } = useAuth();
  const { listCompanyId } = useHrmOperatingUnitFilter();
  const companyId = listCompanyId || currentCompanyId;
  const {
    rateCfgTypeOptions,
    insuranceTypeDisplayLabel,
    isLoading: siTypesLoading,
  } = useSiInsuranceTypesEffective({ enabled: Boolean(companyId) });
  const siTypeSettingsCta = hrmPathWithEmbedSearch('/settings?tab=si-insurance-types');

  // ─── state ─────────────────────────────────────────────────────────────────
  const [ratesByYear, setRatesByYear] = useState<Record<number, HrmInsuranceRateRow[]>>({});
  const [regions, setRegions] = useState<HrmMinimumWageRegionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Rate dialog
  const [rateDialogOpen, setRateDialogOpen] = useState(false);
  const [editingRateId, setEditingRateId] = useState<string | null>(null);
  const [rateForm, setRateForm] = useState<InsRateForm>(() => emptyRateForm());
  const [savingRate, setSavingRate] = useState(false);

  // Min wage dialog
  const [wageDialogOpen, setWageDialogOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState<HrmMinimumWageRegionRow | null>(null);
  const [wageForm, setWageForm] = useState<MinWageForm>({ monthlyMinWage: '', status: 'active', effectiveTo: '' });
  const [savingWage, setSavingWage] = useState(false);

  // ─── Load ──────────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    try {
      const { rates, regions: rgns } = await listInsuranceRates(companyId);
      setRatesByYear(rates);
      setRegions(rgns);
    } catch (err) {
      setError(toErrorMessage(err, 'Không tải được cấu hình bảo hiểm.'));
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => { void loadData(); }, [loadData]);

  // ─── Rate CRUD ─────────────────────────────────────────────────────────────
  const openCreateRate = () => {
    if (rateCfgTypeOptions.length === 0) {
      toast({
        title: 'Chưa có loại BH hiệu lực',
        description: 'Tạo mã trong Cài đặt → Loại bảo hiểm trước.',
        variant: 'destructive',
      });
      return;
    }
    setEditingRateId(null);
    setRateForm(emptyRateForm(rateCfgTypeOptions[0]?.value ?? ''));
    setRateDialogOpen(true);
  };

  const openEditRate = (row: HrmInsuranceRateRow) => {
    setEditingRateId(row.id);
    setRateForm({
      insuranceType: (row.insurance_type ?? '').trim(),
      effectiveYear: String(row.effective_year),
      employerRatePercent: String(row.employer_rate_percent ?? ''),
      employeeRatePercent: String(row.employee_rate_percent ?? ''),
      salaryCapMultiplier: String(row.salary_cap_multiplier ?? ''),
      effectiveFrom: row.effective_from ?? '',
      effectiveTo: row.effective_to ?? '',
      notes: row.notes ?? '',
    });
    setRateDialogOpen(true);
  };

  const closeRateDialog = () => {
    setRateDialogOpen(false);
    setEditingRateId(null);
    setRateForm(emptyRateForm(rateCfgTypeOptions[0]?.value ?? ''));
  };

  const onSaveRate = async () => {
    if (!companyId) return;
    const typeKey = rateForm.insuranceType.trim();
    const year = parseInt(rateForm.effectiveYear, 10);
    const employer = parseFloat(rateForm.employerRatePercent);
    const employee = parseFloat(rateForm.employeeRatePercent);
    const cap = parseFloat(rateForm.salaryCapMultiplier);
    if (!editingRateId) {
      if (!typeKey) {
        toast({ title: 'Chọn loại bảo hiểm', variant: 'destructive' }); return;
      }
      if (
        rateCfgTypeOptions.length > 0 &&
        !isCatalogPickerValueAllowed(rateCfgTypeOptions, typeKey, { allowEmpty: false })
      ) {
        toast({
          title: 'Loại BH không thuộc catalog hiệu lực',
          description: 'Chọn lại từ Cài đặt → Loại bảo hiểm.',
          variant: 'destructive',
        });
        return;
      }
      if (rateCfgTypeOptions.length === 0) {
        toast({
          title: 'Chưa có loại BH hiệu lực',
          description: 'Tạo mã trong Cài đặt → Loại bảo hiểm trước.',
          variant: 'destructive',
        });
        return;
      }
    }
    if (!Number.isFinite(year) || year < 2000 || year > 2100) {
      toast({ title: 'Năm áp dụng không hợp lệ (2000–2100)', variant: 'destructive' }); return;
    }
    if (!Number.isFinite(employer) || employer < 0 || employer > 100) {
      toast({ title: 'Tỷ lệ NSD không hợp lệ (0–100%)', variant: 'destructive' }); return;
    }
    if (!Number.isFinite(employee) || employee < 0 || employee > 100) {
      toast({ title: 'Tỷ lệ NLĐ không hợp lệ (0–100%)', variant: 'destructive' }); return;
    }

    setSavingRate(true);
    try {
      if (editingRateId) {
        await updateInsuranceRate(editingRateId, {
          employerRatePercent: employer,
          employeeRatePercent: employee,
          salaryCapMultiplier: Number.isFinite(cap) && cap > 0 ? cap : undefined,
          effectiveFrom: rateForm.effectiveFrom || undefined,
          effectiveTo: rateForm.effectiveTo || undefined,
          notes: rateForm.notes.trim(),
          companyId,
        });
        toast({ title: 'Đã cập nhật mức đóng bảo hiểm' });
      } else {
        await createInsuranceRate({
          insuranceType: typeKey,
          effectiveYear: year,
          employerRatePercent: employer,
          employeeRatePercent: employee,
          salaryCapMultiplier: Number.isFinite(cap) && cap > 0 ? cap : 20,
          effectiveFrom: rateForm.effectiveFrom || undefined,
          effectiveTo: rateForm.effectiveTo || undefined,
          notes: rateForm.notes.trim() || undefined,
          companyId,
        });
        toast({
          title: `Đã tạo mức đóng ${insuranceTypeDisplayLabel(typeKey)} năm ${year}`,
        });
      }
      closeRateDialog();
      await loadData();
    } catch (err) {
      toast({ title: 'Lưu thất bại', description: toErrorMessage(err), variant: 'destructive' });
    } finally {
      setSavingRate(false);
    }
  };

  // ─── Min Wage CRUD ─────────────────────────────────────────────────────────
  const openEditWage = (row: HrmMinimumWageRegionRow) => {
    setEditingRegion(row);
    setWageForm({
      monthlyMinWage: row.monthly_min_wage,
      status: row.status,
      effectiveTo: row.effective_to ?? '',
    });
    setWageDialogOpen(true);
  };

  const closeWageDialog = () => {
    setWageDialogOpen(false);
    setEditingRegion(null);
    setWageForm({ monthlyMinWage: '', status: 'active', effectiveTo: '' });
  };

  const onSaveWage = async () => {
    if (!editingRegion || !companyId) return;
    const wage = parseFloat(wageForm.monthlyMinWage.replace(/[^\d.]/g, ''));
    if (!Number.isFinite(wage) || wage < 100000) {
      toast({ title: 'Lương tối thiểu phải ≥ 100.000 ₫', variant: 'destructive' }); return;
    }
    setSavingWage(true);
    try {
      await updateMinimumWageRegion(editingRegion.id, {
        monthlyMinWage: wage,
        status: wageForm.status,
        effectiveTo: wageForm.effectiveTo || undefined,
        companyId,
      });
      toast({ title: `Đã cập nhật lương tối thiểu ${REGION_LABELS[editingRegion.region_code] ?? editingRegion.region_code}` });
      closeWageDialog();
      await loadData();
    } catch (err) {
      toast({ title: 'Lưu thất bại', description: toErrorMessage(err), variant: 'destructive' });
    } finally {
      setSavingWage(false);
    }
  };

  // ─── Derived: sorted years desc ────────────────────────────────────────────
  const sortedYears = Object.keys(ratesByYear)
    .map(Number)
    .sort((a, b) => b - a);

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <Tabs defaultValue="rates">
        <TabsList className="mb-4">
          <TabsTrigger value="rates" data-testid="settings-ins-tab-rates">
            Mức đóng bảo hiểm
          </TabsTrigger>
          <TabsTrigger value="min-wage" data-testid="settings-ins-tab-min-wage">
            Lương tối thiểu vùng
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Insurance Rates ── */}
        <TabsContent value="rates">
          <SettingsCatalogScreenShell
            compact
            title="Mức đóng BHXH / BHYT / BHTN"
            description="Tỷ lệ đóng góp NSD và NLĐ theo từng năm — nhấn «Thêm năm mới» để khai báo."
            testId="settings-insurance-rates"
            searchValue=""
            onSearchChange={() => {}}
            searchPlaceholder=""
            onRefresh={() => void loadData()}
            refreshing={loading}
            onAdd={openCreateRate}
            addLabel="Thêm năm mới"
          >
            {error ? (
              <p className="text-sm text-destructive" data-testid="settings-insurance-rates-error">{error}</p>
            ) : null}

            {loading && sortedYears.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Đang tải…</p>
            ) : sortedYears.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Chưa có mức đóng nào — bấm «Thêm năm mới» để khai báo cho năm hiện tại.
              </p>
            ) : (
              sortedYears.map((year) => (
                <div key={year} className="mb-6">
                  <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Năm {year}</h3>
                  <Table data-testid={`settings-ins-rates-table-${year}`} className="min-w-[640px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[140px]">Loại BH</TableHead>
                        <TableHead className="text-right min-w-[100px]">NSD (%)</TableHead>
                        <TableHead className="text-right min-w-[100px]">NLĐ (%)</TableHead>
                        <TableHead className="text-right min-w-[100px]">Tổng (%)</TableHead>
                        <TableHead className="text-right min-w-[120px]">Trần BH (×)</TableHead>
                        <TableHead className="min-w-[160px]">Ghi chú</TableHead>
                        <TableHead className="min-w-[80px]">TT</TableHead>
                        <TableHead className="text-right min-w-[80px]">Sửa</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(ratesByYear[year] ?? []).map((row) => (
                        <TableRow key={row.id} data-testid={`settings-ins-rate-row-${row.insurance_type}-${year}`}>
                          <TableCell className="font-medium">
                            {insuranceTypeDisplayLabel(row.insurance_type)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs">
                            {formatRatePct(row.employer_rate_percent)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs">
                            {formatRatePct(row.employee_rate_percent)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs font-semibold">
                            {sumRatePct(row.employer_rate_percent, row.employee_rate_percent)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs">
                            {parseFloat(row.salary_cap_multiplier).toFixed(1)}×
                          </TableCell>
                          <TableCell className="max-w-[220px] truncate text-xs text-muted-foreground" title={row.notes ?? undefined}>
                            {(row.notes ?? '').trim() || '—'}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={row.status === 'active' ? 'default' : 'secondary'}
                              className="text-[10px]"
                            >
                              {row.status === 'active' ? 'Hiệu lực' : 'Ngừng'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              data-testid={`hdsd-ins-rate-edit-${row.insurance_type}-${year}`}
                              onClick={() => openEditRate(row)}
                            >
                              Sửa
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))
            )}
          </SettingsCatalogScreenShell>
        </TabsContent>

        {/* ── Tab 2: Minimum Wage Regions ── */}
        <TabsContent value="min-wage">
          <SettingsCatalogScreenShell
            compact
            title="Lương tối thiểu vùng"
            description="4 vùng theo Nghị định 74/2024 — nhấn «Sửa» để cập nhật mức lương tối thiểu và ngày hiệu lực."
            testId="settings-min-wage-regions"
            searchValue=""
            onSearchChange={() => {}}
            searchPlaceholder=""
            onRefresh={() => void loadData()}
            refreshing={loading}
          >
            {loading && regions.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Đang tải…</p>
            ) : regions.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Chưa có dữ liệu lương tối thiểu vùng.
              </p>
            ) : (
              <Table data-testid="settings-min-wage-table" className="min-w-[640px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px]">Vùng</TableHead>
                    <TableHead className="text-right min-w-[160px]">Lương tối thiểu/tháng</TableHead>
                    <TableHead className="text-right min-w-[160px]">Trần lương BH</TableHead>
                    <TableHead className="min-w-[100px]">Hiệu lực từ</TableHead>
                    <TableHead className="min-w-[80px]">TT</TableHead>
                    <TableHead className="text-right min-w-[80px]">Sửa</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {regions.map((row) => (
                    <TableRow key={row.id} data-testid={`settings-min-wage-row-${row.region_code}`}>
                      <TableCell className="font-medium">
                        {REGION_LABELS[row.region_code] ?? row.region_code}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        {formatCurrency(row.monthly_min_wage)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        {formatCurrency(row.salary_cap)}
                      </TableCell>
                      <TableCell className="text-xs">{row.effective_from}</TableCell>
                      <TableCell>
                        <Badge
                          variant={row.status === 'active' ? 'default' : 'secondary'}
                          className="text-[10px]"
                        >
                          {row.status === 'active' ? 'Hiệu lực' : 'Ngừng'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          data-testid={`hdsd-min-wage-edit-${row.region_code}`}
                          onClick={() => openEditWage(row)}
                        >
                          Sửa
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </SettingsCatalogScreenShell>
        </TabsContent>
      </Tabs>

      {/* ── Dialog: Insurance Rate ── */}
      <Dialog open={rateDialogOpen} onOpenChange={(open) => (open ? setRateDialogOpen(true) : closeRateDialog())}>
        <DialogContent
          className="max-h-[min(90vh,600px)] max-w-lg overflow-y-auto sm:max-w-xl"
          data-testid="settings-ins-rate-dialog"
        >
          <DialogHeader>
            <DialogTitle>
              {editingRateId ? 'Sửa mức đóng bảo hiểm' : 'Thêm mức đóng bảo hiểm mới'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Loại bảo hiểm *</Label>
                {editingRateId ? (
                  <Input
                    value={insuranceTypeDisplayLabel(rateForm.insuranceType)}
                    disabled
                    data-testid="hdsd-ins-rate-type"
                  />
                ) : (
                  <CatalogSearchPicker
                    options={rateCfgTypeOptions}
                    value={rateForm.insuranceType}
                    onValueChange={(v) =>
                      setRateForm((f) => ({ ...f, insuranceType: v }))
                    }
                    loading={siTypesLoading}
                    placeholder="Chọn loại BH…"
                    emptyHint={
                      <a
                        href={siTypeSettingsCta}
                        className="text-primary underline text-xs font-medium"
                        data-testid="hdsd-ins-rate-open-si-insurance-types"
                      >
                        Mở Cài đặt → Loại bảo hiểm
                      </a>
                    }
                    aria-label="Loại bảo hiểm mức đóng"
                    data-testid="hdsd-ins-rate-type"
                  />
                )}
              </div>
              <div className="space-y-1">
                <Label>Năm áp dụng *</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="2025"
                  value={rateForm.effectiveYear}
                  disabled={Boolean(editingRateId)}
                  data-testid="hdsd-ins-rate-year"
                  onChange={(e) => setRateForm((f) => ({ ...f, effectiveYear: e.target.value.replace(/\D/g, '') }))}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Tỷ lệ NSD (%) *</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="17.5"
                  value={rateForm.employerRatePercent}
                  data-testid="hdsd-ins-rate-employer"
                  onChange={(e) => setRateForm((f) => ({ ...f, employerRatePercent: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Tỷ lệ NLĐ (%) *</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="10.5"
                  value={rateForm.employeeRatePercent}
                  data-testid="hdsd-ins-rate-employee"
                  onChange={(e) => setRateForm((f) => ({ ...f, employeeRatePercent: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Tổng (%) — tự tính</Label>
                <Input
                  value={sumRatePct(rateForm.employerRatePercent, rateForm.employeeRatePercent)}
                  disabled
                  data-testid="hdsd-ins-rate-total"
                />
              </div>
              <div className="space-y-1">
                <Label>Trần BH (× lương tối thiểu)</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="20"
                  value={rateForm.salaryCapMultiplier}
                  data-testid="hdsd-ins-rate-cap"
                  onChange={(e) => setRateForm((f) => ({ ...f, salaryCapMultiplier: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Ghi chú</Label>
              <Input
                type="text"
                placeholder="VD: Tính trên quỹ lương đóng BH"
                value={rateForm.notes}
                data-testid="hdsd-ins-rate-notes"
                onChange={(e) => setRateForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Hiệu lực từ (tùy chọn)</Label>
                <Input
                  type="date"
                  value={rateForm.effectiveFrom}
                  data-testid="hdsd-ins-rate-from"
                  onChange={(e) => setRateForm((f) => ({ ...f, effectiveFrom: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Hiệu lực đến (tùy chọn)</Label>
                <Input
                  type="date"
                  value={rateForm.effectiveTo}
                  data-testid="hdsd-ins-rate-to"
                  onChange={(e) => setRateForm((f) => ({ ...f, effectiveTo: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={closeRateDialog}>Hủy</Button>
            <Button
              disabled={savingRate || !companyId}
              data-testid="hdsd-ins-rate-save"
              onClick={() => void onSaveRate()}
            >
              <Save className="mr-1.5 h-4 w-4" />
              {savingRate ? 'Đang lưu…' : 'Lưu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Minimum Wage ── */}
      <Dialog open={wageDialogOpen} onOpenChange={(open) => (open ? setWageDialogOpen(true) : closeWageDialog())}>
        <DialogContent
          className="max-w-md"
          data-testid="settings-min-wage-dialog"
        >
          <DialogHeader>
            <DialogTitle>
              Cập nhật lương tối thiểu — {editingRegion ? (REGION_LABELS[editingRegion.region_code] ?? editingRegion.region_code) : ''}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1">
              <Label>Lương tối thiểu/tháng (₫) *</Label>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="4680000"
                value={wageForm.monthlyMinWage}
                data-testid="hdsd-min-wage-amount"
                onChange={(e) => setWageForm((f) => ({ ...f, monthlyMinWage: e.target.value.replace(/[^\d]/g, '') }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Hiệu lực đến (tùy chọn)</Label>
              <Input
                type="date"
                value={wageForm.effectiveTo}
                data-testid="hdsd-min-wage-to"
                onChange={(e) => setWageForm((f) => ({ ...f, effectiveTo: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Trạng thái</Label>
              <Select
                value={wageForm.status}
                onValueChange={(v) => setWageForm((f) => ({ ...f, status: v as 'active' | 'inactive' }))}
              >
                <SelectTrigger className="h-9" data-testid="hdsd-min-wage-status">
                  <SelectValue />
                </SelectTrigger>
                <SettingsDialogSelectContent>
                  <SelectItem value="active">Đang hiệu lực</SelectItem>
                  <SelectItem value="inactive">Ngừng hiệu lực</SelectItem>
                </SettingsDialogSelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={closeWageDialog}>Hủy</Button>
            <Button
              disabled={savingWage || !companyId}
              data-testid="hdsd-min-wage-save"
              onClick={() => void onSaveWage()}
            >
              <Save className="mr-1.5 h-4 w-4" />
              {savingWage ? 'Đang lưu…' : 'Lưu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
