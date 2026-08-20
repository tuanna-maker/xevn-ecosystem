"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeProfileService = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const api_exception_1 = require("../common/api.exception");
const hrm_list_scope_1 = require("../common/hrm-list-scope");
const hrm_db_service_1 = require("../db/hrm-db.service");
const employees_service_1 = require("./employees.service");
let EmployeeProfileService = class EmployeeProfileService {
    db;
    employees;
    constructor(db, employees) {
        this.db = db;
        this.employees = employees;
    }
    async ensureSchema() {
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.hrm_employee_degrees (
        id UUID PRIMARY KEY,
        employee_id UUID NOT NULL,
        company_id TEXT NOT NULL,
        degree_type TEXT,
        institution TEXT,
        field_of_study TEXT,
        graduation_year INT,
        payload JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.employee_trainings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID NOT NULL,
        company_id TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'internal',
        category TEXT NOT NULL DEFAULT 'other',
        provider TEXT,
        instructor TEXT,
        start_date DATE,
        end_date DATE,
        duration INTEGER NOT NULL DEFAULT 0,
        duration_unit TEXT NOT NULL DEFAULT 'hours',
        location TEXT,
        status TEXT NOT NULL DEFAULT 'planned',
        progress INTEGER NOT NULL DEFAULT 0,
        score NUMERIC,
        certificate_number TEXT,
        certificate_file_url TEXT,
        cost NUMERIC NOT NULL DEFAULT 0,
        paid_by TEXT NOT NULL DEFAULT 'company',
        description TEXT,
        skills JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.employee_assets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID NOT NULL,
        company_id TEXT NOT NULL,
        asset_code TEXT,
        asset_name TEXT NOT NULL,
        category TEXT,
        serial_number TEXT,
        assigned_date DATE,
        return_date DATE,
        status TEXT NOT NULL DEFAULT 'assigned',
        condition TEXT,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
        await this.db.query(`
      ALTER TABLE public.employee_assets ADD COLUMN IF NOT EXISTS brand TEXT;
      ALTER TABLE public.employee_assets ADD COLUMN IF NOT EXISTS model TEXT;
      ALTER TABLE public.employee_assets ADD COLUMN IF NOT EXISTS specifications TEXT;
      ALTER TABLE public.employee_assets ADD COLUMN IF NOT EXISTS value NUMERIC NOT NULL DEFAULT 0;
    `);
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.employee_skills (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID NOT NULL,
        company_id TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'technical',
        name TEXT NOT NULL,
        level INTEGER NOT NULL DEFAULT 50,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.employee_work_timeline (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID NOT NULL,
        company_id TEXT NOT NULL,
        event_date DATE NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        event_type TEXT NOT NULL DEFAULT 'position',
        status TEXT NOT NULL DEFAULT 'current',
        contract_code TEXT,
        department TEXT,
        position TEXT,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.employee_resume_files (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID NOT NULL,
        company_id TEXT NOT NULL,
        name TEXT NOT NULL,
        file_type TEXT,
        file_url TEXT NOT NULL,
        file_size TEXT,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.employee_rewards (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID NOT NULL,
        company_id TEXT NOT NULL,
        reward_date DATE NOT NULL,
        reward_type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        decision_number TEXT,
        amount NUMERIC NOT NULL DEFAULT 0,
        issued_by TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.employee_discipline (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID NOT NULL,
        company_id TEXT NOT NULL,
        discipline_date DATE NOT NULL,
        discipline_type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        decision_number TEXT,
        penalty_amount NUMERIC NOT NULL DEFAULT 0,
        issued_by TEXT,
        effective_from DATE,
        effective_to DATE,
        status TEXT NOT NULL DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    }
    async listScopedRows(fromSql, selectSql, employeeId, query, authorization) {
        await this.ensureSchema();
        const employee = await this.employees.getEmployeeById(employeeId, query, authorization);
        const filters = ['employee_id = $1::uuid'];
        const values = [employeeId];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, [employee.company_id]);
        const res = await this.db.query(`
        SELECT ${selectSql}
        FROM ${fromSql}
        WHERE ${filters.join(' AND ')}
        ORDER BY updated_at DESC
        LIMIT 500;
      `, values);
        return {
            total: res.rows.length,
            data: res.rows,
        };
    }
    listDegrees(employeeId, query, authorization) {
        return this.listScopedRows('public.hrm_employee_degrees', 'id, employee_id, company_id, payload, created_at, updated_at', employeeId, query, authorization).then((result) => ({
            ...result,
            data: result.data.map((row) => ({
                id: row.id,
                employee_id: employeeId,
                company_id: row.company_id,
                ...(typeof row.payload === 'object' && row.payload ? row.payload : {}),
                created_at: row.created_at,
                updated_at: row.updated_at,
            })),
            phase: 'P1-stub-read',
        }));
    }
    listTraining(employeeId, query, authorization) {
        return this.listScopedRows('public.employee_trainings', '*', employeeId, query, authorization);
    }
    listAssets(employeeId, query, authorization) {
        return this.listScopedRows('public.employee_assets', '*', employeeId, query, authorization);
    }
    createAsset(employeeId, query, payload, authorization) {
        return this.insertProfileRow('public.employee_assets', employeeId, query, authorization, payload);
    }
    updateAsset(assetId, employeeId, query, payload, authorization) {
        return this.updateProfileRow('public.employee_assets', assetId, employeeId, query, authorization, payload, [
            'asset_code',
            'asset_name',
            'category',
            'serial_number',
            'assigned_date',
            'return_date',
            'status',
            'condition',
            'notes',
            'brand',
            'model',
            'specifications',
            'value',
        ]);
    }
    deleteAsset(assetId, employeeId, query, authorization) {
        return this.deleteProfileRow('public.employee_assets', assetId, employeeId, query, authorization);
    }
    listSkills(employeeId, query, authorization) {
        return this.listScopedRows('public.employee_skills', '*', employeeId, query, authorization);
    }
    createSkill(employeeId, query, payload, authorization) {
        const skillLevel = this.resolveSkillLevel(payload, 50);
        return this.insertProfileRow('public.employee_skills', employeeId, query, authorization, {
            category: payload.category ?? 'technical',
            name: payload.name,
            level: skillLevel,
            notes: payload.notes ?? null,
        });
    }
    updateSkill(skillId, employeeId, query, payload, authorization) {
        const normalizedPayload = { ...payload };
        const skillLevel = this.resolveSkillLevel(payload);
        if (skillLevel !== undefined) {
            normalizedPayload.level = skillLevel;
        }
        return this.updateProfileRow('public.employee_skills', skillId, employeeId, query, authorization, normalizedPayload, [
            'category',
            'name',
            'level',
            'notes',
        ]);
    }
    deleteSkill(skillId, employeeId, query, authorization) {
        return this.deleteProfileRow('public.employee_skills', skillId, employeeId, query, authorization);
    }
    listWorkTimeline(employeeId, query, authorization) {
        return this.listScopedRows('public.employee_work_timeline', '*', employeeId, query, authorization);
    }
    createWorkTimelineItem(employeeId, query, payload, authorization) {
        return this.insertProfileRow('public.employee_work_timeline', employeeId, query, authorization, payload);
    }
    updateWorkTimelineItem(itemId, employeeId, query, payload, authorization) {
        return this.updateProfileRow('public.employee_work_timeline', itemId, employeeId, query, authorization, payload, [
            'event_date',
            'title',
            'description',
            'event_type',
            'status',
            'contract_code',
            'department',
            'position',
            'notes',
        ]);
    }
    deleteWorkTimelineItem(itemId, employeeId, query, authorization) {
        return this.deleteProfileRow('public.employee_work_timeline', itemId, employeeId, query, authorization);
    }
    listResumeFiles(employeeId, query, authorization) {
        return this.listScopedRows('public.employee_resume_files', '*', employeeId, query, authorization);
    }
    createResumeFile(employeeId, query, payload, authorization) {
        return this.insertProfileRow('public.employee_resume_files', employeeId, query, authorization, payload);
    }
    deleteResumeFile(fileId, employeeId, query, authorization) {
        return this.deleteProfileRow('public.employee_resume_files', fileId, employeeId, query, authorization);
    }
    listRewards(employeeId, query, authorization) {
        return this.listScopedRows('public.employee_rewards', '*', employeeId, query, authorization);
    }
    listDiscipline(employeeId, query, authorization) {
        return this.listScopedRows('public.employee_discipline', '*', employeeId, query, authorization);
    }
    createReward(employeeId, query, payload, authorization) {
        return this.insertProfileRow('public.employee_rewards', employeeId, query, authorization, payload);
    }
    updateReward(rewardId, employeeId, query, payload, authorization) {
        return this.updateProfileRow('public.employee_rewards', rewardId, employeeId, query, authorization, payload, [
            'reward_date',
            'reward_type',
            'title',
            'description',
            'decision_number',
            'amount',
            'issued_by',
            'status',
            'notes',
        ]);
    }
    deleteReward(rewardId, employeeId, query, authorization) {
        return this.deleteProfileRow('public.employee_rewards', rewardId, employeeId, query, authorization);
    }
    createDiscipline(employeeId, query, payload, authorization) {
        return this.insertProfileRow('public.employee_discipline', employeeId, query, authorization, payload);
    }
    updateDiscipline(disciplineId, employeeId, query, payload, authorization) {
        return this.updateProfileRow('public.employee_discipline', disciplineId, employeeId, query, authorization, payload, [
            'discipline_date',
            'discipline_type',
            'title',
            'description',
            'decision_number',
            'penalty_amount',
            'issued_by',
            'effective_from',
            'effective_to',
            'status',
            'notes',
        ]);
    }
    deleteDiscipline(disciplineId, employeeId, query, authorization) {
        return this.deleteProfileRow('public.employee_discipline', disciplineId, employeeId, query, authorization);
    }
    createTraining(employeeId, query, payload, authorization) {
        return this.insertProfileRow('public.employee_trainings', employeeId, query, authorization, payload);
    }
    updateTraining(trainingId, employeeId, query, payload, authorization) {
        return this.updateProfileRow('public.employee_trainings', trainingId, employeeId, query, authorization, payload, [
            'name',
            'type',
            'category',
            'provider',
            'instructor',
            'start_date',
            'end_date',
            'duration',
            'duration_unit',
            'location',
            'status',
            'progress',
            'score',
            'certificate_number',
            'certificate_file_url',
            'cost',
            'paid_by',
            'description',
            'skills',
        ]);
    }
    deleteTraining(trainingId, employeeId, query, authorization) {
        return this.deleteProfileRow('public.employee_trainings', trainingId, employeeId, query, authorization);
    }
    resolveSkillLevel(payload, fallback) {
        const candidate = payload.level ?? payload.proficiency ?? fallback;
        if (candidate === undefined || candidate === null) {
            return undefined;
        }
        if (typeof candidate === 'number' && Number.isFinite(candidate)) {
            return Math.round(candidate);
        }
        if (typeof candidate === 'string') {
            const trimmed = candidate.trim().toLowerCase();
            if (!trimmed) {
                return undefined;
            }
            if (/^\d+$/.test(trimmed)) {
                return Number(trimmed);
            }
            if (trimmed === 'advanced')
                return 90;
            if (trimmed === 'intermediate')
                return 70;
            if (trimmed === 'beginner')
                return 50;
            if (trimmed === 'expert')
                return 100;
            return undefined;
        }
        return undefined;
    }
    async insertProfileRow(table, employeeId, query, authorization, payload) {
        await this.ensureSchema();
        const employee = await this.employees.getEmployeeById(employeeId, query, authorization);
        const id = (0, node_crypto_1.randomUUID)();
        const columns = ['id', 'employee_id', 'company_id'];
        const values = [id, employeeId, employee.company_id];
        const allowed = Object.keys(payload).filter((k) => payload[k] !== undefined);
        for (const key of allowed) {
            columns.push(key);
            values.push(key === 'skills' ? JSON.stringify(payload[key] ?? []) : payload[key]);
        }
        const placeholders = values.map((_, i) => {
            if (columns[i] === 'skills')
                return `$${i + 1}::jsonb`;
            if (columns[i]?.includes('date') && columns[i] !== 'updated_at')
                return `$${i + 1}::date`;
            return `$${i + 1}`;
        });
        const res = await this.db.query(`INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *;`, values);
        return res.rows[0];
    }
    guardProfileRowMutate(row, authorization, companyId) {
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        (0, hrm_list_scope_1.assertResourceInHrmScope)(row, scope, {
            notFoundCode: 'HRM-EMP-PROFILE-404',
            mismatchCode: 'HRM-EMP-PROFILE-409',
        });
    }
    async peekProfileRow(table, rowId, employeeId) {
        const peek = await this.db.query(`SELECT company_id FROM ${table} WHERE id = $1::uuid AND employee_id = $2::uuid LIMIT 1;`, [rowId, employeeId]);
        return peek.rows[0];
    }
    async updateProfileRow(table, rowId, employeeId, query, authorization, payload, fields) {
        await this.ensureSchema();
        await this.employees.getEmployeeById(employeeId, query, authorization);
        this.guardProfileRowMutate(await this.peekProfileRow(table, rowId, employeeId), authorization, query.company_id);
        const sets = [];
        const values = [rowId, employeeId];
        for (const field of fields) {
            if (payload[field] === undefined)
                continue;
            values.push(field === 'skills' ? JSON.stringify(payload[field]) : payload[field]);
            const cast = field.includes('date') ? '::date' : field === 'skills' ? '::jsonb' : '';
            sets.push(`${field} = $${values.length}${cast}`);
        }
        if (sets.length === 0) {
            throw new api_exception_1.ApiException('HRM-EMP-PROFILE-400', 'No fields to update', common_1.HttpStatus.BAD_REQUEST);
        }
        sets.push('updated_at = NOW()');
        const res = await this.db.query(`UPDATE ${table} SET ${sets.join(', ')} WHERE id = $1::uuid AND employee_id = $2::uuid RETURNING *;`, values);
        if (!res.rows[0]) {
            throw new api_exception_1.ApiException('HRM-EMP-PROFILE-404', 'Profile row not found', common_1.HttpStatus.NOT_FOUND);
        }
        return res.rows[0];
    }
    async deleteProfileRow(table, rowId, employeeId, query, authorization) {
        await this.ensureSchema();
        await this.employees.getEmployeeById(employeeId, query, authorization);
        this.guardProfileRowMutate(await this.peekProfileRow(table, rowId, employeeId), authorization, query.company_id);
        const res = await this.db.query(`DELETE FROM ${table} WHERE id = $1::uuid AND employee_id = $2::uuid RETURNING id;`, [
            rowId,
            employeeId,
        ]);
        if (!res.rows[0]) {
            throw new api_exception_1.ApiException('HRM-EMP-PROFILE-404', 'Profile row not found', common_1.HttpStatus.NOT_FOUND);
        }
        return { id: rowId };
    }
};
exports.EmployeeProfileService = EmployeeProfileService;
exports.EmployeeProfileService = EmployeeProfileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [hrm_db_service_1.HrmDbService,
        employees_service_1.EmployeesService])
], EmployeeProfileService);
//# sourceMappingURL=employee-profile.service.js.map