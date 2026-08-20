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
 *
 * @CODE-MEMORY-CHANGE 2026-08-05
 * WorkItem: PO-HRM-BP-ATT-SIGN-BE-01
 * change_mode: ADD
 * What: assertAttendanceSheetHeaderInScope dùng chung UC-BP-ATT-11 + AT-14 patch/delete
 * Why: TR-CM-16 list↔get parity · ADR scope ladder §13
 * must_keep: HRM-AS-404/409 semantics; catalog chain (không payroll-normalize)
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-BP-ATT-SIGN-BE-CLOSE-SCHEMA-01
 * change_mode: FIX
 * What: shared ensureAttendanceSheetSchema — ALTER closed_at/closed_by on legacy tables
 * Why: catalog path tạo bảng trước sign — thiếu cột close gây 500 F-ATT-SHEET-02
 * must_keep: AC-ATT-SHEET empty honesty
 *
 * @CODE-MEMORY-CHANGE 2026-08-08
 * WorkItem: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-BE-01
 * change_mode: FIX
 * What: F-ATT-CAT-SHIFT deepen — list default status=active (include_inactive audit);
 *       DELETE soft-retire status=inactive (+ hard=true residual when no shift-change refs);
 *       get-by-id scope parity; display-ready code/name/times/coeff; consumer invent
 *       assert → HRM-ATT-SHIFT-KEY when active>0 (ShiftChange create).
 * Why: BA AC-PLT-ATT-SHIFT-01b/01e · VAL-CNS-01/03b/04 · SA Option B ADR D1 · BR-PLT-04
 * must_keep: work_shifts Nest SoT · Settings/shifts REF only · no ensureDefault/seed ·
 *            ATT-CODE/leave/worksite seals · HRM-WS-404/409 · U65 · ba-data HOLD
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
import { assertAttendanceSheetHeaderInScope as assertSheetHeaderRowInScope } from './attendance-sheet-scope';
import { HrmDbService } from '../db/hrm-db.service';
import { ensureAttendanceSheetSchema } from './attendance-sheet-schema.bootstrap';

/** Consumer invent taxonomy (BA BR-PLT-ATT-SHIFT-08 · VAL-ATT-SHIFT-CNS-01). */
export const HRM_ATT_SHIFT_KEY = 'HRM-ATT-SHIFT-KEY';

export type WorkShiftRow = {
  id: string;
  company_id: string;
  code: string;
  name: string;
  department: string | null;
  start_time: string;
  end_time: string;
  break_start: string | null;
  break_end: string | null;
  work_hours: number | string | null;
  coefficient: number | string | null;
  is_night_shift: boolean | null;
  is_overtime_shift: boolean | null;
  color: string | null;
  status: string;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
};

/** Display-ready work-shift row for Ca admin + ShiftChange picker (L-ATT-SHIFT-12). */
export type WorkShiftDisplay = {
  id: string;
  company_id: string;
  code: string;
  name: string;
  department: string | null;
  start_time: string;
  end_time: string;
  break_start: string | null;
  break_end: string | null;
  work_hours: number;
  coefficient: number;
  is_night_shift: boolean;
  is_overtime_shift: boolean;
  color: string | null;
  status: string;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
};

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

  private async ensureAttendanceSheetSchemaLocal() {
    await ensureAttendanceSheetSchema(this.db);
  }

  private mapWorkShift(row: WorkShiftRow): WorkShiftDisplay {
    return {
      id: row.id,
      company_id: row.company_id,
      code: row.code,
      name: row.name,
      department: row.department ?? null,
      start_time: row.start_time,
      end_time: row.end_time,
      break_start: row.break_start ?? null,
      break_end: row.break_end ?? null,
      work_hours: Number(row.work_hours ?? 8),
      coefficient: Number(row.coefficient ?? 1),
      is_night_shift: Boolean(row.is_night_shift),
      is_overtime_shift: Boolean(row.is_overtime_shift),
      color: row.color ?? null,
      status: row.status,
      notes: row.notes ?? null,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private shiftKeyMatches(row: WorkShiftDisplay, raw: string): boolean {
    const key = raw.trim();
    if (!key) return false;
    if (row.id === key) return true;
    return row.code.trim().toLowerCase() === key.toLowerCase();
  }

  /**
   * F-ATT-CAT-SHIFT-01 — default exclude inactive (VAL-ATT-SHIFT-CNS-03b).
   * Pass includeInactive=true for admin audit of soft-retired shifts.
   */
  async listWorkShifts(
    companyId: string,
    authorization?: string,
    opts?: { includeInactive?: boolean },
  ) {
    await this.ensureWorkShiftSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const filters: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    if (!opts?.includeInactive) {
      filters.push(`status = 'active'`);
    }
    const res = await this.db.query<WorkShiftRow>(
      `SELECT id, company_id, code, name, department, start_time, end_time, break_start, break_end,
              work_hours, coefficient, is_night_shift, is_overtime_shift, color, status, notes,
              created_at, updated_at
       FROM public.work_shifts
       WHERE ${filters.join(' AND ')}
       ORDER BY code ASC;`,
      values,
    );
    const data = res.rows.map((r) => this.mapWorkShift(r));
    return { total: data.length, data };
  }

  /** Picker contract — active-only alias of list (optional F-ATT-CAT-SHIFT EFF). */
  async listEffectiveWorkShifts(companyId: string, authorization?: string) {
    return this.listWorkShifts(companyId, authorization, {
      includeInactive: false,
    });
  }

  /** Active shift count in same list scope (U19) — invent skip when 0 (L-ATT-SHIFT-06). */
  async countActiveWorkShifts(
    companyId: string,
    authorization?: string,
  ): Promise<number> {
    await this.ensureWorkShiftSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const filters: string[] = [`status = 'active'`];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    const res = await this.db.query<{ c: string | number }>(
      `SELECT COUNT(*)::int AS c FROM public.work_shifts WHERE ${filters.join(' AND ')};`,
      values,
    );
    return Number(res.rows[0]?.c ?? 0);
  }

  /** F-ATT-CAT-SHIFT-01 get-by-id — same resolveHrmListScope as list (U19 · HRM-WS-404/409). */
  async getWorkShiftById(
    id: string,
    companyId: string,
    authorization?: string,
  ) {
    await this.ensureWorkShiftSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const peek = await this.db.query<WorkShiftRow>(
      `SELECT id, company_id, code, name, department, start_time, end_time, break_start, break_end,
              work_hours, coefficient, is_night_shift, is_overtime_shift, color, status, notes,
              created_at, updated_at
       FROM public.work_shifts WHERE id = $1::uuid LIMIT 1;`,
      [id],
    );
    assertResourceInHrmScope(peek.rows[0], scope, {
      notFoundCode: 'HRM-WS-404',
      mismatchCode: 'HRM-WS-409',
    });
    return this.mapWorkShift(peek.rows[0]);
  }

  /**
   * VAL-ATT-SHIFT-CNS-01 / AC-PLT-ATT-SHIFT-01b — when active>0, reject invent shift code/id.
   * Empty active = soft skip (U65 · L-ATT-SHIFT-06 · no ensureDefault).
   */
  async assertShiftKeysForConsumer(input: {
    companyId: string;
    currentShift: string;
    requestedShift: string;
    authorization?: string;
  }): Promise<void> {
    const active = await this.listEffectiveWorkShifts(
      input.companyId,
      input.authorization,
    );
    if (active.total === 0) {
      return;
    }
    const check = (raw: string, field: string) => {
      const key = raw.trim();
      if (!key) {
        throw new ApiException(
          HRM_ATT_SHIFT_KEY,
          `${field} is required when work_shifts catalog is non-empty`,
          HttpStatus.BAD_REQUEST,
          { field },
        );
      }
      const hit = active.data.find((r) => this.shiftKeyMatches(r, key));
      if (!hit) {
        throw new ApiException(
          HRM_ATT_SHIFT_KEY,
          `${field} '${raw}' is not in Nest work_shifts active catalog (invent forbidden when active ≠ empty)`,
          HttpStatus.BAD_REQUEST,
          { field, key },
        );
      }
    };
    check(input.currentShift, 'current_shift');
    check(input.requestedShift, 'requested_shift');
  }

  async createWorkShift(
    payload: Record<string, unknown>,
    authorization?: string,
  ) {
    await this.ensureWorkShiftSchema();
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      String(payload.company_id ?? ''),
    );
    const code = String(payload.code ?? '').trim();
    const name = String(payload.name ?? '').trim();
    if (!code || !name) {
      throw new ApiException(
        'HRM-WS-VAL',
        'code and name are required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const res = await this.db.query<WorkShiftRow>(
      `INSERT INTO public.work_shifts (
        id, company_id, code, name, department, start_time, end_time, break_start, break_end,
        work_hours, coefficient, is_night_shift, is_overtime_shift, color, status, notes
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING
        id, company_id, code, name, department, start_time, end_time, break_start, break_end,
        work_hours, coefficient, is_night_shift, is_overtime_shift, color, status, notes,
        created_at, updated_at;`,
      [
        randomUUID(),
        companyId,
        code,
        name,
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
    return this.mapWorkShift(res.rows[0]);
  }

  async assertAttendanceSheetHeaderInScope(
    sheetId: string,
    companyId: string,
    authorization?: string,
  ) {
    await this.ensureAttendanceSheetSchemaLocal();
    const peek = await this.db.query(
      `SELECT * FROM public.attendance_sheets WHERE id = $1::uuid LIMIT 1;`,
      [sheetId],
    );
    assertSheetHeaderRowInScope(peek.rows[0], companyId, authorization);
    return peek.rows[0];
  }

  async updateWorkShift(
    id: string,
    payload: Record<string, unknown>,
    companyId: string,
    authorization?: string,
  ) {
    await this.ensureWorkShiftSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const peek = await this.db.query<WorkShiftRow>(
      `SELECT id, company_id, code, name, department, start_time, end_time, break_start, break_end,
              work_hours, coefficient, is_night_shift, is_overtime_shift, color, status, notes,
              created_at, updated_at
       FROM public.work_shifts WHERE id = $1::uuid LIMIT 1;`,
      [id],
    );
    assertResourceInHrmScope(peek.rows[0], scope, {
      notFoundCode: 'HRM-WS-404',
      mismatchCode: 'HRM-WS-409',
    });
    const res = await this.db.query<WorkShiftRow>(
      `UPDATE public.work_shifts SET
        code = COALESCE($2, code), name = COALESCE($3, name), department = COALESCE($4, department),
        start_time = COALESCE($5, start_time), end_time = COALESCE($6, end_time),
        break_start = COALESCE($7, break_start), break_end = COALESCE($8, break_end),
        work_hours = COALESCE($9, work_hours), coefficient = COALESCE($10, coefficient),
        is_night_shift = COALESCE($11, is_night_shift), is_overtime_shift = COALESCE($12, is_overtime_shift),
        color = COALESCE($13, color), status = COALESCE($14, status), notes = COALESCE($15, notes),
        updated_at = NOW()
       WHERE id = $1::uuid RETURNING
        id, company_id, code, name, department, start_time, end_time, break_start, break_end,
        work_hours, coefficient, is_night_shift, is_overtime_shift, color, status, notes,
        created_at, updated_at;`,
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
    if (!res.rows[0])
      throw new ApiException(
        'HRM-WS-404',
        'Work shift not found',
        HttpStatus.NOT_FOUND,
      );
    return this.mapWorkShift(res.rows[0]);
  }

  /**
   * Product retire = soft status='inactive' (VAL-ATT-SHIFT-CNS-04 · BR-PLT-04 · AC-01e).
   * Hard DELETE only when hard=true and no shift_change_requests refs (residual cleanup).
   */
  async deleteWorkShift(
    id: string,
    companyId: string,
    authorization?: string,
    opts?: { hard?: boolean },
  ) {
    await this.ensureWorkShiftSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const existing = await this.db.query<WorkShiftRow>(
      `SELECT id, company_id, code, name, department, start_time, end_time, break_start, break_end,
              work_hours, coefficient, is_night_shift, is_overtime_shift, color, status, notes,
              created_at, updated_at
       FROM public.work_shifts WHERE id = $1::uuid LIMIT 1;`,
      [id],
    );
    const row = existing.rows[0];
    if (!row) {
      throw new ApiException(
        'HRM-WS-404',
        'Work shift not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: 'HRM-WS-404',
      mismatchCode: 'HRM-WS-409',
    });

    if (opts?.hard) {
      let refCount = 0;
      try {
        const refs = await this.db.query<{ c: string | number }>(
          `SELECT COUNT(*)::int AS c FROM public.shift_change_requests
           WHERE current_shift = $1 OR requested_shift = $1
              OR current_shift = $2 OR requested_shift = $2;`,
          [row.code, row.id],
        );
        refCount = Number(refs.rows[0]?.c ?? 0);
      } catch {
        // shift_change_requests may be absent before first TXN ensure — treat as no refs.
        refCount = 0;
      }
      if (refCount > 0) {
        throw new ApiException(
          'HRM-WS-VAL',
          'Cannot hard-delete work shift while shift_change_requests reference it — soft-retire (status=inactive) instead',
          HttpStatus.CONFLICT,
          { shift_id: id, code: row.code },
        );
      }
      await this.db.query(
        `DELETE FROM public.work_shifts WHERE id = $1::uuid;`,
        [id],
      );
      return { id, retired: false, hard_deleted: true };
    }

    if (String(row.status).toLowerCase() === 'inactive') {
      return { ...this.mapWorkShift(row), retired: true, hard_deleted: false };
    }

    const res = await this.db.query<WorkShiftRow>(
      `UPDATE public.work_shifts
       SET status = 'inactive', updated_at = NOW()
       WHERE id = $1::uuid
       RETURNING id, company_id, code, name, department, start_time, end_time, break_start, break_end,
                 work_hours, coefficient, is_night_shift, is_overtime_shift, color, status, notes,
                 created_at, updated_at;`,
      [id],
    );
    return {
      ...this.mapWorkShift(res.rows[0]),
      retired: true,
      hard_deleted: false,
    };
  }

  /**
   * @CODE-MEMORY method · FR-HRM-AT-14
   * SRS bước: Diễn biến #3 Tải danh sách · #4 Empty trung thực
   * TechSpec: §14.4 ref_srs FR-HRM-AT-14 · AC-ATT-SHEET
   */
  async listAttendanceSheets(companyId: string, authorization?: string) {
    await this.ensureAttendanceSheetSchemaLocal();
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
  async createAttendanceSheet(
    payload: CreateAttendanceSheetDto,
    authorization?: string,
  ) {
    await this.ensureAttendanceSheetSchemaLocal();
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      String(payload.company_id ?? ''),
    );
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
    await this.assertAttendanceSheetHeaderInScope(id, companyId, authorization);
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
    if (!res.rows[0])
      throw new ApiException(
        'HRM-AS-404',
        'Attendance sheet not found',
        HttpStatus.NOT_FOUND,
      );
    return res.rows[0];
  }

  async deleteAttendanceSheet(
    id: string,
    companyId: string,
    authorization?: string,
  ) {
    await this.assertAttendanceSheetHeaderInScope(id, companyId, authorization);
    const scope = resolveHrmListScope(authorization, companyId);
    const filters = ['id = $1::uuid'];
    const values: unknown[] = [id];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    const res = await this.db.query(
      `DELETE FROM public.attendance_sheets WHERE ${filters.join(' AND ')} RETURNING id;`,
      values,
    );
    if (!res.rows[0])
      throw new ApiException(
        'HRM-AS-404',
        'Attendance sheet not found',
        HttpStatus.NOT_FOUND,
      );
    return { id };
  }
}
