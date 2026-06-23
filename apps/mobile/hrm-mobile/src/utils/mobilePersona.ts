import { isManagerRole } from '../integrations/jwtClaims';
import { HOME_SUMMARY_QUERY_SCOPE_SLUGS } from '../integrations/companyWireScope';
import type { HrmAuthMembership } from '../integrations/types';

/** Resolved persona lane — MOBILE_PERSONA_UX_MATRIX §2.1 (MOB-UX-13e). */
export type MobilePersonaId = 'employee' | 'manager' | 'leader';

export type MobilePersonaCode = 'EMP' | 'MGR' | 'LDR';

export type MobilePersonaInput = {
  roles?: string[];
  jobTitleKey?: string | null;
  /** Active scope slug — maps to JWT `default_company_id`. */
  companyId?: string | null;
  memberships?: HrmAuthMembership[];
  /** GET /home/summary → viewer.is_manager — overrides JWT when defined. */
  summaryIsManager?: boolean | null;
};

/** Executive titles that qualify for leader layout when rollup scope matches. */
export const LEADER_JOB_TITLE_KEYS = new Set([
  'ceo',
  'coo',
  'cfo',
  'chro',
  'cto',
  'director',
  'managing_director',
  'general_manager',
  'president',
  'vice_president',
  'vp',
  'chief_executive',
  'chief_operating',
  'chief_financial',
  'chief_hr',
  'chief_technology',
]);

export function toMobilePersonaCode(persona: MobilePersonaId): MobilePersonaCode {
  switch (persona) {
    case 'leader':
      return 'LDR';
    case 'manager':
      return 'MGR';
    default:
      return 'EMP';
  }
}

export function isLeaderJobTitle(jobTitleKey: string | null | undefined): boolean {
  const key = jobTitleKey?.trim().toLowerCase() ?? '';
  if (!key) return false;
  return LEADER_JOB_TITLE_KEYS.has(key);
}

/** Rollup holding/main scope — group CEO slice per ADR scope ladder. */
export function isRollupPersonaScope(
  companyId: string | null | undefined,
  memberships?: HrmAuthMembership[],
): boolean {
  const slug = companyId?.trim().toLowerCase() ?? '';
  if (slug && HOME_SUMMARY_QUERY_SCOPE_SLUGS.has(slug)) return true;

  for (const m of memberships ?? []) {
    const mSlug = m.company_id?.trim().toLowerCase() ?? '';
    if (mSlug && HOME_SUMMARY_QUERY_SCOPE_SLUGS.has(mSlug)) return true;
  }

  return false;
}

export function isLeaderPersona(input: MobilePersonaInput): boolean {
  /** Executive home lane only when API confirms manager scope (avoids CEO seed title before summary hydrate). */
  if (input.summaryIsManager !== true) return false;
  if (!isLeaderJobTitle(input.jobTitleKey)) return false;
  return isRollupPersonaScope(input.companyId, input.memberships);
}

/**
 * Manager lane — API `viewer.is_manager` wins over JWT when explicitly false (uat.nv0001 CEO seed).
 */
export function isManagerPersona(input: MobilePersonaInput): boolean {
  if (input.summaryIsManager === true) return true;
  if (input.summaryIsManager === false) return false;
  return isManagerRole(input.roles);
}

/**
 * Resolve mobile persona — priority LDR > MGR > EMP (BR-PERS-01).
 */
export function resolveMobilePersona(input: MobilePersonaInput): MobilePersonaId {
  if (isLeaderPersona(input)) return 'leader';
  if (isManagerPersona(input)) return 'manager';
  return 'employee';
}

/** Manager inbox + approvals API scope (MGR and LDR). */
export function personaHasManagerInbox(persona: MobilePersonaId): boolean {
  return persona === 'manager' || persona === 'leader';
}
