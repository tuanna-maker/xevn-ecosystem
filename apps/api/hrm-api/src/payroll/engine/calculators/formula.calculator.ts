import { ComponentCalculator, CalcContext, ComponentResult } from '../calculator.interface';
import { HyperFormula } from 'hyperformula';

export class FormulaCalculator implements ComponentCalculator {
  readonly componentType = 'FORMULA';

  async calculate(ctx: CalcContext): Promise<ComponentResult> {
    const formulaConfig = ctx.component?.params?.formula;
    const warnings: string[] = [];

    if (!formulaConfig) {
      warnings.push(`Thiếu cấu hình công thức (formula) cho nhân viên ${ctx.employeeId}`);
      return {
        component_type: this.componentType,
        amount_vnd: 0n,
        breakdown: { error: 'Missing formula in params' },
        warnings
      };
    }

    try {
      // 1. Dàn phẳng toàn bộ inputBag và params để tìm kiếm biến tự nhiên (Natural Variable)
      const variables: Record<string, any> = {};
      
      for (const [key, value] of Object.entries(ctx.inputBag || {})) {
        if (typeof value === 'object' && value !== null) {
          for (const [subKey, subValue] of Object.entries(value)) {
            variables[subKey] = subValue;
          }
        } else {
          variables[key] = value;
        }
      }

      if (ctx.component?.params) {
        for (const [key, value] of Object.entries(ctx.component.params)) {
          if (key !== 'formula') {
            variables[key] = value;
          }
        }
      }

      // 2. Parse công thức để tìm các Biến Tự Nhiên (được bọc trong ngoặc vuông, vd: [Điểm KPI/ tháng (%)])
      let parsedFormula = formulaConfig;
      const naturalVariables = formulaConfig.match(/\[(.*?)\]/g) || [];

      for (const match of naturalVariables) {
        const varName = match.slice(1, -1); // Xóa ngoặc vuông
        
        // Lookup DB code from catalogMap (Danh mục Thành phần lương)
        const dbCode = ctx.catalogMap?.[varName.trim()];
        
        // Try getting value by dbCode first, fallback to varName
        let val = dbCode ? variables[dbCode] : variables[varName];

        if (val === undefined || val === null) {
          warnings.push(`Cảnh báo: Không tìm thấy dữ liệu cho cột '${varName}' (Mã DB: ${dbCode || 'Không có trong Danh mục'}). Mặc định là 0.`);
          val = 0;
        }
        
        // Replace all instances of this exact match with its numerical value
        parsedFormula = parsedFormula.split(match).join(val.toString());
      }

      // 3. Thực thi phép toán bằng HyperFormula
      const hf = HyperFormula.buildEmpty({ licenseKey: 'gpl-v3' });
      const sheetName = hf.addSheet('Sheet1');
      const sheetId = hf.getSheetId(sheetName) as number;
      
      // HyperFormula formulas must start with '='
      const hfFormula = parsedFormula.startsWith('=') ? parsedFormula : '=' + parsedFormula;
      
      hf.setCellContents({ sheet: sheetId, row: 0, col: 0 }, [[hfFormula]]);
      const result = hf.getCellValue({ sheet: sheetId, row: 0, col: 0 });

      if (result instanceof Error || typeof result === 'object') {
        throw new Error(`Lỗi đánh giá HyperFormula: ${JSON.stringify(result)}`);
      }

      const finalAmount = BigInt(Math.floor(Number(result)));

      return {
        component_type: this.componentType,
        amount_vnd: finalAmount,
        breakdown: { 
          original_formula: formulaConfig,
          parsed_formula: parsedFormula,
          evaluated_result: result.toString()
        },
        warnings
      };
    } catch (e: any) {
      warnings.push(`Lỗi biên dịch công thức: ${e.message}`);
      return {
        component_type: this.componentType,
        amount_vnd: 0n,
        breakdown: { error: e.message, original_formula: formulaConfig },
        warnings
      };
    }
  }
}
