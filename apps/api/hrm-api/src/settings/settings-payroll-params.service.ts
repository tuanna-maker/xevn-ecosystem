import { Injectable } from '@nestjs/common';
import { HrmDbService } from '../db/hrm-db.service';

@Injectable()
export class SettingsPayrollParamsService {
  constructor(private readonly db: HrmDbService) {}

  async getPayrollParams(companyId: string): Promise<Record<string, number>> {
    const res = await this.db.query<{ value_json: string }>(
      `
        SELECT value_json 
        FROM public.hrm_company_settings 
        WHERE company_id = $1 AND setting_key = 'pay_system_params'
          AND archived_at IS NULL
      `,
      [companyId],
    );

    if (res.rows.length === 0) return this.getDefaults();

    try {
      const parsed =
        typeof res.rows[0].value_json === 'string'
          ? JSON.parse(res.rows[0].value_json)
          : res.rows[0].value_json;

      const out: Record<string, number> = {};
      for (const [k, v] of Object.entries(parsed)) {
        if (typeof v === 'number') out[k] = v;
        else if (typeof v === 'string') out[k] = Number(v);
      }
      return out;
    } catch {
      return this.getDefaults();
    }
  }

  private getDefaults(): Record<string, number> {
    return {
      MINIMUM_WAGE: 5310000,
      STANDARD_WORK_DAYS: 26,
      STANDARD_WORK_HOURS: 8,
      BHXH_BASE: 2340000,
      BHXH_CAP: 46800000,
      BHXH_EMP_RATE: 10.5,
      BHXH_CMP_RATE: 17.5,
      TNCN_PERSONAL: 11000000,
      TNCN_DEPENDENT: 4400000,
      PAY_DAY: 10,
      ADVANCE_DAY: 20,
      CC_BASE_SALARY: 5000000,
      CC_CALL_FUND: 500000,
      DRIVER_KPI_EXPRESS: 2000000,
      DRIVER_MEAL_ALLOWANCE: 25000,
    };
  }
}
