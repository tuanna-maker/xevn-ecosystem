/**
 * @CODE-MEMORY
 * Screen:     Attendance → Leave tab → Tạo yêu cầu nghỉ (create dialog)
 * UC:          UC-HRM-ATT-LEAVE-01 · J-HRM-06
 * BR:          BR-LEAVE-01
 * SRS:         docs/hrm/SRS.md § attendance leave requests
 * TechSpec:    docs/hrm/TECHSPEC.md § leave + employee list keyword
 * Purpose:     Leave request list/approve UI + create dialog. Employee pickers
 *              use capped keyword typeahead (HLD-#### beyond first page).
 * WorkItem:    CD-FB-07-FE-LEAVE-PICKER
 * Coded:       2026-07-19
 *
 * Callers: Attendance page Leave tab
 * Callees: useLeaveRequests · useEmployeePickerSearch → listEmployees
 * must_keep: soft-nav Attendance; F4-01/02 product path; no listAllEmployees; U65 no seed
 * SOLID: Picker read path = useEmployeePickerSearch (shared W2); leave mutate stays in useLeaveRequests
 * LastVerified: apps/web/hrm/src/hooks/useEmployeePicker.test.ts (LeaveTab typeahead)
 *
 * @CODE-MEMORY-CHANGE 2026-07-19 CD-FB-07-FE-LEAVE-PICKER
 *   C-CD-FB-07-01: replace useEmployees dump Select with deferred typeahead
 *   (keyword → GET employees page=1) so HLD-0006 selectable beyond first ~50–100.
 *   Snapshot selected employee for submit after keyword clear. Handover picker same pattern.
 *
 * @CODE-MEMORY-CHANGE 2026-07-23 D-HRM-SETTINGS-MD-CRUD-FE-01
 * change_mode: ADD
 * What: Leave type CatalogSearchPicker từ leave_types catalog (bootstrap discrete nếu empty)
 * Why: FR-HRM-SC-LEAVE-01 · AC-HRM-PICKER-01 · BR-HRM-MD-01
 *
 * @CODE-MEMORY-CHANGE 2026-07-25 D-HRM-SETTINGS-MD-LEAVE-FE-01
 * change_mode: UPGRADE
 * What: Gỡ bootstrap 8 loại nghỉ hardcode khi catalog trống — empty + CTA Cài đặt/sync
 * Why: AC-SET-FS-05 · BR-SET-MD-03 · QA FAIL qa-hrm-settings-master-data-01-20260725
 * must_keep: create/approve khi catalog có item; UF leave 🟢 với catalog thật; U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-07-27 D-HRM-LEAVE-REQ-CREATE-FE-01
 * change_mode: FIX
 * What: Submit vẫn bind employee.company_id; hook maps UUID→TEXT slug holding (G-AT10-01)
 * Why: QA P1 residual FE POST holding UUID; Settings catalog partition alignment
 * must_keep: leave_type CatalogSearchPicker SoT; create dialog path; U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-07-27 D-FE-U72-LEAVE-NOTE-HYGIENE-01
 * change_mode: ADD
 * What: Display lý do nghỉ qua sanitizeLeaveNoteDisplay — `seed:…` → «—»; form nhập không đụng
 * Why: QC C-U72-LEAVE-NOTE-HYGIENE ENV residue trên PNG leave
 * must_keep: C-U72-LEAVE-P3 leave-type unknown→—; soft P2 CLOSED; U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-01 D-HDSD-MUTATE-FE-09
 * change_mode: FIX
 * What: Prefill start/end qua pickNonOverlappingLeaveWindow khi mở dialog — tránh POST 409 overlap U65
 * Why: QA R6 TC-HDSD-08-02-01 — 2027-05-05..07 trùng prior browser rows
 * must_keep: U65 no seed; ViDateField dd/MM/yyyy; overview F5 marker path
 *
 * @CODE-MEMORY-CHANGE 2026-08-03 R-SPINE-LV04-ATTACH-FE-01
 * change_mode: ADD
 * What: Create dialog — đính kèm giấy bác sĩ khi loại ốm/LVT_02; upload feature=leave-attachment → attachment_url
 * Why: QA SPINE-02 LV-04 BLOCKED (no input[type=file]); FR-UC-H03 · BR-LEAVE-ATT-01 ốm≥3 ngày
 * must_keep: LeaveOverviewRecentPanel mount GWC; catalog leave_type SoT; U65 no seed; Vi labels
 *
 * @CODE-MEMORY-CHANGE 2026-08-03 R-SPINE-WEB-APPROVE-UX-01
 * change_mode: FIX
 * What: Requests list — nút Duyệt/Từ chối trên hàng pending + HDSD testid (không chỉ tab Chờ duyệt)
 * Why: QA WEB_APPROVE — APPROVE_LIST_BUTTONS=0 on list tab; HDSD path list→Duyệt
 * must_keep: LeaveOverviewRecentPanel mount GWC; approval tab; LV-03/04 attach; U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-UC-TC-W4-FE-AT12-L1-CREATE-CATALOG-01
 * change_mode: FIX
 * What: Empty leave_types — CTA Đồng bộ từ XBOS (OU scope via useSettingsCatalogsOverview) + HDSD testid
 * Why: QC R-W4-AT12-L1-CREATE-CATALOG — trsport picker empty; U65 FE sync path (cấm seed)
 * must_keep: AT-12 L1 approve; AT-07; pull≠apply/clone; ceo@ EXPECTED_NO_CTA; U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-MFD-M2-ATT-WIRE-BALANCE-01
 * change_mode: FIX
 * What: Wire GET leave-balance (useLeaveBalance) — panel + create dialog; bỏ nhãn Demo
 * Why: SA enterprise map WIRE C5; API HRM-LEAVE-BAL-200 exists; honest empty/error
 * must_keep: approve x-company-id; MD-01 catalog; attach LV-04; U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-ATT-03d-05b-FE-01
 * change_mode: UPGRADE
 * What: Panel quỹ theo loại (useLeaveBalancesByType) + hold/projected trước submit; sharp text tokens
 * Why: FR-UC-BP-ATT-05b · Precision Motion A1–A5 on ATT leave surface
 * must_keep: single-type GET contract; empty OK; no fake LIVE; U65 no seed; no PROP-03e QR
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-ATT-03d-05b-FE-01 (RE-KICK)
 * change_mode: UPGRADE
 * What: Panel quỹ từ GET /leave-balance/panel (5 MVP); single-type chỉ khi loại ngoài MVP
 * Why: BE panel READY — không N×GET; zeros hợp lệ; companyId=token
 * must_keep: stub honesty; no PROP-03e; U65 no seed; FE sau 2xx + F5
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-ATT-C
 * change_mode: UPGRADE
 * What: Remaster leave cluster chrome (S42–S47, S61) → Precision Motion; Dialog/Alert title ≥20
 * Why: ADR-XEVN-PRECISION-MOTION-TOKENS-20260805 §8–§10 · inventory W3-ATT-C
 * Spec: docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md · HRM_UI_BRAND_SCREEN_INVENTORY W3-ATT-C
 * must_keep: leave-balance/panel GET wire; create/approve/reject/delete; Face/GPS honesty; no Attendance CLOSED; no Nest/seed/QR
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-FE-DIALOG-01
 * change_mode: ADD
 * What: Create dialog wide ~920 + compact date/select + reason full-width (ui-neo wire)
 * Why: ADR §16 LOCKED fonts · S3=A · §15.4 U3 · DialogHeader glass/logo from primitive
 * must_keep: leave mutate/balance/attach wires; ATT-03d/05b; Face HOLD; U65 no seed
 * LastVerified: docs/qa/evidence/po-hrm-ui-brand-fe-dialog-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W4-ATT-DIALOG-EXT
 * change_mode: ADD
 * What: Detail/reject/delete *dialog-precision + reject reason xevn-field-reason
 * Why: ADR §16 LOCK · extend beyond create · inventory S45–S47
 * must_keep: leave mutate/balance/attach wires; Face HOLD; U65 no seed
 * LastVerified: docs/qa/evidence/po-hrm-ui-brand-w4-att-dialog-ext.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-ATT-LEAVE-CANCEL-FE-01
 * change_mode: FIX
 * What: Hủy đơn CTA (pending|approved) → cancelLeaveRequest; HDSD leaveListCancel*; confirm dialog
 * Why: AC-ATT-LV-SHEET-02 reverse markers after approve when sheet open; residual FE stub
 * Spec: docs/program/specs/PO-HRM-ATT-LEAVE-FUNNEL-SPEC-01.md §7 AC-ATT-LV-SHEET-02 · F-ATT-LEAVE-FUNNEL-02
 * must_keep: Duyệt→materialize; 409 LOCKED path; Option A; attendance_uat_ready=false; U65 no seed
 * LastVerified: docs/qa/evidence/po-hrm-att-leave-cancel-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-FE-01
 * change_mode: FIX
 * What: Leave type picker binds GET /attendance/leave-types/effective (ATT+REF); empty CTA → Settings Loại phép ATT
 * Why: AC-PLT-ATT-01/02 · BR-PLT-06 — cấm FE hardcode LVT_01..04; retire ẩn picker; historical label từ BE
 * Spec: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01 §3.5 · §5
 * must_keep: cancel/approve/attach wires; work_shifts/sheet untouched; U65; attendance_uat_ready=false
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-att-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-ATT-08-CLUSTER-FE-01
 * change_mode: ADD
 * What: Mount AttLeavePreviewDeductionPanel in create dialog — LIVE preview-deduction when BE READY;
 *       stub-safe ABSENT (no fake T6→T2=4); HOL-MISS disables submit; honesty client-days ≠ ATT-08 DONE.
 * Why: UC-BP-ATT-08 · API-01 F-ATT-LEAVE-01 · BA J-HRM-ATT-08-01..06 · U65
 * Spec: docs/program/specs/PO-HRM-MVP-GD1-ATT-08-CLUSTER-API-01.md
 * must_keep: leave-requests* physical RETAIN; Nest /core 0; ATT02QC1-MSLQZUK7 CFG≠DONE; PLT/CORE;
 *            printable false; PAY OUT; ≠ ATT-09/03b DONE; ≠ ATT UAT; no seed
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-att-08-cluster-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-ATT-08-CLUSTER-FE-02
 * change_mode: UPGRADE
 * What: Bind LIVE preview → submit total_days = deductible_units (ALIGN); HOL-MISS block CTA;
 *       R-ATT-08-PREVIEW-FE CLOSED; DENY calendar as trừ quỹ; Nest /core 0.
 * Why: BE-01 READY · BR-BP-LV-05 · AC-ATT-08-ALIGN/ENGINE · U65
 * Spec: docs/program/specs/PO-HRM-MVP-GD1-ATT-08-CLUSTER-API-01.md §4–§5
 * must_keep: ATT02QC1-MSLQZUK7 CFG≠DONE · PLT/CORE · printable false · PAY OUT · ≠ ATT-09/03b · ≠ ATT UAT
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-att-08-cluster-fe-02.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-ATT-09-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: Bind submit→hold panel pending↑ available↓ · approve settle XOR reject/cancel release;
 *       display-ready held(=pending)·used·statusLabelVi; TYPE-BLOCK when pending; honesty ATT-09;
 *       Nest /core 0; must_keep ATT-08 preview path intact; DENY invent att_leave_hold.
 * Why: UC-BP-ATT-09 · BR-BP-LV-06 · F-ATT-LEAVE-02/03 · API-01 RETAIN · J-HRM-ATT-09-01..06 · U65
 * Spec: docs/program/specs/PO-HRM-MVP-GD1-ATT-09-CLUSTER-API-01.md
 * must_keep: ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 CFG≠DONE · PLT/CORE · printable false · PAY OUT ·
 *            ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT UAT · client-days≠ATT-08 DONE · C-SLICE
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-att-09-cluster-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-ATT-09-CLUSTER-FE-02
 * change_mode: UPGRADE
 * What: TYPE-BLOCK banner on create overlap (proactive + post-409) · list pending hint · detail sync —
 *       R-ATT-09-TYPE-BLOCK-UI residual (≠ toast-only 409).
 * Why: QA J-05 · QC ATT09QC1-MSLUTL9D GWC carry
 * must_keep: FE-01 hold/settle · honesty · ATT-08 preview · Nest /core DENY · DENY att_leave_hold
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-att-09-cluster-fe-02.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-MVP-GD1-ATT-04B-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: Panel bucket labels advance/unpaid · GATE-REJECT banner HRM-LEAVE-VAL-BALANCE ·
 *       allows_advance from effective catalog · HOLD footer J-04/J-05 until BE branch/cap LIVE.
 * Why: J-HRM-ATT-04B-01..06 · AC-ATT-04B-PANEL/GATE-REJECT · API-04B RETAIN · ≠ FR-04b DONE
 * must_keep: ATT04QC1 · ATT09QC1 · ATT03D · Nest /core DENY · DENY att_leave_hold · U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-MVP-GD1-ATT-05-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: Panel «Phép chuyển kỳ» carry_over · ledger sep note · att-05 honesty/HOLD footers · grant path peer
 * Why: J-HRM-ATT-05-01..06 · F-ATT-LEAVE-BAL · BR-BP-LV-02 · ≠ FR-05 DONE
 * must_keep: ATT04QC1 · ATT04BQC1 · ATT09 · DENY merge annual · FY/ENGINE HOLD · U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-MVP-GD1-ATT-05B-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: R-ATT-05B-PANEL-FE on create form — open/type refetch panel+by-type · att-05b honesty/empty/advance footers;
 *       carry_over bucket separate (peer ATT05QC1) · post-submit invalidate panel · preview/overlap peers RETAIN.
 * Why: UC-BP-ATT-05b · BA O6–O11 · J-HRM-ATT-05B-01..06 · U65
 * must_keep: ATT05QC1 · ATT04BQC1 · ATT04QC1 · ATT09 · ATT03D · DENY att_leave_hold · DENY merge carry→annual · Nest /core 0
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-att-05b-cluster-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-MVP-GD1-ATT-06-CLUSTER-FE-01
 * change_mode: ADD
 * What: R-ATT-06-PANEL-FE — ot_comp loại phép → highlight bucket compensatory «Phép bù OT»; att-06-form-panel stamp.
 * Why: J-HRM-ATT-06-05 · peer ATT05BQC1 · AC-ATT-06-TYPE-MAP · ≠ merge annual
 * must_keep: ATT05BQC1 panel wire · pending_days · U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-MVP-GD1-ATT-07-CLUSTER-FE-01
 * change_mode: ADD
 * What: R-ATT-07-FE-PICKER — cờ BH/CTY từ EFF · att-07-sick-attach · dayBranches toast peer;
 *       att-07 honesty · panel RETAIN 5 MVP (no sick bucket) · ≠ FR-07 DONE.
 * Why: J-HRM-ATT-07-01..04 · F-ATT-CAT-LVT-EFF · F-ATT-LEAVE-02 · ATT06QC1 must_keep
 */
import { useEffect, useMemo, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { format, parseISO, eachDayOfInterval, differenceInDays } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import i18n from '@/i18n';
import {
  Calendar as CalendarIcon,
  Plus,
  Check,
  X,
  Clock,
  FileText,
  User,
  Filter,
  Trash2,
  Loader2,
  Eye,
  MessageSquare,
  Paperclip,
  RefreshCw,
} from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ViDateField } from '@/components/ui/ViDateField';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useHrmOperatingUnitFilter } from '@/contexts/HrmOperatingUnitFilterContext';
import { useToast } from '@/hooks/use-toast';
import {
  useDebouncedPickerKeyword,
  useEmployeePickerSearch,
} from '@/hooks/useEmployeePicker';
import { useLeaveRequests, LeaveRequestFormData, LeaveRequest } from '@/hooks/useLeaveRequests';
import { useAttLeaveTypesEffective } from '@/hooks/useAttLeaveTypesEffective';
import { useSettingsCatalogsOverview } from '@/hooks/useSettingsCatalogsOverview';
import { CatalogSearchPicker } from '@/components/common/CatalogSearchPicker';
import { AttLeavePreviewDeductionPanel } from '@/components/attendance/AttLeavePreviewDeductionPanel';
import { AttLeaveTrackedEntitlementGrantPanel } from '@/components/attendance/AttLeaveTrackedEntitlementGrantPanel';
import {
  att08HolMissMessage,
  resolveAtt08SubmitTotalDays,
  type Att08PreviewDeductionEnvelope,
} from '@/lib/attLeaveRing';
import {
  att09HonestyBannerText,
  att09OverlapTypeBlockBannerMessage,
  att09TypeBlockMessage,
  findAtt09DateOverlapConflict,
  isAtt09LeaveTypeChangeBlocked,
  resolveAtt09HeldDays,
} from '@/lib/attLeave09Ring';
import {
  att04bBalanceRejectBannerMessage,
  att04bHonestyBannerText,
  att04bResidualHoldFooterLines,
  isAtt04bOverBalanceBranchLive,
  resolveEffectiveAllowsAdvance,
  type Att04bBalanceRejectDetail,
  type Att04bBalanceResolution,
} from '@/lib/attLeave04bRing';
import {
  att05HonestyBannerText,
  att05LedgerSeparationNoteVi,
  att05ResidualHoldFooterLines,
  deriveAtt05PanelBucketLabelVi,
  isCarryOverLeaveTypeKey,
} from '@/lib/attLeave05Ring';
import {
  ATT_05B_EMPTY_CATALOG_HINT_VI,
  att05bAdvanceHintMessage,
  att05bHonestyBannerText,
  att05bResidualHoldFooterLines,
  att05bShouldShowEmptyCatalogHint,
} from '@/lib/attLeave05bRing';
import {
  ATT_06_COMPENSATORY_LABEL_VI,
  att06HonestyBannerText,
  isOtCompLeaveTypeSelected,
  resolveLeaveBalanceBucketForLeaveType,
} from '@/lib/attLeave06Ring';
import {
  att07HonestyBannerText,
  att07ResidualHoldFooterLines,
  resolveSickLeaveTypeFlags,
} from '@/lib/attLeave07Ring';
import { ensureAtt06OtCompLeaveType } from '@/lib/att06CatalogEnsure';
import {
  isCatalogPickerValueAllowed,
  resolveLeaveTypeLabel,
} from '@/lib/catalogSearchPicker';
import { sanitizeLeaveNoteDisplay } from '@/lib/labelMaps';
import { HDSD_MUTATE_TEST_IDS, hdsdLeaveListApproveTestId, hdsdLeaveListCancelTestId } from '@/lib/hdsdMutateTestIds';
import {
  LEAVE_ATTACHMENT_UPLOAD_FEATURE,
  leaveAttachmentRequired,
  leaveAttachmentSubmitBlocked,
  shouldShowLeaveAttachmentControl,
  toLeaveAttachmentUrlForApi,
  validateLeaveAttachmentFile,
} from '@/lib/leaveAttachment';
import { pickNonOverlappingLeaveWindow } from '@/lib/leaveRequestDateWindow';
import { syncSettingsCatalogsFromXbos, uploadHrmFile } from '@/integrations/hrmApi';
import type { HrmEmployeeRecord } from '@/integrations/hrmApi';
import { ApiClientError, toErrorMessage } from '@/lib/apiError';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useLeaveBalance } from '@/hooks/useLeaveBalance';
import { useLeaveBalancesByType } from '@/hooks/useLeaveBalancesByType';
import {
  MVP_LEAVE_BALANCE_TYPE_CODES,
  projectLeaveBalanceAfterRequest,
  resolveLeaveBalanceDisplayDays,
  resolveLeaveBalanceHeldDays,
} from '@/lib/leaveBalance';

function employeeDeptLabel(emp: HrmEmployeeRecord): string {
  const fromCustom = emp.custom_fields?.department?.trim();
  if (fromCustom) return fromCustom;
  return emp.job_title_key?.trim() || '';
}

function employeePositionLabel(emp: HrmEmployeeRecord): string | undefined {
  const fromCustom = emp.custom_fields?.position?.trim();
  if (fromCustom) return fromCustom;
  return emp.job_title_key?.trim() || undefined;
}

/** Neutral badge chrome — not a leave-type SoT palette (BR-SET-MD-03). */
const LEAVE_TYPE_BADGE_CLASS = 'bg-xevn-textSecondary';

const EMPTY_LEAVE_FORM = {
  employeeId: '',
  leaveType: '',
  startDate: '',
  endDate: '',
  reason: '',
  handoverTo: '',
  handoverTasks: '',
} as const;

export function LeaveTab() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { currentCompanyId, memberships } = useAuth();
  const { listCompanyId } = useHrmOperatingUnitFilter();
  const catalogCompanyId = (listCompanyId || currentCompanyId || '').trim() || null;
  const { requests, isLoading, createRequest, approveRequest, rejectRequest, cancelRequest } = useLeaveRequests();
  /** Effective ATT+REF leave catalog for create picker (AC-PLT-ATT-01 · BR-PLT-06). */
  const {
    items: effectiveLeaveTypes,
    leaveTypeOptions,
    isLoading: leaveTypesLoading,
    isError: leaveTypesError,
    invalidate: invalidateLeaveTypes,
  } = useAttLeaveTypesEffective();
  /** Scope only — sync REF when effective empty (optional XBOS pull). */
  const {
    scope: catalogsScope,
    invalidateSettingsCatalogs,
  } = useSettingsCatalogsOverview({ enabled: leaveTypeOptions.length === 0 });
  const syncLeaveTypesMutation = useMutation({
    mutationFn: () => {
      if (!catalogsScope) {
        throw new Error('Thiếu phạm vi công ty để đồng bộ danh mục');
      }
      return syncSettingsCatalogsFromXbos(catalogsScope);
    },
    onSuccess: (data) => {
      toast({
        title: t('settings.catalogs.syncDone', { count: data.pulledKeys.length }),
      });
      void invalidateSettingsCatalogs();
      invalidateLeaveTypes();
    },
    onError: (e: unknown) => {
      toast({
        title: e instanceof ApiClientError ? e.message : t('common.error'),
        variant: 'destructive',
      });
    },
  });
  const currentLocale = i18n.language === 'vi' ? vi : enUS;
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
  const [attachmentFileName, setAttachmentFileName] = useState<string | null>(null);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  /** ATT-08 — HOL-MISS / GOLD-FAIL từ preview-deduction chặn nộp. */
  const [previewSubmitBlocked, setPreviewSubmitBlocked] = useState(false);
  /** ATT-08 LIVE envelope — ALIGN submit uses deductible_units (≠ calendar). */
  const [previewEnvelope, setPreviewEnvelope] =
    useState<Att08PreviewDeductionEnvelope | null>(null);
  /** FE-02 — visible TYPE-BLOCK when overlap / 409 (≠ toast-only). */
  const [createOverlapBlockRequestId, setCreateOverlapBlockRequestId] = useState<
    string | null
  >(null);
  /** ATT-04b — visible balance gate reject (400 HRM-LEAVE-VAL-BALANCE). */
  const [createBalanceReject, setCreateBalanceReject] =
    useState<Att04bBalanceRejectDetail | null>(null);
  const [overBalanceResolution, setOverBalanceResolution] =
    useState<Att04bBalanceResolution | null>(null);
  const [overBalanceDialogOpen, setOverBalanceDialogOpen] = useState(false);

  /** CD-FB-07: keyword typeahead — never dump full roster into Select. */
  const [employeeKeyword, setEmployeeKeyword] = useState('');
  const [handoverKeyword, setHandoverKeyword] = useState('');
  const debouncedEmployeeKeyword = useDebouncedPickerKeyword(employeeKeyword, 300);
  const debouncedHandoverKeyword = useDebouncedPickerKeyword(handoverKeyword, 300);
  const [selectedEmployee, setSelectedEmployee] = useState<HrmEmployeeRecord | null>(null);

  const {
    employees: pickerEmployees,
    total: pickerTotal,
    isCapped: pickerCapped,
    isFetching: pickerFetching,
  } = useEmployeePickerSearch({
    companyId: currentCompanyId,
    keyword: debouncedEmployeeKeyword,
    enabled: Boolean(currentCompanyId) && isCreateOpen,
  });

  const {
    employees: handoverEmployees,
    total: handoverTotal,
    isCapped: handoverCapped,
    isFetching: handoverFetching,
  } = useEmployeePickerSearch({
    companyId: currentCompanyId,
    keyword: debouncedHandoverKeyword,
    enabled: Boolean(currentCompanyId) && isCreateOpen,
  });

  const [formData, setFormData] = useState({ ...EMPTY_LEAVE_FORM });
  const reasonInputRef = useRef<HTMLTextAreaElement>(null);

  const createDialogOverlapConflict = useMemo(() => {
    if (!formData.employeeId || !formData.startDate || !formData.endDate) return null;
    return findAtt09DateOverlapConflict(
      requests.map((r) => ({
        id: r.id,
        employee_id: r.employee_id,
        start_date: r.start_date,
        end_date: r.end_date,
        status: r.status,
        leave_type: r.leave_type,
      })),
      formData.employeeId,
      formData.startDate,
      formData.endDate,
    );
  }, [requests, formData.employeeId, formData.startDate, formData.endDate]);

  const createTypeBlockRequest = useMemo(() => {
    const id = createOverlapBlockRequestId ?? createDialogOverlapConflict?.id ?? null;
    if (!id) return null;
    return requests.find((r) => r.id === id) ?? null;
  }, [createOverlapBlockRequestId, createDialogOverlapConflict?.id, requests]);

  const showCreateTypeBlockBanner = Boolean(
    createDialogOverlapConflict || createOverlapBlockRequestId,
  );

  const resetCreateForm = () => {
    setFormData({ ...EMPTY_LEAVE_FORM });
    setEmployeeKeyword('');
    setHandoverKeyword('');
    setSelectedEmployee(null);
    setAttachmentUrl(null);
    setAttachmentFileName(null);
    setIsUploadingAttachment(false);
    setPreviewSubmitBlocked(false);
    setPreviewEnvelope(null);
    setCreateOverlapBlockRequestId(null);
    setCreateBalanceReject(null);
    setOverBalanceResolution(null);
    setOverBalanceDialogOpen(false);
  };

  const handleCreateOpenChange = (open: boolean) => {
    setIsCreateOpen(open);
    if (!open) {
      resetCreateForm();
    } else {
      setCreateOverlapBlockRequestId(null);
      setCreateBalanceReject(null);
      setEmployeeKeyword('');
      setHandoverKeyword('');
      if (catalogCompanyId) {
        void ensureAtt06OtCompLeaveType(catalogCompanyId).then((created) => {
          if (created) invalidateLeaveTypes();
        });
      }
      const window = pickNonOverlappingLeaveWindow(
        requests.map((r) => ({
          start_date: r.start_date,
          end_date: r.end_date,
          status: r.status,
        })),
        Date.now(),
      );
      setFormData((prev) => ({
        ...prev,
        startDate: window.startIso,
        endDate: window.endIso,
      }));
    }
  };

  const handleEmployeeSelect = (employeeId: string) => {
    const emp = pickerEmployees.find((e) => e.id === employeeId) ?? null;
    setSelectedEmployee(emp);
    setFormData((prev) => ({
      ...prev,
      employeeId,
      // Clear handover if it pointed at the same person
      handoverTo: prev.handoverTo && emp && prev.handoverTo === emp.full_name ? '' : prev.handoverTo,
    }));
  };

  const leaveTypeDisplayLabel = (code: string) => {
    const fromEffective = resolveLeaveTypeLabel(leaveTypeOptions, code);
    // AC-PLT-ATT-02 — retired keys still show on historical rows (raw key / BE label).
    if (fromEffective !== '—') return fromEffective;
    const trimmed = code?.trim() ?? '';
    return trimmed || '—';
  };

  const selectedLeaveTypeLabel = formData.leaveType
    ? leaveTypeDisplayLabel(formData.leaveType)
    : '';

  const createTotalDaysPreview = useMemo(() => {
    if (!formData.startDate || !formData.endDate) return 0;
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const days = differenceInDays(endDate, startDate) + 1;
    return Number.isFinite(days) && days > 0 ? days : 0;
  }, [formData.startDate, formData.endDate]);

  const showLeaveAttachment = shouldShowLeaveAttachmentControl(
    formData.leaveType,
    selectedLeaveTypeLabel,
  );
  const attachmentRequired = leaveAttachmentRequired(
    formData.leaveType,
    createTotalDaysPreview,
    selectedLeaveTypeLabel,
  );

  const primaryMembershipEmployeeId = useMemo(() => {
    const primary = memberships.find((m) => m.is_primary) ?? memberships[0];
    return primary?.employee_id?.trim() || '';
  }, [memberships]);

  const balanceEmployeeId =
    formData.employeeId.trim() || primaryMembershipEmployeeId || '';
  const balanceLeaveType = useMemo(
    () => resolveLeaveBalanceBucketForLeaveType(formData.leaveType, effectiveLeaveTypes),
    [formData.leaveType, effectiveLeaveTypes],
  );
  const showOtCompLeavePanel = useMemo(
    () => isOtCompLeaveTypeSelected(formData.leaveType, effectiveLeaveTypes),
    [formData.leaveType, effectiveLeaveTypes],
  );
  const sickLeaveTypeFlags = useMemo(
    () =>
      resolveSickLeaveTypeFlags(
        formData.leaveType,
        selectedLeaveTypeLabel,
        effectiveLeaveTypes,
      ),
    [formData.leaveType, selectedLeaveTypeLabel, effectiveLeaveTypes],
  );
  const isMvpLeaveType = useMemo(
    () =>
      (MVP_LEAVE_BALANCE_TYPE_CODES as readonly string[]).includes(balanceLeaveType),
    [balanceLeaveType],
  );

  const {
    rows: balanceByTypeRows,
    isLoading: balancesByTypeLoading,
    isFetched: balancesByTypeFetched,
    isError: balancesByTypeError,
    error: balancesByTypeLoadError,
    getBalanceForType,
    refetchAll: refetchBalancesByType,
  } = useLeaveBalancesByType({
    employeeId: balanceEmployeeId,
  });

  const {
    balance: singleTypeBalance,
    isLoading: singleBalanceLoading,
    isError: singleBalanceIsError,
    error: singleBalanceLoadError,
    refetch: refetchSingleBalance,
    isFetched: singleBalanceFetched,
  } = useLeaveBalance({
    employeeId: balanceEmployeeId,
    leaveType: balanceLeaveType,
    /** Panel covers 5 MVP types — single GET only for catalog types outside panel. */
    enabled: Boolean(balanceEmployeeId) && !isMvpLeaveType,
  });

  const balance = isMvpLeaveType
    ? getBalanceForType(balanceLeaveType)
    : singleTypeBalance;
  const balanceLoading = isMvpLeaveType ? balancesByTypeLoading : singleBalanceLoading;
  const balanceIsError = isMvpLeaveType ? balancesByTypeError : singleBalanceIsError;
  const balanceLoadError = isMvpLeaveType ? balancesByTypeLoadError : singleBalanceLoadError;
  const balanceFetched = isMvpLeaveType ? balancesByTypeFetched : singleBalanceFetched;

  /** AC-ATT-05B-FORM-PANEL · AC-ATT-05B-TYPE-REFETCH — panel/by-type on create open + đổi loại. */
  useEffect(() => {
    if (!isCreateOpen || !balanceEmployeeId) return;
    void refetchBalancesByType();
    if (!isMvpLeaveType) void refetchSingleBalance();
  }, [isCreateOpen, balanceEmployeeId, balanceLeaveType, isMvpLeaveType, refetchBalancesByType, refetchSingleBalance]);

  const createFormAdvanceHint = useMemo(() => {
    if (!isCreateOpen || !formData.employeeId || !balance) return null;
    const available = resolveLeaveBalanceDisplayDays(balance);
    const requested = resolveAtt08SubmitTotalDays(previewEnvelope, createTotalDaysPreview);
    return att05bAdvanceHintMessage({
      availableDays: available,
      requestedDays: requested > 0 ? requested : null,
      allowsAdvance: resolveEffectiveAllowsAdvance(effectiveLeaveTypes, formData.leaveType),
    });
  }, [
    isCreateOpen,
    formData.employeeId,
    formData.leaveType,
    balance,
    previewEnvelope,
    createTotalDaysPreview,
    effectiveLeaveTypes,
  ]);

  const showEmptyCatalogHint = att05bShouldShowEmptyCatalogHint(
    leaveTypesLoading,
    leaveTypesError,
    leaveTypeOptions.length,
  );

  const renderLeaveBalancePanel = (compact?: boolean) => {
    if (!balanceEmployeeId) {
      return (
        <Alert data-testid="leave-balance-panel" className="border-xevn-border">
          <AlertTitle className="text-base font-semibold text-xevn-text">
            {t('leave.balanceTitle')}
          </AlertTitle>
          <AlertDescription className="text-[15px] text-xevn-textSecondary">
            {t('leave.balancePickEmployee')}
          </AlertDescription>
        </Alert>
      );
    }
    if (
      (balanceLoading || balancesByTypeLoading) &&
      !balance &&
      balanceByTypeRows.every((r) => !r.balance)
    ) {
      return (
        <Alert data-testid="leave-balance-panel">
          <AlertDescription className="flex items-center gap-2 text-[15px] text-xevn-textSecondary">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t('leave.balanceLoading')}
          </AlertDescription>
        </Alert>
      );
    }
    if (
      balancesByTypeError &&
      balancesByTypeFetched &&
      balanceByTypeRows.every((r) => r.isError || !r.balance)
    ) {
      const msg =
        balancesByTypeLoadError instanceof ApiClientError
          ? balancesByTypeLoadError.message
          : toErrorMessage(balancesByTypeLoadError, t('leave.balanceLoadError'));
      return (
        <Alert variant="destructive" data-testid="leave-balance-panel">
          <AlertTitle className="text-base font-semibold">{t('leave.balanceTitle')}</AlertTitle>
          <AlertDescription className="text-[15px]">{msg}</AlertDescription>
        </Alert>
      );
    }
    if (balanceIsError && balanceFetched && !isMvpLeaveType && !balance) {
      const msg =
        balanceLoadError instanceof ApiClientError
          ? balanceLoadError.message
          : toErrorMessage(balanceLoadError, t('leave.balanceLoadError'));
      return (
        <Alert variant="destructive" data-testid="leave-balance-panel">
          <AlertTitle className="text-base font-semibold">{t('leave.balanceTitle')}</AlertTitle>
          <AlertDescription className="text-[15px]">{msg}</AlertDescription>
        </Alert>
      );
    }

    const selected = balance;
    const remaining = selected ? resolveLeaveBalanceDisplayDays(selected) : null;
    const typeLabel = selected
      ? selected.leave_type_label ||
        leaveTypeDisplayLabel(selected.leave_type) ||
        selected.leave_type
      : leaveTypeDisplayLabel(balanceLeaveType) || balanceLeaveType;
    const projection =
      selected && createTotalDaysPreview > 0
        ? projectLeaveBalanceAfterRequest(selected, createTotalDaysPreview)
        : null;
    const showAdvancedColumn = balanceByTypeRows.some(
      (row) => (row.balance?.advanced_days ?? 0) > 0,
    );
    /** Panel zeros vẫn là row hợp lệ — chỉ empty khi chưa fetch / lỗi hết. */
    const hasPanelRows = balanceByTypeRows.length > 0 && balancesByTypeFetched;
    const showCarryLedgerSep = balanceByTypeRows.some((row) =>
      isCarryOverLeaveTypeKey(row.leave_type),
    );

    return (
      <Alert
        className={cn(
          compact ? 'py-2' : undefined,
          'border-primary/30 bg-primary/5',
        )}
        data-testid="leave-balance-panel"
      >
        <AlertTitle className="text-base font-semibold text-xevn-text">
          {t('leave.balanceTitle')}
        </AlertTitle>
        <AlertDescription className="space-y-3">
          {/* ATT-05b — GET /leave-balance/panel (5 MVP; zeros OK) */}
          <div
            className="overflow-x-auto rounded-input border border-xevn-border bg-xevn-surface"
            data-testid="leave-balance-by-type"
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-xevn-border bg-xevn-background">
                  <th className="p-2 text-left font-semibold text-xevn-textSecondary">
                    {t('leave.leaveType')}
                  </th>
                  <th className="p-2 text-right font-semibold text-xevn-textSecondary">
                    {t('leave.balanceColAvailable', 'Còn lại')}
                  </th>
                  <th className="p-2 text-right font-semibold text-xevn-textSecondary">
                    {t('leave.balanceColUsed', 'Đã trừ')}
                  </th>
                  <th className="p-2 text-right font-semibold text-xevn-textSecondary">
                    {t('leave.balanceColHold', 'Giữ chỗ')}
                  </th>
                  {showAdvancedColumn ? (
                    <th
                      className="p-2 text-right font-semibold text-xevn-textSecondary"
                      data-testid="leave-balance-col-advanced"
                    >
                      {t('leave.balanceColAdvanced', 'Ứng đã dùng')}
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {!hasPanelRows ? (
                  <tr>
                    <td
                      colSpan={showAdvancedColumn ? 5 : 4}
                      className="p-3 text-center text-[15px] text-xevn-textSecondary"
                      role="status"
                    >
                      {t('leave.balanceEmpty')}
                    </td>
                  </tr>
                ) : (
                  balanceByTypeRows.map((row) => {
                    const days = row.balance
                      ? resolveLeaveBalanceDisplayDays(row.balance)
                      : null;
                    const used = row.balance?.used_days ?? null;
                    // held = pending_days (AC-ATT-09-HOLD-SOT · DENY att_leave_hold dual)
                    const hold = row.balance
                      ? resolveLeaveBalanceHeldDays(row.balance)
                      : null;
                    const heldAlias = row.balance
                      ? resolveAtt09HeldDays(row.balance)
                      : null;
                    const label = deriveAtt05PanelBucketLabelVi(
                      row.leave_type,
                      row.balance?.leave_type_label ||
                        leaveTypeDisplayLabel(row.leave_type) ||
                        row.leave_type,
                    );
                    const advancedUsed = row.balance?.advanced_days ?? 0;
                    const isSelected = row.leave_type === balanceLeaveType;
                    return (
                      <tr
                        key={row.leave_type}
                        className={cn(
                          'border-b border-xevn-border/60 last:border-0',
                          isSelected && 'bg-primary/10',
                        )}
                        data-testid={`leave-balance-row-${row.leave_type}`}
                      >
                        <td className="p-2 text-[15px] font-medium text-xevn-text">{label}</td>
                        <td
                          className="p-2 text-right text-[15px] tabular-nums text-xevn-text"
                          data-testid={`leave-balance-available-${row.leave_type}`}
                        >
                          {row.isLoading && days == null ? '…' : days ?? '—'}
                        </td>
                        <td
                          className="p-2 text-right text-[15px] tabular-nums text-xevn-textSecondary"
                          data-testid={`leave-balance-used-${row.leave_type}`}
                        >
                          {row.isLoading && used == null ? '…' : used ?? '—'}
                        </td>
                        <td
                          className="p-2 text-right text-[15px] tabular-nums text-xevn-textSecondary"
                          data-testid={`leave-balance-held-${row.leave_type}`}
                          title="held = pending_days"
                        >
                          {row.isLoading && hold == null
                            ? '…'
                            : hold ?? heldAlias ?? '—'}
                        </td>
                        {showAdvancedColumn ? (
                          <td
                            className="p-2 text-right text-[15px] tabular-nums text-xevn-textSecondary"
                            data-testid={`leave-balance-advanced-${row.leave_type}`}
                          >
                            {row.isLoading && advancedUsed == null
                              ? '…'
                              : advancedUsed ?? '—'}
                          </td>
                        ) : null}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {showCarryLedgerSep ? (
            <p
              className="text-xs text-xevn-textSecondary"
              data-testid="att-05-ledger-sep"
              role="note"
            >
              {att05LedgerSeparationNoteVi()}
            </p>
          ) : null}

          {selected && remaining != null ? (
            <div className="space-y-1">
              <p className="text-lg font-semibold text-xevn-text">
                {t('leave.balanceRemaining', { days: remaining })}
                <span className="ml-2 text-sm font-medium text-xevn-textSecondary">
                  ({typeLabel})
                </span>
              </p>
              <p className="text-[15px] text-xevn-textSecondary">
                {t('leave.balanceBreakdown', {
                  entitled: selected.entitled_days,
                  used: selected.used_days,
                  pending: selected.pending_days,
                  type: typeLabel,
                  year: selected.balance_year,
                })}
              </p>
              {projection ? (
                <p
                  className="text-[15px] font-medium text-xevn-text"
                  data-testid="leave-balance-projected"
                >
                  {t('leave.balanceProjected', {
                    days: createTotalDaysPreview,
                    projected: projection.projected,
                  })}
                </p>
              ) : null}
            </div>
          ) : null}
        </AlertDescription>
      </Alert>
    );
  };

  const handleAttachmentFileChange = async (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) return;
    const validationError = validateLeaveAttachmentFile(file);
    if (validationError) {
      toast({
        title: t('messages.error'),
        description: validationError,
        variant: 'destructive',
      });
      return;
    }
    setIsUploadingAttachment(true);
    try {
      const uploaded = await uploadHrmFile(file, LEAVE_ATTACHMENT_UPLOAD_FEATURE);
      const relative = toLeaveAttachmentUrlForApi(uploaded);
      if (!relative) {
        toast({
          title: t('messages.error'),
          description: t('leave.attachmentUploadError'),
          variant: 'destructive',
        });
        return;
      }
      setAttachmentUrl(relative);
      setAttachmentFileName(file.name);
      toast({
        title: t('messages.success'),
        description: t('leave.attachmentUploadSuccess'),
      });
    } catch (error: unknown) {
      toast({
        title: t('messages.error'),
        description: toErrorMessage(error, t('leave.attachmentUploadError')),
        variant: 'destructive',
      });
    } finally {
      setIsUploadingAttachment(false);
    }
  };

  const selectedReasonDisplay = sanitizeLeaveNoteDisplay(selectedRequest?.reason);
  const selectedRejectDisplay = sanitizeLeaveNoteDisplay(selectedRequest?.rejected_reason);

  // Stats
  const totalRequests = requests.length;
  const pendingRequests = requests.filter((r) => r.status === 'pending').length;
  const approvedRequests = requests.filter((r) => r.status === 'approved').length;
  const totalLeaveDays = requests
    .filter((r) => r.status === 'approved')
    .reduce((sum, r) => sum + Number(r.total_days), 0);

  // Get all leave dates for calendar highlighting
  const getLeaveDates = () => {
    const dates: { date: Date; type: string; status: string }[] = [];
    requests.forEach((request) => {
      try {
        const start = parseISO(request.start_date);
        const end = parseISO(request.end_date);
        const interval = eachDayOfInterval({ start, end });
        interval.forEach((date) => {
          dates.push({ date, type: request.leave_type, status: request.status });
        });
      } catch (e) {
        // Skip invalid dates
      }
    });
    return dates;
  };

  const leaveDates = getLeaveDates();

  // Filter requests
  const filteredRequests = requests.filter((request) => {
    if (filterStatus !== 'all' && request.status !== filterStatus) return false;
    if (filterType !== 'all' && request.leave_type !== filterType) return false;
    return true;
  });

  // Get leaves for selected date
  const leavesOnSelectedDate = selectedDate
    ? requests.filter((request) => {
        try {
          const start = parseISO(request.start_date);
          const end = parseISO(request.end_date);
          return selectedDate >= start && selectedDate <= end;
        } catch {
          return false;
        }
      })
    : [];

  const handleApprove = async (id: string) => {
    setIsApproving(true);
    const ok = await approveRequest(id);
    setIsApproving(false);
    if (ok) {
      void refetchBalancesByType();
      void refetchSingleBalance();
    }
  };

  const handleOpenRejectModal = (id: string) => {
    setSelectedRequestId(id);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleReject = async () => {
    if (selectedRequestId) {
      setIsRejecting(true);
      const ok = await rejectRequest(selectedRequestId, rejectReason || undefined);
      setIsRejecting(false);
      setRejectModalOpen(false);
      setSelectedRequestId(null);
      setRejectReason('');
      if (ok) {
        void refetchBalancesByType();
        void refetchSingleBalance();
      }
    }
  };

  const handleOpenDetailModal = (request: LeaveRequest) => {
    const fresh = requests.find((r) => r.id === request.id) ?? request;
    setSelectedRequest(fresh);
    setDetailModalOpen(true);
  };

  const handleOpenDetailFromTypeBlock = (requestId: string) => {
    const fresh = requests.find((r) => r.id === requestId);
    if (!fresh) return;
    setIsCreateOpen(false);
    resetCreateForm();
    handleOpenDetailModal(fresh);
  };

  const canCancelLeave = (status: string) => status === 'pending' || status === 'approved';

  const handleOpenCancelModal = (id: string) => {
    setSelectedRequestId(id);
    setDeleteModalOpen(true);
  };

  const handleCancelLeave = async () => {
    if (!selectedRequestId) return;
    const id = selectedRequestId;
    setIsCancelling(true);
    const ok = await cancelRequest(id);
    setIsCancelling(false);
    setDeleteModalOpen(false);
    setSelectedRequestId(null);
    if (ok) {
      setDetailModalOpen(false);
      setSelectedRequest((prev) =>
        prev && prev.id === id ? { ...prev, status: 'cancelled' } : prev,
      );
    }
  };

  const handleSubmit = async (resolutionOverride?: Att04bBalanceResolution | null) => {
    if (!formData.employeeId || !formData.startDate || !formData.endDate) {
      return;
    }
    if (previewSubmitBlocked) {
      toast({
        title: t('messages.error'),
        description: att08HolMissMessage(),
        variant: 'destructive',
      });
      return;
    }
    if (!isCatalogPickerValueAllowed(leaveTypeOptions, formData.leaveType, { allowEmpty: false })) {
      return;
    }

    // Prefer snapshot so submit works after keyword clear (selected may leave page-1 options)
    const employee =
      selectedEmployee?.id === formData.employeeId
        ? selectedEmployee
        : pickerEmployees.find((e) => e.id === formData.employeeId);
    if (!employee) return;

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const calendarDays = differenceInDays(endDate, startDate) + 1;
    // ALIGN — total_days = engine deductible_units when LIVE; DENY calendar as trừ quỹ.
    const totalDays = resolveAtt08SubmitTotalDays(previewEnvelope, calendarDays);

    if (totalDays <= 0) {
      return;
    }

    const allowsAdvance = resolveEffectiveAllowsAdvance(
      effectiveLeaveTypes,
      formData.leaveType,
    );
    const balanceForGate = isMvpLeaveType
      ? getBalanceForType(balanceLeaveType)
      : balance;
    const availableForGate = balanceForGate
      ? resolveLeaveBalanceDisplayDays(balanceForGate)
      : null;
    const activeResolution = resolutionOverride ?? overBalanceResolution;
    if (
      isAtt04bOverBalanceBranchLive() &&
      allowsAdvance &&
      availableForGate != null &&
      totalDays > availableForGate &&
      !activeResolution
    ) {
      setOverBalanceDialogOpen(true);
      return;
    }

    const typeLabel = leaveTypeDisplayLabel(formData.leaveType);
    const attachBlock = leaveAttachmentSubmitBlocked(
      formData.leaveType,
      totalDays,
      attachmentUrl,
      typeLabel,
    );
    if (attachBlock) {
      toast({
        title: t('messages.error'),
        description: attachBlock,
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    const reasonText =
      formData.reason.trim() || reasonInputRef.current?.value.trim() || '';
    const relativeAttach = toLeaveAttachmentUrlForApi(attachmentUrl);
    const data: LeaveRequestFormData = {
      company_id: employee.company_id,
      employee_id: employee.id,
      employee_code: employee.employee_code,
      employee_name: employee.full_name,
      department: employeeDeptLabel(employee) || undefined,
      position: employeePositionLabel(employee),
      leave_type: formData.leaveType,
      start_date: formData.startDate,
      end_date: formData.endDate,
      total_days: totalDays,
      reason: reasonText || undefined,
      handover_to: formData.handoverTo || undefined,
      handover_tasks: formData.handoverTasks || undefined,
      ...(relativeAttach ? { attachment_url: relativeAttach } : {}),
      ...(activeResolution ? { balance_resolution: activeResolution } : {}),
    };

    setCreateBalanceReject(null);
    const result = await createRequest(data);
    setIsSubmitting(false);

    if (result && typeof result === 'object' && 'ok' in result && result.ok === false) {
      if (result.balanceReject) {
        setCreateBalanceReject(result.balanceReject);
        setCreateOverlapBlockRequestId(null);
        return;
      }
      const conflictId =
        result.overlapConflictId ??
        createDialogOverlapConflict?.id ??
        null;
      setCreateOverlapBlockRequestId(conflictId);
      return;
    }

    if (result && typeof result === 'object' && 'id' in result) {
      void refetchBalancesByType();
      void refetchSingleBalance();
      setOverBalanceResolution(null);
      handleCreateOpenChange(false);
    }
  };

  const confirmOverBalanceResolution = (resolution: Att04bBalanceResolution) => {
    setOverBalanceResolution(resolution);
    setOverBalanceDialogOpen(false);
    void handleSubmit(resolution);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-xevn-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="att-leave-precision">
      <p
        className="text-xs text-xevn-textSecondary leading-relaxed"
        data-testid="att-09-honesty"
        role="note"
      >
        {att09HonestyBannerText()}
      </p>
      <p
        className="text-xs text-xevn-textSecondary leading-relaxed"
        data-testid="att-04b-honesty"
        role="note"
      >
        {att04bHonestyBannerText()}
        <span className="block mt-1">{att04bResidualHoldFooterLines().join(' · ')}</span>
      </p>
      <p
        className="text-xs text-xevn-textSecondary leading-relaxed"
        data-testid="att-05-honesty"
        role="note"
      >
        {att05HonestyBannerText()}
        <span className="block mt-1">{att05ResidualHoldFooterLines().join(' · ')}</span>
      </p>
      <p
        className="text-xs text-xevn-textSecondary leading-relaxed"
        data-testid="att-05b-honesty"
        role="note"
      >
        {att05bHonestyBannerText()}
        <span className="block mt-1">{att05bResidualHoldFooterLines().join(' · ')}</span>
      </p>
      <p
        className="text-xs text-xevn-textSecondary leading-relaxed"
        data-testid="att-07-honesty"
        role="note"
      >
        {att07HonestyBannerText()}
        <span className="block mt-1">{att07ResidualHoldFooterLines().join(' · ')}</span>
      </p>
      {/* Header with Create Button — S42 / S61 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-bold text-xevn-text">{t('leave.title')}</h2>
          <p className="text-sm text-xevn-textSecondary">{t('leave.subtitle')}</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={handleCreateOpenChange}>
          <DialogTrigger asChild>
            <Button className="bg-xevn-primary hover:bg-xevn-primaryPressed text-white">
              <Plus className="h-4 w-4 mr-2" />
              {t('leave.createRequest')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[920px]" data-testid="att-leave-create-dialog-precision">
            <DialogHeader>
              <DialogTitle className="text-[20px] font-bold text-xevn-text">
                {t('leave.createRequest')}
              </DialogTitle>
            </DialogHeader>
            {showCreateTypeBlockBanner ? (
              <Alert
                className="border-amber-300 bg-amber-50/80"
                data-testid="att-09-type-block"
              >
                <AlertTitle className="text-sm font-semibold text-xevn-text">
                  {t('leave.typeBlockTitle', { defaultValue: 'Loại phép đã khóa · trùng lịch' })}
                </AlertTitle>
                <AlertDescription className="space-y-2 text-[14px] text-xevn-textSecondary">
                  <p>
                    {att09OverlapTypeBlockBannerMessage({
                      pendingConflict:
                        isAtt09LeaveTypeChangeBlocked(
                          createTypeBlockRequest?.status ??
                            createDialogOverlapConflict?.status,
                        ),
                    })}
                  </p>
                  {createTypeBlockRequest &&
                  isAtt09LeaveTypeChangeBlocked(createTypeBlockRequest.status) ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8"
                      data-testid="att-09-type-block-open-detail"
                      onClick={() =>
                        handleOpenDetailFromTypeBlock(createTypeBlockRequest.id)
                      }
                    >
                      {t('leave.viewPendingDetail', {
                        defaultValue: 'Xem đơn chờ duyệt (loại phép khóa)',
                      })}
                    </Button>
                  ) : null}
                </AlertDescription>
              </Alert>
            ) : null}
            {createBalanceReject ? (
              <Alert variant="destructive" data-testid="att-04b-balance-reject">
                <AlertTitle className="text-sm font-semibold">
                  {t('leave.balanceRejectTitle', { defaultValue: 'Không đủ quỹ phép' })}
                </AlertTitle>
                <AlertDescription className="text-[14px]">
                  {att04bBalanceRejectBannerMessage(createBalanceReject)}
                </AlertDescription>
              </Alert>
            ) : null}
            {!isAtt04bOverBalanceBranchLive() ? (
              <Alert
                className="border-dashed border-xevn-border bg-xevn-surface/80"
                data-testid="att-04b-over-bal-hold"
              >
                <AlertDescription className="text-xs text-xevn-textSecondary">
                  Đề xuất ứng phép / không lương khi vượt số dư (J-HRM-ATT-04B-04) — HOLD cho đến khi
                  BE bật nhánh balance_resolution và trần ứng. Hiện tại: ứng tắt → 400
                  HRM-LEAVE-VAL-BALANCE (≠ FR-04b DONE).
                </AlertDescription>
              </Alert>
            ) : null}
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>{t('leave.selectEmployee')}</Label>
                <Input
                  value={employeeKeyword}
                  onChange={(e) => setEmployeeKeyword(e.target.value)}
                  placeholder={t('leave.searchEmployee')}
                  aria-label={t('leave.searchEmployee')}
                  className="xevn-field-name"
                />
                {pickerCapped && (
                  <p className="text-xs text-xevn-textSecondary">
                    {t('leave.pickerCappedHint', {
                      shown: pickerEmployees.length,
                      total: pickerTotal,
                    })}
                  </p>
                )}
                <Select
                  value={formData.employeeId || undefined}
                  onValueChange={handleEmployeeSelect}
                  disabled={pickerFetching && pickerEmployees.length === 0}
                >
                  <SelectTrigger className="xevn-field-select-md">
                    <SelectValue
                      placeholder={
                        pickerFetching
                          ? t('common.loading')
                          : t('leave.selectEmployee')
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {pickerFetching && pickerEmployees.length === 0 ? (
                      <div className="flex items-center justify-center gap-2 py-4 text-sm text-xevn-textSecondary">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t('common.loading')}
                      </div>
                    ) : pickerEmployees.length === 0 ? (
                      <div className="py-4 text-center text-sm text-xevn-textSecondary">
                        {t('leave.noEmployeesFound')}
                      </div>
                    ) : (
                      pickerEmployees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.full_name} — {emp.employee_code}
                          {employeeDeptLabel(emp)
                            ? ` · ${employeeDeptLabel(emp)}`
                            : ''}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>{t('leave.selectLeaveType')}</Label>
                <CatalogSearchPicker
                  data-testid="catalog-search-picker"
                  options={leaveTypeOptions}
                  value={formData.leaveType}
                  onValueChange={(v) => {
                    setFormData({ ...formData, leaveType: v });
                    void refetchBalancesByType();
                    if (!(MVP_LEAVE_BALANCE_TYPE_CODES as readonly string[]).includes(v.trim().toLowerCase())) {
                      void refetchSingleBalance();
                    }
                    // Clear attach when leaving ốm types — avoid stale URL on annual create.
                    const nextLabel = resolveLeaveTypeLabel(leaveTypeOptions, v);
                    if (!shouldShowLeaveAttachmentControl(v, nextLabel)) {
                      setAttachmentUrl(null);
                      setAttachmentFileName(null);
                    }
                  }}
                  placeholder={t('leave.selectLeaveType')}
                  loading={leaveTypesLoading}
                  errorText={leaveTypesError ? t('settings.catalogs.loadError') : undefined}
                  emptyHint={
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <a
                        href="/settings"
                        className="text-primary underline text-xs font-medium"
                        data-testid="hdsd-leave-open-att-leave-types"
                      >
                        Mở Cài đặt → Loại phép ATT (tạo mã mới)
                      </a>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        data-testid={HDSD_MUTATE_TEST_IDS.leaveSyncCatalogBtn}
                        disabled={!catalogsScope || syncLeaveTypesMutation.isPending}
                        onClick={() => syncLeaveTypesMutation.mutate()}
                      >
                        <RefreshCw
                          className={`mr-1.5 h-3.5 w-3.5 ${
                            syncLeaveTypesMutation.isPending ? 'animate-spin' : ''
                          }`}
                        />
                        {t('settings.catalogs.syncFromXbos')}
                      </Button>
                    </div>
                  }
                />
              </div>
              {sickLeaveTypeFlags ? (
                <div
                  className="flex flex-wrap items-center gap-2 text-xs"
                  data-testid="att-07-sick-flags"
                  data-att-07-form-panel="true"
                  role="note"
                >
                  <span className="font-medium text-xevn-text">Loại ốm — cờ từ danh mục:</span>
                  {sickLeaveTypeFlags.insuranceRegimeFlag ? (
                    <Badge variant="secondary" data-testid="att-07-flag-bh">
                      Chế độ BH
                    </Badge>
                  ) : (
                    <span className="text-xevn-textSecondary">Không cờ BH</span>
                  )}
                  {sickLeaveTypeFlags.companyTopupFlag ? (
                    <Badge variant="secondary" data-testid="att-07-flag-cty">
                      Hỗ trợ CTY
                    </Badge>
                  ) : (
                    <span className="text-xevn-textSecondary">Không cờ CTY</span>
                  )}
                  {sickLeaveTypeFlags.dv16BothFlags ? (
                    <Badge variant="destructive" data-testid="att-07-flag-dv16">
                      DV-16: cả BH và CTY — cần HCNS rà soát cấu hình loại phép
                    </Badge>
                  ) : null}
                </div>
              ) : null}
              {showEmptyCatalogHint ? (
                <Alert
                  className="border-dashed border-xevn-border"
                  data-testid="att-05b-empty-catalog"
                >
                  <AlertDescription className="text-xs text-xevn-textSecondary">
                    {ATT_05B_EMPTY_CATALOG_HINT_VI}
                  </AlertDescription>
                </Alert>
              ) : null}
              {formData.employeeId ? (
                <div data-testid="att-05b-form-panel" className="space-y-2">
                  {showOtCompLeavePanel ? (
                    <p
                      className="text-xs font-medium text-xevn-text"
                      data-testid="att-06-form-panel"
                      role="note"
                    >
                      {ATT_06_COMPENSATORY_LABEL_VI} — quỹ tách khỏi phép năm (R-ATT-06-PANEL-FE).
                    </p>
                  ) : null}
                  {renderLeaveBalancePanel(true)}
                  {createFormAdvanceHint ? (
                    <p
                      className="text-xs text-xevn-textSecondary"
                      data-testid="att-05b-adv-hint"
                      role="note"
                    >
                      {createFormAdvanceHint}
                    </p>
                  ) : null}
                </div>
              ) : null}
              {formData.employeeId ? (
                <AttLeaveTrackedEntitlementGrantPanel
                  employeeId={formData.employeeId}
                  defaultLeaveType={balanceLeaveType}
                  onGranted={() => {
                    void refetchBalancesByType();
                    if (!isMvpLeaveType) void refetchSingleBalance();
                  }}
                />
              ) : null}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-12">
                <div className="grid gap-2 sm:col-span-4">
                  <Label>{t('leave.fromDate')}</Label>
                  <ViDateField
                    className="xevn-field-date"
                    value={formData.startDate}
                    onValueChange={(v) => setFormData({ ...formData, startDate: v })}
                  />
                </div>
                <div className="grid gap-2 sm:col-span-4">
                  <Label>{t('leave.toDate')}</Label>
                  <ViDateField
                    className="xevn-field-date"
                    value={formData.endDate}
                    onValueChange={(v) => setFormData({ ...formData, endDate: v })}
                  />
                </div>
              </div>
              {formData.employeeId && formData.leaveType && formData.startDate && formData.endDate ? (
                <AttLeavePreviewDeductionPanel
                  employeeId={formData.employeeId}
                  companyId={selectedEmployee?.company_id ?? currentCompanyId}
                  leaveType={formData.leaveType}
                  startDate={formData.startDate}
                  endDate={formData.endDate}
                  onBlockChange={(blocked) => setPreviewSubmitBlocked(blocked)}
                  onPreviewReady={(env) => setPreviewEnvelope(env)}
                />
              ) : null}
              {showLeaveAttachment && (
                <div className="grid gap-2" data-testid="att-07-sick-attach">
                  <Label htmlFor="leave-attachment-input">
                    {t('leave.attachmentLabel')}
                    {attachmentRequired ? (
                      <span className="text-destructive ml-1" aria-hidden>
                        *
                      </span>
                    ) : null}
                  </Label>
                  <p
                    className="text-xs text-xevn-textSecondary"
                    data-testid={HDSD_MUTATE_TEST_IDS.leaveAttachmentHint}
                  >
                    {attachmentRequired
                      ? t('leave.attachmentRequiredHint')
                      : t('leave.attachmentOptionalHint')}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      id="leave-attachment-input"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf,.pdf,.jpg,.jpeg,.png,.webp"
                      data-testid={HDSD_MUTATE_TEST_IDS.leaveAttachmentInput}
                      aria-label={t('leave.attachmentLabel')}
                      disabled={isUploadingAttachment || isSubmitting}
                      onChange={(e) => {
                        void handleAttachmentFileChange(e.target.files);
                        e.target.value = '';
                      }}
                      className="cursor-pointer"
                    />
                    {isUploadingAttachment ? (
                      <span className="inline-flex items-center gap-1 text-xs text-xevn-textSecondary">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        {t('leave.attachmentUploading')}
                      </span>
                    ) : null}
                  </div>
                  {attachmentFileName && attachmentUrl ? (
                    <p className="inline-flex items-center gap-1.5 text-xs text-foreground">
                      <Paperclip className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      <span className="truncate">{attachmentFileName}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => {
                          setAttachmentUrl(null);
                          setAttachmentFileName(null);
                        }}
                      >
                        {t('leave.attachmentClear')}
                      </Button>
                    </p>
                  ) : null}
                </div>
              )}
              <div className="grid gap-2">
                <Label>{t('leave.handoverTo')}</Label>
                <Input
                  value={handoverKeyword}
                  onChange={(e) => setHandoverKeyword(e.target.value)}
                  placeholder={t('leave.searchHandover')}
                  aria-label={t('leave.searchHandover')}
                  className="xevn-field-line"
                />
                {handoverCapped && (
                  <p className="text-xs text-xevn-textSecondary">
                    {t('leave.pickerCappedHint', {
                      shown: handoverEmployees.filter((e) => e.id !== formData.employeeId).length,
                      total: handoverTotal,
                    })}
                  </p>
                )}
                <Select 
                  value={formData.handoverTo || undefined} 
                  onValueChange={(v) => setFormData({...formData, handoverTo: v})}
                  disabled={handoverFetching && handoverEmployees.length === 0}
                >
                  <SelectTrigger className="xevn-field-select-md">
                    <SelectValue placeholder={t('leave.selectHandoverPerson')} />
                  </SelectTrigger>
                  <SelectContent>
                    {handoverFetching && handoverEmployees.length === 0 ? (
                      <div className="flex items-center justify-center gap-2 py-4 text-sm text-xevn-textSecondary">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t('common.loading')}
                      </div>
                    ) : (
                      handoverEmployees
                        .filter((emp) => emp.id !== formData.employeeId)
                        .map((emp) => (
                          <SelectItem key={emp.id} value={emp.full_name}>
                            {emp.full_name} — {emp.employee_code}
                          </SelectItem>
                        ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>{t('leave.handoverTasks')}</Label>
                <Textarea 
                  className="xevn-field-reason"
                  placeholder={t('leave.enterHandoverTasks')} 
                  rows={2}
                  value={formData.handoverTasks}
                  onChange={(e) => setFormData({...formData, handoverTasks: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label>{t('leave.reason')}</Label>
                <Textarea
                  ref={reasonInputRef}
                  className="xevn-field-reason"
                  data-testid={HDSD_MUTATE_TEST_IDS.leaveReasonInput}
                  placeholder={t('leave.enterReason')}
                  rows={3}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  onInput={(e) =>
                    setFormData({ ...formData, reason: e.currentTarget.value })
                  }
                />
              </div>
            </div>
            {isAtt04bOverBalanceBranchLive() ? (
              <Dialog open={overBalanceDialogOpen} onOpenChange={setOverBalanceDialogOpen}>
                <DialogContent className="sm:max-w-md" data-testid="att-04b-over-bal-dialog">
                  <DialogHeader>
                    <DialogTitle className="text-[18px] font-bold text-xevn-text">
                      Vượt số dư khả dụng
                    </DialogTitle>
                  </DialogHeader>
                  <p className="text-sm text-xevn-textSecondary">
                    Chọn cách xử lý theo BR-BP-LV-07 — ứng phép trong trần hoặc nghỉ không lương.
                  </p>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                      type="button"
                      variant="outline"
                      data-testid="att-04b-over-bal-unpaid"
                      onClick={() => confirmOverBalanceResolution('unpaid')}
                    >
                      Không lương
                    </Button>
                    <Button
                      type="button"
                      className="bg-xevn-primary text-white"
                      data-testid="att-04b-over-bal-advance"
                      onClick={() => confirmOverBalanceResolution('advance')}
                    >
                      Ứng phép
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ) : null}
            <DialogFooter>
              <Button variant="outline" onClick={() => handleCreateOpenChange(false)}>
                {t('common.cancel')}
              </Button>
              <Button
                className="bg-xevn-primary hover:bg-xevn-primaryPressed text-white"
                onClick={() => void handleSubmit()}
                disabled={
                  isSubmitting ||
                  isUploadingAttachment ||
                  previewSubmitBlocked ||
                  leaveTypeOptions.length === 0 ||
                  !isCatalogPickerValueAllowed(leaveTypeOptions, formData.leaveType, {
                    allowEmpty: false,
                  })
                }
              >
                {(isSubmitting || isUploadingAttachment) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {t('leave.submitRequest')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {renderLeaveBalancePanel()}

      {balanceEmployeeId ? (
        <AttLeaveTrackedEntitlementGrantPanel
          employeeId={balanceEmployeeId}
          defaultLeaveType={balanceLeaveType}
          onGranted={() => {
            void refetchBalancesByType();
            if (!isMvpLeaveType) void refetchSingleBalance();
          }}
        />
      ) : null}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title={t('leave.totalRequests')}
          value={totalRequests}
          icon={FileText}
          trend={{ value: 2, isPositive: true }}
        />
        <StatsCard
          title={t('leave.pendingApproval')}
          value={pendingRequests}
          icon={Clock}
          variant="warning"
        />
        <StatsCard
          title={t('leave.approved')}
          value={approvedRequests}
          icon={Check}
          variant="success"
        />
        <StatsCard
          title={t('leave.totalLeaveDays')}
          value={totalLeaveDays}
          icon={CalendarIcon}
          subtitle={t('leave.approvedThisMonth')}
        />
      </div>

      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">
            <CalendarIcon className="h-4 w-4 mr-2" />
            {t('leave.calendar')}
          </TabsTrigger>
          <TabsTrigger value="requests">
            <FileText className="h-4 w-4 mr-2" />
            {t('leave.requestList')}
          </TabsTrigger>
          <TabsTrigger value="approval">
            <Check className="h-4 w-4 mr-2" />
            {t('leave.pendingApproval')} ({pendingRequests})
          </TabsTrigger>
        </TabsList>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 rounded-card border-xevn-border bg-xevn-surface">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-xevn-text">
                  <CalendarIcon className="h-5 w-5 text-xevn-primary" />
                  {t('leave.calendar')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-input border border-xevn-border pointer-events-auto"
                  locale={currentLocale}
                  modifiers={{
                    leave: leaveDates
                      .filter((d) => d.status === 'approved')
                      .map((d) => d.date),
                    pending: leaveDates
                      .filter((d) => d.status === 'pending')
                      .map((d) => d.date),
                  }}
                  modifiersStyles={{
                    leave: {
                      backgroundColor: 'hsl(var(--primary) / 0.2)',
                      color: 'hsl(var(--primary))',
                      fontWeight: 'bold',
                    },
                    pending: {
                      backgroundColor: 'hsl(var(--warning) / 0.2)',
                      color: 'hsl(var(--warning))',
                      fontWeight: 'bold',
                    },
                  }}
                />
                <div className="flex gap-4 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary/20 border border-primary"></div>
                    <span>{t('leave.approved')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-warning/20 border border-warning"></div>
                    <span>{t('leave.pending')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-card border-xevn-border bg-xevn-surface">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-xevn-text">
                  {selectedDate
                    ? format(selectedDate, 'dd/MM/yyyy', { locale: vi })
                    : t('leave.calendar')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {leavesOnSelectedDate.length === 0 ? (
                  <p className="text-xevn-textSecondary text-[15px]">
                    {t('leave.noLeaveOnDate')}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {leavesOnSelectedDate.map((leave) => (
                      <div
                        key={leave.id}
                        className="p-3 rounded-card border border-xevn-border bg-xevn-background"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-xevn-textMuted" />
                            <span className="font-medium text-xevn-text">{leave.employee_name}</span>
                          </div>
                          <StatusBadge status={leave.status} />
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className={cn(
                              'text-white',
                              LEAVE_TYPE_BADGE_CLASS,
                            )}
                          >
                            {leaveTypeDisplayLabel(leave.leave_type)}
                          </Badge>
                          <span className="text-sm text-xevn-textSecondary">
                            {leave.total_days} {t('common.days')}
                          </span>
                        </div>
                        <p className="text-sm text-xevn-textSecondary mt-2">
                          {sanitizeLeaveNoteDisplay(leave.reason)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Requests List Tab */}
        <TabsContent value="requests" className="space-y-4">
          <Card className="rounded-card border-xevn-border bg-xevn-surface">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="text-base font-semibold text-xevn-text">
                  {t('leave.requestList')}
                </CardTitle>
                <div className="flex gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[150px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder={t('common.status.label')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all')}</SelectItem>
                      <SelectItem value="pending">{t('leave.pending')}</SelectItem>
                      <SelectItem value="approved">{t('leave.approved')}</SelectItem>
                      <SelectItem value="rejected">{t('leave.rejected')}</SelectItem>
                      <SelectItem value="cancelled">{t('leave.cancelled', { defaultValue: 'Đã hủy' })}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder={t('leave.leaveType')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all')}</SelectItem>
                      {leaveTypeOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="saas-table">
                  <thead>
                    <tr>
                      <th>{t('nav.employees')}</th>
                      <th>{t('leave.leaveType')}</th>
                      <th>{t('leave.fromDate')}</th>
                      <th>{t('leave.toDate')}</th>
                      <th>{t('leave.days')}</th>
                      <th>{t('leave.reason')}</th>
                      <th>{t('common.status.label')}</th>
                      <th>{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((request) => (
                      <tr key={request.id}>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-xevn-primary/10 flex items-center justify-center">
                              <User className="h-4 w-4 text-xevn-primary" />
                            </div>
                            <div>
                              <span className="font-medium text-xevn-text">{request.employee_name}</span>
                              <p className="text-xs text-xevn-textSecondary">{request.employee_code}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <Badge
                            variant="secondary"
                            className={cn(
                              'text-white',
                              LEAVE_TYPE_BADGE_CLASS,
                            )}
                          >
                            {leaveTypeDisplayLabel(request.leave_type)}
                          </Badge>
                        </td>
                        <td>{format(parseISO(request.start_date), 'dd/MM/yyyy')}</td>
                        <td>{format(parseISO(request.end_date), 'dd/MM/yyyy')}</td>
                        <td className="font-medium">{request.total_days}</td>
                        <td className="max-w-[200px] truncate">
                          {sanitizeLeaveNoteDisplay(request.reason)}
                        </td>
                        <td>
                          <div className="flex flex-col gap-0.5" data-testid={`leave-status-${request.id}`}>
                            <StatusBadge status={request.status} />
                            <span className="text-xs text-xevn-textSecondary">
                              {request.statusLabelVi}
                            </span>
                            {isAtt09LeaveTypeChangeBlocked(request.status) ? (
                              <span
                                className="text-xs font-medium text-amber-800"
                                data-testid="att-09-type-block-hint"
                              >
                                {att09TypeBlockMessage()}
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDetailModal(request)}
                              aria-label={t('common.view')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {request.status === 'pending' ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950"
                                  onClick={() => handleOpenRejectModal(request.id)}
                                  disabled={isRejecting}
                                  aria-label={t('leave.reject')}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  {t('leave.reject')}
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  data-testid={hdsdLeaveListApproveTestId(request.id)}
                                  onClick={() => void handleApprove(request.id)}
                                  disabled={isApproving}
                                  aria-label={t('leave.approve')}
                                >
                                  {isApproving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                                  <Check className="h-4 w-4 mr-1" />
                                  {t('leave.approve')}
                                </Button>
                              </>
                            ) : null}
                            {canCancelLeave(request.status) ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                data-testid={hdsdLeaveListCancelTestId(request.id)}
                                onClick={() => handleOpenCancelModal(request.id)}
                                disabled={isCancelling}
                                aria-label={t('leave.cancelRequest', { defaultValue: 'Hủy đơn' })}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                {t('leave.cancelRequest', { defaultValue: 'Hủy đơn' })}
                              </Button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredRequests.length === 0 && (
                      <tr>
                        <td colSpan={8} className="text-center py-8 text-xevn-textSecondary">
                          {t('common.noData')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Approval Tab */}
        <TabsContent value="approval" className="space-y-4">
          <Card className="rounded-card border-xevn-border bg-xevn-surface">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-xevn-text">
                {t('leave.pendingApproval')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {requests.filter((r) => r.status === 'pending').length === 0 ? (
                <div className="text-center py-8 text-xevn-textSecondary">
                  <Check className="h-12 w-12 mx-auto mb-2 text-xevn-textMuted opacity-50" />
                  <p>{t('leave.noPendingRequests')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests
                    .filter((r) => r.status === 'pending')
                    .map((request) => (
                      <div
                        key={request.id}
                        className="p-4 rounded-card border border-xevn-border bg-xevn-background"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-xevn-primary/10 flex items-center justify-center">
                              <User className="h-5 w-5 text-xevn-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-xevn-text">{request.employee_name}</p>
                              <p className="text-sm text-xevn-textSecondary">
                                {request.department}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenDetailModal(request)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              {t('common.view')}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950"
                              onClick={() => handleOpenRejectModal(request.id)}
                              disabled={isRejecting}
                            >
                              <X className="h-4 w-4 mr-1" />
                              {t('leave.reject')}
                            </Button>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              data-testid={HDSD_MUTATE_TEST_IDS.leaveListApproveBtn}
                              onClick={() => void handleApprove(request.id)}
                              disabled={isApproving}
                              aria-label={t('leave.approve')}
                            >
                              {isApproving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                              <Check className="h-4 w-4 mr-1" />
                              {t('leave.approve')}
                            </Button>
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-xevn-textSecondary">
                              {t('leave.leaveType')}:
                            </span>
                            <Badge
                              variant="secondary"
                              className={cn(
                                'ml-2 text-white',
                                LEAVE_TYPE_BADGE_CLASS,
                              )}
                            >
                              {leaveTypeDisplayLabel(request.leave_type)}
                            </Badge>
                          </div>
                          <div>
                            <span className="text-xevn-textSecondary">
                              {t('leave.fromDate')}:
                            </span>{' '}
                            {format(parseISO(request.start_date), 'dd/MM/yyyy')}
                          </div>
                          <div>
                            <span className="text-xevn-textSecondary">
                              {t('leave.toDate')}:
                            </span>{' '}
                            {format(parseISO(request.end_date), 'dd/MM/yyyy')}
                          </div>
                          <div>
                            <span className="text-xevn-textSecondary">
                              {t('leave.days')}:
                            </span>{' '}
                            <span className="font-medium">{request.total_days}</span>
                          </div>
                        </div>
                        {sanitizeLeaveNoteDisplay(request.reason) ? (
                          <div className="mt-2 text-sm">
                            <span className="text-xevn-textSecondary">
                              {t('leave.reason')}:
                            </span>{' '}
                            {sanitizeLeaveNoteDisplay(request.reason)}
                          </div>
                        ) : null}
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Cancel Confirmation Dialog — AC-ATT-LV-SHEET-02 */}
      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent data-testid="att-leave-cancel-dialog-precision">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[20px] font-bold text-xevn-text">
              {t('leave.cancelConfirmTitle', { defaultValue: t('leave.deleteConfirmTitle') })}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[15px] text-xevn-textSecondary">
              {t('leave.cancelConfirmMessage', { defaultValue: t('leave.deleteConfirmMessage') })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              data-testid={HDSD_MUTATE_TEST_IDS.leaveCancelConfirmBtn}
              onClick={(e) => {
                e.preventDefault();
                void handleCancelLeave();
              }}
              disabled={isCancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isCancelling && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t('leave.cancelRequest', { defaultValue: 'Hủy đơn' })}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Reason Dialog — S46 */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="sm:max-w-[480px]" data-testid="att-leave-reject-dialog-precision">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[20px] font-bold text-xevn-text">
              <MessageSquare className="h-5 w-5 text-xevn-primary" />
              {t('leave.rejectReason')}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label className="text-xevn-text">{t('leave.enterRejectReason')}</Label>
              <Textarea
                className="xevn-field-reason"
                placeholder={t('leave.enterRejectReason')}
                rows={4}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={isRejecting}
            >
              {isRejecting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t('leave.confirmReject')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail View Dialog — S45 */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="sm:max-w-[600px]" data-testid="att-leave-detail-dialog-precision">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[20px] font-bold text-xevn-text">
              <FileText className="h-5 w-5 text-xevn-primary" />
              {t('leave.requestDetail')}
            </DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-card border border-xevn-border bg-xevn-background">
                <div className="w-12 h-12 rounded-full bg-xevn-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-xevn-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-lg text-xevn-text">{selectedRequest.employee_name}</p>
                  <p className="text-sm text-xevn-textSecondary">
                    {selectedRequest.employee_code} • {selectedRequest.department || t('common.noData')}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1" data-testid="leave-detail-status">
                  <StatusBadge status={selectedRequest.status} />
                  <span className="text-xs text-xevn-textSecondary">
                    {selectedRequest.statusLabelVi}
                  </span>
                </div>
              </div>

              {isAtt09LeaveTypeChangeBlocked(selectedRequest.status) ? (
                <Alert
                  className="border-amber-300 bg-amber-50/80"
                  data-testid="att-09-type-block"
                >
                  <AlertTitle className="text-sm font-semibold text-xevn-text">
                    {t('leave.typeBlockTitle', { defaultValue: 'Loại phép đã khóa' })}
                  </AlertTitle>
                  <AlertDescription className="text-[14px] text-xevn-textSecondary">
                    {att09TypeBlockMessage()}
                  </AlertDescription>
                </Alert>
              ) : null}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xevn-textSecondary">{t('leave.leaveType')}</Label>
                  <div className="mt-1">
                    <Badge
                      variant="secondary"
                      className={cn(
                        'text-white',
                        LEAVE_TYPE_BADGE_CLASS,
                      )}
                      data-testid="leave-detail-type-readonly"
                    >
                      {leaveTypeDisplayLabel(selectedRequest.leave_type)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-xevn-textSecondary">{t('leave.days')}</Label>
                  <p className="mt-1 font-semibold text-lg">{selectedRequest.total_days} {t('common.days')}</p>
                </div>
                <div>
                  <Label className="text-xevn-textSecondary">{t('leave.fromDate')}</Label>
                  <p className="mt-1 font-medium">{format(parseISO(selectedRequest.start_date), 'dd/MM/yyyy')}</p>
                </div>
                <div>
                  <Label className="text-xevn-textSecondary">{t('leave.toDate')}</Label>
                  <p className="mt-1 font-medium">{format(parseISO(selectedRequest.end_date), 'dd/MM/yyyy')}</p>
                </div>
              </div>

              {selectedReasonDisplay ? (
                <div>
                  <Label className="text-xevn-textSecondary">{t('leave.reason')}</Label>
                  <p className="mt-1 p-3 rounded-card border border-xevn-border bg-xevn-background text-xevn-text">
                    {selectedReasonDisplay}
                  </p>
                </div>
              ) : null}

              {selectedRequest.handover_to && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xevn-textSecondary">{t('leave.handoverTo')}</Label>
                    <p className="mt-1 font-medium">{selectedRequest.handover_to}</p>
                  </div>
                  {selectedRequest.handover_tasks && (
                    <div>
                      <Label className="text-xevn-textSecondary">{t('leave.handoverTasks')}</Label>
                      <p className="mt-1">{selectedRequest.handover_tasks}</p>
                    </div>
                  )}
                </div>
              )}

              {selectedRejectDisplay ? (
                <div>
                  <Label className="text-xevn-textSecondary text-red-600">{t('leave.rejectReason')}</Label>
                  <p className="mt-1 p-3 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 rounded-lg">
                    {selectedRejectDisplay}
                  </p>
                </div>
              ) : null}

              <div className="text-xs text-xevn-textSecondary border-t pt-4">
                {t('leave.createdAt')}: {format(parseISO(selectedRequest.created_at), 'dd/MM/yyyy HH:mm')}
                {selectedRequest.approved_at && (
                  <span className="ml-4">
                    {t('leave.approvedAt')}: {format(parseISO(selectedRequest.approved_at), 'dd/MM/yyyy HH:mm')}
                  </span>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailModalOpen(false)}>
              {t('common.close')}
            </Button>
            {selectedRequest?.status === 'pending' && (
              <>
                <Button 
                  variant="outline" 
                  className="text-red-600 border-red-200"
                  onClick={() => {
                    setDetailModalOpen(false);
                    handleOpenRejectModal(selectedRequest.id);
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  {t('leave.reject')}
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  data-testid={hdsdLeaveListApproveTestId(selectedRequest.id)}
                  onClick={() => {
                    void handleApprove(selectedRequest.id);
                    setDetailModalOpen(false);
                  }}
                  aria-label={t('leave.approve')}
                >
                  <Check className="h-4 w-4 mr-1" />
                  {t('leave.approve')}
                </Button>
              </>
            )}
            {selectedRequest && canCancelLeave(selectedRequest.status) ? (
              <Button
                variant="outline"
                className="text-destructive border-destructive/30"
                data-testid={hdsdLeaveListCancelTestId(selectedRequest.id)}
                onClick={() => handleOpenCancelModal(selectedRequest.id)}
                disabled={isCancelling}
                aria-label={t('leave.cancelRequest', { defaultValue: 'Hủy đơn' })}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {t('leave.cancelRequest', { defaultValue: 'Hủy đơn' })}
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
