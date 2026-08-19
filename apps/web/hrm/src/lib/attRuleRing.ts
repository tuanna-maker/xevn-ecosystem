/**
 * @CODE-MEMORY
 * Screen:     /attendance → Cài đặt → Quy tắc · phạt muộn/về sớm (ATT-02)
 * UC:         UC-BP-ATT-02 · FR-UC-BP-ATT-02 · AC-ATT-02-* · J-HRM-ATT-02-01..06
 * BR:         BR-BP-SHF-02 XOR · BR-ATT-02-PATH/SCOPE/OFF/≠-CFG-DONE/≠-LER/≠-UAT/PAY-OUT
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-02 Diễn biến #1–#5 · Thành công
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-ATT-02-CLUSTER-API-01.md
 *             F-ATT-RULE-01 RETAIN · peers sites/shifts/late_early/punch · Nest /core DENY
 * Purpose:    Path lock + mode XOR / bands / scope / off helpers + honesty footers —
 *             bind display-ready when BE wires; graceful ABSENT until residual READY;
 *             DENY Nest /core ATT dual · claim CFG alone = ATT-02 DONE · claim ATT UAT ·
 *             invent PAY/printable/Word DONE · wipe PLT/CORE seals · fake XOR persist.
 * WorkItem:   PO-HRM-MVP-GD1-ATT-02-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    AttLatePenaltyModePanel · LateEarlyRequestTab · source tests
 * Callees:    contractLegalPrintConstants (printable false RETAIN)
 * must_keep:  PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false ·
 *             CORE07QC1-KZJTSHNT · soft≠CORE-06 DONE · Nest /core DENY · physical /attendance/* · U65 · C-SLICE
 * SOLID:      Pure helpers tách panel — no schema invent · no FE penalty engine
 * LastVerified: attRuleRing.test.ts · poHrmMvpGd1Att02ClusterFe01.source.test.ts · poHrmMvpGd1Att02ClusterFe02.source.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-ATT-02-CLUSTER-FE-02
 * change_mode: UPGRADE
 * What: LIVE bind helpers — buildAtt02LatePenaltyPatchBody · collectActiveAtt02Modes ·
 *       surface HRM-VAL-400 · close R-ATT-02-MODE-FE honesty (BE-01 wired) ·
 *       off ≠ notifyLate · Nest /core DENY · CFG alone ≠ ATT-02 DONE.
 * Why: UC-BP-ATT-02 · API-01 §4.6 · BE-01 READY_FOR_QA · J-HRM-ATT-02-01..06
 * must_keep: PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false ·
 *            CORE07QC1-KZJTSHNT · soft≠CORE-06 · physical /attendance/* · U65 · C-SLICE · PAY OUT
 */

import { CONTRACTS_PRINTABLE_READY } from '@/lib/contractLegalPrintConstants';

/** Physical SoT paths (O2/O8) — Network MUST contain; Nest /core ATT = FAIL. */
export const ATT_RULE_02_PATH_ASSERT = {
  rules: '/api/hrm/attendance/rules',
  rulesLatePenaltyOptional: '/api/hrm/attendance/rules/late-penalty',
  workSites: '/api/hrm/attendance/work-sites',
  workShifts: '/api/hrm/attendance/work-shifts',
  lateEarly: '/api/hrm/attendance/late-early-requests',
  punch: '/api/hrm/attendance/records',
  nestCoreDenied: '/api/hrm/core/',
} as const;

/** XOR modes — BR-BP-SHF-02 / O1. */
export const ATT_02_MODES = ['minute', 'block', 'tier', 'band'] as const;
export type Att02Mode = (typeof ATT_02_MODES)[number];

export const ATT_02_MODE_LABEL_VI: Record<Att02Mode, string> = {
  minute: 'Theo phút',
  block: 'Theo block',
  tier: 'Theo bậc/khoảng',
  band: 'Theo bậc/khoảng',
};

export type Att02Band = {
  fromMinutes: number;
  toMinutes: number;
  penaltyHours: number;
};

export type Att02Scope = {
  companyId: string | null;
  departmentId: string | null;
  shiftId: string | null;
};

export type Att02SourceFlags = {
  gpsEnabled: boolean | null;
  wifiEnabled: boolean | null;
  qrEnabled: boolean | null;
};

/** Display-ready late-penalty envelope (API-01 §4.6) — null mode ⇒ residual ABSENT. */
export type Att02LatePenaltyEnvelope = {
  companyId: string | null;
  mode: Att02Mode | null;
  modeLabelVi: string | null;
  bands: Att02Band[];
  scope: Att02Scope;
  sourceFlags: Att02SourceFlags;
  latePenaltyEnabled: boolean | null;
  latePenaltyHours: number | null;
  notifyLate: boolean | null;
  /** True when BE returned at least one residual mode/off field. */
  envelopePresent: boolean;
};

function asBool(v: unknown): boolean | null {
  if (v == null) return null;
  if (typeof v === 'boolean') return v;
  if (v === 'true' || v === 1 || v === '1') return true;
  if (v === 'false' || v === 0 || v === '0') return false;
  return null;
}

function asNum(v: unknown): number | null {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function normalizeMode(raw: unknown): Att02Mode | null {
  const s = String(raw ?? '')
    .trim()
    .toLowerCase();
  if (!s) return null;
  if ((ATT_02_MODES as readonly string[]).includes(s)) return s as Att02Mode;
  return null;
}

function parseBands(raw: unknown): Att02Band[] {
  if (!Array.isArray(raw)) return [];
  const out: Att02Band[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    const fromMinutes = asNum(row.fromMinutes ?? row.from_minutes);
    const toMinutes = asNum(row.toMinutes ?? row.to_minutes);
    const penaltyHours = asNum(row.penaltyHours ?? row.penalty_hours);
    if (fromMinutes == null || toMinutes == null || penaltyHours == null) continue;
    out.push({ fromMinutes, toMinutes, penaltyHours });
  }
  return out;
}

function parseScope(row: Record<string, unknown>): Att02Scope {
  const scopeRaw = row.scope;
  if (scopeRaw && typeof scopeRaw === 'object') {
    const s = scopeRaw as Record<string, unknown>;
    return {
      companyId: s.companyId != null ? String(s.companyId) : s.company_id != null ? String(s.company_id) : null,
      departmentId:
        s.departmentId != null
          ? String(s.departmentId)
          : s.department_id != null
            ? String(s.department_id)
            : null,
      shiftId: s.shiftId != null ? String(s.shiftId) : s.shift_id != null ? String(s.shift_id) : null,
    };
  }
  return {
    companyId: row.companyId != null ? String(row.companyId) : row.company_id != null ? String(row.company_id) : null,
    departmentId:
      row.departmentId != null
        ? String(row.departmentId)
        : row.department_id != null
          ? String(row.department_id)
          : null,
    shiftId: row.shiftId != null ? String(row.shiftId) : row.shift_id != null ? String(row.shift_id) : null,
  };
}

function parseSourceFlags(row: Record<string, unknown>): Att02SourceFlags {
  const flags = row.sourceFlags ?? row.source_flags;
  if (flags && typeof flags === 'object') {
    const f = flags as Record<string, unknown>;
    return {
      gpsEnabled: asBool(f.gpsEnabled ?? f.gps_enabled),
      wifiEnabled: asBool(f.wifiEnabled ?? f.wifi_enabled),
      qrEnabled: asBool(f.qrEnabled ?? f.qr_enabled),
    };
  }
  return {
    gpsEnabled: asBool(row.gpsEnabled ?? row.gps_enabled),
    wifiEnabled: asBool(row.wifiEnabled ?? row.wifi_enabled),
    qrEnabled: asBool(row.qrEnabled ?? row.qr_enabled),
  };
}

/**
 * Parse GET/PATCH /attendance/rules row into late-penalty envelope.
 * mode/latePenaltyEnabled ABSENT ⇒ envelopePresent=false (stub-safe · no fake persist).
 */
export function parseAtt02LatePenaltyEnvelope(
  row: Record<string, unknown> | null | undefined,
): Att02LatePenaltyEnvelope {
  const r = row ?? {};
  const mode = normalizeMode(r.mode);
  const latePenaltyEnabled = asBool(r.latePenaltyEnabled ?? r.late_penalty_enabled);
  const bands = parseBands(r.bands);
  const hasBandsKey = Object.prototype.hasOwnProperty.call(r, 'bands');
  const hasScopeObj =
    (r.scope != null && typeof r.scope === 'object') ||
    r.departmentId != null ||
    r.department_id != null ||
    r.shiftId != null ||
    r.shift_id != null;
  const envelopePresent =
    mode != null || latePenaltyEnabled != null || hasBandsKey || hasScopeObj;

  const modeLabelFromBe = String(r.modeLabelVi ?? r.mode_label_vi ?? '').trim();
  const modeLabelVi =
    modeLabelFromBe || (mode != null ? ATT_02_MODE_LABEL_VI[mode] : null);

  return {
    companyId: r.companyId != null ? String(r.companyId) : r.company_id != null ? String(r.company_id) : null,
    mode,
    modeLabelVi,
    bands,
    scope: parseScope(r),
    sourceFlags: parseSourceFlags(r),
    latePenaltyEnabled,
    latePenaltyHours: asNum(r.latePenaltyHours ?? r.late_penalty_hours),
    notifyLate: asBool(r.notifyLate ?? r.notify_late),
    envelopePresent,
  };
}

/** Prefer BE modeLabelVi; else FE-derive VI (DENY raw enum as sole UI). */
export function resolveAtt02ModeLabelVi(
  mode: string | null | undefined,
  modeLabelVi?: string | null,
): string {
  const fromBe = String(modeLabelVi ?? '').trim();
  if (fromBe) return fromBe;
  const m = normalizeMode(mode);
  if (m) return ATT_02_MODE_LABEL_VI[m];
  return '—';
}

/** Canonical XOR key — band ≡ tier (BR-BP-SHF-02). */
export function canonicalizeAtt02Mode(mode: Att02Mode | null | undefined): 'minute' | 'block' | 'tier' | null {
  const m = normalizeMode(mode);
  if (!m) return null;
  return m === 'band' ? 'tier' : m === 'tier' ? 'tier' : m;
}

/**
 * Collect active modes from draft / mixed payload flags.
 * Mixed boolean flags (modeMinute+modeBlock) or modes[] length>1 ⇒ XOR fail.
 */
export function collectActiveAtt02Modes(input: {
  mode?: string | null;
  modes?: Array<string | null | undefined> | null;
  modeMinute?: boolean | null;
  modeBlock?: boolean | null;
  modeTier?: boolean | null;
  modeBand?: boolean | null;
}): Array<'minute' | 'block' | 'tier'> {
  const out = new Set<'minute' | 'block' | 'tier'>();
  const push = (raw: string | null | undefined) => {
    const c = canonicalizeAtt02Mode(normalizeMode(raw));
    if (c) out.add(c);
  };
  push(input.mode ?? null);
  if (Array.isArray(input.modes)) {
    for (const m of input.modes) push(m);
  }
  if (input.modeMinute === true) out.add('minute');
  if (input.modeBlock === true) out.add('block');
  if (input.modeTier === true || input.modeBand === true) out.add('tier');
  return [...out];
}

/** Client-side XOR guard — >1 distinct mode keys active ⇒ invalid (mirrors HRM-VAL-400). */
export function assertAtt02XorModes(activeModes: Array<string | null | undefined>): boolean {
  const set = new Set(
    activeModes
      .map((m) => canonicalizeAtt02Mode(normalizeMode(m)))
      .filter((m): m is 'minute' | 'block' | 'tier' => m != null),
  );
  return set.size <= 1;
}

/** True when payload would mix modes (client reject before PATCH). */
export function isAtt02MixedModePayload(input: Parameters<typeof collectActiveAtt02Modes>[0]): boolean {
  return collectActiveAtt02Modes(input).length > 1;
}

/** Bands overlap detect — adjacent OK; overlap ⇒ fail (HRM-VAL-400). */
export function bandsOverlap(bands: Att02Band[]): boolean {
  const sorted = [...bands].sort((a, b) => a.fromMinutes - b.fromMinutes);
  for (let i = 1; i < sorted.length; i += 1) {
    if (sorted[i].fromMinutes <= sorted[i - 1].toMinutes) return true;
  }
  return false;
}

/** Stable HRM-VAL-400 code for XOR / bands overlap (client + BE). */
export const ATT_02_VAL_400_CODE = 'HRM-VAL-400' as const;

export function att02Val400Message(kind: 'xor' | 'bands' | 'generic' = 'generic'): string {
  if (kind === 'xor') {
    return `${ATT_02_VAL_400_CODE}: Lẫn chế độ phạt — chỉ một mode (phút XOR block XOR bậc) · BR-BP-SHF-02.`;
  }
  if (kind === 'bands') {
    return `${ATT_02_VAL_400_CODE}: Bảng mức (bands) chồng khoảng — chỉnh lại before Lưu.`;
  }
  return `${ATT_02_VAL_400_CODE}: Cấu hình phạt muộn không hợp lệ.`;
}

/**
 * Build PATCH body for residual late-penalty — single mode SoT · no mixed flags.
 * notifyLate intentionally omitted (peer ≠ off).
 */
export function buildAtt02LatePenaltyPatchBody(draft: {
  mode: Att02Mode;
  latePenaltyEnabled: boolean;
  bands: Att02Band[];
  departmentId?: string | null;
  shiftId?: string | null;
}): Record<string, unknown> {
  const mode = canonicalizeAtt02Mode(draft.mode) ?? draft.mode;
  return {
    mode,
    bands: draft.bands.map((b) => ({
      fromMinutes: b.fromMinutes,
      toMinutes: b.toMinutes,
      penaltyHours: b.penaltyHours,
    })),
    latePenaltyEnabled: draft.latePenaltyEnabled,
    departmentId: draft.departmentId?.trim() ? draft.departmentId.trim() : null,
    shiftId: draft.shiftId?.trim() ? draft.shiftId.trim() : null,
  };
}

/** Client preflight — returns error message or null when OK. */
export function validateAtt02LatePenaltyDraft(draft: {
  mode: Att02Mode | null;
  latePenaltyEnabled: boolean;
  bands: Att02Band[];
  modeMinute?: boolean;
  modeBlock?: boolean;
  modeTier?: boolean;
}): string | null {
  if (!draft.mode) {
    return 'Chọn đúng một chế độ phạt (phút XOR block XOR bậc).';
  }
  if (
    isAtt02MixedModePayload({
      mode: draft.mode,
      modeMinute: draft.modeMinute,
      modeBlock: draft.modeBlock,
      modeTier: draft.modeTier,
    })
  ) {
    return att02Val400Message('xor');
  }
  if (!assertAtt02XorModes([draft.mode])) {
    return att02Val400Message('xor');
  }
  if (bandsOverlap(draft.bands)) {
    return att02Val400Message('bands');
  }
  return null;
}

/** TRUE when path is Nest dual `/api/hrm/core/*` ATT SoT (FAIL O8). */
export function isForbiddenAttRuleSotPath(path: string | null | undefined): boolean {
  const p = String(path ?? '').toLowerCase();
  if (!p.includes('/api/hrm/core/')) return false;
  return (
    p.includes('attendance') ||
    p.includes('/att/') ||
    p.includes('late-penalty') ||
    p.includes('late_penalty') ||
    p.includes('work-site') ||
    p.includes('work_site') ||
    p.includes('work-shift') ||
    p.includes('late-early') ||
    p.includes('rules')
  );
}

/** Physical attendance family (PASS O2/O8). */
export function isPhysicalAttendancePath(path: string | null | undefined): boolean {
  return String(path ?? '').includes('/attendance/');
}

/** Honesty footer lines — every ATT-02 evidence / UI smoke. */
export const ATT_02_HONESTY_FOOTER = {
  printableFalse: 'contracts_printable_ready=false',
  cfgNeAtt02Done: 'CFG alone ≠ ATT-02 DONE · round/notify_late ≠ FR-02 DONE',
  lerNeModeSot: 'late_early_requests ≠ mode SoT · ≠ FR-02 DONE',
  neAttModuleUat: '≠ ATT module UAT · attendance_uat_ready=false',
  nePltDone: '≠ PLT/platform UAT · peer≠PLT DONE · merge≠UAT · PLT01QC1-MSLPUQIU',
  neCore10Done: '≠ CORE-10 DONE · CORE10QC1-MSLP0EJB',
  neCore09Done: '≠ CORE-09 DONE · printable false · CORE09QC1-MSLNBA89',
  neCore07Done:
    '≠ CORE-07 DONE · GATE 409 · ACT-400 · Nest DENY · CORE07QC1-KZJTSHNT',
  softNeCore06: 'soft ≠ CORE-06 DONE',
  nestCoreDeny: 'Nest /core ATT = 0',
  payOut: 'PAY OUT invent DONE',
  noSeed: 'U65 zero-seed',
  cSlice: 'C-SLICE · ATT/personnel/PAY/PLT module UAT false',
  /** FE-02: residual closed after BE-01 wire — still ≠ ATT-02 / UAT DONE. */
  residualMode: 'R-ATT-02-MODE-FE CLOSED · LIVE /attendance/rules* · ≠ CFG alone DONE',
  offNeNotifyLate: 'latePenaltyEnabled=false ≠ notifyLate off',
} as const;

export function att02HonestyFooterLines(): string[] {
  return [
    ATT_02_HONESTY_FOOTER.printableFalse,
    ATT_02_HONESTY_FOOTER.cfgNeAtt02Done,
    ATT_02_HONESTY_FOOTER.lerNeModeSot,
    ATT_02_HONESTY_FOOTER.neAttModuleUat,
    ATT_02_HONESTY_FOOTER.nePltDone,
    ATT_02_HONESTY_FOOTER.neCore10Done,
    ATT_02_HONESTY_FOOTER.neCore09Done,
    ATT_02_HONESTY_FOOTER.neCore07Done,
    ATT_02_HONESTY_FOOTER.softNeCore06,
    ATT_02_HONESTY_FOOTER.nestCoreDeny,
    ATT_02_HONESTY_FOOTER.payOut,
    ATT_02_HONESTY_FOOTER.noSeed,
    ATT_02_HONESTY_FOOTER.cSlice,
    ATT_02_HONESTY_FOOTER.residualMode,
    ATT_02_HONESTY_FOOTER.offNeNotifyLate,
  ];
}

export function att02HonestyBannerText(): string {
  return [
    `Honesty: ${ATT_02_HONESTY_FOOTER.printableFalse}`,
    ATT_02_HONESTY_FOOTER.cfgNeAtt02Done,
    ATT_02_HONESTY_FOOTER.lerNeModeSot,
    ATT_02_HONESTY_FOOTER.neAttModuleUat,
    'PLT/CORE RETAIN (≠ DONE)',
    ATT_02_HONESTY_FOOTER.softNeCore06,
    ATT_02_HONESTY_FOOTER.payOut,
    ATT_02_HONESTY_FOOTER.offNeNotifyLate,
    ATT_02_HONESTY_FOOTER.residualMode,
  ].join(' · ');
}

/** Guard — never flip printable from FE alone. */
export function assertAtt02PrintableHonesty(): boolean {
  return CONTRACTS_PRINTABLE_READY === false;
}

/** Residual stamp — FE-01 ABSENT HOLD; FE-02 CLOSED after BE-01 LIVE bind. */
export const R_ATT_02_MODE_FE = 'R-ATT-02-MODE-FE' as const;

/** FE-02 closed stamp (honesty · evidence). */
export const R_ATT_02_MODE_FE_CLOSED = 'R-ATT-02-MODE-FE CLOSED' as const;
