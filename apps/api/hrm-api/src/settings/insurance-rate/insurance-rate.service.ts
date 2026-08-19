/**
 * @CODE-MEMORY WorkItem: BA-HRM-INSURANCE-RATE-TECHSPEC-01
 * solid_convention_ack: true
 * be_boundary: true
 */
import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { HrmDbService } from '../../db/hrm-db.service';
import { CreateInsuranceRateDto } from './dto/create-insurance-rate.dto';
import { UpdateInsuranceRateDto } from './dto/update-insurance-rate.dto';
import { UpdateMinimumWageDto } from './dto/update-minimum-wage.dto';

type InsuranceRateRow = {
  id: string;
  tenant_id: string;
  company_id: string;
  insurance_type: string;
  effective_year: number;
  employer_rate_percent: string;
  employee_rate_percent: string;
  salary_cap_multiplier: string;
  status: string;
  effective_from: string;
  effective_to: string | null;
  created_at: string;
  updated_at: string;
};

type MinimumWageRegionRow = {
  id: string;
  tenant_id: string;
  company_id: string;
  region_code: string;
  effective_from: string;
  effective_to: string | null;
  monthly_min_wage: string;
  status: string;
  created_at: string;
  updated_at: string;
};

@Injectable()
export class InsuranceRateService {
  constructor(private readonly db: HrmDbService) {}

  // === Insurance Rates ===
  async findAllRates(tenantId: string, companyId: string) {
    const rates = await this.db.query<InsuranceRateRow>(
      `SELECT * FROM hrm_insurance_rate WHERE tenant_id = $1 AND company_id = $2 AND deleted_at IS NULL ORDER BY effective_year DESC, insurance_type`,
      [tenantId, companyId]
    );
    // Group by year for UI
    const grouped = rates.rows.reduce((acc, r) => {
      const year = r.effective_year;
      if (!acc[year]) acc[year] = [];
      acc[year].push(r);
      return acc;
    }, {} as Record<number, InsuranceRateRow[]>);
    return grouped;
  }

  async findRateById(tenantId: string, companyId: string, id: string) {
    const result = await this.db.query<InsuranceRateRow>(
      `SELECT * FROM hrm_insurance_rate WHERE id = $1 AND tenant_id = $2 AND company_id = $3`,
      [id, tenantId, companyId]
    );
    if (!result.rows[0]) {
      throw new NotFoundException('Insurance rate not found');
    }
    return result.rows[0];
  }

  async createRate(tenantId: string, companyId: string, dto: CreateInsuranceRateDto) {
    // BR-IR-05: unique (tenant, type, year)
    const exists = await this.db.queryOne(
      `SELECT 1 FROM hrm_insurance_rate WHERE tenant_id = $1 AND company_id = $2 AND insurance_type = $3 AND effective_year = $4`,
      [tenantId, companyId, dto.insuranceType, dto.effectiveYear]
    );
    if (exists) throw new ConflictException('Rate for this insurance type and year already exists');

    const effectiveFrom = dto.effectiveFrom ?? `${dto.effectiveYear}-01-01`;
    const effectiveTo = dto.effectiveTo ?? `${dto.effectiveYear}-12-31`;
    const salaryCapMultiplier = dto.salaryCapMultiplier ?? 20.0;

    const result = await this.db.queryOne<InsuranceRateRow>(
      `INSERT INTO hrm_insurance_rate (tenant_id, company_id, insurance_type, effective_year, employer_rate_percent, employee_rate_percent, salary_cap_multiplier, effective_from, effective_to)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [tenantId, companyId, dto.insuranceType, dto.effectiveYear, dto.employerRatePercent, dto.employeeRatePercent, salaryCapMultiplier, effectiveFrom, effectiveTo]
    );
    return result;
  }

  async updateRate(tenantId: string, companyId: string, id: string, dto: UpdateInsuranceRateDto) {
    const existing = await this.findRateById(tenantId, companyId, id);
    // BR-IR-07: khong xoa/sua neu payroll da tinh -- check payroll_period co dung rate nay khong
    const payrollUsed = await this.db.queryOne(
      `SELECT 1 FROM payroll_period pp WHERE pp.tenant_id = $1 AND pp.company_id = $2 AND EXTRACT(YEAR FROM pp.start_date) = $3`,
      [tenantId, companyId, existing.effective_year]
    );
    if (payrollUsed && (dto.employerRatePercent !== undefined || dto.employeeRatePercent !== undefined)) {
      throw new BadRequestException('Cannot modify rates for year with existing payroll runs');
    }

    const fields: string[] = [];
    const params: any[] = [tenantId, companyId, id];
    let idx = 4;
    if (dto.employerRatePercent !== undefined) { fields.push(`employer_rate_percent = $${idx++}`); params.push(dto.employerRatePercent); }
    if (dto.employeeRatePercent !== undefined) { fields.push(`employee_rate_percent = $${idx++}`); params.push(dto.employeeRatePercent); }
    if (dto.salaryCapMultiplier !== undefined) { fields.push(`salary_cap_multiplier = $${idx++}`); params.push(dto.salaryCapMultiplier); }
    if (dto.status !== undefined) { fields.push(`status = $${idx++}`); params.push(dto.status); }
    if (dto.effectiveTo !== undefined) { fields.push(`effective_to = $${idx++}`); params.push(dto.effectiveTo); }
    fields.push(`updated_at = now()`);

    if (fields.length === 1) return existing;

    const result = await this.db.queryOne<InsuranceRateRow>(
      `UPDATE hrm_insurance_rate SET ${fields.join(', ')} WHERE tenant_id = $1 AND company_id = $2 AND id = $3 RETURNING *`,
      params
    );
    return result;
  }

  // === Minimum Wage Regions ===
  async findAllRegions(tenantId: string, companyId: string) {
    // First get the BHXH rate for the latest year to get salary_cap_multiplier
    const latestRateResult = await this.db.query<InsuranceRateRow>(
      `SELECT salary_cap_multiplier FROM hrm_insurance_rate
       WHERE tenant_id = $1 AND company_id = $2 AND insurance_type = 'BHXH' AND status = 'active'
       ORDER BY effective_year DESC LIMIT 1`,
      [tenantId, companyId]
    );
    const salaryCapMultiplier = latestRateResult.rows[0] ? parseFloat(latestRateResult.rows[0].salary_cap_multiplier) : 20.0;

    const regionsResult = await this.db.query<MinimumWageRegionRow & { salary_cap: string }>(
      `SELECT *,
        ($1 * monthly_min_wage) AS salary_cap
       FROM hrm_minimum_wage_region
       WHERE tenant_id = $2 AND company_id = $3 AND deleted_at IS NULL
       ORDER BY region_code`,
      [salaryCapMultiplier, tenantId, companyId]
    );
    return regionsResult.rows.map(r => ({ ...r, salary_cap: parseFloat(r.salary_cap) }));
  }

  async updateRegion(tenantId: string, companyId: string, id: string, dto: UpdateMinimumWageDto) {
    const existing = await this.db.queryOne<MinimumWageRegionRow>(
      `SELECT * FROM hrm_minimum_wage_region WHERE id = $1 AND tenant_id = $2 AND company_id = $3`,
      [id, tenantId, companyId]
    );
    if (!existing) throw new NotFoundException('Region not found');

    const fields: string[] = [];
    const params: any[] = [tenantId, companyId, id];
    let idx = 4;
    if (dto.monthlyMinWage !== undefined) { fields.push(`monthly_min_wage = $${idx++}`); params.push(dto.monthlyMinWage); }
    if (dto.status !== undefined) { fields.push(`status = $${idx++}`); params.push(dto.status); }
    if (dto.effectiveTo !== undefined) { fields.push(`effective_to = $${idx++}`); params.push(dto.effectiveTo); }
    fields.push(`updated_at = now()`);

    if (fields.length === 1) return existing;

    const result = await this.db.queryOne<MinimumWageRegionRow>(
      `UPDATE hrm_minimum_wage_region SET ${fields.join(', ')} WHERE tenant_id = $1 AND company_id = $2 AND id = $3 RETURNING *`,
      params
    );
    return result;
  }

  // === For Payroll Formula ===
  async getRatesForPayroll(tenantId: string, companyId: string, payPeriodStartDate: Date) {
    const year = payPeriodStartDate.getFullYear();
    const rates = await this.db.query<InsuranceRateRow>(
      `SELECT insurance_type, employer_rate_percent, employee_rate_percent, salary_cap_multiplier
       FROM hrm_insurance_rate
       WHERE tenant_id = $1 AND company_id = $2 AND effective_year = $3 AND status = 'active'`,
      [tenantId, companyId, year]
    );
    // NOTE: HRM DB không có bảng company (company org sống ở XBOS Plane A).
    // Fallback về REGION_1 cho đến khi có cross-plane API. DO NOT query company table.
    const regionCode = 'REGION_1';
    const minWage = await this.db.queryOne(
      `SELECT monthly_min_wage FROM hrm_minimum_wage_region
       WHERE tenant_id = $1 AND company_id = $2 AND region_code = $3
       AND effective_from <= $4
       AND (effective_to IS NULL OR effective_to >= $4)
       AND status = 'active'
       ORDER BY effective_from DESC LIMIT 1`,
      [tenantId, companyId, regionCode, payPeriodStartDate]
    );
    const monthlyMinWage = minWage ? parseFloat(minWage.monthly_min_wage) : 4680000;
    // Use BHXH rate's salary_cap_multiplier if available, else default 20
    const bhxhRate = rates.rows.find(r => r.insurance_type === 'BHXH');
    const salaryCapMultiplier = bhxhRate ? parseFloat(bhxhRate.salary_cap_multiplier) : 20;
    const salaryCap = monthlyMinWage * salaryCapMultiplier;

    return {
      rates: rates.rows.reduce((acc, r) => {
        acc[`insurance_${r.insurance_type.toLowerCase()}_employer_rate`] = parseFloat(r.employer_rate_percent);
        acc[`insurance_${r.insurance_type.toLowerCase()}_employee_rate`] = parseFloat(r.employee_rate_percent);
        return acc;
      }, {} as Record<string, number>),
      insurance_salary_cap: salaryCap,
    };
  }
}