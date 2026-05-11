import { HttpStatus, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import { HrmDbService } from '../db/hrm-db.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { CreateInsuranceRecordDto } from './dto/create-insurance-record.dto';
import { ListExpiringQueryDto } from './dto/list-expiring.query.dto';
import { ListContractsQueryDto } from './dto/list-contracts.query.dto';
import { UpdateContractDto } from './dto/update-contract.dto';

type ContractRow = {
  id: string;
  company_id: string;
  employee_id: string;
  contract_type: string;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
  updated_at: string;
};

type InsuranceRow = {
  id: string;
  company_id: string;
  employee_id: string;
  provider: string;
  policy_number: string;
  expiry_date: string;
  status: string;
  created_at: string;
  updated_at: string;
};

@Injectable()
export class ContractsInsuranceService {
  constructor(private readonly db: HrmDbService) {}

  private async ensureSchema() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.employee_contracts (
        id UUID PRIMARY KEY,
        company_id TEXT NOT NULL,
        employee_id UUID NOT NULL,
        contract_type TEXT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_employee_contract_status CHECK (status IN ('active', 'expired', 'terminated')),
        CONSTRAINT chk_contract_date_range CHECK (start_date <= end_date)
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.employee_insurance_records (
        id UUID PRIMARY KEY,
        company_id TEXT NOT NULL,
        employee_id UUID NOT NULL,
        provider TEXT NOT NULL,
        policy_number TEXT NOT NULL,
        expiry_date DATE NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_employee_insurance_status CHECK (status IN ('active', 'expired', 'cancelled'))
      );
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_employee_contracts_company_end_date
      ON public.employee_contracts (company_id, end_date);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_employee_insurance_company_expiry_date
      ON public.employee_insurance_records (company_id, expiry_date);
    `);
    await this.db.query(`
      ALTER TABLE public.employee_contracts
      ALTER COLUMN company_id TYPE TEXT USING company_id::text;
    `);
    await this.db.query(`
      ALTER TABLE public.employee_insurance_records
      ALTER COLUMN company_id TYPE TEXT USING company_id::text;
    `);
    await this.ensureSeedData();
  }

  private async ensureSeedData() {
    const contractCount = await this.db.query<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM public.employee_contracts WHERE company_id = 'holding';`,
    );
    if (Number(contractCount.rows[0]?.total ?? 0) === 0) {
      await this.db.query(
        `
        INSERT INTO public.employee_contracts
          (id, company_id, employee_id, contract_type, start_date, end_date, status)
        VALUES
          ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'holding', '11111111-1111-4111-8111-111111111111', 'Hợp đồng 3 năm', CURRENT_DATE - INTERVAL '120 days', CURRENT_DATE + INTERVAL '45 days', 'active'),
          ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'holding', '22222222-2222-4222-8222-222222222222', 'Hợp đồng 1 năm', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '20 days', 'active');
        `,
      );
    }

    const insuranceCount = await this.db.query<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM public.employee_insurance_records WHERE company_id = 'holding';`,
    );
    if (Number(insuranceCount.rows[0]?.total ?? 0) === 0) {
      await this.db.query(
        `
        INSERT INTO public.employee_insurance_records
          (id, company_id, employee_id, provider, policy_number, expiry_date, status)
        VALUES
          ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1', 'holding', '11111111-1111-4111-8111-111111111111', 'Bao Viet', 'BV-2026-0001', CURRENT_DATE + INTERVAL '25 days', 'active'),
          ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2', 'holding', '22222222-2222-4222-8222-222222222222', 'PVI', 'PVI-2026-0002', CURRENT_DATE + INTERVAL '60 days', 'active');
        `,
      );
    }
  }

  async createContract(payload: CreateContractDto) {
    await this.ensureSchema();
    if (new Date(payload.start_date).getTime() > new Date(payload.end_date).getTime()) {
      throw new ApiException('HRM-CON-001', 'start_date must be <= end_date', HttpStatus.BAD_REQUEST);
    }
    const res = await this.db.query<ContractRow>(
      `INSERT INTO public.employee_contracts
        (id, company_id, employee_id, contract_type, start_date, end_date, status)
       VALUES ($1, $2, $3::uuid, $4, $5::date, $6::date, 'active')
       RETURNING id, company_id, employee_id, contract_type, start_date, end_date, status, created_at, updated_at;`,
      [randomUUID(), payload.company_id, payload.employee_id, payload.contract_type.trim(), payload.start_date, payload.end_date],
    );
    return res.rows[0];
  }

  async createInsuranceRecord(payload: CreateInsuranceRecordDto) {
    await this.ensureSchema();
    const res = await this.db.query<InsuranceRow>(
      `INSERT INTO public.employee_insurance_records
        (id, company_id, employee_id, provider, policy_number, expiry_date, status)
       VALUES ($1, $2, $3::uuid, $4, $5, $6::date, 'active')
       RETURNING id, company_id, employee_id, provider, policy_number, expiry_date, status, created_at, updated_at;`,
      [randomUUID(), payload.company_id, payload.employee_id, payload.provider.trim(), payload.policy_number.trim(), payload.expiry_date],
    );
    return res.rows[0];
  }

  async listExpiringContracts(query: ListExpiringQueryDto) {
    await this.ensureSchema();
    const days = query.days ?? 30;
    const res = await this.db.query<ContractRow>(
      `SELECT id, company_id, employee_id, contract_type, start_date, end_date, status, created_at, updated_at
       FROM public.employee_contracts
       WHERE company_id = $1
         AND end_date <= (CURRENT_DATE + ($2::text || ' days')::interval)::date
       ORDER BY end_date ASC;`,
      [query.company_id, days],
    );
    return { total: res.rows.length, days, data: res.rows };
  }

  async listContracts(query: ListContractsQueryDto) {
    await this.ensureSchema();
    const filters = ['company_id = $1'];
    const values: unknown[] = [query.company_id];
    if (query.employee_id) {
      filters.push(`employee_id = $${values.length + 1}::uuid`);
      values.push(query.employee_id);
    }
    if (query.status) {
      filters.push(`status = $${values.length + 1}`);
      values.push(query.status);
    }
    const res = await this.db.query<ContractRow>(
      `
        SELECT id, company_id, employee_id, contract_type, start_date, end_date, status, created_at, updated_at
        FROM public.employee_contracts
        WHERE ${filters.join(' AND ')}
        ORDER BY created_at DESC;
      `,
      values,
    );
    return { total: res.rows.length, data: res.rows };
  }

  async updateContract(contractId: string, payload: UpdateContractDto) {
    await this.ensureSchema();
    if (
      payload.start_date &&
      payload.end_date &&
      new Date(payload.start_date).getTime() > new Date(payload.end_date).getTime()
    ) {
      throw new ApiException('HRM-CON-001', 'start_date must be <= end_date', HttpStatus.BAD_REQUEST);
    }
    const res = await this.db.query<ContractRow>(
      `
        UPDATE public.employee_contracts
        SET contract_type = COALESCE($1, contract_type),
            start_date = COALESCE($2::date, start_date),
            end_date = COALESCE($3::date, end_date),
            status = COALESCE($4, status),
            updated_at = NOW()
        WHERE id = $5::uuid
        RETURNING id, company_id, employee_id, contract_type, start_date, end_date, status, created_at, updated_at;
      `,
      [payload.contract_type?.trim() ?? null, payload.start_date ?? null, payload.end_date ?? null, payload.status ?? null, contractId],
    );
    if (!res.rows[0]) {
      throw new ApiException('HRM-CON-404', 'Contract not found', HttpStatus.NOT_FOUND);
    }
    return res.rows[0];
  }

  async deleteContract(contractId: string) {
    await this.ensureSchema();
    const res = await this.db.query<{ id: string }>(
      `DELETE FROM public.employee_contracts WHERE id = $1::uuid RETURNING id;`,
      [contractId],
    );
    if (!res.rows[0]) {
      throw new ApiException('HRM-CON-404', 'Contract not found', HttpStatus.NOT_FOUND);
    }
    return { id: contractId };
  }

  async listExpiringInsurance(query: ListExpiringQueryDto) {
    await this.ensureSchema();
    const days = query.days ?? 30;
    const res = await this.db.query<InsuranceRow>(
      `SELECT id, company_id, employee_id, provider, policy_number, expiry_date, status, created_at, updated_at
       FROM public.employee_insurance_records
       WHERE company_id = $1
         AND expiry_date <= (CURRENT_DATE + ($2::text || ' days')::interval)::date
       ORDER BY expiry_date ASC;`,
      [query.company_id, days],
    );
    return { total: res.rows.length, days, data: res.rows };
  }
}
