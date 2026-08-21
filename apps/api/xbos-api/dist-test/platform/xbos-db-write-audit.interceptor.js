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
Object.defineProperty(exports, "__esModule", { value: true });
exports.XbosDbWriteAuditInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const platform_audit_service_1 = require("./platform-audit.service");
const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
let XbosDbWriteAuditInterceptor = class XbosDbWriteAuditInterceptor {
    platformAudit;
    constructor(platformAudit) {
        this.platformAudit = platformAudit;
    }
    intercept(context, next) {
        const req = context.switchToHttp().getRequest();
        const method = req.method?.toUpperCase() ?? 'GET';
        if (!MUTATING_METHODS.has(method)) {
            return next.handle();
        }
        const path = (req.originalUrl ?? req.url ?? '').split('?')[0];
        return next.handle().pipe((0, operators_1.tap)((body) => {
            if (!body || typeof body !== 'object')
                return;
            const envelope = body;
            if (envelope.success !== true)
                return;
            const responseCode = typeof envelope.code === 'string' ? envelope.code : '';
            void this.platformAudit
                .emit({
                tenantId: this.readHeader(req, 'x-tenant-id'),
                companyId: this.readHeader(req, 'x-company-id'),
                action: 'xbos.db_write',
                entityType: 'http_mutation',
                entityId: path,
                payload: { path, method, responseCode },
                request: req,
            })
                .catch(() => {
                /* audit failure must not affect the HTTP response */
            });
        }));
    }
    readHeader(req, name) {
        const value = req.headers[name];
        if (typeof value === 'string' && value.trim())
            return value.trim();
        if (Array.isArray(value) && value[0]?.trim())
            return value[0].trim();
        return undefined;
    }
};
exports.XbosDbWriteAuditInterceptor = XbosDbWriteAuditInterceptor;
exports.XbosDbWriteAuditInterceptor = XbosDbWriteAuditInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [platform_audit_service_1.PlatformAuditService])
], XbosDbWriteAuditInterceptor);
