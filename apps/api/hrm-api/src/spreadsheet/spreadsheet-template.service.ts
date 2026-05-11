import { Injectable } from '@nestjs/common';
import ExcelJS from 'exceljs';
import { EMPLOYEE_IMPORT_TEMPLATE_HEADERS } from './spreadsheet-kinds';

@Injectable()
export class SpreadsheetTemplateService {
  employeeImportCsv(): string {
    return `${EMPLOYEE_IMPORT_TEMPLATE_HEADERS.join(',')}\n`;
  }

  async employeeImportXlsx(): Promise<Buffer> {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('employees');
    ws.addRow([...EMPLOYEE_IMPORT_TEMPLATE_HEADERS]);
    const buf = await wb.xlsx.writeBuffer();
    return Buffer.isBuffer(buf) ? buf : Buffer.from(buf);
  }
}
