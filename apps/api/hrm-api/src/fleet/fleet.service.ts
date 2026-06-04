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
    opts?: { status?: string; limit?: number },
  ) {
    await this.ensureSchema();
    const filters = ['tenant_id = $1'];
    const values: unknown[] = [tenantId];
    pushCompanyIdFilter(filters, values, companyIds);
    if (opts?.status) {
      filters.push(`status = $${values.length + 1}`);
      values.push(opts.status);
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
