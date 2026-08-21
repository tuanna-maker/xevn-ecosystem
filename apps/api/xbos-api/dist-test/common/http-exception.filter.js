"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalHttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const platform_core_1 = require("@xevn/platform-core");
let GlobalHttpExceptionFilter = class GlobalHttpExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let code = 'XBOS-SYS-001';
        let message = 'Internal server error';
        let details;
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const payload = exception.getResponse();
            if (typeof payload === 'string') {
                message = payload;
            }
            else if (payload && typeof payload === 'object') {
                if ('code' in payload && payload.code)
                    code = String(payload.code);
                if (payload.message) {
                    message = Array.isArray(payload.message) ? payload.message.join('; ') : payload.message;
                }
                else if (payload.error) {
                    message = payload.error;
                }
                details = payload.details;
            }
            if (!payload || typeof payload !== 'object' || !('code' in payload)) {
                if (status === common_1.HttpStatus.BAD_REQUEST)
                    code = 'XBOS-VAL-001';
                if (status === common_1.HttpStatus.UNAUTHORIZED)
                    code = 'XBOS-AUTH-001';
                if (status === common_1.HttpStatus.NOT_FOUND)
                    code = 'XBOS-CFG-001';
                if (status === common_1.HttpStatus.FORBIDDEN)
                    code = 'XBOS-CFG-002';
            }
        }
        if (!(exception instanceof common_1.HttpException) && exception instanceof Error) {
            message = exception.message || message;
        }
        (0, platform_core_1.logHttpException)(request.log, {
            status,
            code,
            message,
            exception,
            method: request.method,
            path: request.url,
        });
        response.setHeader('x-api-code', code);
        response.status(status).json({
            success: false,
            code,
            message,
            details,
            timestamp: new Date().toISOString(),
        });
    }
};
exports.GlobalHttpExceptionFilter = GlobalHttpExceptionFilter;
exports.GlobalHttpExceptionFilter = GlobalHttpExceptionFilter = __decorate([
    (0, common_1.Catch)()
], GlobalHttpExceptionFilter);
