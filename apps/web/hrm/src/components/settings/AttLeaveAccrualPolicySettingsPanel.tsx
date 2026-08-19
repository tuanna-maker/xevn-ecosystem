/**
 * @CODE-MEMORY
 * Screen:     /attendance → Cài đặt → Quy tắc quỹ phép (F-ATT-LVRULE)
 * UC:         UC-BP-ATT-04 · FR-UC-BP-ATT-04 Diễn biến #1
 * API_DESIGN: F-ATT-LVRULE-01..04 · POST/PATCH/retire leave-accrual-policies
 * Purpose:    Admin CRUD chính sách tích lũy versioned — residual R-ATT-04-POLICY-ADM wire.
 * WorkItem:   PO-HRM-MVP-GD1-ATT-04-CLUSTER-FE-01
 * Coded:      2026-08-09
 * must_keep:  ≠ attendance_rules sole · FY/engine HOLD footer · Nest /core DENY · U65 · honesty false
 * SOLID:      Panel mutate; LeaveTab consumer EFF/LVRULE effective riêng
 * LastVerified: poHrmMvpGd1Att04ClusterFe01.source.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-MVP-GD1-ATT-05-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: RETAIN carryOverExpireRule · carryCapDays on LVRULE admin · R-ATT-05-FY/ENGINE footers
 * Why: J-HRM-ATT-05-03 · F-ATT-LVRULE · ≠ expire job DONE
 * must_keep: ATT04QC1 · ATT04BQC1 · cap 04b RETAIN · U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-MVP-GD1-ATT-04B-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: HOLD footer trần ứng (R-ATT-04B-CAP-CRUD) · wire cap fields when BE returns on policy rows
 * Why: J-HRM-ATT-04B-05 conditional · F-ATT-LVRULE cap GAP
 * must_keep: ATT04QC1 · LVRULE RETAIN · U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-13 PO-HRM-SETTINGS-IA-COPY-WAVE2-FE-01
 * change_mode: UPGRADE
 * What: Form thêm quy tắc chuyển từ Card cố định trên bảng sang Dialog (nút "Thêm mới" cạnh
 *       tiêu đề mở Dialog rỗng; Lưu thành công → đóng Dialog + reset form; đóng không lưu →
 *       reset form qua onOpenChange). CardTitle bỏ hậu tố "(LVRULE)". Empty-state cập nhật
 *       theo CTA mới (bỏ "(U65 · không seed)").
 * Why: PO-HRM-SETTINGS-IA-COPY-WAVE2-FE-01 — chuẩn PAT-SETTINGS-CATALOG-01 (List+Dialog).
 * SRS: (không phát sinh SRS mới — IA + copy hygiene, không đổi hành vi mutate/validate)
 * must_keep: honesty banner att04HonestyBannerText/att05HonestyBannerText + 3 Alert HOLD giữ
 *            NGUYÊN VẸN nội dung/logic (ngoài phạm vi work item này); mọi data-testid cũ
 *            (settings-att-leave-accrual-policies, att-04-honesty, att-05-lvrule-honesty,
 *            att-05-fy-hold, att-04b-cap-hold, hdsd-att-lvrule-*, att-lvrule-row-*); createAtt
 *            LeaveAccrualPolicy/retireAttLeaveAccrualPolicy logic không đổi
 * LastVerified: docs/qa/evidence/po-hrm-settings-ia-copy-wave2-fe-01.md
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, RefreshCw, Save, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useHrmOperatingUnitFilter } from '@/contexts/HrmOperatingUnitFilterContext';
import {
  createAttLeaveAccrualPolicy,
  listAttLeaveAccrualPolicies,
  retireAttLeaveAccrualPolicy,
  type HrmAttLeaveAccrualPolicyRecord,
} from '@/integrations/hrmApi';
import { toErrorMessage } from '@/lib/apiError';
import {
  ATT_04_ACCRUAL_MODE_LABELS_VI,
  att04HonestyBannerText,
  parseAtt04AccrualPolicyDisplay,
  R_ATT_04_ENGINE,
  R_ATT_04_FY,
} from '@/lib/attLeave04Ring';
import {
  isAtt04bAdvanceCapCrudLive,
  R_ATT_04B_CAP_CRUD,
} from '@/lib/attLeave04bRing';
import {
  ATT_05_CARRY_EXPIRE_RULE_OPTIONS,
  att05HonestyBannerText,
  deriveAtt05CarryExpireRuleLabelVi,
  isAtt05CarryPolicyCrudLive,
  parseAtt05CarryPolicyFromPolicyRow,
  R_ATT_05_ENGINE,
  R_ATT_05_FY,
  R_ATT_05_ROLLOVER,
  R_ATT_05_EXPIRE,
} from '@/lib/attLeave05Ring';
import { useAttLeaveTypesEffective } from '@/hooks/useAttLeaveTypesEffective';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';

type FormState = {
  leaveTypeKey: string;
  accrualMode: string;
  annualDays: string;
  effectiveFrom: string;
  effectiveTo: string;
  advanceMaxDays: string;
  advanceCapPercent: string;
  carryOverExpireRule: string;
  carryCapDays: string;
};

const emptyForm = (): FormState => ({
  leaveTypeKey: '',
  accrualMode: 'year_start_grant',
  annualDays: '12',
  effectiveFrom: `${new Date().getFullYear()}-01-01`,
  effectiveTo: '',
  advanceMaxDays: '',
  advanceCapPercent: '',
  carryOverExpireRule: '',
  carryCapDays: '',
});

const ACCRUAL_MODES = Object.keys(ATT_04_ACCRUAL_MODE_LABELS_VI);

export function AttLeaveAccrualPolicySettingsPanel() {
  const { currentCompanyId } = useAuth();
  const { listCompanyId } = useHrmOperatingUnitFilter();
  const companyId = listCompanyId || currentCompanyId;
  const { leaveTypeOptions, isLoading: typesLoading } = useAttLeaveTypesEffective();

  const [items, setItems] = useState<HrmAttLeaveAccrualPolicyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [dialogOpen, setDialogOpen] = useState(false);

  const capCrudLive = useMemo(
    () =>
      isAtt04bAdvanceCapCrudLive(
        items.map((row) => row as unknown as Record<string, unknown>),
      ),
    [items],
  );

  const carryCrudLive = useMemo(
    () =>
      isAtt05CarryPolicyCrudLive(
        items.map((row) => row as unknown as Record<string, unknown>),
      ),
    [items],
  );

  const loadRows = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await listAttLeaveAccrualPolicies({ company_id: companyId });
      setItems(res.items);
    } catch (err) {
      setError(toErrorMessage(err, 'Không tải được quy tắc quỹ phép.'));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  const handleDialogOpenChange = (next: boolean) => {
    setDialogOpen(next);
    if (!next) {
      // Đóng không lưu (Esc / click ngoài / nút Hủy) — tránh giữ state cũ lần mở sau.
      setForm(emptyForm());
    }
  };

  const onSave = async () => {
    if (!companyId) {
      toast({ title: 'Thiếu phạm vi đơn vị', variant: 'destructive' });
      return;
    }
    const leaveTypeKey = form.leaveTypeKey.trim();
    if (!leaveTypeKey) {
      toast({ title: 'Chọn loại phép', variant: 'destructive' });
      return;
    }
    const annualParsed = Number.parseFloat(form.annualDays.replace(',', '.'));
    if (!Number.isFinite(annualParsed) || annualParsed < 0) {
      toast({ title: 'Số ngày/năm không hợp lệ', variant: 'destructive' });
      return;
    }
    if (!form.effectiveFrom.trim()) {
      toast({ title: 'Thiếu ngày hiệu lực', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const capMax = form.advanceMaxDays.trim()
        ? Number.parseFloat(form.advanceMaxDays.replace(',', '.'))
        : null;
      const capPct = form.advanceCapPercent.trim()
        ? Number.parseFloat(form.advanceCapPercent.replace(',', '.'))
        : null;
      const carryCap = form.carryCapDays.trim()
        ? Number.parseFloat(form.carryCapDays.replace(',', '.'))
        : null;
      if (carryCrudLive && carryCap != null && (!Number.isFinite(carryCap) || carryCap < 0)) {
        toast({ title: 'Trần mang sang (ngày) không hợp lệ', variant: 'destructive' });
        setSaving(false);
        return;
      }
      await createAttLeaveAccrualPolicy({
        companyId,
        leaveTypeKey,
        accrualMode: form.accrualMode,
        annualDays: annualParsed,
        unit: 'day',
        effectiveFrom: form.effectiveFrom.trim(),
        effectiveTo: form.effectiveTo.trim() || null,
        status: 'active',
        ...(capCrudLive && capMax != null && Number.isFinite(capMax)
          ? { advanceMaxDays: capMax }
          : {}),
        ...(capCrudLive && capPct != null && Number.isFinite(capPct)
          ? { advanceCapPercent: capPct }
          : {}),
        ...(carryCrudLive && form.carryOverExpireRule.trim()
          ? { carryOverExpireRule: form.carryOverExpireRule.trim() }
          : {}),
        ...(carryCrudLive && carryCap != null && Number.isFinite(carryCap)
          ? { carryCapDays: carryCap }
          : {}),
      });
      toast({ title: 'Đã tạo quy tắc quỹ', description: leaveTypeKey });
      setForm(emptyForm());
      setDialogOpen(false);
      await loadRows();
    } catch (err) {
      toast({
        title: 'Lưu quy tắc thất bại',
        description: toErrorMessage(err, 'Không tạo được quy tắc quỹ.'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const onRetire = async (row: HrmAttLeaveAccrualPolicyRecord) => {
    if (!companyId) return;
    const display = parseAtt04AccrualPolicyDisplay(row as unknown as Record<string, unknown>);
    const ok = window.confirm(
      `Ngừng quy tắc «${display.leaveTypeNameVi}» v${display.version}? (soft-retire)`,
    );
    if (!ok) return;
    try {
      await retireAttLeaveAccrualPolicy(row.id, companyId);
      toast({ title: 'Đã ngừng quy tắc quỹ' });
      await loadRows();
    } catch (err) {
      toast({
        title: 'Ngừng quy tắc thất bại',
        description: toErrorMessage(err, 'Không ngừng được quy tắc.'),
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
      <Card className="rounded-card border-xevn-border" data-testid="settings-att-leave-accrual-policies">
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 space-y-1">
          <div className="space-y-1">
            <CardTitle className="text-[20px] font-bold text-xevn-text">Quy tắc quỹ phép</CardTitle>
            <CardDescription className="text-[15px] text-xevn-textSecondary">
              Chính sách tích lũy versioned — không thay thế Cài đặt chấm công chung.
              <span className="block mt-1 text-xs" data-testid="att-04-honesty" className="hidden" className="hidden">
                {att04HonestyBannerText()}
              </span>
              <span className="block mt-1 text-xs" data-testid="att-05-lvrule-honesty" className="hidden" className="hidden">
                {att05HonestyBannerText()}
              </span>
            </CardDescription>
          </div>
          <DialogTrigger asChild>
            <Button type="button" size="sm" data-testid="att-lvrule-add-new" onClick={() => setDialogOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              Thêm mới
            </Button>
          </DialogTrigger>
        </CardHeader>
        <CardContent className="space-y-6">
          

          

          

          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => void loadRows()} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Tải lại
            </Button>
            {error ? (
              <span className="text-sm text-destructive" role="alert">
                {error}
              </span>
            ) : null}
          </div>

          <div className="overflow-x-auto rounded-input border border-xevn-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loại phép</TableHead>
                  <TableHead>Phiên bản</TableHead>
                  <TableHead>Chế độ</TableHead>
                  <TableHead className="text-right">Ngày/năm</TableHead>
                  <TableHead>Hiệu lực</TableHead>
                  <TableHead>Mang sang</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="w-[80px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-[15px] text-xevn-textSecondary">
                      Đang tải…
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-[15px] text-xevn-textSecondary" role="status">
                      Chưa có quy tắc quỹ — bấm «Thêm mới» ở trên để tạo bản ghi đầu tiên.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((row) => {
                    const d = parseAtt04AccrualPolicyDisplay(row as unknown as Record<string, unknown>);
                    const carry = parseAtt05CarryPolicyFromPolicyRow(
                      row as unknown as Record<string, unknown>,
                    );
                    const carryLabel = carry?.carryOverExpireRule
                      ? deriveAtt05CarryExpireRuleLabelVi(
                          carry.carryOverExpireRule,
                          carry.carryOverExpireRuleLabelVi,
                        )
                      : '—';
                    return (
                      <TableRow key={row.id} data-testid={`att-lvrule-row-${row.id}`}>
                        <TableCell className="font-medium">{d.leaveTypeNameVi}</TableCell>
                        <TableCell>v{d.version}</TableCell>
                        <TableCell>{d.accrualModeLabelVi}</TableCell>
                        <TableCell className="text-right tabular-nums">{d.annualDays}</TableCell>
                        <TableCell className="text-sm">
                          {d.effectiveFrom}
                          {d.effectiveTo ? ` → ${d.effectiveTo}` : ''}
                        </TableCell>
                        <TableCell className="text-xs text-xevn-textSecondary">
                          {carryLabel}
                          {carry?.carryCapDays != null ? (
                            <span className="block tabular-nums">Trần {carry.carryCapDays} ngày</span>
                          ) : null}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{d.statusLabelVi}</Badge>
                        </TableCell>
                        <TableCell>
                          {row.status === 'active' ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label="Ngừng quy tắc"
                              onClick={() => void onRetire(row)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <DialogContent className="max-w-2xl" data-testid="att-lvrule-dialog">
        <DialogHeader>
          <DialogTitle>Thêm quy tắc quỹ phép</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-12">
          <div className="grid gap-2 sm:col-span-6">
            <Label>Loại phép (EFF)</Label>
            <Select
              value={form.leaveTypeKey || undefined}
              onValueChange={(v) => setForm((f) => ({ ...f, leaveTypeKey: v }))}
              disabled={typesLoading || leaveTypeOptions.length === 0}
            >
              <SelectTrigger data-testid="hdsd-att-lvrule-leave-type">
                <SelectValue placeholder={typesLoading ? 'Đang tải…' : 'Chọn loại phép'} />
              </SelectTrigger>
              <SelectContent>
                {leaveTypeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2 sm:col-span-6">
            <Label>Chế độ tích lũy</Label>
            <Select
              value={form.accrualMode}
              onValueChange={(v) => setForm((f) => ({ ...f, accrualMode: v }))}
            >
              <SelectTrigger data-testid="hdsd-att-lvrule-mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACCRUAL_MODES.map((mode) => (
                  <SelectItem key={mode} value={mode}>
                    {ATT_04_ACCRUAL_MODE_LABELS_VI[mode] ?? mode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2 sm:col-span-3">
            <Label>Ngày/năm</Label>
            <Input
              inputMode="decimal"
              data-testid="hdsd-att-lvrule-annual-days"
              value={form.annualDays}
              onChange={(e) => setForm((f) => ({ ...f, annualDays: e.target.value }))}
            />
          </div>
          <div className="grid gap-2 sm:col-span-3">
            <Label>Hiệu lực từ</Label>
            <Input
              type="date"
              data-testid="hdsd-att-lvrule-effective-from"
              value={form.effectiveFrom}
              onChange={(e) => setForm((f) => ({ ...f, effectiveFrom: e.target.value }))}
            />
          </div>
          {capCrudLive ? (
            <>
              <div className="grid gap-2 sm:col-span-3">
                <Label>Trần ứng (ngày)</Label>
                <Input
                  inputMode="decimal"
                  data-testid="hdsd-att-lvrule-advance-max-days"
                  value={form.advanceMaxDays}
                  onChange={(e) => setForm((f) => ({ ...f, advanceMaxDays: e.target.value }))}
                />
              </div>
              <div className="grid gap-2 sm:col-span-3">
                <Label>Trần ứng (% quỹ)</Label>
                <Input
                  inputMode="decimal"
                  data-testid="hdsd-att-lvrule-advance-cap-percent"
                  value={form.advanceCapPercent}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, advanceCapPercent: e.target.value }))
                  }
                />
              </div>
            </>
          ) : null}
          {carryCrudLive ? (
            <>
              <div className="grid gap-2 sm:col-span-8">
                <Label>Quy tắc hết hạn mang sang</Label>
                <Select
                  value={form.carryOverExpireRule || undefined}
                  onValueChange={(v) => setForm((f) => ({ ...f, carryOverExpireRule: v }))}
                >
                  <SelectTrigger data-testid="hdsd-att-lvrule-carry-expire-rule">
                    <SelectValue placeholder="Chọn quy tắc (metadata)" />
                  </SelectTrigger>
                  <SelectContent>
                    {ATT_05_CARRY_EXPIRE_RULE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2 sm:col-span-4">
                <Label>Trần ngày mang sang</Label>
                <Input
                  inputMode="decimal"
                  data-testid="hdsd-att-lvrule-carry-cap-days"
                  value={form.carryCapDays}
                  onChange={(e) => setForm((f) => ({ ...f, carryCapDays: e.target.value }))}
                />
              </div>
            </>
          ) : null}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleDialogOpenChange(false)} disabled={saving}>
            Hủy
          </Button>
          <Button
            type="button"
            disabled={saving}
            onClick={() => void onSave()}
            data-testid="hdsd-att-lvrule-save"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Đang lưu…' : 'Tạo quy tắc'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
