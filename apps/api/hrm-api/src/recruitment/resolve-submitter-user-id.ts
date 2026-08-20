/**
 * @CODE-MEMORY
 * Screen:     HRM → Tuyển dụng — resolve submitter userId
 * UC:         FR-UC-H04 · WF spawn identity
 * Purpose:    Lấy submitter userId từ header hoặc JWT claims (email/sub/…).
 * WorkItem:   W1-B-01-BE-DIST-RESTORE
 * Coded:      2026-08-03
 * Callers:    recruitment.controller
 * Callees:    getVerifiedInternalJwtPayload
 * must_keep:  header ưu tiên; claim order email→sub→userId→user_id→preferred_username
 * SOLID:      Pure helper — no Nest Injectable
 * LastVerified: tsc tsconfig.build.json
 *
 * @CODE-MEMORY-CHANGE 2026-08-03
 * WorkItem: W1-B-01-BE-DIST-RESTORE
 * change_mode: ADD
 * What: Restore src from dist resolve-submitter-user-id.js/.d.ts
 * Why: TS2307 R-HRM-DIST-MISSING
 */
import { getVerifiedInternalJwtPayload } from '../common/internal-auth';

function readStringClaim(
  payload: Record<string, unknown>,
  ...keys: string[]
): string | undefined {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

export function resolveSubmitterUserIdFromAuth(
  authorization: string | undefined,
  headerUserId?: string,
): string | undefined {
  const fromHeader = headerUserId?.trim();
  if (fromHeader) return fromHeader;
  const payload = getVerifiedInternalJwtPayload(authorization);
  if (!payload) return undefined;
  return readStringClaim(
    payload,
    'email',
    'sub',
    'userId',
    'user_id',
    'preferred_username',
  );
}
