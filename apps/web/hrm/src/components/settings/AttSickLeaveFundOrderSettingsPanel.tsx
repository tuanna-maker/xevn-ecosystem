/**
 * @CODE-MEMORY
 * Screen:     /attendance → Cài đặt → Thứ tự quỹ nghỉ ốm (F-ATT-SICK-POLICY-ORDER)
 * UC:         UC-BP-ATT-07 · FR-UC-BP-ATT-07 · J-HRM-ATT-07-05 · BR-BP-LV-04
 * API_DESIGN: GET/PUT /api/hrm/attendance/sick-leave-fund-order
 * Purpose:    HCNS cấu hình thứ tự trừ quỹ ốm; label isProgramDefault khi chưa persist tenant.
 * WorkItem:   PO-HRM-MVP-GD1-ATT-07-CLUSTER-FE-01
 * Coded:      2026-08-10
 * must_keep: DENY merge sick→annual panel · Nest /core DENY · ≠ ATT-07 DONE · U65
 * LastVerified: poHrmMvpGd1Att07ClusterFe01.source.test.ts
 */
import { useCallback, useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, RefreshCw, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useHrmOperatingUnitFilter } from '@/contexts/HrmOperatingUnitFilterContext';
import { getSickLeaveFundOrder, putSickLeaveFundOrder } from '@/integrations/hrmApi';
import { toErrorMessage } from '@/lib/apiError';
import {
  ATT_07_PROGRAM_DEFAULT_LABEL_VI,
  att07HonestyBannerText,
  att07ResidualHoldFooterLines,
  fundSequenceTokenLabelVi,
  R_ATT_07_POLICY_ORDER,
  SICK_FUND_SEQUENCE_TOKENS,
} from '@/lib/attLeave07Ring';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { toast } from '@/hooks/use-toast';

const DEFAULT_SEQUENCE = ['insurance', 'company', 'unpaid'];

export function AttSickLeaveFundOrderSettingsPanel() {
  const { currentCompanyId } = useAuth();
  const { listCompanyId } = useHrmOperatingUnitFilter();
  const companyId = listCompanyId || currentCompanyId;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProgramDefault, setIsProgramDefault] = useState(true);
  const [fundSequence, setFundSequence] = useState<string[]>([...DEFAULT_SEQUENCE]);
  const [annualFirstEnabled, setAnnualFirstEnabled] = useState(false);
  const [insuranceDayCap, setInsuranceDayCap] = useState('');
  const [overInsuranceAction, setOverInsuranceAction] = useState<'company_topup' | 'unpaid'>(
    'company_topup',
  );

  const load = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    try {
      const row = await getSickLeaveFundOrder({ company_id: companyId });
      setIsProgramDefault(Boolean(row.isProgramDefault));
      setFundSequence(
        row.fundSequence?.length ? [...row.fundSequence] : [...DEFAULT_SEQUENCE],
      );
      setAnnualFirstEnabled(Boolean(row.annualFirstEnabled));
      setInsuranceDayCap(
        row.insuranceDayCap != null && Number.isFinite(row.insuranceDayCap)
          ? String(row.insuranceDayCap)
          : '',
      );
      setOverInsuranceAction(row.overInsuranceAction ?? 'company_topup');
    } catch (err) {
      setError(toErrorMessage(err, 'Không tải được thứ tự quỹ nghỉ ốm.'));
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    void load();
  }, [load]);

  const moveToken = (index: number, dir: -1 | 1) => {
    setFundSequence((seq) => {
      const next = [...seq];
      const target = index + dir;
      if (target < 0 || target >= next.length) return seq;
      const tmp = next[index];
      next[index] = next[target];
      next[target] = tmp;
      return next;
    });
  };

  const addToken = (token: string) => {
    const t = token.trim().toLowerCase();
    if (!t) return;
    setFundSequence((seq) => {
      if (seq.includes(t)) return seq;
      return [...seq, t];
    });
  };

  const removeToken = (index: number) => {
    setFundSequence((seq) => {
      if (seq.length <= 1) return seq;
      return seq.filter((_, i) => i !== index);
    });
  };

  const onSave = async () => {
    if (!companyId) {
      toast({ title: 'Thiếu phạm vi đơn vị', variant: 'destructive' });
      return;
    }
    const unique = [...new Set(fundSequence.map((s) => s.trim().toLowerCase()).filter(Boolean))];
    if (unique.length !== fundSequence.length) {
      toast({
        title: 'Thứ tự quỹ không hợp lệ',
        description: 'Không được trùng phần tử trong fundSequence.',
        variant: 'destructive',
      });
      return;
    }
    let cap: number | null = null;
    if (insuranceDayCap.trim()) {
      const parsed = Number.parseFloat(insuranceDayCap.replace(',', '.'));
      if (!Number.isFinite(parsed) || parsed < 0) {
        toast({
          title: 'Trần ngày BH phải ≥ 0',
          variant: 'destructive',
        });
        return;
      }
      cap = parsed;
    }

    setSaving(true);
    try {
      await putSickLeaveFundOrder({
        company_id: companyId,
        fund_sequence: unique,
        annual_first_enabled: annualFirstEnabled,
        insurance_day_cap: cap,
        over_insurance_action: cap != null ? overInsuranceAction : null,
        status: 'active',
      });
      toast({ title: 'Đã lưu thứ tự quỹ nghỉ ốm' });
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
    <div className="space-y-4" data-testid="settings-att-sick-leave-fund-order">
      <Alert
        data-testid="att-07-policy-honesty"
        data-att-07-seal-c-slice="true"
        data-att-06-seal-att05="true"
      >
        <AlertDescription className="text-xs text-xevn-textSecondary">
          {att07HonestyBannerText()}
          <span className="block mt-1">{att07ResidualHoldFooterLines().join(' · ')}</span>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-[18px]">Thứ tự quỹ nghỉ ốm</CardTitle>
            <CardDescription>
              {R_ATT_07_POLICY_ORDER} — thứ tự trừ BH / CTY / phép năm / không lương theo tenant.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading || !companyId}
            data-testid="hdsd-att-sick-leave-fund-order-reload"
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

          {isProgramDefault ? (
            <Badge
              variant="outline"
              className="text-xs"
              data-testid="att-07-fund-order-program-default"
            >
              {ATT_07_PROGRAM_DEFAULT_LABEL_VI}
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-xs" data-testid="att-07-fund-order-persisted">
              Đã lưu cấu hình tenant
            </Badge>
          )}

          <div className="space-y-2">
            <Label>Thứ tự trừ quỹ (trên → dưới)</Label>
            <ul className="space-y-2 rounded-input border border-xevn-border p-3">
              {fundSequence.map((token, index) => (
                <li
                  key={`${token}-${index}`}
                  className="flex items-center justify-between gap-2 text-sm"
                  data-testid={`att-07-fund-seq-${index}`}
                >
                  <span>
                    {index + 1}. {fundSequenceTokenLabelVi(token)}{' '}
                    <span className="text-xevn-textSecondary">({token})</span>
                  </span>
                  <span className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      aria-label="Lên"
                      disabled={loading || saving || index === 0}
                      onClick={() => moveToken(index, -1)}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      aria-label="Xuống"
                      disabled={loading || saving || index === fundSequence.length - 1}
                      onClick={() => moveToken(index, 1)}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs"
                      disabled={loading || saving || fundSequence.length <= 1}
                      onClick={() => removeToken(index)}
                    >
                      Gỡ
                    </Button>
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-end gap-2 max-w-md">
              <div className="grid gap-1 flex-1 min-w-[140px]">
                <Label className="text-xs">Thêm bước</Label>
                <Select
                  onValueChange={(v) => addToken(v)}
                  disabled={loading || saving}
                >
                  <SelectTrigger data-testid="att-07-fund-seq-add">
                    <SelectValue placeholder="Chọn quỹ…" />
                  </SelectTrigger>
                  <SelectContent>
                    {SICK_FUND_SEQUENCE_TOKENS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {fundSequenceTokenLabelVi(t)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-input border border-xevn-border p-4">
            <div className="space-y-1">
              <Label htmlFor="att-07-annual-first">Ưu tiên phép năm trước</Label>
              <p className="text-xs text-xevn-textSecondary">
                Khi bật và «annual» nằm đầu chuỗi — trừ phép năm trước (SRS «còn phép năm»).
              </p>
            </div>
            <Switch
              id="att-07-annual-first"
              data-testid="att-07-policy-annual-first"
              checked={annualFirstEnabled}
              onCheckedChange={setAnnualFirstEnabled}
              disabled={loading || saving}
            />
          </div>

          <div className="grid gap-2 max-w-xs">
            <Label htmlFor="att-07-insurance-cap">Trần ngày BH (tùy chọn)</Label>
            <Input
              id="att-07-insurance-cap"
              data-testid="att-07-policy-insurance-cap"
              value={insuranceDayCap}
              onChange={(e) => setInsuranceDayCap(e.target.value)}
              disabled={loading || saving}
              placeholder="VD: 30"
            />
          </div>

          {insuranceDayCap.trim() ? (
            <div className="grid gap-2 max-w-md">
              <Label>Hành động khi vượt trần BH</Label>
              <Select
                value={overInsuranceAction}
                onValueChange={(v) =>
                  setOverInsuranceAction(v as 'company_topup' | 'unpaid')
                }
                disabled={loading || saving}
              >
                <SelectTrigger data-testid="att-07-policy-over-insurance">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="company_topup">Hỗ trợ CTY (company_topup)</SelectItem>
                  <SelectItem value="unpaid">Không lương (unpaid)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <Button
            type="button"
            className="bg-xevn-primary hover:bg-xevn-primaryPressed text-white"
            disabled={loading || saving || !companyId}
            data-testid="hdsd-att-sick-leave-fund-order-save"
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
