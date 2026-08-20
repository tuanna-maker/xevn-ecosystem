"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveSubmitterUserIdFromAuth = resolveSubmitterUserIdFromAuth;
const internal_auth_1 = require("../common/internal-auth");
function readStringClaim(payload, ...keys) {
    for (const key of keys) {
        const value = payload[key];
        if (typeof value === 'string' && value.trim()) {
            return value.trim();
        }
    }
    return undefined;
}
function resolveSubmitterUserIdFromAuth(authorization, headerUserId) {
    const fromHeader = headerUserId?.trim();
    if (fromHeader)
        return fromHeader;
    const payload = (0, internal_auth_1.getVerifiedInternalJwtPayload)(authorization);
    if (!payload)
        return undefined;
    return readStringClaim(payload, 'email', 'sub', 'userId', 'user_id', 'preferred_username');
}
//# sourceMappingURL=resolve-submitter-user-id.js.map