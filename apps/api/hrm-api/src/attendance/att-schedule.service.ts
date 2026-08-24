import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { HrmDbService } from '../db/hrm-db.service';

export type AttScheduleRow = {
  id: string;
  company_id: string;
  code: string;
  name_vi: string;
  default_shift_code: string | null;
  working_days: string | null;
  apply_to: string | null;
  description: string | null;
  status: string;
  archived_at: string | null;
};

export type UpsertAttSchedulePayload = {
  companyId: string;
  code: string;
  nameVi: string;
  defaultShiftCode?: string | null;
  workingDays?: string | null;
  applyTo?: string | null;
  description?: string | null;
  status?: string;
};

@Injectable()
export class AttScheduleService {
  constructor(private readonly db: HrmDbService) {}

  async listSchedules(
    companyId: string,
    q?: string,
  ): Promise<AttScheduleRow[]> {
    let sql = `
      SELECT * FROM public.att_schedule
      WHERE company_id = $1 AND archived_at IS NULL
    `;
    const params: unknown[] = [companyId];
    if (q && q.trim()) {
      sql += ` AND (code ILIKE $2 OR name_vi ILIKE $2)`;
      params.push(`%${q.trim()}%`);
    }
    sql += ` ORDER BY code ASC`;
    const res = await this.db.query(sql, params);
    return res.rows as AttScheduleRow[];
  }

  async upsertSchedule(
    payload: UpsertAttSchedulePayload,
  ): Promise<AttScheduleRow> {
    const code = payload.code.trim().toUpperCase();
    if (!code) {
      throw new ApiException(
        'HRM-SCHED-400',
        'Thiếu mã lịch trình',
        HttpStatus.BAD_REQUEST,
      );
    }

    const name = payload.nameVi.trim();
    if (!name) {
      throw new ApiException(
        'HRM-SCHED-400',
        'Thiếu tên lịch trình',
        HttpStatus.BAD_REQUEST,
      );
    }

    const existing = await this.db.query(
      `SELECT * FROM public.att_schedule WHERE company_id = $1 AND code = $2`,
      [payload.companyId, code],
    );

    let row: AttScheduleRow;
    if (existing && existing.rowCount && existing.rowCount > 0) {
      const res = await this.db.query(
        `
        UPDATE public.att_schedule
        SET name_vi = $3,
            default_shift_code = $4,
            working_days = $5,
            apply_to = $6,
            description = $7,
            status = $8,
            updated_at = NOW(),
            archived_at = NULL
        WHERE company_id = $1 AND code = $2
        RETURNING *
        `,
        [
          payload.companyId,
          code,
          name,
          payload.defaultShiftCode ?? null,
          payload.workingDays ?? null,
          payload.applyTo ?? null,
          payload.description ?? null,
          payload.status ?? 'active',
        ],
      );
      row = res.rows[0] as AttScheduleRow;
    } else {
      const res = await this.db.query(
        `
        INSERT INTO public.att_schedule (
          company_id, code, name_vi, default_shift_code, working_days,
          apply_to, description, status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8
        ) RETURNING *
        `,
        [
          payload.companyId,
          code,
          name,
          payload.defaultShiftCode ?? null,
          payload.workingDays ?? null,
          payload.applyTo ?? null,
          payload.description ?? null,
          payload.status ?? 'active',
        ],
      );
      row = res.rows[0] as AttScheduleRow;
    }
    return row;
  }

  async retireSchedule(companyId: string, id: string): Promise<void> {
    const res = await this.db.query(
      `
      UPDATE public.att_schedule
      SET archived_at = NOW(), status = 'retired', updated_at = NOW()
      WHERE company_id = $1 AND id = $2 AND archived_at IS NULL
      RETURNING *
      `,
      [companyId, id],
    );
    if (res.rowCount === 0) {
      throw new ApiException(
        'HRM-SCHED-404',
        'Không tìm thấy lịch trình hoặc đã bị xóa',
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
