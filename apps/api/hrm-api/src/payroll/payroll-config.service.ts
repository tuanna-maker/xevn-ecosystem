// @CODE-MEMORY: Xử lý logic Backend (Service) cho cấu hình Thành phần lương và Mặc định lương. Bảo vệ dữ liệu qua tenant isolation.
import { Injectable, ConflictException } from '@nestjs/common';
import { HrmDbService } from '../db/hrm-db.service';
import { CreateSalaryComponentDto } from './dto/create-salary-component.dto';

@Injectable()
export class PayrollConfigService {
  constructor(private readonly db: HrmDbService) {}

  async getSalaryComponents(tenantId: string, companyId: string) {
    const result = await this.db.query(
      `SELECT * FROM pay_salary_component 
       WHERE tenant_id = $1 AND company_id = $2 AND is_active = true AND deleted_at IS NULL
       ORDER BY created_at DESC`,
      [tenantId, companyId],
    );

    return result.rows.map((row) => ({
      id: row.id,
      code: row.code,
      name_vi: row.name_vi,
      component_type: row.component_type,
      taxable_badge: row.is_taxable ? 'Có tính thuế' : 'Không tính thuế',
      bhxh_badge: row.in_bhxh_base ? 'Tính BHXH' : 'Không tính',
    }));
  }

  async createSalaryComponent(
    tenantId: string,
    companyId: string,
    dto: CreateSalaryComponentDto,
  ) {
    // Check collision
    const existing = await this.db.queryOne(
      `SELECT id FROM pay_salary_component WHERE company_id = $1 AND code = $2`,
      [companyId, dto.code],
    );

    if (existing) {
      throw new ConflictException(
        `Mã thành phần lương ${dto.code} đã tồn tại trong công ty này.`,
      );
    }

    const result = await this.db.query(
      `INSERT INTO pay_salary_component (tenant_id, company_id, code, name_vi, component_type, is_taxable, in_bhxh_base)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [
        tenantId,
        companyId,
        dto.code,
        dto.name_vi,
        dto.component_type,
        dto.is_taxable ?? false,
        dto.in_bhxh_base ?? false,
      ],
    );

    return result.rows[0];
  }

  async getSystemSettings(tenantId: string, companyId: string) {
    const result = await this.db.query(
      `SELECT setting_key, setting_value FROM pay_system_settings 
       WHERE tenant_id = $1 AND company_id = $2`,
      [tenantId, companyId],
    );

    // Display-Ready Format
    const settingsMap: Record<string, string> = {};
    for (const row of result.rows) {
      settingsMap[row.setting_key as string] = row.setting_value as string;
    }
    return settingsMap;
  }
}
