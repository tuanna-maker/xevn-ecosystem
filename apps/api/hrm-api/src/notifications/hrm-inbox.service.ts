import { HttpStatus, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import { HrmDbService } from '../db/hrm-db.service';
import type { HrmRealtimeEventEnvelope } from '../realtime/hrm-realtime.service';

type InboxRow = {
  id: string;
  company_id: string;
  event_type: string;
  payload: unknown;
  recipient_employee_id: string | null;
  read_at: string | null;
  created_at: string;
};

@Injectable()
export class HrmInboxService {
  constructor(private readonly db: HrmDbService) {}

  private async ensureSchema() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.hrm_inbox_notifications (
        id UUID PRIMARY KEY,
        company_id UUID NOT NULL,
        event_type TEXT NOT NULL,
        payload JSONB NOT NULL,
        recipient_employee_id UUID NULL,
        read_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_hrm_inbox_company_recipient_created
      ON public.hrm_inbox_notifications (company_id, recipient_employee_id, created_at DESC);
    `);
  }

  /**
   * Lưu inbox từ envelope realtime: đơn chờ → 1 dòng broadcast (recipient NULL);
   * đã xử lý → broadcast + (nếu có employee_id) 1 dòng gửi đích nhân viên.
   * Các luồng gửi/nhận mới (đơn công, nghỉ, dịch vụ, …) nên dùng cùng envelope + AttendanceEventFanoutService.
   */
  async persistAttendanceEnvelope(envelope: HrmRealtimeEventEnvelope): Promise<void> {
    await this.ensureSchema();
    const { type, request } = envelope;
    const payload = JSON.stringify(envelope);

    if (
      type === 'attendance_update_request.created' ||
      type === 'leave_request.created' ||
      type === 'service_request.created'
    ) {
      await this.db.query(
        `
          INSERT INTO public.hrm_inbox_notifications (id, company_id, event_type, payload, recipient_employee_id)
          VALUES ($1::uuid, $2::uuid, $3, $4::jsonb, NULL);
        `,
        [randomUUID(), request.company_id, type, payload],
      );
      return;
    }

    const idCompany = randomUUID();
    await this.db.query(
      `
        INSERT INTO public.hrm_inbox_notifications (id, company_id, event_type, payload, recipient_employee_id)
        VALUES ($1::uuid, $2::uuid, $3, $4::jsonb, NULL);
      `,
      [idCompany, request.company_id, type, payload],
    );

    const targetEmployeeId =
      'employee_id' in request && request.employee_id != null && String(request.employee_id).trim() !== ''
        ? String(request.employee_id).trim()
        : null;
    if (!targetEmployeeId) return;

    const idEmployee = randomUUID();
    await this.db.query(
      `
        INSERT INTO public.hrm_inbox_notifications (id, company_id, event_type, payload, recipient_employee_id)
        VALUES ($1::uuid, $2::uuid, $3, $4::jsonb, $5::uuid);
      `,
      [idEmployee, request.company_id, type, payload, targetEmployeeId],
    );
  }

  async listInbox(companyId: string, employeeId: string, limit: number) {
    await this.ensureSchema();
    const lim = Math.min(Math.max(limit, 1), 100);
    const res = await this.db.query<InboxRow>(
      `
        SELECT id, company_id, event_type, payload, recipient_employee_id, read_at, created_at
        FROM public.hrm_inbox_notifications
        WHERE company_id = $1::uuid
          AND (recipient_employee_id IS NULL OR recipient_employee_id = $2::uuid)
        ORDER BY created_at DESC
        LIMIT $3;
      `,
      [companyId, employeeId, lim],
    );
    return {
      total: res.rows.length,
      data: res.rows.map((row) => ({
        id: row.id,
        company_id: row.company_id,
        event_type: row.event_type,
        payload: row.payload,
        recipient_employee_id: row.recipient_employee_id,
        read_at: row.read_at,
        created_at: row.created_at,
      })),
    };
  }

  async markRead(notificationId: string, companyId: string, viewerEmployeeId: string) {
    await this.ensureSchema();
    const res = await this.db.query<InboxRow>(
      `
        UPDATE public.hrm_inbox_notifications
        SET read_at = NOW()
        WHERE id = $1::uuid
          AND company_id = $2::uuid
          AND recipient_employee_id = $3::uuid
          AND read_at IS NULL
        RETURNING id, company_id, event_type, payload, recipient_employee_id, read_at, created_at;
      `,
      [notificationId, companyId, viewerEmployeeId],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException('HRM-INBOX-404', 'Notification not found or not markable', HttpStatus.NOT_FOUND);
    }
    return {
      id: row.id,
      company_id: row.company_id,
      event_type: row.event_type,
      read_at: row.read_at,
    };
  }
}
