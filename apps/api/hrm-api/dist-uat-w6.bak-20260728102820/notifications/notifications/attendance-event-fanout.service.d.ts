import { HrmRealtimeService } from '../realtime/hrm-realtime.service';
import type { AttendanceUpdateRequestRealtimePayload, LeaveRequestRealtimePayload, ServiceRequestRealtimePayload } from '../realtime/hrm-realtime.service';
import { HrmInboxService } from './hrm-inbox.service';
import { PushOutboundService } from './push-outbound.service';
import { WebhookOutboundService } from './webhook-outbound.service';
export declare class AttendanceEventFanoutService {
    private readonly realtime;
    private readonly inbox;
    private readonly webhook;
    private readonly push;
    constructor(realtime: HrmRealtimeService, inbox: HrmInboxService, webhook: WebhookOutboundService, push: PushOutboundService);
    private dispatch;
    onUpdateRequestCreated(request: AttendanceUpdateRequestRealtimePayload): Promise<void>;
    onUpdateRequestDecided(kind: 'approved' | 'rejected', request: AttendanceUpdateRequestRealtimePayload): Promise<void>;
    private envelopeAttendance;
    onLeaveRequestCreated(request: LeaveRequestRealtimePayload): Promise<void>;
    onLeaveRequestDecided(kind: 'approved' | 'rejected', request: LeaveRequestRealtimePayload): Promise<void>;
    onServiceRequestCreated(request: ServiceRequestRealtimePayload): Promise<void>;
    onServiceRequestDecided(kind: 'approved' | 'rejected', request: ServiceRequestRealtimePayload): Promise<void>;
}
