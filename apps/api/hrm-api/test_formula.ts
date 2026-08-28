import { FormulaCalculator } from './src/payroll/engine/calculators/formula.calculator';
import { CalcContext } from './src/payroll/engine/calculator.interface';

async function test() {
  const calc = new FormulaCalculator();
  const ctx: CalcContext = {
    employeeId: 'EMP1',
    periodMonth: new Date(),
    attendance: {},
    gradeStep: null,
    catalogMap: {
      'Quỹ lương KPI': 'kpi_fund',
      'Điểm KPI/ tháng (%)': 'kpi_score'
    },
    inputBag: {
      'kpi_fund': 5000000,
      'kpi_score': 1.1
    },
    component: {
      type: 'FORMULA',
      params: {
        formula: '[Quỹ lương KPI] + (1.5 * ([Điểm KPI/ tháng (%)] - 1) * [Quỹ lương KPI])'
      }
    }
  };
  
  const res = await calc.calculate(ctx);
  console.log('Result:', JSON.stringify(res, (k,v) => typeof v === 'bigint' ? v.toString() : v, 2));
}
test().catch(console.error);
