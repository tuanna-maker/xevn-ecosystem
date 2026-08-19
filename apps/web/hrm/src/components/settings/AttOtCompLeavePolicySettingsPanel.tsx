/**
 * @CODE-MEMORY
 * Screen:     /attendance → Cài đặt → Chế độ phép bù OT (F-ATT-OT-COMP-POLICY)
 * UC:         UC-BP-ATT-06 · FR-UC-BP-ATT-06 · J-HRM-ATT-06-01 · J-HRM-ATT-06-07
 * API_DESIGN: GET/PUT /api/hrm/attendance/ot-comp-leave-policy
 * Purpose:    HCNS bật/tắt chế độ bù OT + tỷ lệ giờ→ngày; comp_balance_key compensatory only.
 * WorkItem:   PO-HRM-MVP-GD1-ATT-06-CLUSTER-FE-01
 * Coded:      2026-08-10
 * must_keep: DENY merge compensatory→annual · Nest /core DENY · ≠ ATT-06 DONE · U65
 * LastVerified: poHrmMvpGd1Att06ClusterFe01.source.test.ts
 */
import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Save } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useHrmOperatingUnitFilter } from '@/contexts/HrmOperatingUnitFilterContext';
import { getOtCompLeavePolicy, listEffectiveAttOtCompTypes, putOtCompLeavePolicy } from '@/integrations/hrmApi';
import { toErrorMessage } from '@/lib/apiError';
import { ensureAtt06CatalogPrereqs } from '@/lib/att06CatalogEnsure';
import { ATT_OT_COMP_TYPES_EFFECTIVE_QUERY_KEY } from '@/hooks/useAttOtCompTypesEffective';
import { ATT_LEAVE_TYPES_EFFECTIVE_QUERY_KEY } from '@/hooks/useAttLeaveTypesEffective';
import {
  ATT_06_COMPENSATORY_BUCKET,
  att06HonestyBannerText,
  buildPolicyMapsCompCodes,
  R_ATT_06_POLICY,
} from '@/lib/attLeave06Ring';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';

export function AttOtCompLeavePolicySettingsPanel() {
  const { currentCompanyId } = useAuth();
  const { listCompanyId } = useHrmOperatingUnitFilter();
  const companyId = listCompanyId || currentCompanyId;
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modeEnabled, setModeEnabled] = useState(false);
  const [hoursPerDay, setHoursPerDay] = useState('8');

  const load = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    try {
      const row = await getOtCompLeavePolicy({ company_id: companyId });
      setModeEnabled(Boolean(row.modeEnabled));
      setHoursPerDay(
        row.hoursPerLeaveDay != null && Number.isFinite(row.hoursPerLeaveDay)
          ? String(row.hoursPerLeaveDay)
          : '8',
      );
    } catch (err) {
      setError(toErrorMessage(err, 'Không tải được chế độ phép bù OT.'));
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    void load();
  }, [load]);

  const onSave = async () => {
    if (!companyId) {
      toast({ title: 'Thiếu phạm vi đơn vị', variant: 'destructive' });
      return;
    }
    let hours: number | null = null;
    if (modeEnabled) {
      const parsed = Number.parseFloat(hoursPerDay.replace(',', '.'));
      if (!Number.isFinite(parsed) || parsed <= 0) {
        toast({
          title: 'Tỷ lệ giờ→ngày phải > 0 khi bật chế độ',
          variant: 'destructive',
        });
        return;
      }
      hours = parsed;
    }

    setSaving(true);
    try {
      await ensureAtt06CatalogPrereqs(companyId);
      void queryClient.invalidateQueries({ queryKey: [ATT_OT_COMP_TYPES_EFFECTIVE_QUERY_KEY] });
      void queryClient.invalidateQueries({ queryKey: [ATT_LEAVE_TYPES_EFFECTIVE_QUERY_KEY] });

      const eff = await listEffectiveAttOtCompTypes({ company_id: companyId });
      const effCodes = (eff.items ?? []).map((row) => String(row.code ?? '').trim()).filter(Boolean);
      const maps_comp_codes = buildPolicyMapsCompCodes(effCodes);

      await putOtCompLeavePolicy({
        company_id: companyId,
        mode_enabled: modeEnabled,
        hours_per_leave_day: hours,
        comp_balance_key: ATT_06_COMPENSATORY_BUCKET,
        maps_comp_codes,
      });
      toast({ title: 'Đã lưu chế độ phép bù OT' });
      await load();
    } catch (err) {
      toast({
        title: 'Lưu thất bại',
        description: toErrorMessage(err, 'Không lưu được cấu hình.'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4" data-testid="settings-att-ot-comp-leave-policy">
      <Alert
        data-testid="att-06-policy-honesty"
        data-att-06-seal-c-slice="true"
        data-att-06-seal-att05="true"
        data-att-06-seal-compensatory="true"
      >
        <AlertDescription className="text-xs text-xevn-textSecondary">
          {att06HonestyBannerText()}
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-[18px]">Chế độ phép bù OT</CardTitle>
            <CardDescription>
              {R_ATT_06_POLICY} — duyệt OT hình thức nghỉ bù → cộng quỹ «Phép bù OT» (
              {ATT_06_COMPENSATORY_BUCKET}), tách khỏi phép năm.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading || !companyId}
            data-testid="hdsd-att-ot-comp-leave-policy-reload"
            onClick={() => void load()}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Tải lại
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex items-center justify-between gap-4 rounded-input border border-xevn-border p-4">
            <div className="space-y-1">
              <Label htmlFor="att-06-mode-enabled">Bật chế độ bù OT</Label>
              <p className="text-xs text-xevn-textSecondary">
                Tắt → duyệt OT vẫn 2xx nhưng không cộng quỹ mới (J-HRM-ATT-06-07).
              </p>
            </div>
            <Switch
              id="att-06-mode-enabled"
              data-testid="att-06-policy-mode-enabled"
              checked={modeEnabled}
              onCheckedChange={setModeEnabled}
              disabled={loading || saving}
            />
          </div>

          <div className="grid gap-2 max-w-xs">
            <Label htmlFor="att-06-hours-per-day">Số giờ OT = 1 ngày phép bù</Label>
            <Input
              id="att-06-hours-per-day"
              data-testid="att-06-policy-hours-per-day"
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(e.target.value)}
              disabled={!modeEnabled || loading || saving}
              placeholder="8"
            />
          </div>

          <Button
            type="button"
            className="bg-xevn-primary hover:bg-xevn-primaryPressed text-white"
            disabled={loading || saving || !companyId}
            data-testid="hdsd-att-ot-comp-leave-policy-save"
            onClick={() => void onSave()}
          >
            <Save className="mr-2 h-4 w-4" />
            Lưu
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
