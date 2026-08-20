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
exports.FleetService = void 0;
exports.resolveFleetSearchTerm = resolveFleetSearchTerm;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const api_exception_1 = require("../common/api.exception");
const hrm_list_scope_1 = require("../common/hrm-list-scope");
const hrm_db_service_1 = require("../db/hrm-db.service");
function resolveFleetSearchTerm(keyword, q) {
    const term = (q ?? keyword)?.trim();
    if (!term)
        return undefined;
    return term.slice(0, 100);
}
const FLEET_NAME_JSON_KEYS = [
    'driver_name',
    'manufacturer',
    'model',
    'route_name',
    'name',
    'vehicle_name',
];
let FleetService = class FleetService {
    db;
    constructor(db) {
        this.db = db;
    }
    async onModuleInit() {
        await this.ensureSchema();
    }
    async ensureSchema() {
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.hrm_fleet_vehicles (
        id UUID PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        company_id TEXT NOT NULL,
        license_plate TEXT NOT NULL,
        fleet_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_hrm_fleet_status CHECK (status IN ('active', 'inactive'))
      );
    `);
        await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_hrm_fleet_plate_scope
      ON public.hrm_fleet_vehicles (tenant_id, company_id, license_plate);
    `);
    }
    mapRow(row) {
        return {
            id: row.id,
            tenant_id: row.tenant_id,
            company_id: row.company_id,
            license_plate: row.license_plate,
            fleet_fields: row.fleet_fields ?? {},
            status: row.status,
            created_at: row.created_at,
            updated_at: row.updated_at,
        };
    }
    async listVehicles(tenantId, companyIds, opts) {
        await this.ensureSchema();
        const filters = ['tenant_id = $1'];
        const values = [tenantId];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, companyIds);
        if (opts?.status) {
            filters.push(`status = $${values.length + 1}`);
            values.push(opts.status);
        }
        const searchTerm = resolveFleetSearchTerm(opts?.keyword, opts?.q);
        if (searchTerm) {
            const idx = values.length + 1;
            const nameClauses = FLEET_NAME_JSON_KEYS.map((key) => `COALESCE(fleet_fields->>'${key}','') ILIKE $${idx}`).join(' OR ');
            filters.push(`(license_plate ILIKE $${idx} OR ${nameClauses})`);
            values.push(`%${searchTerm}%`);
        }
        const limit = Math.min(Math.max(opts?.limit ?? 500, 1), 2000);
        const res = await this.db.query(`
        SELECT id, tenant_id, company_id, license_plate, fleet_fields, status, created_at, updated_at
        FROM public.hrm_fleet_vehicles
        WHERE ${filters.join(' AND ')}
        ORDER BY license_plate ASC
        LIMIT ${limit};
      `, values);
        return { total: res.rows.length, data: res.rows.map((r) => this.mapRow(r)) };
    }
    async upsertVehicle(input) {
        await this.ensureSchema();
        const plate = input.licensePlate.trim().toUpperCase();
        if (!plate) {
            throw new api_exception_1.ApiException('HRM-FLEET-001', 'license_plate is required', common_1.HttpStatus.BAD_REQUEST);
        }
        const existing = await this.db.query(`SELECT id FROM public.hrm_fleet_vehicles WHERE tenant_id = $1 AND company_id = $2 AND license_plate = $3 LIMIT 1`, [input.tenantId, input.companyId, plate]);
        const id = existing.rows[0]?.id ?? (0, node_crypto_1.randomUUID)();
        const res = await this.db.query(`
        INSERT INTO public.hrm_fleet_vehicles (id, tenant_id, company_id, license_plate, fleet_fields, status)
        VALUES ($1, $2, $3, $4, $5::jsonb, $6)
        ON CONFLICT (tenant_id, company_id, license_plate)
        DO UPDATE SET
          fleet_fields = EXCLUDED.fleet_fields,
          status = EXCLUDED.status,
          updated_at = NOW()
        RETURNING id, tenant_id, company_id, license_plate, fleet_fields, status, created_at, updated_at;
      `, [id, input.tenantId, input.companyId, plate, JSON.stringify(input.fleetFields), input.status ?? 'active']);
        return this.mapRow(res.rows[0]);
    }
};
exports.FleetService = FleetService;
exports.FleetService = FleetService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [hrm_db_service_1.HrmDbService])
], FleetService);
//# sourceMappingURL=fleet.service.js.map