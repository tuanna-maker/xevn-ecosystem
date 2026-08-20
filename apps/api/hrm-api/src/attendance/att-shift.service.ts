import { HttpStatus, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import { HrmDbService } from '../db/hrm-db.service';

export type AttShiftRow = {
  id: string;
  company_id: string;
  code: string;
  name_vi: string;
  start_time: string | null;
  end_time: string | null;
  break_minutes: number;
  is_flexible: boolean;
  is_night_shift: boolean;
  apply_to: string | null;
  description: string | null;
  status: string;
  archived_at: string | null;
};

export type UpsertAttShiftPayload = {
  companyId: string;
  code: string;
  nameVi: string;
  startTime?: string | null;
  endTime?: string | null;
  breakMinutes?: number;
  isFlexible?: boolean;
  isNightShift?: boolean;
  applyTo?: string | null;
  description?: string | null;
  status?: string;
};

@Injectable()
export class AttShiftService {
  constructor(private readonly db: HrmDbService) {}

  async listShifts(companyId: string, q?: string): Promise<AttShiftRow[]> {
    let sql = `
      SELECT * FROM public.att_shift
      WHERE company_id = $1 AND archived_at IS NULL
    `;
    const params: unknown[] = [companyId];
    if (q && q.trim()) {
      sql += ` AND (code ILIKE $2 OR name_vi ILIKE $2)`;
      params.push(`%${q.trim()}%`);
    }
    sql += ` ORDER BY code ASC`;
    const res = await this.db.query(sql, params);
    return res.rows as AttShiftRow[];
  }

  async upsertShift(
    payload: UpsertAttShiftPayload,
  ): Promise<AttShiftRow> {
    const code = payload.code.trim().toUpperCase();
    if (!code) {
      throw new ApiException('HRM-SHIFT-400', 'Thiếu mã ca làm việc', HttpStatus.BAD_REQUEST);
    }

    const name = payload.nameVi.trim();
    if (!name) {
      throw new ApiException('HRM-SHIFT-400', 'Thiếu tên ca làm việc', HttpStatus.BAD_REQUEST);
    }

    const existing = await this.db.query(
      `SELECT * FROM public.att_shift WHERE company_id = $1 AND code = $2`,
      [payload.companyId, code],
    );

    let row: AttShiftRow;
    if (existing && existing.rowCount && existing.rowCount > 0) {
      // Update
      const res = await this.db.query(
        `
        UPDATE public.att_shift
        SET name_vi = $3,
            start_time = $4,
            end_time = $5,
            break_minutes = $6,
            is_flexible = $7,
            is_night_shift = $8,
            apply_to = $9,
            description = $10,
            status = $11,
            updated_at = NOW(),
            archived_at = NULL
        WHERE company_id = $1 AND code = $2
        RETURNING *
        `,
        [
          payload.companyId,
          code,
          name,
          payload.startTime ?? null,
          payload.endTime ?? null,
          payload.breakMinutes ?? 0,
          payload.isFlexible ?? false,
          payload.isNightShift ?? false,
          payload.applyTo ?? null,
          payload.description ?? null,
          payload.status ?? 'active',
        ],
      );
      row = res.rows[0] as AttShiftRow;
    } else {
      // Insert
      const res = await this.db.query(
        `
        INSERT INTO public.att_shift (
          company_id, code, name_vi, start_time, end_time, break_minutes,
          is_flexible, is_night_shift, apply_to, description, status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
        ) RETURNING *
        `,
        [
          payload.companyId,
          code,
          name,
          payload.startTime ?? null,
          payload.endTime ?? null,
          payload.breakMinutes ?? 0,
          payload.isFlexible ?? false,
          payload.isNightShift ?? false,
          payload.applyTo ?? null,
          payload.description ?? null,
          payload.status ?? 'active',
        ],
      );
      row = res.rows[0] as AttShiftRow;
    }
    return row;
  }

  async retireShift(companyId: string, id: string): Promise<void> {
    const res = await this.db.query(
      `
      UPDATE public.att_shift
      SET archived_at = NOW(), status = 'retired', updated_at = NOW()
      WHERE company_id = $1 AND id = $2 AND archived_at IS NULL
      RETURNING *
      `,
      [companyId, id],
    );
    if (res.rowCount === 0) {
      throw new ApiException('HRM-SHIFT-404', 'Không tìm thấy ca làm việc hoặc đã bị xóa', HttpStatus.NOT_FOUND);
    }
  }
}
