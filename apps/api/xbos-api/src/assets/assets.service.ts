import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { XbosDbService } from '../db/xbos-db.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { ListAssetsQueryDto } from './dto/list-assets.query.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { AssetOwnerModule } from './dto/asset-common.dto';

interface AssetRow {
  asset_id: string;
  tenant_id: string;
  company_id: string;
  asset_code: string;
  asset_name: string;
  asset_type: string;
  vin: string | null;
  chassis_no: string | null;
  status: string;
  owner_module: AssetOwnerModule;
  metadata: Record<string, unknown>;
  version: number;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

type OwnershipField =
  | 'assetCode'
  | 'assetName'
  | 'assetType'
  | 'vin'
  | 'chassisNo'
  | 'status'
  | 'ownerModule'
  | 'metadata'
  | 'financialProfile';

type ConflictField = 'assetCode' | 'vin' | 'chassisNo';

const fieldOwnershipMatrix: Record<OwnershipField, AssetOwnerModule[]> = {
  assetCode: ['hrm-admin', 'operations'],
  assetName: ['hrm-admin', 'operations'],
  assetType: ['hrm-admin', 'operations'],
  vin: ['operations'],
  chassisNo: ['operations'],
  status: ['operations'],
  ownerModule: ['hrm-admin'],
  metadata: ['hrm-admin', 'operations', 'finance-tax'],
  financialProfile: ['finance-tax'],
};

@Injectable()
export class AssetsService {
  constructor(private readonly db: XbosDbService) {}

  private readonly uniqueConstraintFieldMap: Record<string, ConflictField[]> = {
    asset_registry_tenant_id_company_id_asset_code_key: ['assetCode'],
    uq_asset_registry_tenant_company_vin: ['vin'],
    uq_asset_registry_tenant_company_chassis: ['chassisNo'],
  };

  private async ensureSchema() {
    await this.db.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.asset_registry (
        id BIGSERIAL PRIMARY KEY,
        asset_id UUID NOT NULL DEFAULT gen_random_uuid(),
        tenant_id TEXT NOT NULL,
        company_id TEXT NOT NULL,
        asset_code TEXT NOT NULL,
        asset_name TEXT NOT NULL,
        asset_type TEXT NOT NULL,
        vin TEXT NULL,
        chassis_no TEXT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        owner_module TEXT NOT NULL,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        version INT NOT NULL DEFAULT 1,
        created_by TEXT NOT NULL DEFAULT 'system',
        updated_by TEXT NOT NULL DEFAULT 'system',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (asset_id),
        UNIQUE (tenant_id, company_id, asset_code)
      );
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_asset_registry_tenant_company_vin
      ON public.asset_registry (tenant_id, company_id, vin)
      WHERE vin IS NOT NULL;
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_asset_registry_tenant_company_chassis
      ON public.asset_registry (tenant_id, company_id, chassis_no)
      WHERE chassis_no IS NOT NULL;
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.asset_ownership_map (
        id BIGSERIAL PRIMARY KEY,
        asset_id UUID NOT NULL REFERENCES public.asset_registry(asset_id) ON DELETE CASCADE,
        field_key TEXT NOT NULL,
        owner_module TEXT NOT NULL,
        mutable BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (asset_id, field_key)
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.asset_financial_profile (
        id BIGSERIAL PRIMARY KEY,
        asset_id UUID NOT NULL REFERENCES public.asset_registry(asset_id) ON DELETE CASCADE,
        depreciation_method TEXT NOT NULL DEFAULT 'straight_line',
        useful_life_months INT NULL,
        acquisition_cost NUMERIC(18, 2) NULL,
        residual_value NUMERIC(18, 2) NULL,
        monthly_loan_interest NUMERIC(18, 2) NULL,
        monthly_principal_payment NUMERIC(18, 2) NULL,
        currency_code CHAR(3) NOT NULL DEFAULT 'VND',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (asset_id)
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.asset_lifecycle_audit (
        id BIGSERIAL PRIMARY KEY,
        asset_id UUID NOT NULL REFERENCES public.asset_registry(asset_id) ON DELETE CASCADE,
        tenant_id TEXT NOT NULL,
        company_id TEXT NOT NULL,
        action TEXT NOT NULL,
        actor_module TEXT NOT NULL,
        actor_id TEXT NOT NULL DEFAULT 'system',
        request_id TEXT NULL,
        before_payload JSONB NULL,
        after_payload JSONB NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  }

  private validateOwnership(moduleCode: AssetOwnerModule, fields: OwnershipField[]) {
    for (const field of fields) {
      if (!fieldOwnershipMatrix[field].includes(moduleCode)) {
        throw new ApiException(
          'ASSET-OWN-001',
          `Module '${moduleCode}' cannot update field '${field}'`,
          HttpStatus.FORBIDDEN,
          { field, moduleCode },
        );
      }
    }
  }

  private normalizeRow(row: AssetRow) {
    return {
      assetId: row.asset_id,
      tenantId: row.tenant_id,
      companyId: row.company_id,
      assetCode: row.asset_code,
      assetName: row.asset_name,
      assetType: row.asset_type,
      vin: row.vin,
      chassisNo: row.chassis_no,
      status: row.status,
      ownerModule: row.owner_module,
      metadata: row.metadata,
      version: row.version,
      createdBy: row.created_by,
      updatedBy: row.updated_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private async writeAudit(
    assetId: string,
    tenantId: string,
    companyId: string,
    action: 'create' | 'update',
    actorModule: AssetOwnerModule,
    actorId: string,
    requestId: string | undefined,
    beforePayload: unknown,
    afterPayload: unknown,
  ) {
    await this.db.query(
      `
      INSERT INTO public.asset_lifecycle_audit (
        asset_id, tenant_id, company_id, action, actor_module, actor_id, request_id, before_payload, after_payload
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb)
    `,
      [
        assetId,
        tenantId,
        companyId,
        action,
        actorModule,
        actorId,
        requestId ?? null,
        beforePayload ? JSON.stringify(beforePayload) : null,
        afterPayload ? JSON.stringify(afterPayload) : null,
      ],
    );
  }

  private async upsertOwnershipMap(assetId: string) {
    for (const [fieldKey, owners] of Object.entries(fieldOwnershipMatrix)) {
      await this.db.query(
        `
        INSERT INTO public.asset_ownership_map (asset_id, field_key, owner_module, mutable, updated_at)
        VALUES ($1, $2, $3, TRUE, NOW())
        ON CONFLICT (asset_id, field_key) DO UPDATE SET owner_module = EXCLUDED.owner_module, updated_at = NOW()
      `,
        [assetId, fieldKey, owners[0]],
      );
    }
  }

  private resolveConflictFields(constraint?: string, detail?: string): ConflictField[] {
    if (constraint && this.uniqueConstraintFieldMap[constraint]) {
      return this.uniqueConstraintFieldMap[constraint];
    }
    if (!detail) return [];
    const keyMatch = detail.match(/Key \(([^)]+)\)=\(([^)]+)\)/i);
    if (!keyMatch?.[1]) return [];
    const columns = keyMatch[1]
      .split(',')
      .map((column) => column.trim().toLowerCase())
      .filter(Boolean);

    const fields: ConflictField[] = [];
    if (columns.includes('asset_code')) fields.push('assetCode');
    if (columns.includes('vin')) fields.push('vin');
    if (columns.includes('chassis_no')) fields.push('chassisNo');
    return fields;
  }

  async createAsset(dto: CreateAssetDto, moduleCode: AssetOwnerModule) {
    await this.ensureSchema();
    this.validateOwnership(moduleCode, ['assetCode', 'assetName', 'assetType', 'metadata']);
    if (dto.ownerModule !== moduleCode && moduleCode !== 'hrm-admin') {
      throw new ApiException(
        'ASSET-OWN-003',
        `Module '${moduleCode}' cannot assign owner module '${dto.ownerModule}'`,
        HttpStatus.FORBIDDEN,
      );
    }
    if (dto.vin) this.validateOwnership(moduleCode, ['vin']);
    if (dto.chassisNo) this.validateOwnership(moduleCode, ['chassisNo']);
    if (dto.financialProfile) this.validateOwnership(moduleCode, ['financialProfile']);

    const actorId = dto.actorId?.trim() || 'system';
    let insertResult: { rows: AssetRow[] };
    try {
      insertResult = await this.db.query<AssetRow>(
        `
        INSERT INTO public.asset_registry (
          tenant_id, company_id, asset_code, asset_name, asset_type, vin, chassis_no, status, owner_module, metadata, created_by, updated_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11, $11)
        RETURNING *
      `,
        [
          dto.tenantId,
          dto.companyId,
          dto.assetCode.trim(),
          dto.assetName.trim(),
          dto.assetType.trim(),
          dto.vin?.trim() ?? null,
          dto.chassisNo?.trim() ?? null,
          dto.status?.trim() ?? 'active',
          dto.ownerModule,
          JSON.stringify(dto.metadata ?? {}),
          actorId,
        ],
      );
    } catch (error) {
      const pgError = error as { code?: string; constraint?: string; detail?: string };
      if (pgError?.code === '23505') {
        const conflictFields = this.resolveConflictFields(pgError.constraint, pgError.detail);
        throw new ApiException(
          'ASSET-REG-409',
          'Asset identity already exists in tenant/company scope',
          HttpStatus.CONFLICT,
          {
            conflictFields,
            scope: { tenantId: dto.tenantId, companyId: dto.companyId },
            constraint: pgError.constraint ?? null,
          },
        );
      }
      throw error;
    }
    const created = insertResult.rows[0];
    if (!created) {
      throw new ApiException('ASSET-REG-500', 'Asset create failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    await this.upsertOwnershipMap(created.asset_id);

    if (dto.financialProfile) {
      await this.db.query(
        `
        INSERT INTO public.asset_financial_profile (
          asset_id, depreciation_method, useful_life_months, acquisition_cost, residual_value,
          monthly_loan_interest, monthly_principal_payment, currency_code
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (asset_id) DO UPDATE SET
          depreciation_method = EXCLUDED.depreciation_method,
          useful_life_months = EXCLUDED.useful_life_months,
          acquisition_cost = EXCLUDED.acquisition_cost,
          residual_value = EXCLUDED.residual_value,
          monthly_loan_interest = EXCLUDED.monthly_loan_interest,
          monthly_principal_payment = EXCLUDED.monthly_principal_payment,
          currency_code = EXCLUDED.currency_code,
          updated_at = NOW()
      `,
        [
          created.asset_id,
          dto.financialProfile.depreciationMethod ?? 'straight_line',
          dto.financialProfile.usefulLifeMonths ?? null,
          dto.financialProfile.acquisitionCost ?? null,
          dto.financialProfile.residualValue ?? null,
          dto.financialProfile.monthlyLoanInterest ?? null,
          dto.financialProfile.monthlyPrincipalPayment ?? null,
          dto.financialProfile.currencyCode ?? 'VND',
        ],
      );
    }

    const normalizedCreated = this.normalizeRow(created);
    await this.writeAudit(
      created.asset_id,
      created.tenant_id,
      created.company_id,
      'create',
      moduleCode,
      actorId,
      dto.requestId,
      null,
      normalizedCreated,
    );
    return normalizedCreated;
  }

  async listAssets(query: ListAssetsQueryDto) {
    await this.ensureSchema();
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const offset = (page - 1) * limit;
    const searchValue = query.q?.trim() ?? '';

    const listResult = await this.db.query<AssetRow>(
      `
      SELECT *
      FROM public.asset_registry
      WHERE tenant_id = $1
        AND company_id = $2
        AND ($3::text IS NULL OR owner_module = $3)
        AND ($4::text IS NULL OR status = $4)
        AND (
          $5::text = ''
          OR asset_code ILIKE '%' || $5 || '%'
          OR asset_name ILIKE '%' || $5 || '%'
          OR COALESCE(vin, '') ILIKE '%' || $5 || '%'
          OR COALESCE(chassis_no, '') ILIKE '%' || $5 || '%'
        )
      ORDER BY updated_at DESC
      LIMIT $6 OFFSET $7
    `,
      [query.tenantId, query.companyId, query.ownerModule ?? null, query.status ?? null, searchValue, limit, offset],
    );
    const countResult = await this.db.query<{ total: string }>(
      `
      SELECT COUNT(*)::text AS total
      FROM public.asset_registry
      WHERE tenant_id = $1
        AND company_id = $2
        AND ($3::text IS NULL OR owner_module = $3)
        AND ($4::text IS NULL OR status = $4)
        AND (
          $5::text = ''
          OR asset_code ILIKE '%' || $5 || '%'
          OR asset_name ILIKE '%' || $5 || '%'
          OR COALESCE(vin, '') ILIKE '%' || $5 || '%'
          OR COALESCE(chassis_no, '') ILIKE '%' || $5 || '%'
        )
    `,
      [query.tenantId, query.companyId, query.ownerModule ?? null, query.status ?? null, searchValue],
    );

    return {
      page,
      limit,
      total: Number(countResult.rows[0]?.total ?? '0'),
      data: listResult.rows.map((row) => this.normalizeRow(row)),
    };
  }

  async getAssetById(assetId: string, tenantId: string, companyId: string) {
    await this.ensureSchema();
    const result = await this.db.query<AssetRow>(
      `
      SELECT *
      FROM public.asset_registry
      WHERE asset_id = $1 AND tenant_id = $2 AND company_id = $3
    `,
      [assetId, tenantId, companyId],
    );
    const found = result.rows[0];
    if (!found) {
      throw new ApiException('ASSET-REG-404', `Asset '${assetId}' not found`, HttpStatus.NOT_FOUND);
    }
    return this.normalizeRow(found);
  }

  async updateAsset(
    assetId: string,
    tenantId: string,
    companyId: string,
    dto: UpdateAssetDto,
    moduleCode: AssetOwnerModule,
  ) {
    await this.ensureSchema();
    const foundResult = await this.db.query<AssetRow>(
      `
      SELECT *
      FROM public.asset_registry
      WHERE asset_id = $1 AND tenant_id = $2 AND company_id = $3
    `,
      [assetId, tenantId, companyId],
    );
    const found = foundResult.rows[0];
    if (!found) {
      throw new ApiException('ASSET-REG-404', `Asset '${assetId}' not found`, HttpStatus.NOT_FOUND);
    }

    const changedFields = (Object.keys(dto) as Array<keyof UpdateAssetDto>).filter((key) => dto[key] !== undefined);
    if (changedFields.length === 0) {
      throw new ApiException('ASSET-REG-400', 'No update field provided', HttpStatus.BAD_REQUEST);
    }
    const ownershipFields = changedFields.filter((field): field is OwnershipField =>
      ['assetCode', 'assetName', 'assetType', 'vin', 'chassisNo', 'status', 'ownerModule', 'metadata', 'financialProfile'].includes(
        field,
      ),
    );
    this.validateOwnership(moduleCode, ownershipFields);

    const actorId = dto.actorId?.trim() || 'system';
    const sqlFields: string[] = [];
    const values: unknown[] = [];
    const pushField = (column: string, value: unknown) => {
      values.push(value);
      sqlFields.push(`${column} = $${values.length}`);
    };

    if (dto.assetCode !== undefined) pushField('asset_code', dto.assetCode.trim());
    if (dto.assetName !== undefined) pushField('asset_name', dto.assetName.trim());
    if (dto.assetType !== undefined) pushField('asset_type', dto.assetType.trim());
    if (dto.vin !== undefined) pushField('vin', dto.vin.trim());
    if (dto.chassisNo !== undefined) pushField('chassis_no', dto.chassisNo.trim());
    if (dto.status !== undefined) pushField('status', dto.status.trim());
    if (dto.ownerModule !== undefined) pushField('owner_module', dto.ownerModule);
    if (dto.metadata !== undefined) pushField('metadata', JSON.stringify(dto.metadata));

    pushField('version', found.version + 1);
    pushField('updated_by', actorId);
    sqlFields.push('updated_at = NOW()');

    values.push(assetId, tenantId, companyId);
    const updatedResult = await this.db.query<AssetRow>(
      `
      UPDATE public.asset_registry
      SET ${sqlFields.join(', ')}
      WHERE asset_id = $${values.length - 2} AND tenant_id = $${values.length - 1} AND company_id = $${values.length}
      RETURNING *
    `,
      values,
    );
    const updated = updatedResult.rows[0];
    if (!updated) {
      throw new ApiException('ASSET-REG-409', 'Asset update conflict', HttpStatus.CONFLICT);
    }

    if (dto.financialProfile) {
      await this.db.query(
        `
        INSERT INTO public.asset_financial_profile (
          asset_id, depreciation_method, useful_life_months, acquisition_cost, residual_value,
          monthly_loan_interest, monthly_principal_payment, currency_code
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (asset_id) DO UPDATE SET
          depreciation_method = COALESCE(EXCLUDED.depreciation_method, public.asset_financial_profile.depreciation_method),
          useful_life_months = COALESCE(EXCLUDED.useful_life_months, public.asset_financial_profile.useful_life_months),
          acquisition_cost = COALESCE(EXCLUDED.acquisition_cost, public.asset_financial_profile.acquisition_cost),
          residual_value = COALESCE(EXCLUDED.residual_value, public.asset_financial_profile.residual_value),
          monthly_loan_interest = COALESCE(EXCLUDED.monthly_loan_interest, public.asset_financial_profile.monthly_loan_interest),
          monthly_principal_payment = COALESCE(EXCLUDED.monthly_principal_payment, public.asset_financial_profile.monthly_principal_payment),
          currency_code = COALESCE(EXCLUDED.currency_code, public.asset_financial_profile.currency_code),
          updated_at = NOW()
      `,
        [
          assetId,
          dto.financialProfile.depreciationMethod ?? null,
          dto.financialProfile.usefulLifeMonths ?? null,
          dto.financialProfile.acquisitionCost ?? null,
          dto.financialProfile.residualValue ?? null,
          dto.financialProfile.monthlyLoanInterest ?? null,
          dto.financialProfile.monthlyPrincipalPayment ?? null,
          dto.financialProfile.currencyCode ?? null,
        ],
      );
    }

    const beforePayload = this.normalizeRow(found);
    const afterPayload = this.normalizeRow(updated);
    await this.writeAudit(
      assetId,
      tenantId,
      companyId,
      'update',
      moduleCode,
      actorId,
      dto.requestId,
      beforePayload,
      afterPayload,
    );

    return afterPayload;
  }
}
