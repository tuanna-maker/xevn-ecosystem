"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformQueueService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("bullmq");
let PlatformQueueService = class PlatformQueueService {
    connection = null;
    queue = null;
    worker = null;
    onModuleInit() {
        const url = process.env.REDIS_URL?.trim();
        if (!url || process.env.BULLMQ_ENABLED !== 'true')
            return;
        this.connection = { url, maxRetriesPerRequest: null };
        this.queue = new bullmq_1.Queue('xevn-platform', { connection: this.connection });
        this.worker = new bullmq_1.Worker('xevn-platform', async (job) => {
            if (job.name === 'notification.fanout') {
                return { ok: true, delivered: job.data };
            }
            return { ok: true };
        }, { connection: this.connection });
    }
    async enqueue(name, data, idempotencyKey) {
        if (!this.queue)
            return { queued: false, reason: 'bullmq_disabled' };
        const job = await this.queue.add(name, data, {
            jobId: idempotencyKey,
            removeOnComplete: 1000,
            removeOnFail: 5000,
        });
        return { queued: true, jobId: job.id };
    }
    async onModuleDestroy() {
        await this.worker?.close();
        await this.queue?.close();
    }
};
exports.PlatformQueueService = PlatformQueueService;
exports.PlatformQueueService = PlatformQueueService = __decorate([
    (0, common_1.Injectable)()
], PlatformQueueService);
//# sourceMappingURL=platform-queue.service.js.map