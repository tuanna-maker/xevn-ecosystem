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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const platform_core_1 = require("@xevn/platform-core");
const api_response_1 = require("./common/api-response");
const platform_runtime_1 = require("./platform/platform-runtime");
let AppController = class AppController {
    getHello() {
        return (0, api_response_1.ok)({ service: 'xbos-api', status: 'ok' }, 'XBOS-HEALTH-200', 'XBOS service is healthy');
    }
    async getMetrics(res, format) {
        const wantsPrometheus = format === 'prometheus' || String(res.req?.headers?.accept ?? '').includes('text/plain');
        if (wantsPrometheus) {
            const body = await (0, platform_core_1.renderPrometheusMetrics)(platform_runtime_1.XBOS_SERVICE_NAME);
            res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
            res.send(body);
            return;
        }
        return (0, api_response_1.ok)({
            process_uptime_sec: Math.round(process.uptime()),
            memory_rss_bytes: process.memoryUsage().rss,
            memory_heap_used_bytes: process.memoryUsage().heapUsed,
            node_version: process.version,
            timestamp: new Date().toISOString(),
            prometheus_hint: 'GET /api/xbos/metrics?format=prometheus',
        }, 'XBOS-METRICS-200', 'Runtime metrics snapshot');
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getHello", null);
__decorate([
    (0, common_1.Get)('metrics'),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __param(1, (0, common_1.Query)('format')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getMetrics", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)()
], AppController);
