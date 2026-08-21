"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findPilotPortalUser = findPilotPortalUser;
exports.upsertPilotMembership = upsertPilotMembership;
exports.ensurePilotMembershipForUser = ensurePilotMembershipForUser;
exports.ensureAllPilotMemberships = ensureAllPilotMemberships;
const pilot_portal_users_constants_1 = require("./pilot-portal-users.constants");
function findPilotPortalUser(userId) {
    const normalized = userId.trim().toLowerCase();
    return pilot_portal_users_constants_1.PILOT_PORTAL_USERS.find((p) => p.userId.toLowerCase() === normalized);
}
/** Idempotent upsert for one pilot persona — returns false when tenant registry row is missing/inactive. */
async function upsertPilotMembership(db, pilot) {
    const userId = pilot.userId.trim().toLowerCase();
    const reg = await db.query(`SELECT 1 FROM public.xbos_tenant_registry WHERE tenant_id = $1 AND status = 'active' LIMIT 1`, [pilot.tenantId]);
    if (!reg.rows[0]) {
        return false;
    }
    await db.query(`INSERT INTO public.xbos_user_tenant_membership (user_id, tenant_id, role_code, is_default, status)
     VALUES ($1, $2, $3, true, 'active')
     ON CONFLICT (user_id, tenant_id) DO UPDATE SET
       role_code = EXCLUDED.role_code,
       is_default = true,
       status = 'active',
       updated_at = NOW()`, [userId, pilot.tenantId, pilot.roleCode]);
    return true;
}
async function ensurePilotMembershipForUser(db, userId) {
    const pilot = findPilotPortalUser(userId);
    if (pilot) {
        await upsertPilotMembership(db, pilot);
    }
}
async function ensureAllPilotMemberships(db) {
    for (const pilot of pilot_portal_users_constants_1.PILOT_PORTAL_USERS) {
        await upsertPilotMembership(db, pilot);
    }
}
