"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HRM_REC_HIRE_409 = exports.HRM_REC_HIRE_400 = void 0;
exports.isHiredStage = isHiredStage;
exports.resolveHireEmployeeId = resolveHireEmployeeId;
exports.assertEmployeeInCandidateCompany = assertEmployeeInCandidateCompany;
exports.assertHireEmployeeLinkOrThrow = assertHireEmployeeLinkOrThrow;
const common_1 = require("@nestjs/common");
const api_exception_1 = require("../common/api.exception");
exports.HRM_REC_HIRE_400 = 'HRM-REC-HIRE-400';
exports.HRM_REC_HIRE_409 = 'HRM-REC-HIRE-409';
function isHiredStage(stage) {
    return (stage ?? '').trim().toLowerCase() === 'hired';
}
async function resolveHireEmployeeId(db, candidateId, opts) {
    const explicit = opts.explicitEmployeeId?.trim() || null;
    if (explicit)
        return explicit;
    const existing = opts.existingEmployeeId?.trim() || null;
    if (existing)
        return existing;
    try {
        const linked = await db.query(`SELECT id::text AS id FROM public.employees
       WHERE candidate_id = $1::uuid AND archived_at IS NULL
       LIMIT 1`, [candidateId]);
        return linked.rows[0]?.id?.trim() || null;
    }
    catch {
        return null;
    }
}
async function assertEmployeeInCandidateCompany(db, employeeId, candidateCompanyId) {
    const emp = await db.query(`SELECT id::text AS id, company_id::text AS company_id
     FROM public.employees
     WHERE id = $1::uuid AND archived_at IS NULL
     LIMIT 1`, [employeeId]);
    const row = emp.rows[0];
    if (!row?.id) {
        throw new api_exception_1.ApiException(exports.HRM_REC_HIRE_400, 'Hire requires a linked employee profile (employee_id)', common_1.HttpStatus.BAD_REQUEST);
    }
    const candCo = candidateCompanyId.trim().toLowerCase();
    const empCo = (row.company_id ?? '').trim().toLowerCase();
    if (candCo && empCo && candCo !== empCo) {
        throw new api_exception_1.ApiException(exports.HRM_REC_HIRE_409, 'Employee and candidate must belong to the same company', common_1.HttpStatus.CONFLICT);
    }
    return row.id;
}
async function assertHireEmployeeLinkOrThrow(db, candidateId, candidateCompanyId, opts) {
    const resolved = await resolveHireEmployeeId(db, candidateId, opts);
    if (!resolved) {
        throw new api_exception_1.ApiException(exports.HRM_REC_HIRE_400, 'Hire requires a linked employee profile (employee_id)', common_1.HttpStatus.BAD_REQUEST);
    }
    return assertEmployeeInCandidateCompany(db, resolved, candidateCompanyId);
}
//# sourceMappingURL=hire-employee-link.js.map