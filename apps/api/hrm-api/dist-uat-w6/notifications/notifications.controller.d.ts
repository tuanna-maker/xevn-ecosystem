import { ListInboxQueryDto } from './dto/list-inbox.query.dto';
import { MarkInboxReadDto } from './dto/mark-inbox-read.dto';
import { MarkInboxReadQueryDto } from './dto/mark-inbox-read.query.dto';
import { RegisterPushTokenDto } from './dto/register-push-token.dto';
import { HrmInboxService } from './hrm-inbox.service';
import { PushOutboundService } from './push-outbound.service';
export declare class NotificationsController {
    private readonly inbox;
    private readonly push;
    constructor(inbox: HrmInboxService, push: PushOutboundService);
    private assertBusinessAccess;
    listInbox(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: ListInboxQueryDto): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        data: {
            id: string;
            company_id: string;
            event_type: string;
            payload: unknown;
            recipient_employee_id: string | null;
            read_at: string | null;
            created_at: string;
        }[];
    }>>;
    markInboxRead(notificationId: string, authorization: string | undefined, internalApiKey: string | undefined, query: MarkInboxReadQueryDto, body: MarkInboxReadDto): Promise<import("../common/api-response").ApiSuccess<{
        id: string;
        company_id: string;
        event_type: string;
        read_at: string | null;
    }>>;
    registerPushToken(authorization: string | undefined, internalApiKey: string | undefined, body: RegisterPushTokenDto): Promise<import("../common/api-response").ApiSuccess<{
        ok: true;
    }>>;
}
