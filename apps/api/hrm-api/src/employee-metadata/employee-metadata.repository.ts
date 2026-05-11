import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { HrmDbService } from '../db/hrm-db.service';

export type EmployeeMetadataChangeStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export type EmployeeMetadataValueRecord = {
  id: string;
  company_id: string;
  employee_id: string;
  legal_entity_id: string | null;
  field_key: string;
  field_value: unknown;
  source_catalog_key: string | null;
  workflow_code: string | null;
  updated_by: string | null;
  updated_at: string;
};

export type EmployeeMetadataChangeRequestRecord = {
  id: string;
  company_id: string;
  employee_id: string;
  legal_entity_id: string | null;
  field_key: string;
  current_value: unknown;
  requested_value: unknown;
  reason: string | null;
  actor_user_id: string | null;
  actor_name: string | null;
  workflow_code: string | null;
  source_catalog_key: string | null;
  status: EmployeeMetadataChangeStatus;
  decided_by: string | null;
  decided_note: string | null;
  decided_at: string | null;
  submitted_at: string;
  updated_at: string;
};

export type EmployeeMetadataAuditLogRecord = {
  id: string;
  change_request_id: string | null;
  company_id: string;
  employee_id: string;
  field_key: string;
  action: string;
  actor_user_id: string | null;
  actor_name: string | null;
  payload: unknown;
  created_at: string;
};

type ListFilters = {
  company_id: string;
  employee_id?: string;
  legal_entity_id?: string;
  status?: EmployeeMetadataChangeStatus;
  field_key?: string;
  page: number;
  page_size: number;
};

type SubmitChangeInput = {
  company_id: string;
  employee_id: string;
  legal_entity_id?: string;
  field_key: string;
  current_value: unknown;
  requested_value: unknown;
  reason?: string;
  actor_user_id?: string;
  actor_name?: string;
  workflow_code?: string;
  source_catalog_key?: string;
};

type DecisionInput = {
  actor_user_id?: string;
  actor_name?: string;
  note?: string;
};

@Injectable()
export class EmployeeMetadataRepository {
  constructor(private readonly db: HrmDbService) {}

  async ensureSchema() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.employee_metadata_values (
        id UUID PRIMARY KEY,
        company_id UUID NOT NULL,
        employee_id UUID NOT NULL,
        legal_entity_id UUID NULL,
        field_key TEXT NOT NULL,
        field_value JSONB NOT NULL,
        source_catalog_key TEXT NULL,
        workflow_code TEXT NULL,
        updated_by TEXT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_employee_metadata_values_scope
      ON public.employee_metadata_values (company_id, employee_id, field_key);
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.employee_metadata_change_requests (
        id UUID PRIMARY KEY,
        company_id UUID NOT NULL,
        employee_id UUID NOT NULL,
        legal_entity_id UUID NULL,
        field_key TEXT NOT NULL,
        current_value JSONB NULL,
        requested_value JSONB NOT NULL,
        reason TEXT NULL,
        actor_user_id TEXT NULL,
        actor_name TEXT NULL,
        workflow_code TEXT NULL,
        source_catalog_key TEXT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        decided_by TEXT NULL,
        decided_note TEXT NULL,
        decided_at TIMESTAMPTZ NULL,
        submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_employee_metadata_change_requests_status
          CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled'))
      );
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_employee_metadata_change_requests_scope
      ON public.employee_metadata_change_requests (
        company_id, status, submitted_at DESC
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.employee_metadata_audit_logs (
        id UUID PRIMARY KEY,
        change_request_id UUID NULL REFERENCES public.employee_metadata_change_requests(id) ON DELETE SET NULL,
        company_id UUID NOT NULL,
        employee_id UUID NOT NULL,
        field_key TEXT NOT NULL,
        action TEXT NOT NULL,
        actor_user_id TEXT NULL,
        actor_name TEXT NULL,
        payload JSONB NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_employee_metadata_audit_logs_scope
      ON public.employee_metadata_audit_logs (company_id, employee_id, created_at DESC);
    `);
  }

  async submitChange(input: SubmitChangeInput) {
    await this.ensureSchema();
    const res = await this.db.query<EmployeeMetadataChangeRequestRecord>(
      `
        INSERT INTO public.employee_metadata_change_requests (
          id, company_id, employee_id, legal_entity_id, field_key,
          current_value, requested_value, reason, actor_user_id, actor_name,
          workflow_code, source_catalog_key, status
        ) VALUES (
          $1, $2::uuid, $3::uuid, $4::uuid, $5,
          $6::jsonb, $7::jsonb, $8, $9, $10,
          $11, $12, 'pending'
        )
        RETURNING
          id, company_id, employee_id, legal_entity_id, field_key, current_value, requested_value,
          reason, actor_user_id, actor_name, workflow_code, source_catalog_key, status,
          decided_by, decided_note, decided_at, submitted_at, updated_at;
      `,
      [
        randomUUID(),
        input.company_id,
        input.employee_id,
        input.legal_entity_id ?? null,
        input.field_key,
        JSON.stringify(input.current_value ?? null),
        JSON.stringify(input.requested_value),
        input.reason?.trim() ?? null,
        input.actor_user_id?.trim() ?? null,
        input.actor_name?.trim() ?? null,
        input.workflow_code?.trim() ?? null,
        input.source_catalog_key?.trim() ?? null,
      ],
    );
    const created = res.rows[0];
    await this.insertAuditLog({
      change_request_id: created.id,
      company_id: created.company_id,
      employee_id: created.employee_id,
      field_key: created.field_key,
      action: 'submitted',
      actor_user_id: created.actor_user_id ?? null,
      actor_name: created.actor_name ?? null,
      payload: {
        current_value: created.current_value,
        requested_value: created.requested_value,
        workflow_code: created.workflow_code,
      },
    });
    return created;
  }

  async listChangeRequests(filters: ListFilters) {
    await this.ensureSchema();
    const clauses = ['company_id = $1::uuid'];
    const values: unknown[] = [filters.company_id];
    let idx = 2;

    if (filters.employee_id) {
      clauses.push(`employee_id = $${idx}::uuid`);
      values.push(filters.employee_id);
      idx += 1;
    }
    if (filters.legal_entity_id) {
      clauses.push(`legal_entity_id = $${idx}::uuid`);
      values.push(filters.legal_entity_id);
      idx += 1;
    }
    if (filters.status) {
      clauses.push(`status = $${idx}`);
      values.push(filters.status);
      idx += 1;
    }
    if (filters.field_key) {
      clauses.push(`field_key = $${idx}`);
      values.push(filters.field_key);
      idx += 1;
    }

    const whereClause = clauses.join(' AND ');
    const offset = (filters.page - 1) * filters.page_size;
    const countRes = await this.db.query<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM public.employee_metadata_change_requests WHERE ${whereClause};`,
      values,
    );
    const dataRes = await this.db.query<EmployeeMetadataChangeRequestRecord>(
      `
        SELECT
          id, company_id, employee_id, legal_entity_id, field_key, current_value, requested_value,
          reason, actor_user_id, actor_name, workflow_code, source_catalog_key, status,
          decided_by, decided_note, decided_at, submitted_at, updated_at
        FROM public.employee_metadata_change_requests
        WHERE ${whereClause}
        ORDER BY submitted_at DESC
        LIMIT $${idx} OFFSET $${idx + 1};
      `,
      [...values, filters.page_size, offset],
    );
    return {
      total: Number(countRes.rows[0]?.total ?? 0),
      page: filters.page,
      page_size: filters.page_size,
      data: dataRes.rows,
    };
  }

  async getChangeRequestById(changeRequestId: string) {
    await this.ensureSchema();
    const res = await this.db.query<EmployeeMetadataChangeRequestRecord>(
      `
        SELECT
          id, company_id, employee_id, legal_entity_id, field_key, current_value, requested_value,
          reason, actor_user_id, actor_name, workflow_code, source_catalog_key, status,
          decided_by, decided_note, decided_at, submitted_at, updated_at
        FROM public.employee_metadata_change_requests
        WHERE id = $1::uuid
      `,
      [changeRequestId],
    );
    return res.rows[0] ?? null;
  }

  async upsertMetadataValue(request: EmployeeMetadataChangeRequestRecord, decision: DecisionInput) {
    const res = await this.db.query<EmployeeMetadataValueRecord>(
      `
        INSERT INTO public.employee_metadata_values (
          id, company_id, employee_id, legal_entity_id, field_key, field_value,
          source_catalog_key, workflow_code, updated_by, updated_at
        ) VALUES (
          $1, $2::uuid, $3::uuid, $4::uuid, $5, $6::jsonb,
          $7, $8, $9, NOW()
        )
        ON CONFLICT (company_id, employee_id, field_key)
        DO UPDATE SET
          legal_entity_id = EXCLUDED.legal_entity_id,
          field_value = EXCLUDED.field_value,
          source_catalog_key = EXCLUDED.source_catalog_key,
          workflow_code = EXCLUDED.workflow_code,
          updated_by = EXCLUDED.updated_by,
          updated_at = NOW()
        RETURNING
          id, company_id, employee_id, legal_entity_id, field_key, field_value,
          source_catalog_key, workflow_code, updated_by, updated_at;
      `,
      [
        randomUUID(),
        request.company_id,
        request.employee_id,
        request.legal_entity_id,
        request.field_key,
        JSON.stringify(request.requested_value),
        request.source_catalog_key,
        request.workflow_code,
        decision.actor_user_id?.trim() ?? decision.actor_name?.trim() ?? 'hrm-api',
      ],
    );
    return res.rows[0];
  }

  async approveChangeRequest(changeRequestId: string, decision: DecisionInput) {
    const current = await this.getChangeRequestById(changeRequestId);
    if (!current) {
      return null;
    }
    const updatedRes = await this.db.query<EmployeeMetadataChangeRequestRecord>(
      `
        UPDATE public.employee_metadata_change_requests
        SET status = 'approved',
            decided_by = $1,
            decided_note = $2,
            decided_at = NOW(),
            updated_at = NOW()
        WHERE id = $3::uuid
          AND status = 'pending'
        RETURNING
          id, company_id, employee_id, legal_entity_id, field_key, current_value, requested_value,
          reason, actor_user_id, actor_name, workflow_code, source_catalog_key, status,
          decided_by, decided_note, decided_at, submitted_at, updated_at;
      `,
      [
        decision.actor_user_id?.trim() ?? decision.actor_name?.trim() ?? 'hrm-api',
        decision.note?.trim() ?? null,
        changeRequestId,
      ],
    );
    const approved = updatedRes.rows[0];
    if (!approved) {
      return current;
    }
    const value = await this.upsertMetadataValue(approved, decision);
    await this.insertAuditLog({
      change_request_id: approved.id,
      company_id: approved.company_id,
      employee_id: approved.employee_id,
      field_key: approved.field_key,
      action: 'approved',
      actor_user_id: decision.actor_user_id ?? null,
      actor_name: decision.actor_name ?? null,
      payload: {
        decided_note: decision.note ?? null,
        requested_value: approved.requested_value,
        materialized_value_id: value.id,
      },
    });
    return approved;
  }

  async rejectChangeRequest(changeRequestId: string, decision: DecisionInput) {
    const res = await this.db.query<EmployeeMetadataChangeRequestRecord>(
      `
        UPDATE public.employee_metadata_change_requests
        SET status = 'rejected',
            decided_by = $1,
            decided_note = $2,
            decided_at = NOW(),
            updated_at = NOW()
        WHERE id = $3::uuid
          AND status = 'pending'
        RETURNING
          id, company_id, employee_id, legal_entity_id, field_key, current_value, requested_value,
          reason, actor_user_id, actor_name, workflow_code, source_catalog_key, status,
          decided_by, decided_note, decided_at, submitted_at, updated_at;
      `,
      [
        decision.actor_user_id?.trim() ?? decision.actor_name?.trim() ?? 'hrm-api',
        decision.note?.trim() ?? null,
        changeRequestId,
      ],
    );
    const rejected = res.rows[0];
    if (!rejected) {
      return null;
    }
    await this.insertAuditLog({
      change_request_id: rejected.id,
      company_id: rejected.company_id,
      employee_id: rejected.employee_id,
      field_key: rejected.field_key,
      action: 'rejected',
      actor_user_id: decision.actor_user_id ?? null,
      actor_name: decision.actor_name ?? null,
      payload: {
        decided_note: decision.note ?? null,
        requested_value: rejected.requested_value,
      },
    });
    return rejected;
  }

  async listAuditLogs(companyId: string, employeeId?: string) {
    await this.ensureSchema();
    const clauses = ['company_id = $1::uuid'];
    const values: unknown[] = [companyId];
    if (employeeId) {
      clauses.push('employee_id = $2::uuid');
      values.push(employeeId);
    }
    const res = await this.db.query<EmployeeMetadataAuditLogRecord>(
      `
        SELECT
          id, change_request_id, company_id, employee_id, field_key, action,
          actor_user_id, actor_name, payload, created_at
        FROM public.employee_metadata_audit_logs
        WHERE ${clauses.join(' AND ')}
        ORDER BY created_at DESC
      `,
      values,
    );
    return res.rows;
  }

  private async insertAuditLog(input: {
    change_request_id: string | null;
    company_id: string;
    employee_id: string;
    field_key: string;
    action: string;
    actor_user_id: string | null;
    actor_name: string | null;
    payload: unknown;
  }) {
    await this.db.query(
      `
        INSERT INTO public.employee_metadata_audit_logs (
          id, change_request_id, company_id, employee_id, field_key,
          action, actor_user_id, actor_name, payload
        ) VALUES (
          $1, $2::uuid, $3::uuid, $4::uuid, $5,
          $6, $7, $8, $9::jsonb
        );
      `,
      [
        randomUUID(),
        input.change_request_id,
        input.company_id,
        input.employee_id,
        input.field_key,
        input.action,
        input.actor_user_id,
        input.actor_name,
        JSON.stringify(input.payload ?? null),
      ],
    );
  }
}
