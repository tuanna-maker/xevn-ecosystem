/**
 * @CODE-MEMORY
 * Screen:     HRM → Hồ sơ xe (Fleet) — list + keyword filter
 * UC:         FR-HRM-FL-01
 * BR:         BR-FLEET-LIST-SCOPE · G-FL-02 keyword plate/name in-scope
 * SRS:        docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.49 · FR-HRM-FL-01 Diễn biến #4
 * TechSpec:   docs/hrm/TECHSPEC.md §16.5 · API_DESIGN_HRM_FLEET.md §A
 * Purpose:    Đọc/ghi nội bộ hồ sơ xe; GET list lọc biển số + tên mềm trong fleet_fields.
 * WorkItem:   BE-HRM-FLEET-KEYWORD-01
 * Coded:      2026-07-27
 *
 * Callers:
 *   - FleetController.listVehicles
 *   - Internal/ops upsertVehicle (no public HTTP — G-FL-UPSERT)
 *
 * Callees:
 *   - HrmDbService → public.hrm_fleet_vehicles
 *   - pushCompanyIdFilter (scope parity)
 *
 * FE-Actions:
 *   | Thao tác        | Handler      | Lib / RPC                                      |
 *   |-----------------|--------------|------------------------------------------------|
 *   | Tìm biển/tên    | listVehicles | GET …/fleet/vehicles?keyword|q → HRM-FLEET-200 |
 *
 * BE-Chain:
 *   listVehicles → WHERE tenant + companyIds + optional status + ILIKE plate/name keys
 *
 * Impact:     Keyword bỏ scope → lộ xe ĐV khác; public upsert → phá FL-01 view-only
 * must_keep:  FL-01 GET list only · TEXT slug · empty 200 · không mở HTTP upsert
 * SOLID:      Service = SQL + map; controller = auth/scope transport
 * LastVerified: fleet.controller.spec.ts · fleet.service.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: BE-HRM-FLEET-KEYWORD-01
 * change_mode: ADD
 * What: Thêm filter keyword/q trên listVehicles (plate + name keys trong fleet_fields)
 * Why: Đóng residual G-FL-02 — SRS Diễn biến #4 tìm biển số / tên trong ĐV
 * SRS: §3.49 · FR-HRM-FL-01 #4
 * TechSpec: §16.5 · API_DESIGN_HRM_FLEET §A F.1
 * must_keep: không public write · U65 empty OK · HOLD_DEPLOY
 */
import { HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import { pushCompanyIdFilter } from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';

export type FleetVehicleRow = {
  id: string;
  tenant_id: string;
  company_id: string;
  license_plate: string;
  fleet_fields: Record<string, unknown>;
  status: string;
  created_at: string;
  updated_at: string;
};

/** Prefer `q` over `keyword` (employees directory parity). */
export function resolveFleetSearchTerm(keyword?: string, q?: string): string | undefined {
  const term = (q ?? keyword)?.trim();
  if (!term) return undefined;
  return term.slice(0, 100);
}

/** Soft name keys in fleet_fields (Settings tourism catalog + generic aliases). */
const FLEET_NAME_JSON_KEYS = [
  'driver_name',
  'manufacturer',
  'model',
  'route_name',
  'name',
  'vehicle_name',
] as const;

@Injectable()
export class FleetService implements OnModuleInit {
  constructor(private readonly db: HrmDbService) {}

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

  private mapRow(row: FleetVehicleRow) {
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

  async listVehicles(
    tenantId: string,
    companyIds: string[],
    opts?: { status?: string; limit?: number; keyword?: string; q?: string },
  ) {
    await this.ensureSchema();
    const filters = ['tenant_id = $1'];
    const values: unknown[] = [tenantId];
    pushCompanyIdFilter(filters, values, companyIds);
    if (opts?.status) {
      filters.push(`status = $${values.length + 1}`);
      values.push(opts.status);
    }
    const searchTerm = resolveFleetSearchTerm(opts?.keyword, opts?.q);
    if (searchTerm) {
      const idx = values.length + 1;
      const nameClauses = FLEET_NAME_JSON_KEYS.map(
        (key) => `COALESCE(fleet_fields->>'${key}','') ILIKE $${idx}`,
      ).join(' OR ');
      filters.push(`(license_plate ILIKE $${idx} OR ${nameClauses})`);
      values.push(`%${searchTerm}%`);
    }
    const limit = Math.min(Math.max(opts?.limit ?? 500, 1), 2000);
    const res = await this.db.query<FleetVehicleRow>(
      `
        SELECT id, tenant_id, company_id, license_plate, fleet_fields, status, created_at, updated_at
        FROM public.hrm_fleet_vehicles
        WHERE ${filters.join(' AND ')}
        ORDER BY license_plate ASC
        LIMIT ${limit};
      `,
      values,
    );
    return { total: res.rows.length, data: res.rows.map((r) => this.mapRow(r)) };
  }

  async upsertVehicle(input: {
    tenantId: string;
    companyId: string;
    licensePlate: string;
    fleetFields: Record<string, unknown>;
    status?: string;
  }) {
    await this.ensureSchema();
    const plate = input.licensePlate.trim().toUpperCase();
    if (!plate) {
      throw new ApiException('HRM-FLEET-001', 'license_plate is required', HttpStatus.BAD_REQUEST);
    }
    const existing = await this.db.query<{ id: string }>(
      `SELECT id FROM public.hrm_fleet_vehicles WHERE tenant_id = $1 AND company_id = $2 AND license_plate = $3 LIMIT 1`,
      [input.tenantId, input.companyId, plate],
    );
    const id = existing.rows[0]?.id ?? randomUUID();
    const res = await this.db.query<FleetVehicleRow>(
      `
        INSERT INTO public.hrm_fleet_vehicles (id, tenant_id, company_id, license_plate, fleet_fields, status)
        VALUES ($1, $2, $3, $4, $5::jsonb, $6)
        ON CONFLICT (tenant_id, company_id, license_plate)
        DO UPDATE SET
          fleet_fields = EXCLUDED.fleet_fields,
          status = EXCLUDED.status,
          updated_at = NOW()
        RETURNING id, tenant_id, company_id, license_plate, fleet_fields, status, created_at, updated_at;
      `,
      [id, input.tenantId, input.companyId, plate, JSON.stringify(input.fleetFields), input.status ?? 'active'],
    );
    return this.mapRow(res.rows[0]);
  }
}
