/**
 * @CODE-MEMORY
 * Screen:     HRM → Bảng chấm công / ca làm (catalog)
 * UC:         HRM-AT-14
 * BR:         BR-ATT-SHEET-01..07 · AC-ATT-SHEET-01..06
 * SRS:        docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.4 · FR-HRM-AT-14
 * SRS bước:   Diễn biến #3/#4 list+empty · #8 Lưu bảng · #11 F5 — không tự bịa ngày công
 * TechSpec:   docs/hrm/TECHSPEC.md §14.4 · §12.1/§13 (ref_srs: FR-HRM-AT-14)
 * Purpose:    CRUD attendance_sheets + work_shifts; header kỳ không seed records.
 * WorkItem:   BE-HRM-CODE-MEMORY-SRS-STEP-01
 * Coded:      2026-07-21
 * Callers:    attendance.controller.ts → list/create/update/delete attendance-sheets
 * Callees:    resolveHrmListScope → public.attendance_sheets
 * must_keep:  AC-ATT-SHEET empty honesty; không INSERT attendance_records khi tạo sheet
 * SOLID:      Catalog tách khỏi AttendanceService (records)
 * LastVerified: attendance sheet related specs / AC-ATT-SHEET
 *
 * @CODE-MEMORY-CHANGE 2026-07-21
 * WorkItem: BE-HRM-CODE-MEMORY-SRS-STEP-01
 * change_mode: ADD
 * What: CODE-MEMORY map Diễn biến AT-14 (không đổi logic)
 * must_keep: AC-ATT-SHEET-01..06
 *
 * @CODE-MEMORY-CHANGE 2026-07-21
 * WorkItem: BE-HRM-C-CONV-AS-01
 * change_mode: ADD
 * What: create/update sheet nhận CreateAttendanceSheetDto / UpdateAttendanceSheetDto
 * Why: §15.1 C-CONV-AS-01 — bỏ Record<string, unknown> ở service edge
 * must_keep: AC-ATT-SHEET empty honesty; không INSERT attendance_records khi tạo sheet
 */
import { HttpStatus, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import { CreateAttendanceSheetDto } from './dto/create-attendance-sheet.dto';
import { UpdateAttendanceSheetDto } from './dto/update-attendance-sheet.dto';
import {
  assertResourceInHrmScope,
  pushCompanyIdFilter,
  resolveHrmListScope,
  resolveHrmPersistCompanyIdText,
} from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';

@Injectable()
export class AttendanceCatalogService {
  constructor(private readonly db: HrmDbService) {}

  private async ensureWorkShiftSchema() {
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

  private async ensureAttendanceSheetSchema() {
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

  async listWorkShifts(companyId: string, authorization?: string) {
    await this.ensureWorkShiftSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const filters: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    const res = await this.db.query(
      `SELECT * FROM public.work_shifts WHERE ${filters.join(' AND ')} ORDER BY code ASC;`,
      values,
    );
    return { total: res.rows.length, data: res.rows };
  }

  async createWorkShift(payload: Record<string, unknown>, authorization?: string) {
    await this.ensureWorkShiftSchema();
    const companyId = resolveHrmPersistCompanyIdText(authorization, String(payload.company_id ?? ''));
    const res = await this.db.query(
      `INSERT INTO public.work_shifts (
        id, company_id, code, name, department, start_time, end_time, break_start, break_end,
        work_hours, coefficient, is_night_shift, is_overtime_shift, color, status, notes
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *;`,
      [
        randomUUID(),
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
      ],
    );
    return res.rows[0];
  }

  async updateWorkShift(id: string, payload: Record<string, unknown>, companyId: string, authorization?: string) {
    await this.ensureWorkShiftSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const peek = await this.db.query(`SELECT company_id FROM public.work_shifts WHERE id = $1::uuid LIMIT 1;`, [id]);
    assertResourceInHrmScope(peek.rows[0], scope, { notFoundCode: 'HRM-WS-404', mismatchCode: 'HRM-WS-409' });
    const res = await this.db.query(
      `UPDATE public.work_shifts SET
        code = COALESCE($2, code), name = COALESCE($3, name), department = COALESCE($4, department),
        start_time = COALESCE($5, start_time), end_time = COALESCE($6, end_time),
        break_start = COALESCE($7, break_start), break_end = COALESCE($8, break_end),
        work_hours = COALESCE($9, work_hours), coefficient = COALESCE($10, coefficient),
        is_night_shift = COALESCE($11, is_night_shift), is_overtime_shift = COALESCE($12, is_overtime_shift),
        color = COALESCE($13, color), status = COALESCE($14, status), notes = COALESCE($15, notes),
        updated_at = NOW()
       WHERE id = $1::uuid RETURNING *;`,
      [
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
      ],
    );
    if (!res.rows[0]) throw new ApiException('HRM-WS-404', 'Work shift not found', HttpStatus.NOT_FOUND);
    return res.rows[0];
  }

  async deleteWorkShift(id: string, companyId: string, authorization?: string) {
    await this.ensureWorkShiftSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const filters = ['id = $1::uuid'];
    const values: unknown[] = [id];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    const res = await this.db.query(`DELETE FROM public.work_shifts WHERE ${filters.join(' AND ')} RETURNING id;`, values);
    if (!res.rows[0]) throw new ApiException('HRM-WS-404', 'Work shift not found', HttpStatus.NOT_FOUND);
    return { id };
  }

  /**
   * @CODE-MEMORY method · FR-HRM-AT-14
   * SRS bước: Diễn biến #3 Tải danh sách · #4 Empty trung thực
   * TechSpec: §14.4 ref_srs FR-HRM-AT-14 · AC-ATT-SHEET
   */
  async listAttendanceSheets(companyId: string, authorization?: string) {
    await this.ensureAttendanceSheetSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const filters: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    const res = await this.db.query(
      `SELECT * FROM public.attendance_sheets WHERE ${filters.join(' AND ')} ORDER BY start_date DESC;`,
      values,
    );
    // Thành công: list hoặc empty trung thực (Diễn biến #4) — không fake rows.
    return { total: res.rows.length, data: res.rows };
  }

  /**
   * @CODE-MEMORY method · FR-HRM-AT-14
   * SRS bước: Diễn biến #8 Lưu thành công — chỉ header bảng, không bịa điểm danh
   * TechSpec: §14.4 ref_srs FR-HRM-AT-14 · AC-ATT-SHEET-01
   */
  async createAttendanceSheet(payload: CreateAttendanceSheetDto, authorization?: string) {
    await this.ensureAttendanceSheetSchema();
    const companyId = resolveHrmPersistCompanyIdText(authorization, String(payload.company_id ?? ''));
    const res = await this.db.query(
      `INSERT INTO public.attendance_sheets (
        id, company_id, name, start_date, end_date, attendance_type, standard_type,
        department, positions, notes, status
      ) VALUES ($1,$2,$3,$4::date,$5::date,$6,$7,$8,$9,$10,$11) RETURNING *;`,
      [
        randomUUID(),
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
      ],
    );
    // Thành công: Diễn biến #8 — khóa bảng kỳ; lưới trống = AC-ATT-SHEET-06.
    return res.rows[0];
  }

  async updateAttendanceSheet(
    id: string,
    payload: UpdateAttendanceSheetDto,
    companyId: string,
    authorization?: string,
  ) {
    await this.ensureAttendanceSheetSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const peek = await this.db.query(`SELECT company_id FROM public.attendance_sheets WHERE id = $1::uuid LIMIT 1;`, [id]);
    assertResourceInHrmScope(peek.rows[0], scope, { notFoundCode: 'HRM-AS-404', mismatchCode: 'HRM-AS-409' });
    const res = await this.db.query(
      `UPDATE public.attendance_sheets SET
        name = COALESCE($2, name), start_date = COALESCE($3::date, start_date),
        end_date = COALESCE($4::date, end_date), attendance_type = COALESCE($5, attendance_type),
        standard_type = COALESCE($6, standard_type), department = COALESCE($7, department),
        positions = COALESCE($8, positions), notes = COALESCE($9, notes), updated_at = NOW()
       WHERE id = $1::uuid RETURNING *;`,
      [
        id,
        payload.name ?? null,
        payload.start_date ?? null,
        payload.end_date ?? null,
        payload.attendance_type ?? null,
        payload.standard_type ?? null,
        payload.department ?? null,
        payload.positions ?? null,
        payload.notes ?? null,
      ],
    );
    if (!res.rows[0]) throw new ApiException('HRM-AS-404', 'Attendance sheet not found', HttpStatus.NOT_FOUND);
    return res.rows[0];
  }

  async deleteAttendanceSheet(id: string, companyId: string, authorization?: string) {
    await this.ensureAttendanceSheetSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const filters = ['id = $1::uuid'];
    const values: unknown[] = [id];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    const res = await this.db.query(
      `DELETE FROM public.attendance_sheets WHERE ${filters.join(' AND ')} RETURNING id;`,
      values,
    );
    if (!res.rows[0]) throw new ApiException('HRM-AS-404', 'Attendance sheet not found', HttpStatus.NOT_FOUND);
    return { id };
  }
}
