import type { HrmRealtimeEventEnvelope } from '../realtime/hrm-realtime.service';
export declare class WebhookOutboundService {
    private readonly logger;
    dispatchAttendanceEvent(envelope: HrmRealtimeEventEnvelope): void;
}
