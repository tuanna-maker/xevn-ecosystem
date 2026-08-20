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
exports.HrmDbService = void 0;
const common_1 = require("@nestjs/common");
const platform_core_1 = require("@xevn/platform-core");
const pg_1 = require("pg");
const platform_runtime_1 = require("../platform/platform-runtime");
function resolveDatabaseUrl() {
    if (process.env.DATABASE_URL_HRM) {
        return process.env.DATABASE_URL_HRM;
    }
    return undefined;
}
let HrmDbService = class HrmDbService {
    pool;
    constructor() {
        const poolEnv = (0, platform_core_1.readPgPoolEnv)();
        const connectionString = resolveDatabaseUrl();
        if (connectionString) {
            this.pool = new pg_1.Pool({ connectionString, ssl: false, ...poolEnv });
            return;
        }
        if (process.env.DB_HOST && process.env.DB_PORT && process.env.DB_USER && process.env.DB_PASSWORD) {
            this.pool = new pg_1.Pool({
                host: process.env.DB_HOST,
                port: Number(process.env.DB_PORT),
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: 'xevn_hrm',
                ssl: false,
                ...poolEnv,
            });
            return;
        }
        this.pool = new pg_1.Pool({ max: 1 });
    }
    async query(text, values = []) {
        const startedAt = Date.now();
        const operation = text.trim().split(/\s+/)[0]?.toLowerCase() || 'query';
        try {
            (0, platform_core_1.setPgPoolWaiting)(platform_runtime_1.HRM_SERVICE_NAME, this.pool.waitingCount);
            const result = await this.pool.query(text, values);
            (0, platform_core_1.recordDbQueryMetrics)(platform_runtime_1.HRM_SERVICE_NAME, operation, Date.now() - startedAt);
            return result;
        }
        catch (error) {
            (0, platform_core_1.recordDbQueryMetrics)(platform_runtime_1.HRM_SERVICE_NAME, `${operation}_error`, Date.now() - startedAt);
            throw error;
        }
    }
    async withTransaction(fn) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const query = async (text, values = []) => {
                const startedAt = Date.now();
                const operation = text.trim().split(/\s+/)[0]?.toLowerCase() || 'query';
                try {
                    const result = await client.query(text, values);
                    (0, platform_core_1.recordDbQueryMetrics)(platform_runtime_1.HRM_SERVICE_NAME, operation, Date.now() - startedAt);
                    return result;
                }
                catch (error) {
                    (0, platform_core_1.recordDbQueryMetrics)(platform_runtime_1.HRM_SERVICE_NAME, `${operation}_error`, Date.now() - startedAt);
                    throw error;
                }
            };
            const result = await fn(query);
            await client.query('COMMIT');
            return result;
        }
        catch (error) {
            try {
                await client.query('ROLLBACK');
            }
            catch {
            }
            throw error;
        }
        finally {
            client.release();
        }
    }
    async onModuleDestroy() {
        await this.pool.end();
    }
};
exports.HrmDbService = HrmDbService;
exports.HrmDbService = HrmDbService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], HrmDbService);
//# sourceMappingURL=hrm-db.service.js.map