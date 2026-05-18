import { Injectable, OnModuleInit } from '@nestjs/common';
import { XbosDbService } from '../db/xbos-db.service';

/** Ensures PostgreSQL tables for meeting-foundation waves (org, RBAC, workflow, asset request). */
@Injectable()
export class FoundationSchemaService implements OnModuleInit {
  constructor(private readonly db: XbosDbService) {}

  async onModuleInit() {
    await this.ensureAll();
  }

  async ensureAll() {
    await this.db.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.xbos_legal_entity (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id TEXT NOT NULL,
        company_id TEXT NOT NULL,
        code TEXT NOT NULL,
        name TEXT NOT NULL,
        entity_type TEXT NOT NULL DEFAULT 'subsidiary',
        tax_code TEXT,
        established_at DATE,
        address TEXT,
        business_lines TEXT,
        charter_capital NUMERIC,
        legal_representative TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        payload JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, company_id, code)
      );
    `);

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.xbos_org_unit (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id TEXT NOT NULL,
        company_id TEXT NOT NULL,
        parent_id UUID REFERENCES public.xbos_org_unit(id) ON DELETE SET NULL,
        legal_entity_id UUID REFERENCES public.xbos_legal_entity(id) ON DELETE SET NULL,
        org_type TEXT NOT NULL,
        code TEXT NOT NULL,
        name TEXT NOT NULL,
        sort_order INT NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'active',
        payload JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, company_id, code)
      );
    `);

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.xbos_position_template (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id TEXT NOT NULL,
        code TEXT NOT NULL,
        name TEXT NOT NULL,
        level_scope TEXT NOT NULL DEFAULT 'group',
        org_type_hint TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        payload JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, code)
      );
    `);

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.xbos_job_description (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        position_template_id UUID NOT NULL REFERENCES public.xbos_position_template(id) ON DELETE CASCADE,
        version INT NOT NULL DEFAULT 1,
        regular_tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
        ad_hoc_tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
        content TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (position_template_id, version)
      );
    `);

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.xbos_permission_definition (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id TEXT NOT NULL,
        permission_code TEXT NOT NULL,
        name TEXT NOT NULL,
        scope_level TEXT NOT NULL DEFAULT 'subsidiary',
        description TEXT,
        workflow_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, permission_code)
      );
    `);

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.xbos_position_assignment (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id TEXT NOT NULL,
        company_id TEXT NOT NULL,
        position_template_id UUID NOT NULL REFERENCES public.xbos_position_template(id),
        org_unit_id UUID REFERENCES public.xbos_org_unit(id) ON DELETE SET NULL,
        user_id TEXT,
        employee_id TEXT,
        valid_from DATE,
        valid_to DATE,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.xbos_permission_grant (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id TEXT NOT NULL,
        company_id TEXT NOT NULL,
        permission_id UUID NOT NULL REFERENCES public.xbos_permission_definition(id),
        assignment_id UUID REFERENCES public.xbos_position_assignment(id) ON DELETE CASCADE,
        valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        valid_to TIMESTAMPTZ,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.xbos_workflow_definition (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id TEXT NOT NULL,
        workflow_code TEXT NOT NULL,
        name TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'general',
        scope_level TEXT NOT NULL DEFAULT 'group',
        company_id TEXT,
        version INT NOT NULL DEFAULT 1,
        graph JSONB NOT NULL DEFAULT '{}'::jsonb,
        conditions JSONB NOT NULL DEFAULT '{}'::jsonb,
        status TEXT NOT NULL DEFAULT 'draft',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, workflow_code, version)
      );
    `);

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.xbos_workflow_instance (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id TEXT NOT NULL,
        company_id TEXT NOT NULL,
        definition_id UUID NOT NULL REFERENCES public.xbos_workflow_definition(id),
        business_type TEXT NOT NULL,
        business_id TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        context JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.xbos_workflow_step_task (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        instance_id UUID NOT NULL REFERENCES public.xbos_workflow_instance(id) ON DELETE CASCADE,
        step_key TEXT NOT NULL,
        hat_key TEXT NOT NULL,
        assignee_user_id TEXT,
        assignment_id UUID REFERENCES public.xbos_position_assignment(id),
        status TEXT NOT NULL DEFAULT 'pending',
        due_at TIMESTAMPTZ,
        completed_at TIMESTAMPTZ,
        payload JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.xbos_reporting_route (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id TEXT NOT NULL,
        company_id TEXT NOT NULL,
        report_level TEXT NOT NULL,
        recipient_user_id TEXT,
        recipient_assignment_id UUID,
        workflow_category TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.xbos_asset_request (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id TEXT NOT NULL,
        company_id TEXT NOT NULL,
        asset_id UUID,
        request_code TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending_finance',
        requested_by TEXT NOT NULL,
        payload JSONB NOT NULL DEFAULT '{}'::jsonb,
        finance_confirmed_by TEXT,
        finance_confirmed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, company_id, request_code)
      );
    `);

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.xbos_tenant_registry (
        tenant_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        short_name TEXT NOT NULL,
        tenant_kind TEXT NOT NULL DEFAULT 'member',
        default_company_id TEXT NOT NULL DEFAULT 'main',
        modules JSONB NOT NULL DEFAULT '[]'::jsonb,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.xbos_user_tenant_membership (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        tenant_id TEXT NOT NULL REFERENCES public.xbos_tenant_registry(tenant_id) ON DELETE CASCADE,
        role_code TEXT NOT NULL,
        is_default BOOLEAN NOT NULL DEFAULT false,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (user_id, tenant_id)
      );
    `);

    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_xbos_user_tenant_membership_user ON public.xbos_user_tenant_membership (user_id, status);
    `);

    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_xbos_org_unit_parent ON public.xbos_org_unit (tenant_id, company_id, parent_id);
      CREATE INDEX IF NOT EXISTS idx_xbos_permission_grant_perm ON public.xbos_permission_grant (permission_id, status);
      CREATE INDEX IF NOT EXISTS idx_xbos_wf_instance_biz ON public.xbos_workflow_instance (tenant_id, company_id, business_type, business_id);
    `);

    await this.ensureRaciGovernanceTables();
  }

  private async ensureRaciGovernanceTables() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.raci_catalog_version (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id TEXT NOT NULL,
        version_label TEXT NOT NULL,
        source_ref TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, version_label)
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.raci_activity_catalog (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id TEXT NOT NULL,
        catalog_version_id UUID NOT NULL REFERENCES public.raci_catalog_version(id) ON DELETE CASCADE,
        activity_code TEXT NOT NULL,
        domain_code TEXT NOT NULL,
        domain_label TEXT NOT NULL,
        seq_no INT NOT NULL DEFAULT 0,
        name TEXT NOT NULL,
        default_matrix JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, catalog_version_id, activity_code)
      );
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_raci_activity_domain
        ON public.raci_activity_catalog (tenant_id, domain_code);
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.raci_ecosystem_capability (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id TEXT NOT NULL,
        activity_id UUID NOT NULL REFERENCES public.raci_activity_catalog(id) ON DELETE CASCADE,
        module_code TEXT NOT NULL,
        feature_code TEXT NOT NULL,
        permission_code TEXT,
        workflow_id TEXT,
        api_route TEXT,
        raci_letter_required TEXT NOT NULL DEFAULT '*',
        status TEXT NOT NULL DEFAULT 'active',
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, activity_id, module_code, feature_code)
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.company_raci_matrix_cell (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id TEXT NOT NULL,
        company_id TEXT NOT NULL,
        activity_id UUID NOT NULL REFERENCES public.raci_activity_catalog(id) ON DELETE CASCADE,
        org_column_id TEXT NOT NULL,
        raci_letters TEXT NOT NULL DEFAULT '',
        source TEXT NOT NULL DEFAULT 'company_override',
        updated_by TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, company_id, activity_id, org_column_id)
      );
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_company_raci_matrix_company
        ON public.company_raci_matrix_cell (tenant_id, company_id);
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.company_raci_column_binding (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id TEXT NOT NULL,
        company_id TEXT NOT NULL,
        org_column_id TEXT NOT NULL,
        position_template_id UUID,
        org_unit_id UUID,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, company_id, org_column_id)
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.xbos_legal_entity_shareholder (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id TEXT NOT NULL,
        company_id TEXT NOT NULL,
        legal_entity_id UUID NOT NULL REFERENCES public.xbos_legal_entity(id) ON DELETE CASCADE,
        holder_name TEXT NOT NULL,
        identity_code TEXT,
        ratio_percent NUMERIC(5, 2) DEFAULT 0,
        contributed_value NUMERIC(18, 2) DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.xbos_legal_entity_document (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id TEXT NOT NULL,
        company_id TEXT NOT NULL,
        legal_entity_id UUID NOT NULL REFERENCES public.xbos_legal_entity(id) ON DELETE CASCADE,
        document_code TEXT,
        document_name TEXT NOT NULL,
        issued_date DATE,
        expired_date DATE,
        file_url TEXT,
        storage_path TEXT,
        mime_type TEXT,
        file_size BIGINT,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.xbos_cc_permission_matrix_cell (
        tenant_id TEXT NOT NULL,
        role_id TEXT NOT NULL,
        row_id TEXT NOT NULL,
        view BOOLEAN NOT NULL DEFAULT FALSE,
        write BOOLEAN NOT NULL DEFAULT FALSE,
        delete BOOLEAN NOT NULL DEFAULT FALSE,
        approve BOOLEAN NOT NULL DEFAULT FALSE,
        data_scope TEXT NOT NULL DEFAULT 'personal',
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (tenant_id, role_id, row_id)
      );
    `);

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.raci_matrix_audit_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id TEXT NOT NULL,
        company_id TEXT NOT NULL,
        activity_id UUID NOT NULL,
        org_column_id TEXT NOT NULL,
        old_letters TEXT,
        new_letters TEXT,
        actor_id TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  }
}
