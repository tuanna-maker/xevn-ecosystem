import { Injectable } from '@nestjs/common';
import { HrmRealtimeService } from '../realtime/hrm-realtime.service';
import type {
  AttendanceUpdateRequestRealtimePayload,
  HrmRealtimeEventEnvelope,
  LeaveRequestRealtimePayload,
  ServiceRequestRealtimePayload,
} from '../realtime/hrm-realtime.service';
import { HrmInboxService } from './hrm-inbox.service';
import { PushOutboundService } from './push-outbound.service';
import { WebhookOutboundService } from './webhook-outbound.service';

/**
 * Chuẩn pipeline cho mọi luồng “gửi đơn → người có quyền xử lý → thông báo lại người gửi” trên HRM API:
 * Socket.IO → `hrm_inbox_notifications` → webhook → push.
 * Luồng mới (hồ sơ tập đoàn, phê duyệt khác, …) nên gọi `dispatch` với envelope thống nhất thay vì tự ghi DB.
 * Phạm vi “lãnh đạo tập đoàn” đa pháp nhân: cần tổng hợp inbox theo nhiều company_id ở cổng portal / BFF — không gói gọn trong một query inbox đơn lẻ.
 */
@Injectable()
export class AttendanceEventFanoutService {
  constructor(
    private readonly realtime: HrmRealtimeService,
    private readonly inbox: HrmInboxService,
    private readonly webhook: WebhookOutboundService,
    private readonly push: PushOutboundService,
  ) {}

  private async dispatch(envelope: HrmRealtimeEventEnvelope): Promise<void> {
    this.realtime.publishAttendanceEvent(envelope);
    await this.inbox.persistAttendanceEnvelope(envelope);
    this.webhook.dispatchAttendanceEvent(envelope);
    this.push.dispatchAttendanceEvent(envelope);
  }

  async onUpdateRequestCreated(
    request: AttendanceUpdateRequestRealtimePayload,
  ): Promise<void> {
    await this.dispatch(
      this.envelopeAttendance('attendance_update_request.created', request),
    );
  }

  async onUpdateRequestDecided(
    kind: 'approved' | 'rejected',
    request: AttendanceUpdateRequestRealtimePayload,
  ): Promise<void> {
    const type =
      kind === 'approved'
        ? 'attendance_update_request.approved'
        : 'attendance_update_request.rejected';
    await this.dispatch(this.envelopeAttendance(type, request));
  }

  private envelopeAttendance(
    type:
      | 'attendance_update_request.created'
      | 'attendance_update_request.approved'
      | 'attendance_update_request.rejected',
    request: AttendanceUpdateRequestRealtimePayload,
  ): HrmRealtimeEventEnvelope {
    return { type, at: new Date().toISOString(), request };
  }

  async onLeaveRequestCreated(
    request: LeaveRequestRealtimePayload,
  ): Promise<void> {
    await this.dispatch({
      type: 'leave_request.created',
      at: new Date().toISOString(),
      request,
    });
  }

  async onLeaveRequestDecided(
    kind: 'approved' | 'rejected',
    request: LeaveRequestRealtimePayload,
  ): Promise<void> {
    const type =
      kind === 'approved' ? 'leave_request.approved' : 'leave_request.rejected';
    await this.dispatch({ type, at: new Date().toISOString(), request });
  }

  async onServiceRequestCreated(
    request: ServiceRequestRealtimePayload,
  ): Promise<void> {
    await this.dispatch({
      type: 'service_request.created',
      at: new Date().toISOString(),
      request,
    });
  }

  async onServiceRequestDecided(
    kind: 'approved' | 'rejected',
    request: ServiceRequestRealtimePayload,
  ): Promise<void> {
    const type =
      kind === 'approved'
        ? 'service_request.approved'
        : 'service_request.rejected';
    await this.dispatch({ type, at: new Date().toISOString(), request });
  }
}
