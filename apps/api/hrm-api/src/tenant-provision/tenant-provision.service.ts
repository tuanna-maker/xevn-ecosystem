/**
 * @CODE-MEMORY WorkItem: HRM-TENANT-PROVISION-LISTENER-01
 * solid_convention_ack: true
 * be_boundary: true
 *
 * Screen:     N/A — cross-service event listener
 * UC:         TENANT_PROVISIONED event from XBOS PlatformAuditService
 * Purpose:    Subscribe xbos.tenant BullMQ queue, seed default HRM settings for new tenant.
 * Tables:     hrm_leave_type · hrm_insurance_rate · hrm_minimum_wage_region
 * Idempotent: INSERT ... ON CONFLICT DO NOTHING (safe on BullMQ retry)
 * Coded:      2026-08-15
 * must_keep:  no cross-DB query; tenant_id from payload only; BULLMQ_ENABLED gate
 */
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Worker, type ConnectionOptions } from 'bullmq';
import { HrmDbService, HrmDbQueryFn } from '../db/hrm-db.service';
import {
  MASTER_REC_SOURCES,
  MASTER_REC_STAGES,
  MASTER_REC_INTERVIEW_TYPES,
  MASTER_REC_REJECT_REASONS,
  MASTER_REC_HEALTH_REQS,
} from './recruitment-provision.constants';

export interface TenantProvisionedPayload {
  eventType: 'TENANT_PROVISIONED';
  tenantId: string;
  defaultCompanyId: string;
  modules: ('hrm' | 'logistics')[];
  activatedAt: string; // ISO 8601
  issuedBy: string;
  adminEmail?: string;
}

/** 8 loại nghỉ theo BLLĐ 2019 */
const LABOR_LAW_LEAVE_TYPES: ReadonlyArray<{
  code: string;
  name: string;
  defaultDays: number;
  isPaid: boolean;
  payRate: number;
}> = [
  {
    code: 'ANNUAL',
    name: 'Nghỉ phép năm',
    defaultDays: 12,
    isPaid: true,
    payRate: 100,
  },
  {
    code: 'SICK',
    name: 'Nghỉ ốm đau',
    defaultDays: 30,
    isPaid: true,
    payRate: 75,
  },
  {
    code: 'MATERNITY',
    name: 'Nghỉ thai sản',
    defaultDays: 180,
    isPaid: true,
    payRate: 100,
  },
  {
    code: 'PATERNITY',
    name: 'Nghỉ thai sản cha',
    defaultDays: 5,
    isPaid: true,
    payRate: 100,
  },
  {
    code: 'BEREAVEMENT',
    name: 'Nghỉ tang',
    defaultDays: 3,
    isPaid: true,
    payRate: 100,
  },
  {
    code: 'MARRIAGE',
    name: 'Nghỉ kết hôn',
    defaultDays: 3,
    isPaid: true,
    payRate: 100,
  },
  {
    code: 'ELECTION',
    name: 'Nghỉ bầu cử',
    defaultDays: 1,
    isPaid: true,
    payRate: 100,
  },
  {
    code: 'NATIONAL_DISASTER',
    name: 'Nghỉ thiên tai quốc gia',
    defaultDays: 1,
    isPaid: false,
    payRate: 0,
  },
] as const;

/** Mức đóng BH theo Nghị định 74/2024 (hiệu lực 01/07/2024) */
const INSURANCE_RATES_2026: ReadonlyArray<{
  type: 'BHXH' | 'BHYT' | 'BHTN';
  employer: number;
  employee: number;
}> = [
  { type: 'BHXH', employer: 17.0, employee: 8.0 },
  { type: 'BHYT', employer: 3.0, employee: 1.5 },
  { type: 'BHTN', employer: 1.0, employee: 1.0 },
] as const;

/** 4 vùng lương tối thiểu theo Nghị định 74/2024 (hiệu lực 01/07/2024) */
const MIN_WAGE_REGIONS: ReadonlyArray<{
  code: 'REGION_1' | 'REGION_2' | 'REGION_3' | 'REGION_4';
  wage: number;
}> = [
  { code: 'REGION_1', wage: 4960000 },
  { code: 'REGION_2', wage: 4410000 },
  { code: 'REGION_3', wage: 3860000 },
  { code: 'REGION_4', wage: 3450000 },
] as const;

const INSURANCE_EFFECTIVE_YEAR = 2026;
/** Ngày hiệu lực Nghị định 74/2024 */
const INSURANCE_EFFECTIVE_FROM = '2024-07-01';

@Injectable()
export class TenantProvisionService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TenantProvisionService.name);
  private worker: Worker | null = null;

  constructor(private readonly db: HrmDbService) {}

  onModuleInit(): void {
    const url = process.env.REDIS_URL?.trim();
    if (!url || process.env.BULLMQ_ENABLED !== 'true') {
      this.logger.warn(
        '[HRM] BULLMQ_ENABLED != true or REDIS_URL missing — TenantProvisionWorker not started.' +
          ' Use REST fallback POST /internal/tenant-provisioned for testing.',
      );
      return;
    }
    const connection: ConnectionOptions = { url, maxRetriesPerRequest: null };
    this.worker = new Worker(
      'xbos.tenant',
      async (job) => {
        if (job.name === 'TENANT_PROVISIONED') {
          await this.handleTenantProvisioned(
            job.data as TenantProvisionedPayload,
          );
        }
      },
      { connection },
    );
    this.worker.on('failed', (job, err) => {
      this.logger.error(
        `[HRM] xbos.tenant worker job failed: ${job?.name ?? 'unknown'} — ${err.message}`,
      );
    });
    this.logger.log(
      '[HRM] TenantProvisionWorker subscribed to BullMQ queue: xbos.tenant',
    );
  }

  async onModuleDestroy(): Promise<void> {
    await this.worker?.close();
  }

  /**
   * Public so REST controller can call this directly for integration tests
   * and manual XBOS→HRM HTTP fallback path.
   */
  async handleTenantProvisioned(
    payload: TenantProvisionedPayload,
  ): Promise<void> {
    const { tenantId, defaultCompanyId, modules } = payload;

    if (!modules.includes('hrm')) {
      this.logger.log(
        `[HRM] Tenant ${tenantId}: 'hrm' not in modules ${JSON.stringify(modules)}. Skipping.`,
      );
      return;
    }

    // Idempotency guard: if tenant already has any leave_type row, skip entire seed block.
    const existing = await this.db.query<{ exists: boolean }>(
      'SELECT EXISTS(SELECT 1 FROM hrm_leave_type WHERE tenant_id = $1 LIMIT 1) AS exists',
      [tenantId],
    );
    if (existing.rows[0]?.exists) {
      this.logger.log(
        `[HRM] Tenant ${tenantId} already provisioned — skipping seed.`,
      );
      return;
    }

    await this.db.withTransaction(async (query) => {
      await this.seedLeaveTypes(query, tenantId, defaultCompanyId);
      await this.seedInsuranceRates(query, tenantId, defaultCompanyId);
      await this.seedMinimumWageRegions(query, tenantId, defaultCompanyId);
      await this.seedRecruitmentMasterData(query, tenantId, defaultCompanyId);
      await this.seedJobDescriptionTemplates(query, tenantId, defaultCompanyId);
      await this.seedAdminEmployee(
        query,
        tenantId,
        defaultCompanyId,
        payload.adminEmail || payload.issuedBy,
      );
    });

    this.logger.log(
      `[HRM] Tenant provisioned: ${tenantId}, seeded defaults (company: ${defaultCompanyId})`,
    );
  }

  // ─── Private seed methods — executed inside withTransaction ─────────────────

  private async seedAdminEmployee(
    query: HrmDbQueryFn,
    tenantId: string,
    companyId: string,
    adminEmail: string,
  ): Promise<void> {
    await query(
      `INSERT INTO public.employees 
         (id, company_id, employee_code, email, full_name, job_title_key, status, hired_at)
       VALUES (gen_random_uuid(), $1, 'ADMIN01', $2, 'Tenant Admin', 'CEO', 'active', CURRENT_DATE)
       ON CONFLICT (company_id, employee_code) DO NOTHING`,
      [companyId, adminEmail || 'admin@xe.vn'],
    );
  }

  private async seedLeaveTypes(
    query: HrmDbQueryFn,
    tenantId: string,
    companyId: string,
  ): Promise<void> {
    for (const lt of LABOR_LAW_LEAVE_TYPES) {
      await query(
        `INSERT INTO hrm_leave_type
           (tenant_id, company_id, code, name, default_days_per_year,
            is_paid, pay_rate_percent, leave_category)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'LABOR_LAW')
         ON CONFLICT ON CONSTRAINT uq_leave_type_tenant_code DO NOTHING`,
        [
          tenantId,
          companyId,
          lt.code,
          lt.name,
          lt.defaultDays,
          lt.isPaid,
          lt.payRate,
        ],
      );
    }
  }

  private async seedInsuranceRates(
    query: HrmDbQueryFn,
    tenantId: string,
    companyId: string,
  ): Promise<void> {
    for (const rate of INSURANCE_RATES_2026) {
      await query(
        `INSERT INTO hrm_insurance_rate
           (tenant_id, company_id, insurance_type, effective_year,
            employer_rate_percent, employee_rate_percent, effective_from)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT ON CONSTRAINT uq_ins_rate_tenant_type_year DO NOTHING`,
        [
          tenantId,
          companyId,
          rate.type,
          INSURANCE_EFFECTIVE_YEAR,
          rate.employer,
          rate.employee,
          INSURANCE_EFFECTIVE_FROM,
        ],
      );
    }
  }

  private async seedMinimumWageRegions(
    query: HrmDbQueryFn,
    tenantId: string,
    companyId: string,
  ): Promise<void> {
    for (const region of MIN_WAGE_REGIONS) {
      await query(
        `INSERT INTO hrm_minimum_wage_region
           (tenant_id, company_id, region_code, effective_from, monthly_min_wage)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT ON CONSTRAINT uq_min_wage_tenant_region_eff DO NOTHING`,
        [
          tenantId,
          companyId,
          region.code,
          INSURANCE_EFFECTIVE_FROM,
          region.wage,
        ],
      );
    }
  }

  private async seedRecruitmentMasterData(
    query: HrmDbQueryFn,
    tenantId: string,
    companyId: string,
  ): Promise<void> {
    // 1. Nguồn tuyển dụng
    for (const src of MASTER_REC_SOURCES) {
      await query(
        `INSERT INTO public.hrm_catalog_extension_items
           (tenant_id, company_id, catalog_key, code, label, status)
         VALUES ($1, $2, $3, $4, $5, 'active')
         ON CONFLICT ON CONSTRAINT uq_hrm_cat_ext_scope_key_code DO NOTHING`,
        [tenantId, companyId, 'recruitment_channels', src.code, src.name_vi],
      );
    }

    // 2. Giai đoạn tuyển dụng -> rec_pipeline_stage
    for (const stage of MASTER_REC_STAGES) {
      const exists = await query(
        `SELECT 1 FROM public.rec_pipeline_stage WHERE company_id = $1 AND lower(stage_key) = lower($2) AND archived_at IS NULL`,
        [companyId, stage.code],
      );
      if (exists.rows.length === 0) {
        await query(
          `INSERT INTO public.rec_pipeline_stage
             (company_id, stage_key, name_vi, sort_order, is_terminal, is_hired_outcome, is_reject_outcome)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            companyId,
            stage.code,
            stage.name_vi,
            stage.order * 10,
            stage.is_terminal,
            stage.code === 'HIRED',
            stage.code === 'REJECTED' || stage.code === 'WITHDRAWN',
          ],
        );
      }
    }

    // 3. Loại phỏng vấn
    for (const type of MASTER_REC_INTERVIEW_TYPES) {
      await query(
        `INSERT INTO public.hrm_catalog_extension_items
           (tenant_id, company_id, catalog_key, code, label, status)
         VALUES ($1, $2, $3, $4, $5, 'active')
         ON CONFLICT ON CONSTRAINT uq_hrm_cat_ext_scope_key_code DO NOTHING`,
        [tenantId, companyId, 'interview_types', type.code, type.name_vi],
      );
    }

    // 4. Lý do từ chối
    for (const reason of MASTER_REC_REJECT_REASONS) {
      await query(
        `INSERT INTO public.hrm_catalog_extension_items
           (tenant_id, company_id, catalog_key, code, label, status)
         VALUES ($1, $2, $3, $4, $5, 'active')
         ON CONFLICT ON CONSTRAINT uq_hrm_cat_ext_scope_key_code DO NOTHING`,
        [tenantId, companyId, 'reject_reasons', reason.code, reason.name_vi],
      );
    }

    // 5. Yêu cầu sức khỏe
    for (const req of MASTER_REC_HEALTH_REQS) {
      await query(
        `INSERT INTO public.hrm_catalog_extension_items
           (tenant_id, company_id, catalog_key, code, label, status)
         VALUES ($1, $2, $3, $4, $5, 'active')
         ON CONFLICT ON CONSTRAINT uq_hrm_cat_ext_scope_key_code DO NOTHING`,
        [tenantId, companyId, 'health_requirements', req.code, req.name_vi],
      );
    }
  }

  private async seedJobDescriptionTemplates(
    query: HrmDbQueryFn,
    tenantId: string,
    companyId: string,
  ): Promise<void> {
    const defaultTemplates = [
      {
        code: 'JD_LAI_XE',
        title: 'Tuyển dụng Lái xe',
        position_code: 'POS_LAI_XE',
        position_name: 'Lái xe',
        job_description:
          '- Bước 1: Tiếp nhận hồ sơ (Phòng HCNS)\n- Bước 2: Phỏng vấn sơ loại (Phòng HCNS)\n- Bước 3: Sát hạch tay lái (Đội trưởng Đội xe)\n- Bước 4: Ký hợp đồng thử việc',
        requirements:
          '- Bằng lái xe hạng D trở lên\n- Sức khỏe tốt (Giấy khám sức khỏe loại I)\n- Hộ khẩu thường trú rõ ràng',
      },
      {
        code: 'JD_QUAN_LY',
        title: 'Tuyển dụng Quản lý',
        position_code: 'POS_QUAN_LY',
        position_name: 'Quản lý',
        job_description:
          '- Bước 1: Tiếp nhận hồ sơ (Phòng HCNS)\n- Bước 2: Phỏng vấn vòng 1 (Phòng HCNS & Trưởng phòng chuyên môn)\n- Bước 3: Đánh giá năng lực (Làm bài Test)\n- Bước 4: Phỏng vấn vòng 2 (Giám đốc khối)\n- Bước 5: Thỏa thuận lương & Ký hợp đồng',
        requirements:
          '- Tốt nghiệp Đại học trở lên\n- Có ít nhất 3 năm kinh nghiệm quản lý\n- Kỹ năng giao tiếp, giải quyết vấn đề và lập kế hoạch tốt',
      },
    ];

    for (const tpl of defaultTemplates) {
      // 1. Ensure position exists in job_titles catalog so assertCodeInEffectiveCatalog doesn't fail
      await query(
        `INSERT INTO public.hrm_catalog_extension_items
           (tenant_id, company_id, catalog_key, code, label, status)
         VALUES ($1, $2, $3, $4, $5, 'active')
         ON CONFLICT ON CONSTRAINT uq_hrm_cat_ext_scope_key_code DO NOTHING`,
        [
          tenantId,
          companyId,
          'job_titles',
          tpl.position_code,
          tpl.position_name,
        ],
      );

      // 2. Insert JD Template
      await query(
        `INSERT INTO public.job_description_templates
           (company_id, code, title, position_code, position_name, job_description, requirements)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT ON CONSTRAINT uq_job_description_templates_company_code DO NOTHING`,
        [
          companyId,
          tpl.code,
          tpl.title,
          tpl.position_code,
          tpl.position_name,
          tpl.job_description,
          tpl.requirements,
        ],
      );
    }
  }
}
