import { XbosDbService } from '../db/xbos-db.service';
import { PILOT_PORTAL_USERS, type PilotPortalUser } from './pilot-portal-users.constants';

export function findPilotPortalUser(userId: string): PilotPortalUser | undefined {
  const normalized = userId.trim().toLowerCase();
  return PILOT_PORTAL_USERS.find((p) => p.userId.toLowerCase() === normalized);
}

/** Idempotent upsert for one pilot persona — returns false when tenant registry row is missing/inactive. */
export async function upsertPilotMembership(db: XbosDbService, pilot: PilotPortalUser): Promise<boolean> {
  const userId = pilot.userId.trim().toLowerCase();
  const reg = await db.query(
    `SELECT 1 FROM public.xbos_tenant_registry WHERE tenant_id = $1 AND status = 'active' LIMIT 1`,
    [pilot.tenantId],
  );
  if (!reg.rows[0]) {
    return false;
  }
  await db.query(
    `INSERT INTO public.xbos_user_tenant_membership (user_id, tenant_id, role_code, is_default, status)
     VALUES ($1, $2, $3, true, 'active')
     ON CONFLICT (user_id, tenant_id) DO UPDATE SET
       role_code = EXCLUDED.role_code,
       is_default = true,
       status = 'active',
       updated_at = NOW()`,
    [userId, pilot.tenantId, pilot.roleCode],
  );
  return true;
}

export async function ensurePilotMembershipForUser(db: XbosDbService, userId: string): Promise<void> {
  const pilot = findPilotPortalUser(userId);
  if (pilot) {
    await upsertPilotMembership(db, pilot);
  }
}

export async function ensureAllPilotMemberships(db: XbosDbService): Promise<void> {
  for (const pilot of PILOT_PORTAL_USERS) {
    await upsertPilotMembership(db, pilot);
  }
}
