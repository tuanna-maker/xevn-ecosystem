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
exports.XbosDbService = void 0;
const common_1 = require("@nestjs/common");
const platform_core_1 = require("@xevn/platform-core");
const pg_1 = require("pg");
const platform_runtime_1 = require("../platform/platform-runtime");
function resolveDatabaseUrl() {
    if (process.env.DATABASE_URL_XBOS) {
        return process.env.DATABASE_URL_XBOS;
    }
    return undefined;
}
/** Tên DB logic XBOS — tránh để pg mặc định DB = tên user OS (gây lỗi 3D000). */
function resolveDbName() {
    const raw = process.env.DB_NAME_XBOS?.trim() ||
        process.env.DB_NAME?.trim() ||
        process.env.PGDATABASE?.trim() ||
        'xevn_xbos';
    return raw || 'xevn_xbos';
}
let XbosDbService = class XbosDbService {
    pool;
    constructor() {
        const poolEnv = (0, platform_core_1.readPgPoolEnv)();
        const connectionString = resolveDatabaseUrl();
        if (connectionString) {
            this.pool = new pg_1.Pool({ connectionString, ssl: false, ...poolEnv });
            this.attachPoolErrorGuard(this.pool);
            return;
        }
        const host = process.env.DB_HOST?.trim();
        const portRaw = process.env.DB_PORT?.trim();
        const user = process.env.DB_USER?.trim();
        const dbName = resolveDbName();
        if (host && portRaw && user) {
            this.pool = new pg_1.Pool({
                host,
                port: Number(portRaw),
                user,
                password: process.env.DB_PASSWORD ?? '',
                database: dbName,
                ssl: process.env.DB_SSL === 'true',
                ...poolEnv,
            });
            this.attachPoolErrorGuard(this.pool);
            return;
        }
        // Local dev: không bao giờ dùng `new Pool({ max: 1 })` — mặc định pg sẽ chọn database = user OS.
        if (process.env.NODE_ENV !== 'production') {
            console.warn(`[xbos-db] Using local dev defaults: ${process.env.DB_USER ?? 'postgres'}@${process.env.DB_HOST ?? '127.0.0.1'}:${process.env.DB_PORT ?? '5432'}/${dbName} ` +
                `(set DATABASE_URL_XBOS or DB_HOST/DB_PORT/DB_USER/DB_PASSWORD in deploy or apps/api/xbos-api/.env)`);
        }
        this.pool = new pg_1.Pool({
            host: process.env.DB_HOST?.trim() || '127.0.0.1',
            port: Number(process.env.DB_PORT ?? 5432),
            user: process.env.DB_USER?.trim() || 'postgres',
            password: process.env.DB_PASSWORD ?? '',
            database: dbName,
            ssl: process.env.DB_SSL === 'true',
            ...poolEnv,
        });
        this.attachPoolErrorGuard(this.pool);
    }
    /** PgBouncer idle disconnect must not crash the Nest process (ECONNRESET). */
    attachPoolErrorGuard(pool) {
        pool.on('error', (err) => {
            console.error(`[${platform_runtime_1.XBOS_SERVICE_NAME}] pg pool idle client error: ${err.message}`);
        });
    }
    async query(text, values = []) {
        const startedAt = Date.now();
        const operation = text.trim().split(/\s+/)[0]?.toLowerCase() || 'query';
        try {
            (0, platform_core_1.setPgPoolWaiting)(platform_runtime_1.XBOS_SERVICE_NAME, this.pool.waitingCount);
            const result = await this.pool.query(text, values);
            (0, platform_core_1.recordDbQueryMetrics)(platform_runtime_1.XBOS_SERVICE_NAME, operation, Date.now() - startedAt);
            return result;
        }
        catch (error) {
            (0, platform_core_1.recordDbQueryMetrics)(platform_runtime_1.XBOS_SERVICE_NAME, `${operation}_error`, Date.now() - startedAt);
            throw error;
        }
    }
    async onModuleDestroy() {
        await this.pool.end();
    }
};
exports.XbosDbService = XbosDbService;
exports.XbosDbService = XbosDbService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], XbosDbService);
