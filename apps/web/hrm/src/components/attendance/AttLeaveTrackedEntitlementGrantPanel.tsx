/**
 * @CODE-MEMORY
 * Screen:     /attendance → Nghỉ phép — HR cấp entitled (Diễn biến #2)
 * UC:         UC-BP-ATT-04 · peer UC-BP-ATT-09 · PUT tracked-entitlement
 * API_DESIGN: F-ATT-LEAVE-BAL-UPSERT-01 · GET leave-balance/panel peer
 * Purpose:    HR upsert entitled_days qua product path — invalidate panel sau 2xx.
 * WorkItem:   PO-HRM-MVP-GD1-ATT-04-CLUSTER-FE-01
 * Coded:      2026-08-09
 * must_keep:  pending_days=held peer ATT-09 · DENY att_leave_hold · U65 · Nest /core DENY
 * SOLID:      Grant tách LeaveTab list — chỉ nhận employeeId + callbacks
 * LastVerified: poHrmMvpGd1Att04ClusterFe01.source.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-MVP-GD1-ATT-05-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: Grant path label «Phép chuyển kỳ» for carry_over MVP bucket
 * Why: J-HRM-ATT-05-04 · PUT tracked-entitlement on leave_type=carry_over
 * must_keep: ATT04 grant RETAIN · DENY merge annual · U65
 */
import { useState } from 'react';
import { Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { putTrackedLeaveEntitlement } from '@/integrations/hrmApi';
import { toErrorMessage } from '@/lib/apiError';
import { ATT_LEAVE_04_PATH_ASSERT, R_ATT_04_GRANT } from '@/lib/attLeave04Ring';
import { deriveAtt05PanelBucketLabelVi } from '@/lib/attLeave05Ring';
import { MVP_LEAVE_BALANCE_TYPE_CODES } from '@/lib/leaveBalance';
import { coerceHrmListCompanyId } from '@/lib/hrmListScope';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { useAttLeaveTypesEffective } from '@/hooks/useAttLeaveTypesEffective';

export type AttLeaveTrackedEntitlementGrantPanelProps = {
  employeeId: string;
  defaultLeaveType?: string;
  balanceYear?: number;
  onGranted?: () => void;
};

export function AttLeaveTrackedEntitlementGrantPanel({
  employeeId,
  defaultLeaveType,
  balanceYear,
  onGranted,
}: AttLeaveTrackedEntitlementGrantPanelProps) {
  const { currentCompanyId } = useAuth();
  const year = balanceYear ?? new Date().getFullYear();
  const { leaveTypeOptions } = useAttLeaveTypesEffective();
  const mvpOptions = MVP_LEAVE_BALANCE_TYPE_CODES.map((code) => {
    const fromEff = leaveTypeOptions.find((o) => o.value === code);
    const label = deriveAtt05PanelBucketLabelVi(code, fromEff?.label);
    return { value: code, label };
  });

  const [leaveType, setLeaveType] = useState(defaultLeaveType?.trim() || 'annual');
  const [entitledDays, setEntitledDays] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onGrant = async () => {
    if (!currentCompanyId || !employeeId.trim()) {
      toast({ title: 'Thiếu nhân viên hoặc phạm vi', variant: 'destructive' });
      return;
    }
    const parsed = Number.parseFloat(entitledDays.replace(',', '.'));
    if (!Number.isFinite(parsed) || parsed < 0) {
      toast({ title: 'Số ngày entitled không hợp lệ', variant: 'destructive' });
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await putTrackedLeaveEntitlement({
        company_id: coerceHrmListCompanyId(currentCompanyId),
        employee_id: employeeId.trim(),
        leave_type: leaveType,
        balance_year: year,
        entitled_days: parsed,
      });
      toast({
        title: 'Đã cập nhật quỹ entitled',
        description: `${leaveType} · ${year}: ${parsed} ngày`,
      });
      setEntitledDays('');
      onGranted?.();
    } catch (err) {
      const msg = toErrorMessage(err, 'Không cập nhật được quỹ phép.');
      setError(msg);
      toast({ title: 'Cấp quỹ thất bại', description: msg, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (!employeeId.trim()) {
    return null;
  }

  return (
    <Alert
      className="border-xevn-border bg-xevn-surface/90"
      data-testid="att-04-grant-panel"
    >
      <AlertTitle className="text-base font-semibold text-xevn-text">
        Cấp quỹ phép (HR) · {R_ATT_04_GRANT}
      </AlertTitle>
      <AlertDescription className="space-y-3 text-[15px] text-xevn-textSecondary">
        <p className="text-xs">
          PUT {ATT_LEAVE_04_PATH_ASSERT.trackedEntitlement} — U65 product path (≠ seed). held = pending_days
          (peer ATT-09).
        </p>
        <div className="grid gap-3 sm:grid-cols-12">
            <div className="grid gap-1 sm:col-span-3">
              <Label>Loại quỹ</Label>
              <Select value={leaveType} onValueChange={setLeaveType}>
                <SelectTrigger data-testid="hdsd-att-grant-leave-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mvpOptions.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      data-testid={
                        opt.value === 'carry_over' ? 'hdsd-att-grant-leave-type-carry-over' : undefined
                      }
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1 sm:col-span-2">
              <Label>Năm</Label>
              <Input readOnly className="tabular-nums" value={String(year)} />
            </div>
            <div className="grid gap-1 sm:col-span-3">
              <Label>Entitled (ngày)</Label>
              <Input
                inputMode="decimal"
                placeholder="12"
                data-testid="hdsd-att-grant-entitled-days"
                value={entitledDays}
                onChange={(e) => setEntitledDays(e.target.value)}
              />
            </div>
            <div className="flex items-end sm:col-span-4">
              <Button
                type="button"
                disabled={saving}
                onClick={() => void onGrant()}
                data-testid="hdsd-att-grant-save"
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Đang lưu…' : 'Lưu entitled'}
              </Button>
            </div>
          </div>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </AlertDescription>
    </Alert>
  );
}
