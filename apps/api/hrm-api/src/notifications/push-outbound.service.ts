import { randomUUID } from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { HrmDbService } from '../db/hrm-db.service';
import type { HrmRealtimeEventEnvelope } from '../realtime/hrm-realtime.service';

type TokenRow = { token: string; platform: string };

@Injectable()
export class PushOutboundService {
  private readonly logger = new Logger(PushOutboundService.name);
  private fcmReady = false;

  constructor(private readonly db: HrmDbService) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
    if (!raw) return;
    try {
      const cred = JSON.parse(raw) as Record<string, unknown>;
      if (!getApps().length) {
        initializeApp({ credential: cert(cred) });
      }
      this.fcmReady = true;
    } catch (e) {
      this.logger.error(
        `firebase-admin init failed: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }

  private async ensureTokenSchema() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.hrm_push_device_tokens (
        id UUID PRIMARY KEY,
        company_id UUID NOT NULL,
        employee_id UUID NOT NULL,
        platform TEXT NOT NULL,
        token TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_hrm_push_platform CHECK (platform IN ('expo', 'fcm'))
      );
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_hrm_push_device_tokens_scope
      ON public.hrm_push_device_tokens (company_id, employee_id, platform);
    `);
  }

  async upsertToken(
    companyId: string,
    employeeId: string,
    platform: 'expo' | 'fcm',
    token: string,
  ) {
    await this.ensureTokenSchema();
    await this.db.query(
      `
        INSERT INTO public.hrm_push_device_tokens (id, company_id, employee_id, platform, token)
        VALUES ($1::uuid, $2::uuid, $3::uuid, $4, $5)
        ON CONFLICT (company_id, employee_id, platform)
        DO UPDATE SET token = EXCLUDED.token, updated_at = NOW();
      `,
      [randomUUID(), companyId, employeeId, platform, token],
    );
    return { ok: true as const };
  }

  dispatchAttendanceEvent(envelope: HrmRealtimeEventEnvelope): void {
    void this.dispatchAttendanceEventAsync(envelope);
  }

  private async dispatchAttendanceEventAsync(
    envelope: HrmRealtimeEventEnvelope,
  ) {
    try {
      await this.ensureTokenSchema();
      const targets = await this.resolveTargetTokens(envelope);
      if (!targets.length) return;

      const expo = targets.filter((t) => t.platform === 'expo');
      const fcm = targets.filter((t) => t.platform === 'fcm');
      if (expo.length)
        await this.sendExpoChunks(
          expo.map((t) => t.token),
          envelope,
        );
      if (fcm.length && this.fcmReady)
        await this.sendFcmBatch(
          fcm.map((t) => t.token),
          envelope,
        );
      else if (fcm.length && !this.fcmReady) {
        this.logger.warn(
          'FCM tokens present but FIREBASE_SERVICE_ACCOUNT_JSON is not configured',
        );
      }
    } catch (e) {
      this.logger.warn(
        `push dispatch failed: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }

  private async resolveTargetTokens(
    envelope: HrmRealtimeEventEnvelope,
  ): Promise<TokenRow[]> {
    const { type, request } = envelope;
    if (type === 'service_request.created') {
      if (!request.employee_id) {
        const res = await this.db.query<TokenRow>(
          `SELECT token, platform FROM public.hrm_push_device_tokens WHERE company_id = $1::uuid;`,
          [request.company_id],
        );
        return res.rows;
      }
      const res = await this.db.query<TokenRow>(
        `
          SELECT token, platform FROM public.hrm_push_device_tokens
          WHERE company_id = $1::uuid AND employee_id <> $2::uuid;
        `,
        [request.company_id, request.employee_id],
      );
      return res.rows;
    }
    if (
      type === 'attendance_update_request.created' ||
      type === 'leave_request.created'
    ) {
      const res = await this.db.query<TokenRow>(
        `
          SELECT token, platform FROM public.hrm_push_device_tokens
          WHERE company_id = $1::uuid AND employee_id <> $2::uuid;
        `,
        [request.company_id, request.employee_id],
      );
      return res.rows;
    }
    const employeeId =
      'employee_id' in request &&
      request.employee_id != null &&
      String(request.employee_id).trim() !== ''
        ? String(request.employee_id).trim()
        : null;
    if (!employeeId) return [];
    const res = await this.db.query<TokenRow>(
      `
        SELECT token, platform FROM public.hrm_push_device_tokens
        WHERE company_id = $1::uuid AND employee_id = $2::uuid;
      `,
      [request.company_id, employeeId],
    );
    return res.rows;
  }

  private pushCopy(envelope: HrmRealtimeEventEnvelope): {
    title: string;
    body: string;
  } {
    if (envelope.type === 'employee.activated') {
      const r = envelope.request;
      return {
        title: 'Nhân viên đã kích hoạt',
        body: `${r.employee_id} — hiệu lực ${r.effective_date}`,
      };
    }
    const n = envelope.request.employee_name;
    switch (envelope.type) {
      case 'attendance_update_request.created':
        return {
          title: 'Đơn công mới',
          body: `${n} — ${envelope.request.update_type}`,
        };
      case 'attendance_update_request.approved':
        return {
          title: 'Đơn công đã duyệt',
          body: `Yêu cầu của ${n} đã được duyệt.`,
        };
      case 'attendance_update_request.rejected':
        return {
          title: 'Đơn công bị từ chối',
          body: `Yêu cầu của ${n} bị từ chối.`,
        };
      case 'leave_request.created': {
        const r = envelope.request;
        return {
          title: 'Đơn nghỉ mới',
          body: `${n} — ${r.leave_type} (${r.start_date} → ${r.end_date})`,
        };
      }
      case 'leave_request.approved':
        return {
          title: 'Đơn nghỉ đã duyệt',
          body: `Đơn nghỉ của ${n} đã được duyệt.`,
        };
      case 'leave_request.rejected': {
        const reason =
          'rejected_reason' in envelope.request
            ? envelope.request.rejected_reason
            : null;
        return {
          title: 'Đơn nghỉ bị từ chối',
          body: reason
            ? `Đơn nghỉ của ${n} bị từ chối: ${reason}`
            : `Đơn nghỉ của ${n} bị từ chối.`,
        };
      }
      case 'service_request.created':
        return {
          title: 'Yêu cầu dịch vụ mới',
          body: `${n} — ${envelope.request.service_type}`,
        };
      case 'service_request.approved':
        return {
          title: 'Yêu cầu dịch vụ đã duyệt',
          body: `Yêu cầu của ${n} đã được duyệt.`,
        };
      case 'service_request.rejected': {
        const r = envelope.request;
        const reason = r.rejected_reason?.trim();
        return {
          title: 'Yêu cầu dịch vụ bị từ chối',
          body: reason
            ? `Yêu cầu của ${n} bị từ chối: ${reason}`
            : `Yêu cầu của ${n} bị từ chối.`,
        };
      }
    }
    return { title: 'HRM', body: (envelope as { type: string }).type };
  }

  private async sendExpoChunks(
    tokens: string[],
    envelope: HrmRealtimeEventEnvelope,
  ) {
    const expoAccess = process.env.EXPO_ACCESS_TOKEN?.trim();
    const { title, body } = this.pushCopy(envelope);
    const chunkSize = 90;
    for (let i = 0; i < tokens.length; i += chunkSize) {
      const slice = tokens.slice(i, i + chunkSize);
      const requestId =
        envelope.type === 'employee.activated'
          ? envelope.request.employee_id
          : envelope.request.id;
      const messages = slice.map((to) => ({
        to,
        title,
        body,
        data: {
          type: envelope.type,
          requestId,
          companyId: envelope.request.company_id,
        },
        sound: 'default' as const,
        channelId: 'default',
      }));
      const headers: Record<string, string> = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };
      if (expoAccess) headers.Authorization = `Bearer ${expoAccess}`;

      const res = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers,
        body: JSON.stringify({ messages }),
        signal: AbortSignal.timeout(12_000),
      });
      if (!res.ok) {
        this.logger.warn(
          `Expo push API HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`,
        );
      }
    }
  }

  private async sendFcmBatch(
    tokens: string[],
    envelope: HrmRealtimeEventEnvelope,
  ) {
    const messaging = getMessaging();
    const { title, body } = this.pushCopy(envelope);
    const requestId =
      envelope.type === 'employee.activated'
        ? envelope.request.employee_id
        : envelope.request.id;
    const data: Record<string, string> = {
      type: envelope.type,
      requestId,
      companyId: envelope.request.company_id,
      employeeId:
        'employee_id' in envelope.request && envelope.request.employee_id
          ? envelope.request.employee_id
          : '',
    };
    try {
      await messaging.sendEachForMulticast({
        tokens,
        notification: { title, body },
        data,
      });
    } catch (e) {
      this.logger.warn(
        `FCM sendEachForMulticast failed: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }
}
