import { Injectable, Logger } from '@nestjs/common';
import { ComponentCalculator, CalcContext, ComponentResult } from './calculator.interface';
import { TripRateTieredCalculator } from './calculators/trip-rate-tiered.calculator';
import { RevenueQualityCalculator } from './calculators/revenue-quality.calculator';
import { FormulaCalculator } from './calculators/formula.calculator';
import { AdvanceDeductionCalculator } from './calculators/advance-deduction.calculator';
import { HrmDbService } from '../../db/hrm-db.service';

@Injectable()
export class PayrollProcessorService {
  private readonly logger = new Logger(PayrollProcessorService.name);
  private readonly calculators: Map<string, ComponentCalculator> = new Map();

  constructor(private readonly db: HrmDbService) {
    this.registerCalculator(new TripRateTieredCalculator());
    this.registerCalculator(new RevenueQualityCalculator());
    this.registerCalculator(new FormulaCalculator());
    this.registerCalculator(new AdvanceDeductionCalculator());
  }

  private registerCalculator(calc: ComponentCalculator) {
    this.calculators.set(calc.componentType, calc);
  }

  async runBatch(tenantId: string, companyId: string, periodMonth: string): Promise<any> {
    this.logger.log(`Running payroll batch for tenant ${tenantId}, company ${companyId}, period ${periodMonth}`);

    // Pre-fetch Salary Components Catalog to get data_source configurations
    const componentConfigs: Record<string, { code: string; name: string; data_source_type: string; source_mapping_key: string }> = {};
    const catalogMap: Record<string, string> = {};
    try {
      const componentsRes = await this.db.query<{ code: string; name: string; data_source_type: string; source_mapping_key: string }>(
        `SELECT code, name, data_source_type, source_mapping_key FROM public.salary_components WHERE company_id = $1 AND archived_at IS NULL`,
        [companyId]
      );
      for (const row of componentsRes.rows) {
        if (row.name && row.code) {
          catalogMap[row.name.trim()] = row.code.trim();
          componentConfigs[row.code.trim()] = row;
        }
      }
    } catch (e) {
      this.logger.warn(`Failed to fetch salary_components for catalog mapping: ${e}`);
    }

    // TODO: Tích hợp lấy dữ liệu thật từ Database thay vì Mock Data
    // Bước 1: Fetch danh sách nhân viên trong kỳ lương từ PayrollService / PayPayrollGroupService
    const employees = await this.fetchEmployeesForPeriod(tenantId, companyId, periodMonth);

    // Bước 2: Lấy dữ liệu Input Hub (E3) từ PayPeriodInputPackService
    // const inputBag = await this.payInputPackService.getEmployeeInputs(periodMonth);

    // Bước 3: Lấy các chính sách lương (Policies) từ PayFormulaService
    // const policies = await this.payFormulaService.getActivePolicies(companyId, periodMonth);

    const batchResults = [];

    for (const emp of employees) {
      // Build CalcContext for each employee dynamically based on their applied policies and inputs
      const ctx: CalcContext = {
        employeeId: emp.id,
        periodMonth: new Date(periodMonth),
        gradeStep: emp.gradeStep, // e.g. from GradeAPI
        attendance: emp.attendance, 
        inputBag: emp.inputs, // dynamic from InputHub
        component: emp.policyComponent, // dynamic from PayFormulaService
        catalogMap
      };

      const results: ComponentResult[] = [];
      
      // Determine if we resolve value from source mapping or use a calculator
      const config = ctx.component?.code ? componentConfigs[ctx.component.code] : null;
      
      if (config && config.data_source_type && config.data_source_type !== 'FORMULA') {
        const sourceKey = config.source_mapping_key;
        let val = 0;
        
        if (sourceKey && ctx.inputBag) {
          // Lấy giá trị trực tiếp từ inputBag dựa trên source mapping key
          // Ví dụ: inputBag['timesheet']['actual_working_days'] hoặc inputBag['actual_working_days']
          if (ctx.inputBag[sourceKey] !== undefined) {
            val = Number(ctx.inputBag[sourceKey]);
          } else {
            // Thử đệ quy 1 cấp nếu data được tổ chức theo module
            for (const key of Object.keys(ctx.inputBag)) {
              if (typeof ctx.inputBag[key] === 'object' && ctx.inputBag[key] !== null) {
                if (ctx.inputBag[key][sourceKey] !== undefined) {
                  val = Number(ctx.inputBag[key][sourceKey]);
                  break;
                }
              }
            }
          }
        }
        
        results.push({
          component_type: ctx.component?.type || 'DATA_SOURCE',
          amount_vnd: BigInt(Math.floor(val)),
          breakdown: { data_source: config.data_source_type, source_key: sourceKey, raw_value: val },
          warnings: []
        });
      } else {
        // Route to correct calculator based on component_type configuration
        const calculator = this.calculators.get(ctx.component?.type || 'FORMULA');
        if (calculator) {
          const res = await calculator.calculate(ctx);
          results.push(res);
        }
      }
      
      batchResults.push({ employeeId: emp.id, results });
    }

    return {
      batch_id: 'batch_' + Date.now(),
      employee_count: employees.length,
      warnings: batchResults.flatMap(r => r.results.flatMap(c => c.warnings)),
      details: batchResults.map(r => ({
        employee_id: r.employeeId,
        components: r.results.map(c => ({ ...c, amount_vnd: c.amount_vnd.toString() }))
      }))
    };
  }

  // Placeholder for real DB fetching (to be implemented with Prisma Repositories)
  private async fetchEmployeesForPeriod(tenantId: string, companyId: string, periodMonth: string): Promise<any[]> {
    // Return empty for now until wired to actual EmployeeRepository
    return [];
  }
}
