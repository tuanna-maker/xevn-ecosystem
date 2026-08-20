import { OnGatewayConnection, OnGatewayInit } from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { HrmRealtimeService } from './hrm-realtime.service';
export declare class HrmRealtimeGateway implements OnGatewayInit, OnGatewayConnection {
    private readonly realtime;
    server: Server;
    private readonly logger;
    constructor(realtime: HrmRealtimeService);
    afterInit(server: Server): void;
    handleConnection(client: Socket): void;
    handleJoin(client: Socket, body: {
        companyUuid?: string;
        employeeId?: string;
    }): {
        ok: boolean;
        code: string;
        message: string;
    } | {
        ok: boolean;
        code: string;
        message?: undefined;
    };
    private readAuthorization;
    private readInternalApiKey;
}
