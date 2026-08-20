"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var HrmRealtimeGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HrmRealtimeGateway = void 0;
const common_1 = require("@nestjs/common");
const platform_core_1 = require("@xevn/platform-core");
const websockets_1 = require("@nestjs/websockets");
const internal_auth_1 = require("../common/internal-auth");
const hrm_realtime_service_1 = require("./hrm-realtime.service");
const wsCors = (0, platform_core_1.resolveCorsOptions)();
let HrmRealtimeGateway = HrmRealtimeGateway_1 = class HrmRealtimeGateway {
    realtime;
    server;
    logger = new common_1.Logger(HrmRealtimeGateway_1.name);
    constructor(realtime) {
        this.realtime = realtime;
    }
    afterInit(server) {
        this.realtime.attachServer(server);
    }
    handleConnection(client) {
        const authHeader = this.readAuthorization(client);
        const internalKey = this.readInternalApiKey(client);
        if (!(0, internal_auth_1.isAuthorizedInternalRequest)(authHeader, internalKey)) {
            client.emit('hrm:error', { code: 'HRM-AUTH-001', message: 'Unauthorized realtime access' });
            client.disconnect(true);
        }
    }
    handleJoin(client, body) {
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
    readAuthorization(client) {
        const auth = client.handshake.auth;
        const fromAuth = typeof auth?.authorization === 'string' ? auth.authorization.trim() : '';
        if (fromAuth)
            return fromAuth;
        const q = client.handshake.query?.authorization;
        const fromQuery = typeof q === 'string' ? q.trim() : Array.isArray(q) ? q[0]?.trim() : '';
        if (fromQuery) {
            return fromQuery.startsWith('Bearer ') ? fromQuery : `Bearer ${fromQuery}`;
        }
        return undefined;
    }
    readInternalApiKey(client) {
        const auth = client.handshake.auth;
        const fromAuth = typeof auth?.internalApiKey === 'string' ? auth.internalApiKey.trim() : '';
        if (fromAuth)
            return fromAuth;
        const q = client.handshake.query?.internalApiKey;
        const fromQuery = typeof q === 'string' ? q.trim() : Array.isArray(q) ? q[0]?.trim() : '';
        return fromQuery || undefined;
    }
};
exports.HrmRealtimeGateway = HrmRealtimeGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", Function)
], HrmRealtimeGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('hrm:join'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Object]),
    __metadata("design:returntype", void 0)
], HrmRealtimeGateway.prototype, "handleJoin", null);
exports.HrmRealtimeGateway = HrmRealtimeGateway = HrmRealtimeGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        namespace: '/hrm-realtime',
        cors: { origin: wsCors.origin, credentials: wsCors.credentials },
    }),
    __metadata("design:paramtypes", [hrm_realtime_service_1.HrmRealtimeService])
], HrmRealtimeGateway);
//# sourceMappingURL=hrm-realtime.gateway.js.map