import { Logger } from '@nestjs/common';
import { resolveCorsOptions } from '@xevn/platform-core';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { HrmRealtimeService } from './hrm-realtime.service';

const wsCors = resolveCorsOptions();

@WebSocketGateway({
  namespace: '/hrm-realtime',
  cors: { origin: wsCors.origin, credentials: wsCors.credentials },
})
export class HrmRealtimeGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(HrmRealtimeGateway.name);

  constructor(private readonly realtime: HrmRealtimeService) {}

  afterInit(server: Server) {
    this.realtime.attachServer(server);
  }

  handleConnection(client: Socket) {
    const authHeader = this.readAuthorization(client);
    const internalKey = this.readInternalApiKey(client);
    if (!isAuthorizedInternalRequest(authHeader, internalKey)) {
      client.emit('hrm:error', { code: 'HRM-AUTH-001', message: 'Unauthorized realtime access' });
      client.disconnect(true);
    }
  }

  @SubscribeMessage('hrm:join')
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { companyUuid?: string; employeeId?: string },
  ) {
    const companyUuid = typeof body?.companyUuid === 'string' ? body.companyUuid.trim() : '';
    if (!companyUuid) {
      return { ok: false, code: 'HRM-ERR-VALIDATION', message: 'companyUuid required' };
    }
    void client.join(`company:${companyUuid}`);
    const employeeId = typeof body?.employeeId === 'string' ? body.employeeId.trim() : '';
    if (employeeId) {
      void client.join(`employee:${employeeId}`);
    }
    this.logger.debug(`client ${client.id} joined company:${companyUuid}${employeeId ? ` employee:${employeeId}` : ''}`);
    return { ok: true, code: 'HRM-OK-REALTIME-JOIN' };
  }

  private readAuthorization(client: Socket): string | undefined {
    const auth = client.handshake.auth as Record<string, unknown> | undefined;
    const fromAuth = typeof auth?.authorization === 'string' ? auth.authorization.trim() : '';
    if (fromAuth) return fromAuth;
    const q = client.handshake.query?.authorization;
    const fromQuery = typeof q === 'string' ? q.trim() : Array.isArray(q) ? q[0]?.trim() : '';
    if (fromQuery) {
      return fromQuery.startsWith('Bearer ') ? fromQuery : `Bearer ${fromQuery}`;
    }
    return undefined;
  }

  private readInternalApiKey(client: Socket): string | undefined {
    const auth = client.handshake.auth as Record<string, unknown> | undefined;
    const fromAuth = typeof auth?.internalApiKey === 'string' ? auth.internalApiKey.trim() : '';
    if (fromAuth) return fromAuth;
    const q = client.handshake.query?.internalApiKey;
    const fromQuery = typeof q === 'string' ? q.trim() : Array.isArray(q) ? q[0]?.trim() : '';
    return fromQuery || undefined;
  }
}
