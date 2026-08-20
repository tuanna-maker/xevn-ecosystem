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
exports.AttendanceCatalogService = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const api_exception_1 = require("../common/api.exception");
const hrm_list_scope_1 = require("../common/hrm-list-scope");
const hrm_db_service_1 = require("../db/hrm-db.service");
let AttendanceCatalogService = class AttendanceCatalogService {
    db;
    constructor(db) {
        this.db = db;
    }
    async ensureWorkShiftSchema() {
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.work_shifts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        code TEXT NOT NULL,
        name TEXT NOT NULL,
        department TEXT,
        start_time TEXT NOT NULL DEFAULT '08:00',
        end_time TEXT NOT NULL DEFAULT '17:00',
        break_start TEXT,
        break_end TEXT,
        work_hours NUMERIC DEFAULT 8,
        coefficient NUMERIC DEFAULT 1,
        is_night_shift BOOLEAN DEFAULT FALSE,
        is_overtime_shift BOOLEAN DEFAULT FALSE,
        color TEXT DEFAULT '#3b82f6',
        status TEXT NOT NULL DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    }
    async ensureAttendanceSheetSchema() {
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.attendance_sheets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        name TEXT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        attendance_type TEXT NOT NULL DEFAULT 'daily',
        standard_type TEXT NOT NULL DEFAULT 'standard',
        department TEXT,
        positions TEXT,
        status TEXT NOT NULL DEFAULT 'draft',
        created_by TEXT,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    }
    async listWorkShifts(companyId, authorization) {
        await this.ensureWorkShiftSchema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        const filters = [];
        const values = [];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, scope.companyIds);
        const res = await this.db.query(`SELECT * FROM public.work_shifts WHERE ${filters.join(' AND ')} ORDER BY code ASC;`, values);
        return { total: res.rows.length, data: res.rows };
    }
    async createWorkShift(payload, authorization) {
        await this.ensureWorkShiftSchema();
        const companyId = (0, hrm_list_scope_1.resolveHrmPersistCompanyIdText)(authorization, String(payload.company_id ?? ''));
        const res = await this.db.query(`INSERT INTO public.work_shifts (
        id, company_id, code, name, department, start_time, end_time, break_start, break_end,
        work_hours, coefficient, is_night_shift, is_overtime_shift, color, status, notes
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *;`, [
            (0, node_crypto_1.randomUUID)(),
            companyId,
            String(payload.code ?? '').trim(),
            String(payload.name ?? '').trim(),
            payload.department ?? null,
            payload.start_time ?? '08:00',
            payload.end_time ?? '17:00',
            payload.break_start ?? null,
            payload.break_end ?? null,
            payload.work_hours ?? 8,
            payload.coefficient ?? 1,
            payload.is_night_shift ?? false,
            payload.is_overtime_shift ?? false,
            payload.color ?? '#3b82f6',
            payload.status ?? 'active',
            payload.notes ?? null,
        ]);
        return res.rows[0];
    }
    async updateWorkShift(id, payload, companyId, authorization) {
        await this.ensureWorkShiftSchema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        const peek = await this.db.query(`SELECT company_id FROM public.work_shifts WHERE id = $1::uuid LIMIT 1;`, [id]);
        (0, hrm_list_scope_1.assertResourceInHrmScope)(peek.rows[0], scope, { notFoundCode: 'HRM-WS-404', mismatchCode: 'HRM-WS-409' });
        const res = await this.db.query(`UPDATE public.work_shifts SET
        code = COALESCE($2, code), name = COALESCE($3, name), department = COALESCE($4, department),
        start_time = COALESCE($5, start_time), end_time = COALESCE($6, end_time),
        break_start = COALESCE($7, break_start), break_end = COALESCE($8, break_end),
        work_hours = COALESCE($9, work_hours), coefficient = COALESCE($10, coefficient),
        is_night_shift = COALESCE($11, is_night_shift), is_overtime_shift = COALESCE($12, is_overtime_shift),
        color = COALESCE($13, color), status = COALESCE($14, status), notes = COALESCE($15, notes),
        updated_at = NOW()
       WHERE id = $1::uuid RETURNING *;`, [
            id,
            payload.code ?? null,
            payload.name ?? null,
            payload.department ?? null,
            payload.start_time ?? null,
            payload.end_time ?? null,
            payload.break_start ?? null,
            payload.break_end ?? null,
            payload.work_hours ?? null,
            payload.coefficient ?? null,
            payload.is_night_shift ?? null,
            payload.is_overtime_shift ?? null,
            payload.color ?? null,
            payload.status ?? null,
            payload.notes ?? null,
        ]);
        if (!res.rows[0])
            throw new api_exception_1.ApiException('HRM-WS-404', 'Work shift not found', common_1.HttpStatus.NOT_FOUND);
        return res.rows[0];
    }
    async deleteWorkShift(id, companyId, authorization) {
        await this.ensureWorkShiftSchema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        const filters = ['id = $1::uuid'];
        const values = [id];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, scope.companyIds);
        const res = await this.db.query(`DELETE FROM public.work_shifts WHERE ${filters.join(' AND ')} RETURNING id;`, values);
        if (!res.rows[0])
            throw new api_exception_1.ApiException('HRM-WS-404', 'Work shift not found', common_1.HttpStatus.NOT_FOUND);
        return { id };
    }
    async listAttendanceSheets(companyId, authorization) {
        await this.ensureAttendanceSheetSchema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        const filters = [];
        const values = [];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, scope.companyIds);
        const res = await this.db.query(`SELECT * FROM public.attendance_sheets WHERE ${filters.join(' AND ')} ORDER BY start_date DESC;`, values);
        return { total: res.rows.length, data: res.rows };
    }
    async createAttendanceSheet(payload, authorization) {
        await this.ensureAttendanceSheetSchema();
        const companyId = (0, hrm_list_scope_1.resolveHrmPersistCompanyIdText)(authorization, String(payload.company_id ?? ''));
        const res = await this.db.query(`INSERT INTO public.attendance_sheets (
        id, company_id, name, start_date, end_date, attendance_type, standard_type,
        department, positions, notes, status
      ) VALUES ($1,$2,$3,$4::date,$5::date,$6,$7,$8,$9,$10,$11) RETURNING *;`, [
            (0, node_crypto_1.randomUUID)(),
            companyId,
            String(payload.name ?? '').trim(),
            payload.start_date,
            payload.end_date,
            payload.attendance_type ?? 'daily',
            payload.standard_type ?? 'standard',
            payload.department ?? null,
            payload.positions ?? null,
            payload.notes ?? null,
            'draft',
        ]);
        return res.rows[0];
    }
    async updateAttendanceSheet(id, payload, companyId, authorization) {
        await this.ensureAttendanceSheetSchema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        const peek = await this.db.query(`SELECT company_id FROM public.attendance_sheets WHERE id = $1::uuid LIMIT 1;`, [id]);
        (0, hrm_list_scope_1.assertResourceInHrmScope)(peek.rows[0], scope, { notFoundCode: 'HRM-AS-404', mismatchCode: 'HRM-AS-409' });
        const res = await this.db.query(`UPDATE public.attendance_sheets SET
        name = COALESCE($2, name), start_date = COALESCE($3::date, start_date),
        end_date = COALESCE($4::date, end_date), attendance_type = COALESCE($5, attendance_type),
        standard_type = COALESCE($6, standard_type), department = COALESCE($7, department),
        positions = COALESCE($8, positions), notes = COALESCE($9, notes), updated_at = NOW()
       WHERE id = $1::uuid RETURNING *;`, [
            id,
            payload.name ?? null,
            payload.start_date ?? null,
            payload.end_date ?? null,
            payload.attendance_type ?? null,
            payload.standard_type ?? null,
            payload.department ?? null,
            payload.positions ?? null,
            payload.notes ?? null,
        ]);
        if (!res.rows[0])
            throw new api_exception_1.ApiException('HRM-AS-404', 'Attendance sheet not found', common_1.HttpStatus.NOT_FOUND);
        return res.rows[0];
    }
    async deleteAttendanceSheet(id, companyId, authorization) {
        await this.ensureAttendanceSheetSchema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        const filters = ['id = $1::uuid'];
        const values = [id];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, scope.companyIds);
        const res = await this.db.query(`DELETE FROM public.attendance_sheets WHERE ${filters.join(' AND ')} RETURNING id;`, values);
        if (!res.rows[0])
            throw new api_exception_1.ApiException('HRM-AS-404', 'Attendance sheet not found', common_1.HttpStatus.NOT_FOUND);
        return { id };
    }
};
exports.AttendanceCatalogService = AttendanceCatalogService;
exports.AttendanceCatalogService = AttendanceCatalogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [hrm_db_service_1.HrmDbService])
], AttendanceCatalogService);
//# sourceMappingURL=attendance-catalog.service.js.map