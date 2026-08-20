"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SELF_PATCH_CUSTOM_FIELD_KEYS = void 0;
exports.readJwtEmployeeId = readJwtEmployeeId;
exports.isSelfEmployeeTarget = isSelfEmployeeTarget;
exports.canFullEmployeeUpdate = canFullEmployeeUpdate;
exports.mergeSelfEssCustomFields = mergeSelfEssCustomFields;
exports.assertEmployeeUpdateAllowed = assertEmployeeUpdateAllowed;
const common_1 = require("@nestjs/common");
const api_exception_1 = require("../common/api.exception");
const internal_auth_1 = require("../common/internal-auth");
const FULL_UPDATE_ROLE_CODES = new Set([
    'group_ceo',
    'subsidiary_ceo',
    'company_ceo',
    'chro',
    'hr_admin',
    'hr_manager',
    'hrbp_manager',
]);
const SELF_PATCH_FIELDS = ['avatar_url', 'custom_fields'];
exports.SELF_PATCH_CUSTOM_FIELD_KEYS = ['phone_number', 'work_phone'];
function readClaim(payload, ...keys) {
    for (const key of keys) {
        const value = payload[key];
        if (typeof value === 'string' && value.trim()) {
            return value.trim();
        }
    }
    return undefined;
}
function readJwtRoles(payload) {
    const roles = payload.roles;
    if (!Array.isArray(roles)) {
        return [];
    }
    return roles.filter((role) => typeof role === 'string');
}
function readJwtEmployeeId(authorization) {
    const payload = (0, internal_auth_1.getVerifiedInternalJwtPayload)(authorization);
    if (!payload) {
        return undefined;
    }
    return readClaim(payload, 'employee_id', 'employeeId', 'emp_id');
}
function isSelfEmployeeTarget(employeeId, authorization) {
    const jwtEmployeeId = readJwtEmployeeId(authorization);
    return Boolean(jwtEmployeeId && jwtEmployeeId === employeeId);
}
function canFullEmployeeUpdate(authorization) {
    const payload = (0, internal_auth_1.getVerifiedInternalJwtPayload)(authorization);
    if (!payload) {
        return true;
    }
    const roleCode = readClaim(payload, 'roleCode', 'role_code', 'role')?.toLowerCase() ?? '';
    if (FULL_UPDATE_ROLE_CODES.has(roleCode) || roleCode.startsWith('group_')) {
        return true;
    }
    const roles = readJwtRoles(payload);
    return (roles.includes('hr_manager') ||
        roles.includes('hrbp_manager') ||
        roles.includes('manager'));
}
function assertSelfEssPatchAllowed(payload) {
    const fields = definedPatchFields(payload);
    const disallowed = fields.filter((field) => !SELF_PATCH_FIELDS.includes(field));
    if (disallowed.length > 0) {
        throw new api_exception_1.ApiException('HRM-EMP-403', 'Employees may only update avatar_url or custom_fields phone keys on their own profile', common_1.HttpStatus.FORBIDDEN, { disallowed_fields: disallowed });
    }
    if (payload.custom_fields !== undefined) {
        assertSelfCustomFieldsPatch(payload.custom_fields ?? {});
    }
}
function definedPatchFields(payload) {
    return Object.keys(payload).filter((key) => payload[key] !== undefined);
}
function isSelfPatchCustomFieldKey(key) {
    return exports.SELF_PATCH_CUSTOM_FIELD_KEYS.includes(key);
}
function mergeSelfEssCustomFields(existing, patch) {
    const next = { ...(existing ?? {}) };
    if (!patch || typeof patch !== 'object') {
        return next;
    }
    for (const key of exports.SELF_PATCH_CUSTOM_FIELD_KEYS) {
        if (!Object.prototype.hasOwnProperty.call(patch, key)) {
            continue;
        }
        const raw = patch[key];
        const trimmed = typeof raw === 'string' ? raw.trim() : '';
        if (trimmed) {
            next[key] = trimmed;
        }
        else {
            delete next[key];
        }
    }
    return next;
}
function assertSelfCustomFieldsPatch(customFields) {
    const keys = Object.keys(customFields);
    if (keys.filter(isSelfPatchCustomFieldKey).length === 0) {
        throw new api_exception_1.ApiException('HRM-EMP-403', 'Employees may only update avatar_url or custom_fields phone keys (phone_number, work_phone) on their own profile', common_1.HttpStatus.FORBIDDEN, {
            disallowed_fields: ['custom_fields'],
            disallowed_custom_fields: keys,
            allowed_custom_fields: [...exports.SELF_PATCH_CUSTOM_FIELD_KEYS],
        });
    }
}
function assertEmployeeUpdateAllowed(employeeId, payload, authorization) {
    if (isSelfEmployeeTarget(employeeId, authorization)) {
        assertSelfEssPatchAllowed(payload);
        return;
    }
    if (canFullEmployeeUpdate(authorization)) {
        return;
    }
    const jwtEmployeeId = readJwtEmployeeId(authorization);
    if (!jwtEmployeeId) {
        throw new api_exception_1.ApiException('HRM-EMP-403', 'Employee profile update requires HR role or self ESS patch (avatar_url / phone)', common_1.HttpStatus.FORBIDDEN);
    }
    throw new api_exception_1.ApiException('HRM-EMP-403', 'Employees may only update their own profile (avatar_url / phone custom_fields)', common_1.HttpStatus.FORBIDDEN);
}
//# sourceMappingURL=employee-update-policy.js.map