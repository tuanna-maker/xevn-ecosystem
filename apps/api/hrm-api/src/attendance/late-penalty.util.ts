/**
 * @CODE-MEMORY
 * Screen:     HRM → Chấm công → Phạt muộn/về sớm (ATT-02 CFG/EVAL helpers)
 * UC:         UC-BP-ATT-02 · FR-UC-BP-ATT-02
 * BR:         BR-BP-SHF-02
 * SRS:        docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md · FR-UC-BP-ATT-02 Diễn biến #1/#3/#5
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-ATT-02-CLUSTER-API-01.md F-ATT-RULE-01
 * Purpose:    XOR mode · bands overlap · evaluate late_penalty_hours (pure) — không Nest /core · ≠ PAY.
 * WorkItem:   PO-HRM-MVP-GD1-ATT-02-CLUSTER-BE-01
 * Coded:      2026-08-09
 * Callers:    attendance-config.service · att-timesheet-line-aggregate
 * Callees:    none (pure)
 * must_keep:  HRM-VAL-400 mixed/overlap · notifyLate ≠ off · PAY OUT · CFG ≠ ATT-02 DONE
 * SOLID:      Pure helpers tách persist/HTTP
 * LastVerified: late-penalty.util.spec.ts
 */
import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';

export type LatePenaltyMode = 'minute' | 'block' | 'tier';

export type LatePenaltyBand = {
  fromMinutes: number;
  toMinutes: number;
  penaltyHours: number;
  /** Block size in minutes when mode=block (optional; default 30). */
  blockMinutes?: number;
};

export const LATE_PENALTY_MODE_LABELS_VI: Record<LatePenaltyMode, string> = {
  minute: 'Theo phút',
  block: 'Theo block',
  tier: 'Theo bậc/khoảng',
};

const MODE_ALIASES: Record<string, LatePenaltyMode> = {
  minute: 'minute',
  minutes: 'minute',
  block: 'block',
  tier: 'tier',
  band: 'tier',
  bands: 'tier',
};

export function normalizeLatePenaltyMode(raw: unknown): LatePenaltyMode | null {
  if (raw == null || raw === '') return null;
  const key = String(raw).trim().toLowerCase();
  return MODE_ALIASES[key] ?? null;
}

export function modeLabelVi(
  mode: LatePenaltyMode | null | undefined,
): string | null {
  if (!mode) return null;
  return LATE_PENALTY_MODE_LABELS_VI[mode] ?? null;
}

function isFiniteNumber(n: unknown): n is number {
  return typeof n === 'number' && Number.isFinite(n);
}

export function parseLatePenaltyBands(raw: unknown): LatePenaltyBand[] {
  if (raw == null) return [];
  let arr: unknown = raw;
  if (typeof raw === 'string') {
    try {
      arr = JSON.parse(raw);
    } catch {
      throw new ApiException(
        'HRM-VAL-400',
        'bands must be a JSON array',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  if (!Array.isArray(arr)) {
    throw new ApiException(
      'HRM-VAL-400',
      'bands must be an array',
      HttpStatus.BAD_REQUEST,
    );
  }
  return arr.map((item, idx) => {
    const row = item as Record<string, unknown>;
    const fromMinutes = Number(row.fromMinutes ?? row.from_minutes);
    const toMinutes = Number(row.toMinutes ?? row.to_minutes);
    const penaltyHours = Number(row.penaltyHours ?? row.penalty_hours);
    if (
      !isFiniteNumber(fromMinutes) ||
      !isFiniteNumber(toMinutes) ||
      !isFiniteNumber(penaltyHours)
    ) {
      throw new ApiException(
        'HRM-VAL-400',
        `bands[${idx}] requires fromMinutes, toMinutes, penaltyHours`,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (fromMinutes < 0 || toMinutes < fromMinutes) {
      throw new ApiException(
        'HRM-VAL-400',
        `bands[${idx}] invalid minute range`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const blockRaw = row.blockMinutes ?? row.block_minutes;
    const band: LatePenaltyBand = { fromMinutes, toMinutes, penaltyHours };
    if (blockRaw != null) {
      const blockMinutes = Number(blockRaw);
      if (!isFiniteNumber(blockMinutes) || blockMinutes <= 0) {
        throw new ApiException(
          'HRM-VAL-400',
          `bands[${idx}] blockMinutes invalid`,
          HttpStatus.BAD_REQUEST,
        );
      }
      band.blockMinutes = blockMinutes;
    }
    return band;
  });
}

/** Half-open overlap on [from, to] minute intervals → reject. */
export function assertBandsNoOverlap(bands: LatePenaltyBand[]): void {
  const sorted = [...bands].sort((a, b) => a.fromMinutes - b.fromMinutes);
  for (let i = 1; i < sorted.length; i += 1) {
    const prev = sorted[i - 1];
    const cur = sorted[i];
    if (cur.fromMinutes <= prev.toMinutes) {
      throw new ApiException(
        'HRM-VAL-400',
        'Late-penalty bands overlap (BR-BP-SHF-02)',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}

/**
 * XOR one mode SoT (BR-BP-SHF-02). Rejects mixed flags / multi-mode arrays.
 */
export function assertXorLatePenaltyMode(payload: {
  mode?: unknown;
  modes?: unknown;
  modeMinute?: unknown;
  modeBlock?: unknown;
  modeTier?: unknown;
  modeBand?: unknown;
}): LatePenaltyMode | undefined {
  const flagModes: LatePenaltyMode[] = [];
  if (payload.modeMinute === true) flagModes.push('minute');
  if (payload.modeBlock === true) flagModes.push('block');
  if (payload.modeTier === true || payload.modeBand === true)
    flagModes.push('tier');

  if (Array.isArray(payload.modes)) {
    const normalized = payload.modes
      .map((m) => normalizeLatePenaltyMode(m))
      .filter((m): m is LatePenaltyMode => m != null);
    const unique = [...new Set(normalized)];
    if (unique.length > 1 || flagModes.length > 0) {
      throw new ApiException(
        'HRM-VAL-400',
        'Mixed late-penalty modes not allowed (BR-BP-SHF-02)',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (unique.length === 1) return unique[0];
  }

  if (Array.isArray(payload.mode)) {
    const normalized = payload.mode
      .map((m) => normalizeLatePenaltyMode(m))
      .filter((m): m is LatePenaltyMode => m != null);
    const unique = [...new Set(normalized)];
    if (unique.length > 1) {
      throw new ApiException(
        'HRM-VAL-400',
        'Mixed late-penalty modes not allowed (BR-BP-SHF-02)',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (unique.length === 1) return unique[0];
    throw new ApiException(
      'HRM-VAL-400',
      'Invalid late-penalty mode (minute|block|tier)',
      HttpStatus.BAD_REQUEST,
    );
  }

  if (flagModes.length > 1) {
    throw new ApiException(
      'HRM-VAL-400',
      'Mixed late-penalty modes not allowed (BR-BP-SHF-02)',
      HttpStatus.BAD_REQUEST,
    );
  }
  if (flagModes.length === 1 && payload.mode != null && payload.mode !== '') {
    const single = normalizeLatePenaltyMode(payload.mode);
    if (single && single !== flagModes[0]) {
      throw new ApiException(
        'HRM-VAL-400',
        'Mixed late-penalty modes not allowed (BR-BP-SHF-02)',
        HttpStatus.BAD_REQUEST,
      );
    }
    return flagModes[0];
  }
  if (flagModes.length === 1) return flagModes[0];

  if (payload.mode === undefined) return undefined;
  if (payload.mode === null || payload.mode === '') return undefined;

  const normalized = normalizeLatePenaltyMode(payload.mode);
  if (!normalized) {
    throw new ApiException(
      'HRM-VAL-400',
      'Invalid late-penalty mode (minute|block|tier)',
      HttpStatus.BAD_REQUEST,
    );
  }
  return normalized;
}

function roundHours(n: number): number {
  return Math.round(n * 10000) / 10000;
}

/**
 * Evaluate late penalty hours for funnel (FR-UC-BP-ATT-02 Diễn biến #3/#5).
 * latePenaltyEnabled=false → 0 (notifyLate is orthogonal — not consulted here).
 */
export function evaluateLatePenaltyHours(input: {
  latePenaltyEnabled: boolean | null | undefined;
  mode: LatePenaltyMode | string | null | undefined;
  bands?: LatePenaltyBand[] | null;
  lateMinutes: number;
}): number {
  if (input.latePenaltyEnabled === false) return 0;
  const late = Number(input.lateMinutes);
  if (!Number.isFinite(late) || late <= 0) return 0;

  const mode = normalizeLatePenaltyMode(input.mode);
  if (!mode) return 0;

  const bands = Array.isArray(input.bands) ? input.bands : [];

  if (mode === 'minute') {
    if (bands.length === 0) {
      return roundHours(late / 60);
    }
    let total = 0;
    for (const band of bands) {
      if (late >= band.fromMinutes && late <= band.toMinutes) {
        return roundHours(band.penaltyHours);
      }
      // Pro-rate across covered span when band uses penalty as rate hours per minute range
      if (late > band.toMinutes) {
        total = band.penaltyHours;
      }
    }
    const match = bands.find(
      (b) => late >= b.fromMinutes && late <= b.toMinutes,
    );
    if (match) return roundHours(match.penaltyHours);
    const last = bands[bands.length - 1];
    if (last && late > last.toMinutes) return roundHours(last.penaltyHours);
    return roundHours(total);
  }

  if (mode === 'block') {
    const blockSize =
      bands.find((b) => b.blockMinutes != null)?.blockMinutes ??
      bands[0]?.blockMinutes ??
      30;
    const blocks = Math.ceil(late / blockSize);
    const perBlock =
      bands.find((b) => late >= b.fromMinutes && late <= b.toMinutes)
        ?.penaltyHours ??
      bands[0]?.penaltyHours ??
      roundHours(blockSize / 60);
    return roundHours(blocks * perBlock);
  }

  // tier / band
  const hit = bands.find((b) => late >= b.fromMinutes && late <= b.toMinutes);
  if (hit) return roundHours(hit.penaltyHours);
  const last = [...bands].sort((a, b) => a.toMinutes - b.toMinutes).at(-1);
  if (last && late > last.toMinutes) return roundHours(last.penaltyHours);
  return 0;
}

export type LatePenaltyScopeKeys = {
  companyId: string;
  departmentId: string | null;
  shiftId: string | null;
};

/**
 * Specificity rank: dept+shift (3) > dept (2) > shift (1) > company (0).
 * Resolve picks highest rank among candidates matching keys.
 */
export function specificityRank(scope: {
  departmentId?: string | null;
  shiftId?: string | null;
}): number {
  const hasDept = Boolean(scope.departmentId);
  const hasShift = Boolean(scope.shiftId);
  if (hasDept && hasShift) return 3;
  if (hasDept) return 2;
  if (hasShift) return 1;
  return 0;
}

export function pickBestSpecificityRule<
  T extends { department_id?: string | null; shift_id?: string | null },
>(
  rows: T[],
  want: { departmentId?: string | null; shiftId?: string | null },
): T | null {
  const wantDept = want.departmentId ? String(want.departmentId) : null;
  const wantShift = want.shiftId ? String(want.shiftId) : null;

  const candidates = rows.filter((r) => {
    const d = r.department_id ? String(r.department_id) : null;
    const s = r.shift_id ? String(r.shift_id) : null;
    if (d && wantDept && d !== wantDept) return false;
    if (s && wantShift && s !== wantShift) return false;
    if (d && !wantDept) return false;
    if (s && !wantShift) return false;
    return true;
  });

  if (!candidates.length) {
    // company-only fallback
    const companyOnly = rows.filter((r) => !r.department_id && !r.shift_id);
    return companyOnly[0] ?? null;
  }

  candidates.sort(
    (a, b) =>
      specificityRank({ departmentId: b.department_id, shiftId: b.shift_id }) -
      specificityRank({ departmentId: a.department_id, shiftId: a.shift_id }),
  );
  return candidates[0] ?? null;
}
