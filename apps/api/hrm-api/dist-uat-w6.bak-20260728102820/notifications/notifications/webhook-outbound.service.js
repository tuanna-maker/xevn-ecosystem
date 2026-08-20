"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var WebhookOutboundService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookOutboundService = void 0;
const node_crypto_1 = require("node:crypto");
const common_1 = require("@nestjs/common");
let WebhookOutboundService = WebhookOutboundService_1 = class WebhookOutboundService {
    logger = new common_1.Logger(WebhookOutboundService_1.name);
    dispatchAttendanceEvent(envelope) {
        const raw = process.env.HRM_EVENT_WEBHOOK_URLS?.trim();
        if (!raw)
            return;
        const urls = raw
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
        if (!urls.length)
            return;
        const secret = process.env.HRM_EVENT_WEBHOOK_SECRET?.trim();
        const body = JSON.stringify({
            source: 'hrm-api',
            envelope,
        });
        const deliveryId = (0, node_crypto_1.randomUUID)();
        void Promise.all(urls.map(async (url) => {
            try {
                const headers = {
                    'Content-Type': 'application/json',
                    'X-HRM-Delivery-Id': deliveryId,
                    'X-HRM-Event-Type': envelope.type,
                };
                if (secret) {
                    const sig = (0, node_crypto_1.createHmac)('sha256', secret).update(body).digest('hex');
                    headers['X-HRM-Signature'] = `sha256=${sig}`;
                }
                const res = await fetch(url, { method: 'POST', headers, body, signal: AbortSignal.timeout(8_000) });
                if (!res.ok) {
                    this.logger.warn(`Webhook ${url} returned HTTP ${res.status}`);
                }
            }
            catch (e) {
                this.logger.warn(`Webhook ${url} failed: ${e instanceof Error ? e.message : String(e)}`);
            }
        }));
    }
};
exports.WebhookOutboundService = WebhookOutboundService;
exports.WebhookOutboundService = WebhookOutboundService = WebhookOutboundService_1 = __decorate([
    (0, common_1.Injectable)()
], WebhookOutboundService);
//# sourceMappingURL=webhook-outbound.service.js.map