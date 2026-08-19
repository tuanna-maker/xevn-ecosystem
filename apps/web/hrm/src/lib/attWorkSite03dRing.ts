/**
 * @CODE-MEMORY
 * Screen:     /attendance → Cài đặt → Điểm GPS / vùng hợp lệ (ATT-03d) + Clock-In GPS punch
 * UC:         UC-BP-ATT-03d · FR-UC-BP-ATT-03d · AC-ATT-03D-* · J-HRM-ATT-03D-01..06
 * BR:         BR-BP-GPS-01 · ATT-03D-PATH/SOT/ADMIN/SOFT/CNS/EMPTY/GATE/DISP/≠DONE
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-03d Diễn biến #1–#6 + Thành công
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-ATT-03D-CLUSTER-API-01.md
 *             F-ATT-CAT-WS-01/02 RETAIN · F-ATT-PUNCH-01 RETAIN · Nest /core DENY
 * Purpose:    Path lock + statusLabelVi FE-derive from active + empty CTA + GEO wire codes +
 *             honesty footers — bind LIVE work-sites* + punch records; DENY Nest /core ·
 *             gps_locations sole SoT · ensureDefaultWorkSite · seed · claim PLT WS alone =
 *             ATT-03d DONE · residual/thin=ATT-03b · catalog=ATT-01 · LIVE=ATT-11 · AGG=ATT-10 ·
 *             ATT UAT · invent PAY/printable · invent ASSIGN · invent att_leave_hold.
 * WorkItem:   PO-HRM-MVP-GD1-ATT-03D-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    useAttendanceRules · Attendance GPS card · GPSAttendance · source tests
 * Callees:    contractLegalPrintConstants (printable false RETAIN)
 * must_keep:  ATT03BQC1-MSM0891H ≠ residual/thin=DONE · ATT01QC1-MSLZ3KIM ≠ catalog=DONE ·
 *             R-ATT-01-ASSIGN open · ATT11QC1-MSLXTH9P ≠ LIVE=DONE · ATT10QC1-MSLWGUYH ≠ AGG=DONE ·
 *             ATT09QC1-MSLUTL9D DENY att_leave_hold · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 ·
 *             PLT/CORE · ATTWSQA-MSJC3IN9 · ATTWSQA2-MSJCG47P ≠ ATT-03d DONE · Nest /core DENY ·
 *             OVERLAP/SITE/MOB HOLD · U65 · C-SLICE
 * SOLID:      Pure helpers — no FE invent second geofence · no Nest /core · no seed default site
 * LastVerified: attWorkSite03dRing.test.ts · poHrmMvpGd1Att03dClusterFe01.source.test.ts
 */

import { CONTRACTS_PRINTABLE_READY } from '@/lib/contractLegalPrintConstants';

/** Physical SoT paths — Network MUST contain; Nest /core geofence SoT = FAIL O9. */
export const ATT_WS_03D_PATH_ASSERT = {
  workSites: '/api/hrm/attendance/work-sites',
  attendanceRecords: '/api/hrm/attendance/records',
  attendanceRulesPeer: '/api/hrm/attendance/rules',
  nestCoreDenied: '/api/hrm/core/',
  inventHoldTableDenied: 'att_leave_hold',
  ensureDefaultDenied: 'ensureDefaultWorkSite',
  gpsLocationsSoleDenied: 'gps_locations',
} as const;

/** Punch geofence wire codes (F-ATT-PUNCH-01 · O4). */
export const ATT_03D_GEO_001_CODE = 'HRM-ATT-GEO-001' as const;
export const ATT_03D_GEO_REQ_CODE = 'HRM-ATT-GEO-REQ' as const;
export const ATT_03D_SITE_VAL_CODE = 'HRM-ATT-SITE-VAL' as const;
export const ATT_03D_SITE_404_CODE = 'HRM-ATT-SITE-404' as const;
/** HOLD GĐ1 — DENY invent FAIL as DONE. */
export const ATT_03D_SITE_UNKNOWN_HOLD = 'HRM-ATT-SITE-UNKNOWN' as const;

export const R_ATT_03D_ADMIN = 'R-ATT-03D-ADMIN' as const;
export const R_ATT_03D_SOFT = 'R-ATT-03D-SOFT' as const;
export const R_ATT_03D_CNS = 'R-ATT-03D-CNS' as const;
export const R_ATT_03D_EMPTY = 'R-ATT-03D-EMPTY' as const;
export const R_ATT_03D_DISP = 'R-ATT-03D-DISP' as const;
export const R_ATT_03D_OVERLAP = 'R-ATT-03D-OVERLAP' as const;
export const R_ATT_03D_SITE = 'R-ATT-03D-SITE' as const;
export const R_ATT_03D_MOB = 'R-ATT-03D-MOB' as const;

/** VI status — FE-derive from active when BE omits statusLabelVi (R-ATT-03D-DISP). */
export const ATT_03D_STATUS_LABELS_VI = {
  active: 'Đang hiệu lực',
  inactive: 'Ngừng',
} as const;

export type Att03dWorkSiteDisplay = {
  id: string | null;
  companyId: string | null;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  active: boolean;
  statusLabelVi: string;
  createdAt: string | null;
  updatedAt: string | null;
};

function asNum(v: unknown, fallback = 0): number {
  if (v == null || v === '') return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function asBool(v: unknown, fallback = true): boolean {
  if (v == null) return fallback;
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  const s = String(v).trim().toLowerCase();
  if (s === 'false' || s === '0' || s === 'no') return false;
  if (s === 'true' || s === '1' || s === 'yes') return true;
  return fallback;
}

/** Prefer BE statusLabelVi; else FE-derive from active (DENY raw bool as sole UI). */
export function deriveAtt03dStatusLabelVi(
  active: boolean | null | undefined,
  statusLabelVi?: string | null,
): string {
  const fromBe = String(statusLabelVi ?? '').trim();
  if (fromBe) return fromBe;
  if (active === false) return ATT_03D_STATUS_LABELS_VI.inactive;
  if (active === true) return ATT_03D_STATUS_LABELS_VI.active;
  return '—';
}

/** Map list/detail/create/patch row → display-ready (FE-derive statusLabelVi). */
export function parseAtt03dWorkSiteDisplay(
  row: Record<string, unknown> | null | undefined,
): Att03dWorkSiteDisplay {
  const r = row ?? {};
  const active = asBool(r.active, true);
  const beLabel =
    (typeof r.statusLabelVi === 'string' ? r.statusLabelVi : null) ??
    (typeof r.status_label_vi === 'string' ? r.status_label_vi : null) ??
    (typeof r.status_label === 'string' ? r.status_label : null);
  return {
    id: r.id != null ? String(r.id) : null,
    companyId:
      r.companyId != null
        ? String(r.companyId)
        : r.company_id != null
          ? String(r.company_id)
          : null,
    name: String(r.name ?? '').trim() || '—',
    address: String(r.address ?? '').trim(),
    latitude: asNum(r.latitude),
    longitude: asNum(r.longitude),
    radiusMeters: asNum(r.radiusMeters ?? r.radius_meters ?? r.radius, 200),
    active,
    statusLabelVi: deriveAtt03dStatusLabelVi(active, beLabel),
    createdAt:
      r.createdAt != null
        ? String(r.createdAt)
        : r.created_at != null
          ? String(r.created_at)
          : null,
    updatedAt:
      r.updatedAt != null
        ? String(r.updatedAt)
        : r.updated_at != null
          ? String(r.updated_at)
          : null,
  };
}

/** Empty active catalog — must show CTA (no seed / no ensureDefaultWorkSite). */
export function isAtt03dActiveEmpty(activeCount: number | null | undefined): boolean {
  return !activeCount || activeCount <= 0;
}

/** Empty CTA — admin thêm điểm trong Cài đặt GPS (U65 · AC-ATT-03D-EMPTY). */
export function att03dEmptyCatalogCtaMessage(): string {
  return 'Chưa có điểm GPS hiệu lực — mở Cài đặt chấm công → Điểm GPS để Thêm điểm (không seed · không tạo điểm mặc định).';
}

/** Punch empty skip hint — geofence skipped when active=0 (Diễn biến #6). */
export function att03dEmptyPunchSkipMessage(): string {
  return 'Chưa có điểm GPS hiệu lực — chấm GPS không bị chặn ngoài vùng. Thêm điểm tại Cài đặt → Điểm GPS (không seed).';
}

export function att03dGeo001Message(): string {
  return `${ATT_03D_GEO_001_CODE}: Ngoài vùng GPS cho phép. Đứng trong bán kính điểm hiệu lực hoặc cập nhật danh mục điểm.`;
}

export function att03dGeoReqMessage(): string {
  return `${ATT_03D_GEO_REQ_CODE}: Thiếu tọa độ GPS. Bật vị trí / gửi vĩ độ·kinh độ — không im lặng thành công.`;
}

/** TRUE when path is Nest dual /api/hrm/core/* geofence SoT (FAIL O9). */
export function isForbiddenAtt03dSotPath(path: string | null | undefined): boolean {
  const p = String(path ?? '').toLowerCase();
  if (!p.includes('/api/hrm/core/')) return false;
  return (
    p.includes('attendance') ||
    p.includes('/att/') ||
    p.includes('work-site') ||
    p.includes('work_site') ||
    p.includes('gps') ||
    p.includes('geofence')
  );
}

/** Physical attendance family (PASS O9). */
export function isPhysicalAtt03dPath(path: string | null | undefined): boolean {
  const p = String(path ?? '');
  return (
    p.includes('/attendance/work-sites') ||
    p.includes('/attendance/records') ||
    p.includes('/attendance/rules')
  );
}

/** Honesty footer lines — every ATT-03d evidence / UI smoke. */
export const ATT_03D_HONESTY_FOOTER = {
  printableFalse: 'contracts_printable_ready=false',
  pltWsNeAtt03dDone:
    'PLT WS / CNS-05 ≠ ATT-03d DONE · ATTWSQA-MSJC3IN9 · ATTWSQA2-MSJCG47P',
  thinNeAtt03dDone: 'thin work-sites CRUD alone ≠ ATT-03d DONE · ≠ FR-UC-BP-ATT-03d DONE',
  neResidualAtt03b: '≠ residual/thin=ATT-03b DONE · ATT03BQC1-MSM0891H',
  neCatalogAtt01: '≠ catalog=ATT-01 DONE · ATT01QC1-MSLZ3KIM · R-ATT-01-ASSIGN open',
  neLiveAtt11: '≠ LIVE=ATT-11 DONE · ATT11QC1-MSLXTH9P',
  neAggAtt10: '≠ AGG=ATT-10 DONE · ATT10QC1-MSLWGUYH',
  neSoftAtt09: '≠ soft/ATT-08=ATT-09 DONE · ATT09QC1-MSLUTL9D · DENY att_leave_hold',
  mkAtt08: 'ATT-08 preview RETAIN · ATT08QC1-MSLSL36C',
  cfgNeAtt02: 'CFG ≠ ATT-02 DONE · ATT02QC1-MSLQZUK7',
  neAttModuleUat: '≠ ATT module UAT · attendance_uat_ready=false',
  nePltDone: '≠ PLT/platform UAT · PLT01QC1-MSLPUQIU',
  neCore10Done: '≠ CORE-10 DONE · CORE10QC1-MSLP0EJB',
  neCore09Done: '≠ CORE-09 DONE · printable false · CORE09QC1-MSLNBA89',
  neCore07Done: '≠ CORE-07 DONE · CORE07QC1-KZJTSHNT',
  softNeCore06: 'soft ≠ CORE-06 DONE',
  nestCoreDeny: 'Nest /core ATT geofence = 0',
  payOut: 'PAY OUT invent DONE',
  noSeed: 'U65 zero-seed · DENY ensureDefaultWorkSite',
  gpsJsonDeny: 'DENY gps_locations sole SoT write',
  overlapSiteMobHold: 'OVERLAP/SITE/MOB HOLD GĐ1',
  cSlice: 'C-SLICE · ATT/personnel/PAY/PLT module UAT false',
} as const;

export function att03dHonestyFooterLines(): string[] {
  return [
    ATT_03D_HONESTY_FOOTER.printableFalse,
    ATT_03D_HONESTY_FOOTER.pltWsNeAtt03dDone,
    ATT_03D_HONESTY_FOOTER.thinNeAtt03dDone,
    ATT_03D_HONESTY_FOOTER.neResidualAtt03b,
    ATT_03D_HONESTY_FOOTER.neCatalogAtt01,
    ATT_03D_HONESTY_FOOTER.neLiveAtt11,
    ATT_03D_HONESTY_FOOTER.neAggAtt10,
    ATT_03D_HONESTY_FOOTER.neSoftAtt09,
    ATT_03D_HONESTY_FOOTER.mkAtt08,
    ATT_03D_HONESTY_FOOTER.cfgNeAtt02,
    ATT_03D_HONESTY_FOOTER.neAttModuleUat,
    ATT_03D_HONESTY_FOOTER.nePltDone,
    ATT_03D_HONESTY_FOOTER.neCore10Done,
    ATT_03D_HONESTY_FOOTER.neCore09Done,
    ATT_03D_HONESTY_FOOTER.neCore07Done,
    ATT_03D_HONESTY_FOOTER.softNeCore06,
    ATT_03D_HONESTY_FOOTER.nestCoreDeny,
    ATT_03D_HONESTY_FOOTER.payOut,
    ATT_03D_HONESTY_FOOTER.noSeed,
    ATT_03D_HONESTY_FOOTER.gpsJsonDeny,
    ATT_03D_HONESTY_FOOTER.overlapSiteMobHold,
    ATT_03D_HONESTY_FOOTER.cSlice,
  ];
}

export function att03dHonestyBannerText(): string {
  return [
    `Honesty: ${ATT_03D_HONESTY_FOOTER.printableFalse}`,
    ATT_03D_HONESTY_FOOTER.pltWsNeAtt03dDone,
    ATT_03D_HONESTY_FOOTER.thinNeAtt03dDone,
    '≠ residual/thin=ATT-03b · ≠ catalog=ATT-01 · ≠ LIVE=ATT-11 · ≠ AGG=ATT-10',
    ATT_03D_HONESTY_FOOTER.cfgNeAtt02,
    ATT_03D_HONESTY_FOOTER.neAttModuleUat,
    ATT_03D_HONESTY_FOOTER.nestCoreDeny,
    ATT_03D_HONESTY_FOOTER.noSeed,
    ATT_03D_HONESTY_FOOTER.gpsJsonDeny,
    ATT_03D_HONESTY_FOOTER.payOut,
  ].join(' · ');
}

/** Guard — never flip printable from FE alone. */
export function assertAtt03dPrintableHonesty(): boolean {
  return CONTRACTS_PRINTABLE_READY === false;
}
