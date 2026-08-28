import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { HrmDbService } from '../src/db/hrm-db.service';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

process.env.DATABASE_URL_HRM = 'postgresql://app1:5%5ES0CEpvYwC1(%23YN1UoJ@113.20.107.184:6432/xevn_hrm?schema=public';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
  const db = app.get(HrmDbService);
  const pool = (db as any).pool; // bypass private visibility

  // Get path from env, args, or relative to this script for default test file
  const defaultFilePath = path.join(__dirname, '../../../../docs/từ khách hàng/Gửi P.CNTT/1. Điều phối hàng hóa/Bảng_lương_Refactored_Test_Import.xlsx');
  const filePath = process.argv[2] || process.env.EXCEL_IMPORT_PATH || defaultFilePath;

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  console.log(`Reading Excel file: ${filePath}`);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const sheet = workbook.worksheets.find(s => s.name.toLowerCase().includes('công') || s.name.toLowerCase().includes('doanh thu'));
  if (!sheet) {
    console.error('Không tìm thấy sheet Bảng công');
    process.exit(1);
  }

  console.log(`Processing sheet: ${sheet.name}`);
  const periodMonth = 5;
  const periodYear = 2026;
  const companyId = 'holding';

  let successCount = 0;

  for (let i = 10; i <= Math.min(sheet.rowCount, 100); i++) {
    const row = sheet.getRow(i);
    const rowValues = row.values as any[];
    if (i <= 12) {
      console.log(`Row ${i} values:`, JSON.stringify(rowValues.slice(0, 10)));
    }
    const mnv = rowValues[2];
    const name = rowValues[3];
    const dept = rowValues[4]; 

    
    if (!mnv || typeof mnv !== 'string' || !mnv.startsWith('XE')) {
      continue;
    }

    console.log(`Processing MNV: ${mnv} - ${name}`);

    // Map MNV to employee_id
    const empRes = await pool.query('SELECT id, company_id FROM public.employees WHERE employee_code = $1', [mnv]);
    if (empRes.rowCount === 0) {
      console.log(`> Employee not found: ${mnv}`);
      continue;
    }
    const empId = empRes.rows[0].id;
    const actualCompanyId = empRes.rows[0].company_id || companyId;

    const valuesToInsert = [
      { code: 'NGAY_CONG_TV', val: rowValues[19] || 0 },
      { code: 'NGAY_CONG_CT', val: rowValues[20] || 0 },
      { code: 'GIO_OT_150', val: rowValues[23] || 0 },
      { code: 'GIO_OT_200', val: rowValues[25] || 0 },
      { code: 'NGHI_PHEP', val: rowValues[29] || 0 },
      { code: 'NGHI_LE', val: rowValues[31] || 0 }
    ];

    try {
      await pool.query('BEGIN');
      
      const summaryId = crypto.randomUUID();
      
      await pool.query(
        `INSERT INTO public.pay_timesheet_summaries 
         (id, company_id, employee_id, department_id, period_month, period_year, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'DRAFT')
         ON CONFLICT (company_id, employee_id, period_month, period_year) 
         DO UPDATE SET updated_at = NOW()
         RETURNING id`,
        [summaryId, actualCompanyId, empId, dept || null, periodMonth, periodYear]
      );

      const upsertRes = await pool.query(
        `SELECT id FROM public.pay_timesheet_summaries 
         WHERE company_id = $1 AND employee_id = $2 AND period_month = $3 AND period_year = $4`,
        [actualCompanyId, empId, periodMonth, periodYear]
      );
      const actualSummaryId = upsertRes.rows[0].id;

      let insertedLines = 0;
      for (const m of valuesToInsert) {
        if (m.val && !isNaN(Number(m.val))) {
          await pool.query(
            `INSERT INTO public.pay_timesheet_lines (timesheet_id, metric_code, metric_value)
             VALUES ($1, $2, $3)
             ON CONFLICT (timesheet_id, metric_code) 
             DO UPDATE SET metric_value = EXCLUDED.metric_value, updated_at = NOW()`,
            [actualSummaryId, m.code, Number(m.val)]
          );
          insertedLines++;
        }
      }

      await pool.query('COMMIT');
      console.log(`> Success: Upserted timesheet with ${insertedLines} metrics`);
      successCount++;
    } catch (err) {
      await pool.query('ROLLBACK');
      console.error(`> Error saving timesheet for ${mnv}:`, err.message);
    }
  }

  console.log(`\nImport completed! Successfully imported ${successCount} timesheets.`);
  await app.close();
}

bootstrap().catch(err => {
  console.error(err);
  process.exit(1);
});
