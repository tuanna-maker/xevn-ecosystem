/**
 * @CODE-MEMORY
 * Screen:     Mobile login — lazy ensure UAT NV personas
 * UC:         FR-UC-M01 · UC-HRM-MOB-03
 * BR:         MOBILE_PERSONA_UX_MATRIX §2.2
 * SRS:        HDSD CH12 TC-MOB-003/004
 * Purpose:    Lazy product ensure `uat.nv####@xe.vn` (seq 1..1000) + password
 *             `xevn-uat-2026` sau tenant-master wipe — không bulk seed.
 * WorkItem:   D-HDSD-MOB-UAT-AUTH-01 (restore) · W1-B-03-AUTH-BE
 * Coded:      2026-07-30; restored 2026-08-03
 * must_keep:  Chỉ pattern uat.nv#### / nguyen.van.an.####; U65 no pnpm seed:*
 * LastVerified: mobile-auth.service.spec.ts D-HDSD-MOB-UAT-AUTH-01
 */

import { createHash, randomUUID } from 'node:crypto';
import type { HrmDbService } from '../db/hrm-db.service';

const UAT_EMAIL_RE = /^uat\.nv(\d{4})@xe\.vn$/i;
const LEGACY_EMAIL_RE = /^nguyen\.van\.an\.(\d{4})@xe\.vn$/i;
const UAT_SEQ_MIN = 1;
const UAT_SEQ_MAX = 1000;

type UatPersona = {
  companyId: string;
  employeeCode: string;
  fullName: string;
  jobTitleKey: string;
  mobilePersona: 'emp' | 'mgr';
};

function resolveUatPassword(): string {
  return (
    process.env.HRM_MOBILE_UAT_PASSWORD?.trim() ||
    process.env.PILOT_MOBILE_UAT_PASSWORD?.trim() ||
    'xevn-uat-2026'
  );
}

function hashMobilePassword(email: string, password: string): string {
  return createHash('sha256').update(`${email.trim().toLowerCase()}:${password}`).digest('hex');
}

function parseSeq(raw: string): number | null {
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < UAT_SEQ_MIN || n > UAT_SEQ_MAX) return null;
  return n;
}

/** `uat.nv0001@xe.vn` hoặc legacy `nguyen.van.an.0001@xe.vn` → seq 1..1000. */
export function parseUatMobileSeqFromLoginEmail(email: string): number | null {
  const key = email.trim().toLowerCase();
  const uat = UAT_EMAIL_RE.exec(key);
  if (uat) return parseSeq(uat[1]);
  const legacy = LEGACY_EMAIL_RE.exec(key);
  if (legacy) return parseSeq(legacy[1]);
  return null;
}

export function resolveCanonicalUatLoginEmail(email: string): string {
  const key = email.trim().toLowerCase();
  const seq = parseUatMobileSeqFromLoginEmail(key);
  if (!seq) return key;
  return `uat.nv${String(seq).padStart(4, '0')}@xe.vn`;
}

export function matchesUatMobilePassword(email: string, password: string): boolean {
  if (!parseUatMobileSeqFromLoginEmail(email)) return false;
  return password === resolveUatPassword();
}

function personaForSeq(seq: number): UatPersona {
  if (seq === 2) {
    return {
      companyId: 'trsport',
      employeeCode: 'TRS-0002',
      fullName: 'UAT Quản lý',
      jobTitleKey: 'COO',
      mobilePersona: 'mgr',
    };
  }
  if (seq === 1) {
    return {
      companyId: 'holding',
      employeeCode: 'HLD-0001',
      fullName: 'Nguyễn Văn An',
      jobTitleKey: 'STAFF',
      mobilePersona: 'emp',
    };
  }
  const companyId =
    seq <= 200 ? 'holding' : seq <= 400 ? 'trsport' : seq <= 600 ? 'logistics' : seq <= 800 ? 'finance' : 'services';
  return {
    companyId,
    employeeCode: `UAT-${String(seq).padStart(4, '0')}`,
    fullName: `UAT NV ${String(seq).padStart(4, '0')}`,
    jobTitleKey: 'STAFF',
    mobilePersona: 'emp',
  };
}

/**
 * Product ensure (not bulk seed): one employee row for documented UAT seq.
 */
export async function ensureUatMobileEmployeeRow(
  db: HrmDbService,
  seq: number,
  password: string,
): Promise<void> {
  if (seq < UAT_SEQ_MIN || seq > UAT_SEQ_MAX) return;
  if (password !== resolveUatPassword()) return;

  const email = `uat.nv${String(seq).padStart(4, '0')}@xe.vn`;
  const persona = personaForSeq(seq);
  const customFields = {
    tenant_id: 'xevn',
    is_primary: 'true',
    is_primary_membership: 'true',
    mobile_persona: persona.mobilePersona,
    mobile_password_hash: hashMobilePassword(email, password),
    company_display:
      persona.companyId === 'holding'
        ? 'Tập đoàn X.E'
        : persona.companyId === 'trsport'
          ? 'Vận tải X.E'
          : undefined,
  };

  const existing = await db.query<{ id: string }>(
    `
      SELECT id::text AS id
      FROM public.employees
      WHERE archived_at IS NULL
        AND status = 'active'
        AND lower(email) = $1
      ORDER BY CASE WHEN company_id = $2 THEN 0 ELSE 1 END
      LIMIT 1;
    `,
    [email, persona.companyId],
  );
  if (existing.rows[0]?.id) {
    await db.query(
      `
        UPDATE public.employees
        SET custom_fields = COALESCE(custom_fields, '{}'::jsonb) || $2::jsonb,
            job_title_key = COALESCE(NULLIF(job_title_key, ''), $3),
            updated_at = NOW()
        WHERE id = $1::uuid AND archived_at IS NULL;
      `,
      [existing.rows[0].id, JSON.stringify(customFields), persona.jobTitleKey],
    );
    return;
  }

  const newId = randomUUID();
  await db.query(
    `
      INSERT INTO public.employees (
        id, company_id, employee_code, email, full_name, job_title_key, status, hired_at, custom_fields
      ) VALUES (
        $1::uuid, $2, $3, $4, $5, $6, 'active', CURRENT_DATE, $7::jsonb
      );
    `,
    [
      newId,
      persona.companyId,
      persona.employeeCode,
      email,
      persona.fullName,
      persona.jobTitleKey,
      JSON.stringify(customFields),
    ],
  );
}
