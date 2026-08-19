/**
 * @CODE-MEMORY
 * Screen:     /attendance → Cài đặt → Lịch lễ / Tết (ATT-03b thin LIVE admin)
 * UC:         UC-BP-ATT-03b · FR-UC-BP-ATT-03b Diễn biến #1 · AC-ATT-03B-ADMIN/SOT/F5/PATH
 * BR:         BR-BP-HOL-01 residual · BR-ATT-03B-≠-THIN · Nest /core DENY
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-03b
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-ATT-03B-CLUSTER-API-01.md F-ATT-HOL-01
 * Purpose:    Admin CRUD năm thin {date,nameVi} → GET/PUT physical
 *             /api/hrm/attendance/holiday-calendars/:year · statusLabelVi FE-derive ·
 *             residual lunar/type/publish stub-honest (not DONE) · Nest /core = 0 ·
 *             honesty thin ≠ ATT-03b DONE · PAY OUT · U65 no seed.
 * WorkItem:   PO-HRM-MVP-GD1-ATT-03B-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    pages/Attendance.tsx settings → holiday-calendar
 * Callees:    getHolidayCalendar · putHolidayCalendar · attHoliday03bRing
 * FEActions:  | Thao tác | Handler | API |
 *             | Tải năm | load | GET …/holiday-calendars/:year |
 *             | Lưu năm | onSave | PUT …/holiday-calendars/:year |
 * must_keep:  ATT01QC1-MSLZ3KIM · ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH ·
 *             ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02/PLT/CORE · Nest /core DENY ·
 *             R-ATT-01-ASSIGN open · DENY att_leave_hold · printable false · U65
 * SOLID:      Panel owns thin admin; residual deepen deferred to BE-01
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-att-03b-cluster-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-ATT-03B-CLUSTER-FE-02
 * What: UPGRADE residual admin — lunarFlag · calendarType · isPaid · dayType · status ·
 *       show statusLabelVi/dayTypeLabelVi · midYearPendingLeaveRecalcRequired on replace ·
 *       HOL-MISS CTA peer RETAIN · Nest /core 0 · honesty ≠ residual alone=ATT-03b DONE.
 * must_keep: ATT01QC1-MSLZ3KIM · ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D ·
 *            ATT08QC1-MSLSL36C · ATT02/PLT/CORE · R-ATT-01-ASSIGN open · DENY att_leave_hold ·
 *            PAY OUT · printable false · U65 · C-SLICE
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-att-03b-cluster-fe-02.md
 */
import { useCallback, useEffect, useState } from 'react';
import { Loader2, Plus, RefreshCw, Save, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getHolidayCalendar, putHolidayCalendar } from '@/integrations/hrmApi';
import { ApiClientError, toErrorMessage } from '@/lib/apiError';
import {
  ATT_03B_VAL_400_CODE,
  att03bAdminLiveBadgeText,
  att03bEmptyYearCtaText,
  att03bHonestyBannerText,
  att03bMidYearRecalcBannerText,
  att03bResidualDeepenBannerText,
  buildAtt03bPutYearBody,
  emptyAtt03bYearEnvelope,
  isAtt03bHol404Error,
  parseAtt03bHolidayCalendarEnvelope,
  resolveAtt03bDayTypeLabelVi,
  validateAtt03bYearDraft,
  type Att03bCalendarStatus,
  type Att03bCalendarType,
  type Att03bHolidayDay,
} from '@/lib/attHoliday03bRing';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type DraftDay = {
  key: string;
  date: string;
  nameVi: string;
  lunarFlag: boolean;
  calendarType: Att03bCalendarType | '';
  isPaid: boolean;
  dayType: '' | 'nghi' | 'truc';
};

function toDraftDays(days: Att03bHolidayDay[]): DraftDay[] {
  return days.map((d, i) => {
    const dt = String(d.dayType ?? '').toLowerCase();
    const dayType: DraftDay['dayType'] =
      dt === 'nghi' || dt === 'truc' ? dt : '';
    return {
      key: `${d.date}-${i}`,
      date: d.date,
      nameVi: d.nameVi ?? '',
      lunarFlag: d.lunarFlag === true,
      calendarType: d.calendarType ?? '',
      isPaid: d.isPaid !== false,
      dayType,
    };
  });
}

function surfaceSaveError(error: unknown): string {
  if (error instanceof ApiClientError && error.code === ATT_03B_VAL_400_CODE) {
    return toErrorMessage(error, 'Dữ liệu lịch lễ không hợp lệ (HRM-VAL-400).');
  }
  if (typeof error === 'object' && error !== null) {
    const code = (error as { code?: string }).code;
    if (code === ATT_03B_VAL_400_CODE) {
      return toErrorMessage(error, 'Dữ liệu lịch lễ không hợp lệ (HRM-VAL-400).');
    }
  }
  return toErrorMessage(error, 'Không lưu được lịch lễ năm.');
}

export function AttHolidayCalendarPanel() {
  const { currentCompanyId } = useAuth();
  const { toast } = useToast();
  const nowYear = new Date().getFullYear();
  const [year, setYear] = useState(nowYear);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Att03bCalendarStatus>('draft');
  const [calendarType, setCalendarType] = useState<Att03bCalendarType | ''>('solar');
  const [statusLabelVi, setStatusLabelVi] = useState<string>('—');
  const [dayCount, setDayCount] = useState(0);
  const [envelopePresent, setEnvelopePresent] = useState(false);
  const [residualDeepenPresent, setResidualDeepenPresent] = useState(false);
  const [midYearPending, setMidYearPending] = useState(false);
  const [draftDays, setDraftDays] = useState<DraftDay[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [clientValError, setClientValError] = useState<string | null>(null);

  const applyEnvelope = (
    env: ReturnType<typeof parseAtt03bHolidayCalendarEnvelope>,
  ) => {
    setEnvelopePresent(env.envelopePresent);
    setResidualDeepenPresent(env.residualDeepenPresent);
    setStatusLabelVi(env.statusLabelVi ?? '—');
    setDayCount(env.dayCount);
    setDraftDays(toDraftDays(env.days));
    setMidYearPending(env.midYearPendingLeaveRecalcRequired);
    const st = String(env.status ?? '')
      .trim()
      .toLowerCase();
    if (st === 'effective' || st === 'published' || st === 'active') {
      setStatus('effective');
    } else if (st === 'draft' || st === 'nhap' || st === 'nháp' || env.envelopePresent) {
      setStatus('draft');
    }
    if (env.calendarType === 'solar' || env.calendarType === 'lunar') {
      setCalendarType(env.calendarType);
    }
  };

  const load = useCallback(async () => {
    if (!currentCompanyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    setClientValError(null);
    setMidYearPending(false);
    try {
      const row = await getHolidayCalendar(year, currentCompanyId);
      const env = parseAtt03bHolidayCalendarEnvelope(row);
      applyEnvelope(env);
    } catch (error: unknown) {
      if (isAtt03bHol404Error(error)) {
        const empty = emptyAtt03bYearEnvelope(year, currentCompanyId);
        applyEnvelope(empty);
        setStatusLabelVi(empty.statusLabelVi ?? 'Chưa có lịch năm');
        setStatus('draft');
        setCalendarType('solar');
        setLoadError(null);
      } else {
        setLoadError(toErrorMessage(error, 'Không tải được lịch lễ năm.'));
        setEnvelopePresent(false);
        setDraftDays([]);
        setMidYearPending(false);
      }
    } finally {
      setLoading(false);
    }
  }, [currentCompanyId, year]);

  useEffect(() => {
    void load();
  }, [load]);

  const onAddDay = () => {
    setDraftDays((prev) => [
      ...prev,
      {
        key: `new-${Date.now()}`,
        date: `${year}-01-01`,
        nameVi: '',
        lunarFlag: false,
        calendarType: calendarType || 'solar',
        isPaid: true,
        dayType: 'nghi',
      },
    ]);
  };

  const onRemoveDay = (key: string) => {
    setDraftDays((prev) => prev.filter((d) => d.key !== key));
  };

  const onSave = async () => {
    if (!currentCompanyId) return;
    setClientValError(null);
    const val = validateAtt03bYearDraft(draftDays);
    if (val) {
      setClientValError(val);
      toast({ title: 'Không lưu', description: val, variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const body = buildAtt03bPutYearBody({
        companyId: currentCompanyId,
        status,
        calendarType: calendarType || null,
        days: draftDays.map((d) => ({
          date: d.date,
          nameVi: d.nameVi,
          lunarFlag: d.lunarFlag,
          calendarType: d.calendarType || null,
          isPaid: d.isPaid,
          dayType: d.dayType || null,
        })),
      });
      const row = await putHolidayCalendar(year, body);
      const env = parseAtt03bHolidayCalendarEnvelope(row);
      applyEnvelope(env);
      const mid = env.midYearPendingLeaveRecalcRequired;
      toast({
        title: 'Đã lưu lịch lễ năm',
        description: mid
          ? `${env.dayCount} ngày · cần tính lại đơn nghỉ chờ · residual ≠ ATT-03b DONE`
          : `${env.dayCount} ngày · residual bind ≠ ATT-03b DONE`,
      });
    } catch (error: unknown) {
      const msg = surfaceSaveError(error);
      setClientValError(msg);
      toast({ title: 'Lưu thất bại', description: msg, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4" data-testid="att-03b-holiday-calendar-panel">
      <Alert
        className="border-xevn-border bg-xevn-surface"
        data-testid="att-03b-live-banner"
      >
        <AlertTitle className="text-sm font-semibold text-xevn-text flex items-center gap-2 flex-wrap">
          Lịch lễ / Tết (năm)
          <Badge
            variant="outline"
            className="border-emerald-300 text-emerald-800 text-[10px]"
            data-testid="att-03b-admin-live-badge"
          >
            {att03bAdminLiveBadgeText()}
          </Badge>
        </AlertTitle>
        <AlertDescription className="text-xs text-xevn-textSecondary">
          LIVE GET/PUT /api/hrm/attendance/holiday-calendars/:year · residual lunarFlag ·
          calendarType · isPaid · dayType · status · Nest /core = 0 · no seed · thin PUT ≠ ATT-03b DONE · residual ≠ ATT-03b DONE.
        </AlertDescription>
      </Alert>

      <Alert
        className="border-amber-200 bg-amber-50/60"
        data-testid="att-03b-residual-banner"
      >
        <AlertTitle className="text-sm font-semibold text-amber-900">
          Residual lunar / type / publish (LIVE)
        </AlertTitle>
        <AlertDescription className="text-xs text-amber-900/90">
          {att03bResidualDeepenBannerText()}
          {residualDeepenPresent
            ? ' · BE đã trả residual fields — vẫn ≠ ATT-03b DONE.'
            : ' · Chưa có lunarFlag / isPaid / status từ BE trên năm này.'}
        </AlertDescription>
      </Alert>

      {midYearPending ? (
        <Alert
          className="border-orange-300 bg-orange-50/80"
          data-testid="att-03b-midyear-banner"
        >
          <AlertTitle className="text-sm font-semibold text-orange-950">
            Mid-year replace — pending leave recalc
          </AlertTitle>
          <AlertDescription
            className="text-xs text-orange-950/90"
            data-testid="att-03b-midyear-text"
          >
            {att03bMidYearRecalcBannerText()}
          </AlertDescription>
        </Alert>
      ) : null}

      <Card className="rounded-card border-xevn-border bg-xevn-surface shadow-soft">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-[18px] font-bold text-xevn-text">
                Lịch lễ năm
              </CardTitle>
              <CardDescription className="text-xs text-xevn-textSecondary mt-1">
                Trạng thái:{' '}
                <span className="font-medium text-xevn-text" data-testid="att-03b-status-label">
                  {statusLabelVi}
                </span>
                {' · '}
                <span data-testid="att-03b-day-count">{dayCount}</span> ngày
                {envelopePresent ? '' : ' · năm chưa tạo'}
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="att-03b-year" className="text-xs text-xevn-textSecondary">
                  Năm
                </Label>
                <Input
                  id="att-03b-year"
                  type="number"
                  min={2000}
                  max={2100}
                  className="w-24 h-9 rounded-input"
                  value={year}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    if (Number.isFinite(n)) setYear(n);
                  }}
                  data-testid="att-03b-year-input"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <Label htmlFor="att-03b-status" className="text-xs text-xevn-textSecondary">
                  PH
                </Label>
                <select
                  id="att-03b-status"
                  className="h-9 rounded-input border border-xevn-border bg-white px-2 text-sm text-xevn-text"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Att03bCalendarStatus)}
                  data-testid="att-03b-status-select"
                >
                  <option value="draft">Nháp</option>
                  <option value="effective">Đã phát hành</option>
                </select>
              </div>
              <div className="flex items-center gap-1.5">
                <Label htmlFor="att-03b-cal-type" className="text-xs text-xevn-textSecondary">
                  Lịch
                </Label>
                <select
                  id="att-03b-cal-type"
                  className="h-9 rounded-input border border-xevn-border bg-white px-2 text-sm text-xevn-text"
                  value={calendarType}
                  onChange={(e) =>
                    setCalendarType(e.target.value as Att03bCalendarType | '')
                  }
                  data-testid="att-03b-calendar-type"
                >
                  <option value="solar">Dương</option>
                  <option value="lunar">Âm</option>
                </select>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => void load()}
                disabled={loading || saving}
                data-testid="att-03b-reload"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                ) : (
                  <RefreshCw className="w-4 h-4" aria-hidden />
                )}
                Tải lại
              </Button>
              <Button
                type="button"
                size="sm"
                className="gap-1.5"
                onClick={() => void onSave()}
                disabled={loading || saving || !currentCompanyId}
                data-testid="att-03b-save"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                ) : (
                  <Save className="w-4 h-4" aria-hidden />
                )}
                Lưu
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {loadError ? (
            <Alert variant="destructive" data-testid="att-03b-load-error">
              <AlertTitle className="text-sm">Lỗi tải</AlertTitle>
              <AlertDescription className="text-xs">{loadError}</AlertDescription>
            </Alert>
          ) : null}

          {clientValError ? (
            <Alert variant="destructive" data-testid="att-03b-client-val">
              <AlertTitle className="text-sm">Không lưu</AlertTitle>
              <AlertDescription className="text-xs">{clientValError}</AlertDescription>
            </Alert>
          ) : null}

          {!loading && draftDays.length === 0 ? (
            <Alert
              className="border-xevn-border bg-xevn-surface"
              data-testid="att-03b-empty-cta"
            >
              <AlertTitle className="text-sm font-semibold text-xevn-text">
                Năm trống
              </AlertTitle>
              <AlertDescription className="text-xs text-xevn-textSecondary">
                {att03bEmptyYearCtaText()}
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-3" data-testid="att-03b-days-list">
            {draftDays.map((d, idx) => {
              const dayLabel =
                resolveAtt03bDayTypeLabelVi(d.dayType || null, null) ?? '—';
              return (
                <div
                  key={d.key}
                  className="rounded-card border border-xevn-border/70 p-3 space-y-2"
                  data-testid={`att-03b-day-row-${idx}`}
                >
                  <div className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-4 space-y-1">
                      <Label className="text-xs text-xevn-textSecondary">
                        Ngày (yyyy-MM-dd)
                      </Label>
                      <Input
                        type="date"
                        className="h-9 rounded-input"
                        value={d.date}
                        onChange={(e) => {
                          const v = e.target.value;
                          setDraftDays((prev) =>
                            prev.map((row) =>
                              row.key === d.key ? { ...row, date: v } : row,
                            ),
                          );
                        }}
                        data-testid={`att-03b-day-date-${idx}`}
                      />
                    </div>
                    <div className="col-span-6 space-y-1">
                      <Label className="text-xs text-xevn-textSecondary">Tên VI</Label>
                      <Input
                        className="h-9 rounded-input"
                        value={d.nameVi}
                        placeholder="vd. Tết Dương lịch"
                        onChange={(e) => {
                          const v = e.target.value;
                          setDraftDays((prev) =>
                            prev.map((row) =>
                              row.key === d.key ? { ...row, nameVi: v } : row,
                            ),
                          );
                        }}
                        data-testid={`att-03b-day-name-${idx}`}
                      />
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-xevn-textSecondary"
                        onClick={() => onRemoveDay(d.key)}
                        aria-label="Xóa ngày"
                        data-testid={`att-03b-day-remove-${idx}`}
                      >
                        <Trash2 className="w-4 h-4" aria-hidden />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-3 space-y-1">
                      <Label className="text-xs text-xevn-textSecondary">Loại lịch</Label>
                      <select
                        className="h-9 w-full rounded-input border border-xevn-border bg-white px-2 text-sm"
                        value={d.calendarType}
                        onChange={(e) => {
                          const v = e.target.value as Att03bCalendarType | '';
                          setDraftDays((prev) =>
                            prev.map((row) =>
                              row.key === d.key
                                ? {
                                    ...row,
                                    calendarType: v,
                                    lunarFlag: v === 'lunar' ? true : row.lunarFlag,
                                  }
                                : row,
                            ),
                          );
                        }}
                        data-testid={`att-03b-day-cal-type-${idx}`}
                      >
                        <option value="solar">Dương</option>
                        <option value="lunar">Âm</option>
                      </select>
                    </div>
                    <div className="col-span-3 space-y-1">
                      <Label className="text-xs text-xevn-textSecondary">Loại ngày</Label>
                      <select
                        className="h-9 w-full rounded-input border border-xevn-border bg-white px-2 text-sm"
                        value={d.dayType}
                        onChange={(e) => {
                          const v = e.target.value as DraftDay['dayType'];
                          setDraftDays((prev) =>
                            prev.map((row) =>
                              row.key === d.key ? { ...row, dayType: v } : row,
                            ),
                          );
                        }}
                        data-testid={`att-03b-day-type-${idx}`}
                      >
                        <option value="nghi">Nghỉ lễ</option>
                        <option value="truc">Trực lễ</option>
                      </select>
                    </div>
                    <div className="col-span-2 flex items-center gap-2 h-9">
                      <input
                        id={`att-03b-lunar-${idx}`}
                        type="checkbox"
                        className="h-4 w-4"
                        checked={d.lunarFlag}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setDraftDays((prev) =>
                            prev.map((row) =>
                              row.key === d.key
                                ? {
                                    ...row,
                                    lunarFlag: checked,
                                    calendarType: checked
                                      ? 'lunar'
                                      : row.calendarType || 'solar',
                                  }
                                : row,
                            ),
                          );
                        }}
                        data-testid={`att-03b-day-lunar-${idx}`}
                      />
                      <Label
                        htmlFor={`att-03b-lunar-${idx}`}
                        className="text-xs text-xevn-textSecondary"
                      >
                        Âm
                      </Label>
                    </div>
                    <div className="col-span-2 flex items-center gap-2 h-9">
                      <input
                        id={`att-03b-paid-${idx}`}
                        type="checkbox"
                        className="h-4 w-4"
                        checked={d.isPaid}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setDraftDays((prev) =>
                            prev.map((row) =>
                              row.key === d.key ? { ...row, isPaid: checked } : row,
                            ),
                          );
                        }}
                        data-testid={`att-03b-day-paid-${idx}`}
                      />
                      <Label
                        htmlFor={`att-03b-paid-${idx}`}
                        className="text-xs text-xevn-textSecondary"
                      >
                        Có lương
                      </Label>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs text-xevn-textSecondary">Nhãn loại</Label>
                      <p
                        className="h-9 flex items-center text-sm font-medium text-xevn-text"
                        data-testid={`att-03b-day-type-label-${idx}`}
                      >
                        {dayLabel}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={onAddDay}
              disabled={loading || saving}
              data-testid="att-03b-add-day"
            >
              <Plus className="w-4 h-4" aria-hidden />
              Thêm ngày
            </Button>
          </div>

          <p
            className="text-[11px] text-xevn-textSecondary leading-relaxed pt-2 border-t border-xevn-border/60"
            data-testid="att-03b-honesty"
          >
            {att03bHonestyBannerText()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
