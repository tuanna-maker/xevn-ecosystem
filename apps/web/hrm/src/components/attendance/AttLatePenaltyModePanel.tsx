/**
 * @CODE-MEMORY
 * Screen:     /attendance → Cài đặt → Quy tắc → Phạt muộn/về sớm (ATT-02 mode shell)
 * UC:         UC-BP-ATT-02 · FR-UC-BP-ATT-02 Diễn biến #1/#5 · AC-ATT-02-MODE/XOR/OFF/PATH
 * BR:         BR-BP-SHF-02 · BR-ATT-02-PATH · ≠ CFG alone DONE · Nest /core DENY
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-02
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-ATT-02-CLUSTER-API-01.md F-ATT-RULE-01
 * Purpose:    UI shell XOR mode / bands / scope / latePenaltyEnabled —
 *             bind LIVE envelope when BE READY; stub-safe when ABSENT (no fake XOR persist);
 *             Network only /api/hrm/attendance/rules* · honesty ≠ ATT-02 DONE · PAY OUT · PLT/CORE RETAIN.
 * WorkItem:   PO-HRM-MVP-GD1-ATT-02-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    pages/Attendance.tsx rules → general
 * Callees:    getAttendanceRules · patchAttendanceRules · attRuleRing
 * FEActions:  | Thao tác | Handler | API |
 *             | Tải envelope | load | GET /attendance/rules |
 *             | Lưu mode (LIVE only) | onSave | PATCH /attendance/rules |
 * must_keep:  PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 · CORE07QC1-KZJTSHNT ·
 *             soft≠CORE-06 · Nest /core DENY · U65 · no fake persist when ABSENT
 * SOLID:      Panel owns residual shell; useAttendanceRules RETAIN round/methods/sites
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-att-02-cluster-fe-02.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-ATT-02-CLUSTER-FE-02
 * change_mode: UPGRADE
 * What: LIVE bind display-ready mode·modeLabelVi·bands·scope·sourceFlags·latePenaltyEnabled·
 *       latePenaltyHours · XOR radio one mode · client reject mixed/bands → HRM-VAL-400 ·
 *       off ≠ notifyLate · close R-ATT-02-MODE-FE · Nest /core 0 · CFG alone ≠ ATT-02 DONE.
 * Why: BE-01 READY_FOR_QA · API-01 §4.6 · J-HRM-ATT-02-01..06 U65
 * must_keep: physical /attendance/rules* · printable false · PLT/CORE RETAIN · PAY OUT · U65
 */
import { useCallback, useEffect, useState } from 'react';
import { Loader2, RefreshCw, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getAttendanceRules, patchAttendanceRules } from '@/integrations/hrmApi';
import { ApiClientError, toErrorMessage } from '@/lib/apiError';
import {
  ATT_02_MODE_LABEL_VI,
  ATT_02_MODES,
  ATT_02_VAL_400_CODE,
  R_ATT_02_MODE_FE,
  R_ATT_02_MODE_FE_CLOSED,
  att02HonestyBannerText,
  att02Val400Message,
  buildAtt02LatePenaltyPatchBody,
  parseAtt02LatePenaltyEnvelope,
  resolveAtt02ModeLabelVi,
  validateAtt02LatePenaltyDraft,
  type Att02Band,
  type Att02Mode,
  type Att02SourceFlags,
} from '@/lib/attRuleRing';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type DraftState = {
  mode: Att02Mode | null;
  latePenaltyEnabled: boolean;
  bands: Att02Band[];
  departmentId: string;
  shiftId: string;
  notifyLate: boolean | null;
  sourceFlags: Att02SourceFlags;
  latePenaltyHours: number | null;
};

const emptyDraft = (): DraftState => ({
  mode: null,
  latePenaltyEnabled: true,
  bands: [],
  departmentId: '',
  shiftId: '',
  notifyLate: null,
  sourceFlags: { gpsEnabled: null, wifiEnabled: null, qrEnabled: null },
  latePenaltyHours: null,
});

function formatSourceFlags(flags: Att02SourceFlags): string {
  const parts: string[] = [];
  if (flags.gpsEnabled != null) parts.push(`GPS ${flags.gpsEnabled ? 'bật' : 'tắt'}`);
  if (flags.wifiEnabled != null) parts.push(`Wi‑Fi ${flags.wifiEnabled ? 'bật' : 'tắt'}`);
  if (flags.qrEnabled != null) parts.push(`QR ${flags.qrEnabled ? 'bật' : 'tắt'}`);
  return parts.length ? parts.join(' · ') : '—';
}

function surfaceSaveError(error: unknown): string {
  if (error instanceof ApiClientError && error.code === ATT_02_VAL_400_CODE) {
    return toErrorMessage(error, att02Val400Message('generic'));
  }
  if (typeof error === 'object' && error !== null) {
    const code = (error as { code?: string }).code;
    if (code === ATT_02_VAL_400_CODE) {
      return toErrorMessage(error, att02Val400Message('generic'));
    }
  }
  return toErrorMessage(error, 'Không lưu được cấu hình phạt.');
}

export function AttLatePenaltyModePanel() {
  const { currentCompanyId } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [envelopePresent, setEnvelopePresent] = useState(false);
  const [modeLabelVi, setModeLabelVi] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftState>(emptyDraft);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [clientValError, setClientValError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!currentCompanyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    setClientValError(null);
    try {
      // Company SoT load; optional dept/shift scope applied on PATCH (U19).
      const row = (await getAttendanceRules(currentCompanyId)) as Record<string, unknown>;
      const env = parseAtt02LatePenaltyEnvelope(row);
      setEnvelopePresent(env.envelopePresent);
      setModeLabelVi(env.modeLabelVi);
      setDraft({
        mode: env.mode,
        latePenaltyEnabled: env.latePenaltyEnabled ?? true,
        bands: env.bands,
        departmentId: env.scope.departmentId ?? '',
        shiftId: env.scope.shiftId ?? '',
        notifyLate: env.notifyLate,
        sourceFlags: env.sourceFlags,
        latePenaltyHours: env.latePenaltyHours,
      });
    } catch (error: unknown) {
      setLoadError(toErrorMessage(error, 'Không tải được quy tắc phạt muộn.'));
      setEnvelopePresent(false);
      setDraft(emptyDraft());
    } finally {
      setLoading(false);
    }
  }, [currentCompanyId]);

  useEffect(() => {
    void load();
  }, [load]);

  const onSave = async () => {
    if (!currentCompanyId || !envelopePresent) {
      toast({
        title: 'Chưa sẵn sàng',
        description: `${R_ATT_02_MODE_FE}: BE chưa wire mode/bands — cấm lưu giả XOR.`,
        variant: 'destructive',
      });
      return;
    }
    const preflight = validateAtt02LatePenaltyDraft({
      mode: draft.mode,
      latePenaltyEnabled: draft.latePenaltyEnabled,
      bands: draft.bands,
    });
    if (preflight) {
      setClientValError(preflight);
      toast({
        title: ATT_02_VAL_400_CODE,
        description: preflight,
        variant: 'destructive',
      });
      return;
    }
    if (!draft.mode) return;
    setClientValError(null);
    setSaving(true);
    try {
      const body = buildAtt02LatePenaltyPatchBody({
        mode: draft.mode,
        latePenaltyEnabled: draft.latePenaltyEnabled,
        bands: draft.bands,
        departmentId: draft.departmentId,
        shiftId: draft.shiftId,
      });
      const updated = (await patchAttendanceRules(
        currentCompanyId,
        body,
      )) as Record<string, unknown>;
      const env = parseAtt02LatePenaltyEnvelope(updated);
      setEnvelopePresent(env.envelopePresent);
      setModeLabelVi(env.modeLabelVi);
      setDraft({
        mode: env.mode,
        latePenaltyEnabled: env.latePenaltyEnabled ?? draft.latePenaltyEnabled,
        bands: env.bands,
        departmentId: env.scope.departmentId ?? '',
        shiftId: env.scope.shiftId ?? '',
        notifyLate: env.notifyLate,
        sourceFlags: env.sourceFlags,
        latePenaltyHours: env.latePenaltyHours,
      });
      toast({
        title: 'Đã lưu',
        description: `Chế độ: ${resolveAtt02ModeLabelVi(env.mode, env.modeLabelVi)} · CFG alone ≠ ATT-02 DONE`,
      });
    } catch (error: unknown) {
      const msg = surfaceSaveError(error);
      setClientValError(msg.includes(ATT_02_VAL_400_CODE) ? msg : null);
      toast({
        title: msg.includes(ATT_02_VAL_400_CODE) ? ATT_02_VAL_400_CODE : 'Lỗi lưu',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const updateBand = (index: number, patch: Partial<Att02Band>) => {
    setDraft((prev) => {
      const bands = [...prev.bands];
      bands[index] = { ...bands[index], ...patch };
      return { ...prev, bands };
    });
    setClientValError(null);
  };

  const addBand = () => {
    setDraft((prev) => ({
      ...prev,
      bands: [...prev.bands, { fromMinutes: 1, toMinutes: 15, penaltyHours: 0.5 }],
    }));
    setClientValError(null);
  };

  const removeBand = (index: number) => {
    setDraft((prev) => ({
      ...prev,
      bands: prev.bands.filter((_, i) => i !== index),
    }));
    setClientValError(null);
  };

  const selectMode = (m: Att02Mode) => {
    // XOR: radio enforces exactly one — never set multiple mode* flags
    setDraft((prev) => ({ ...prev, mode: m }));
    setClientValError(null);
    setModeLabelVi(ATT_02_MODE_LABEL_VI[m]);
  };

  return (
    <Card className="border-xevn-border bg-xevn-surface" data-testid="att-02-late-penalty-panel">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="text-[20px] font-bold text-xevn-text">
              Phạt muộn / về sớm
              <Badge
                variant="outline"
                className="ml-2 border-xevn-border text-xevn-textSecondary text-[10px] font-semibold align-middle"
                data-testid="att-02-mode-status-badge"
              >
                {envelopePresent ? R_ATT_02_MODE_FE_CLOSED : `${R_ATT_02_MODE_FE} HOLD`}
              </Badge>
            </CardTitle>
            <CardDescription className="text-[15px] text-xevn-textSecondary mt-1">
              XOR một chế độ (phút | block | bậc) · physical{' '}
              <code className="text-xs">/api/hrm/attendance/rules*</code> · Nest /core = 0
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2 border-xevn-border"
            onClick={() => void load()}
            disabled={loading || !currentCompanyId}
            data-testid="att-02-mode-refresh"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Tải lại
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!envelopePresent && (
          <Alert
            className="border-xevn-border bg-xevn-surface"
            data-testid="att-02-mode-residual-banner"
          >
            <AlertTitle className="text-[15px] font-semibold text-xevn-text">
              Mode / bands / scope / off — chờ BE residual
            </AlertTitle>
            <AlertDescription className="text-[14px] text-xevn-textSecondary space-y-1">
              <p>
                GET <code>/api/hrm/attendance/rules</code> chưa trả envelope{' '}
                <code>mode</code> / <code>bands</code> / <code>latePenaltyEnabled</code>. Panel
                hiển thị stub — <strong>không</strong> persist XOR giả.
              </p>
              <p>
                Peers RETAIN: round / notify_late / work-sites / work-shifts / late-early (≠ mode
                SoT). CFG alone ≠ ATT-02 DONE.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {envelopePresent && (
          <Alert
            className="border-xevn-border bg-xevn-surface"
            data-testid="att-02-mode-live-banner"
          >
            <AlertTitle className="text-[15px] font-semibold text-xevn-text">
              {R_ATT_02_MODE_FE_CLOSED} — envelope LIVE
            </AlertTitle>
            <AlertDescription className="text-[14px] text-xevn-textSecondary">
              Display-ready từ GET/PATCH <code>/api/hrm/attendance/rules*</code>. XOR một mode ·
              tắt phạt ≠ tắt notify_late · CFG alone ≠ ATT-02 DONE · ≠ ATT module UAT.
            </AlertDescription>
          </Alert>
        )}

        {loadError && (
          <Alert variant="destructive" data-testid="att-02-mode-load-error">
            <AlertTitle>Lỗi tải</AlertTitle>
            <AlertDescription>{loadError}</AlertDescription>
          </Alert>
        )}

        {clientValError && (
          <Alert variant="destructive" data-testid="att-02-mode-val-400">
            <AlertTitle>{ATT_02_VAL_400_CODE}</AlertTitle>
            <AlertDescription>{clientValError}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center py-8" data-testid="att-02-mode-loading">
            <Loader2 className="h-6 w-6 animate-spin text-xevn-primary" />
          </div>
        ) : (
          <fieldset
            disabled={!envelopePresent}
            className="space-y-5 disabled:opacity-70"
            data-testid="att-02-mode-fieldset"
          >
            <div className="space-y-3">
              <Label className="text-[15px] font-semibold text-xevn-text">Chế độ phạt (XOR)</Label>
              <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Chế độ phạt XOR">
                {ATT_02_MODES.filter((m) => m !== 'band').map((m) => {
                  const id = `att-02-mode-${m}`;
                  const checked = draft.mode === m || (m === 'tier' && draft.mode === 'band');
                  return (
                    <label
                      key={m}
                      htmlFor={id}
                      className="flex items-center gap-2 rounded-input border border-xevn-border px-3 py-2 text-[15px] text-xevn-text cursor-pointer"
                    >
                      <input
                        id={id}
                        type="radio"
                        name="att-02-mode"
                        className="accent-xevn-primary"
                        checked={checked}
                        onChange={() => selectMode(m)}
                        data-testid={id}
                      />
                      {ATT_02_MODE_LABEL_VI[m]}
                    </label>
                  );
                })}
              </div>
              {modeLabelVi && envelopePresent && (
                <p className="text-sm text-xevn-textSecondary" data-testid="att-02-mode-label-vi">
                  Nhãn: {resolveAtt02ModeLabelVi(draft.mode, modeLabelVi)}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                id="att-02-late-penalty-enabled"
                checked={draft.latePenaltyEnabled}
                onCheckedChange={(c) =>
                  setDraft((prev) => ({ ...prev, latePenaltyEnabled: c === true }))
                }
                data-testid="att-02-late-penalty-enabled"
              />
              <label htmlFor="att-02-late-penalty-enabled" className="text-sm text-xevn-text">
                Bật phạt muộn/về sớm (tắt → penalty = 0 · notify_late ≠ off)
              </label>
            </div>

            {draft.notifyLate != null && (
              <p className="text-xs text-xevn-textSecondary" data-testid="att-02-notify-late-peer">
                Peer notify_late = {draft.notifyLate ? 'bật' : 'tắt'} (≠ cờ tắt phạt ·{' '}
                {draft.latePenaltyEnabled ? 'phạt đang bật' : 'phạt đang tắt'})
              </p>
            )}

            <div
              className="rounded-input border border-xevn-border px-3 py-2 text-sm text-xevn-textSecondary"
              data-testid="att-02-source-flags"
            >
              <span className="font-semibold text-xevn-text">Nguồn hợp lệ (sourceFlags): </span>
              {formatSourceFlags(draft.sourceFlags)}
            </div>

            {draft.latePenaltyHours != null && (
              <p className="text-sm text-xevn-textSecondary" data-testid="att-02-late-penalty-hours">
                latePenaltyHours (funnel cite): {draft.latePenaltyHours}
              </p>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="att-02-dept" className="text-sm text-xevn-textSecondary">
                  Phòng ban (scope · optional)
                </Label>
                <Input
                  id="att-02-dept"
                  value={draft.departmentId}
                  onChange={(e) => setDraft((prev) => ({ ...prev, departmentId: e.target.value }))}
                  placeholder="departmentId"
                  className="text-[15px] text-xevn-text"
                  data-testid="att-02-scope-department"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="att-02-shift" className="text-sm text-xevn-textSecondary">
                  Ca (scope · optional)
                </Label>
                <Input
                  id="att-02-shift"
                  value={draft.shiftId}
                  onChange={(e) => setDraft((prev) => ({ ...prev, shiftId: e.target.value }))}
                  placeholder="shiftId"
                  className="text-[15px] text-xevn-text"
                  data-testid="att-02-scope-shift"
                />
              </div>
            </div>
            <p className="text-xs text-xevn-textSecondary">
              Resolve: dept+shift &gt; dept &gt; company &gt; shift default · DENY company-only SoT
              forever
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <Label className="text-[15px] font-semibold text-xevn-text">Bảng mức (bands)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addBand}
                  className="border-xevn-border"
                  data-testid="att-02-band-add"
                >
                  Thêm mức
                </Button>
              </div>
              {draft.bands.length === 0 ? (
                <p className="text-sm text-xevn-textSecondary" data-testid="att-02-bands-empty">
                  Chưa có mức — mode phút có thể không cần bands.
                </p>
              ) : (
                <div className="space-y-2" data-testid="att-02-bands-list">
                  {draft.bands.map((b, i) => (
                    <div
                      key={`band-${i}`}
                      className="grid grid-cols-12 gap-2 items-end"
                      data-testid={`att-02-band-row-${i}`}
                    >
                      <div className="col-span-3 space-y-1">
                        <Label className="text-xs text-xevn-textSecondary">Từ (phút)</Label>
                        <Input
                          type="number"
                          value={b.fromMinutes}
                          onChange={(e) =>
                            updateBand(i, { fromMinutes: Number(e.target.value) || 0 })
                          }
                          className="text-[15px]"
                        />
                      </div>
                      <div className="col-span-3 space-y-1">
                        <Label className="text-xs text-xevn-textSecondary">Đến (phút)</Label>
                        <Input
                          type="number"
                          value={b.toMinutes}
                          onChange={(e) =>
                            updateBand(i, { toMinutes: Number(e.target.value) || 0 })
                          }
                          className="text-[15px]"
                        />
                      </div>
                      <div className="col-span-3 space-y-1">
                        <Label className="text-xs text-xevn-textSecondary">Giờ phạt</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={b.penaltyHours}
                          onChange={(e) =>
                            updateBand(i, { penaltyHours: Number(e.target.value) || 0 })
                          }
                          className="text-[15px]"
                        />
                      </div>
                      <div className="col-span-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full border-xevn-border"
                          onClick={() => removeBand(i)}
                        >
                          Xóa
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                className="gap-2 bg-xevn-primary hover:bg-xevn-primaryPressed text-white"
                disabled={!envelopePresent || saving}
                onClick={() => void onSave()}
                data-testid="att-02-mode-save"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Lưu chế độ phạt
              </Button>
            </div>
          </fieldset>
        )}

        <p
          className="text-xs text-xevn-textSecondary leading-relaxed border-t border-xevn-border pt-3"
          data-testid="att-02-honesty"
        >
          {att02HonestyBannerText()}
        </p>
      </CardContent>
    </Card>
  );
}
