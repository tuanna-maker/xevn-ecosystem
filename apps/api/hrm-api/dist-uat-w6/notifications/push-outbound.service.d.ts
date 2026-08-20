import { HrmDbService } from '../db/hrm-db.service';
import type { HrmRealtimeEventEnvelope } from '../realtime/hrm-realtime.service';
export declare class PushOutboundService {
    private readonly db;
    private readonly logger;
    private fcmReady;
    constructor(db: HrmDbService);
    private ensureTokenSchema;
    upsertToken(companyId: string, employeeId: string, platform: 'expo' | 'fcm', token: string): Promise<{
        ok: true;
    }>;
    dispatchAttendanceEvent(envelope: HrmRealtimeEventEnvelope): void;
    private dispatchAttendanceEventAsync;
    private resolveTargetTokens;
    private pushCopy;
    private sendExpoChunks;
    private sendFcmBatch;
}
