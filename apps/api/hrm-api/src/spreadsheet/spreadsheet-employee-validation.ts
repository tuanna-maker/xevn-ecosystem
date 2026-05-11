import { EMPLOYEE_IMPORT_TEMPLATE_HEADERS } from './spreadsheet-kinds';
import type { SheetRowError } from './spreadsheet-ingest.service';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normKey(k: string): string {
  return k.trim().toLowerCase().replace(/\s+/g, '_');
}

/** Build lookup from raw header -> value */
function valueForAliases(row: Record<string, string>, aliases: string[]): string {
  const byNorm = new Map<string, string>();
  for (const [k, v] of Object.entries(row)) {
    byNorm.set(normKey(k), v ?? '');
  }
  for (const a of aliases) {
    const hit = byNorm.get(normKey(a));
    if (hit !== undefined && hit.trim() !== '') return hit.trim();
  }
  return '';
}

export function canonicalEmployeeFieldsFromRow(row: Record<string, string>): {
  employee_code: string;
  email: string;
  full_name: string;
  job_title_key: string;
  hired_at: string;
} {
  return {
    employee_code: valueForAliases(row, ['employee_code', 'emp_code', 'code', 'employee code']),
    email: valueForAliases(row, ['email', 'e_mail']),
    full_name: valueForAliases(row, ['full_name', 'fullname', 'name', 'full name']),
    job_title_key: valueForAliases(row, ['job_title_key', 'job_title', 'title', 'job title']),
    hired_at: valueForAliases(row, ['hired_at', 'hire_date', 'hired', 'hire date']),
  };
}

export function validateEmployeeImportRow(
  row: Record<string, string>,
  /** 1-based data row index (first data row = 1) */
  dataRowIndex1Based: number,
): SheetRowError[] {
  const c = canonicalEmployeeFieldsFromRow(row);
  const errors: SheetRowError[] = [];
  if (!c.employee_code) {
    errors.push({ row: dataRowIndex1Based, field: 'employee_code', code: 'SHEET-422', message: 'Required' });
  } else if (c.employee_code.length > 64) {
    errors.push({ row: dataRowIndex1Based, field: 'employee_code', code: 'SHEET-422', message: 'Max 64 chars' });
  }
  if (!c.email) {
    errors.push({ row: dataRowIndex1Based, field: 'email', code: 'SHEET-422', message: 'Required' });
  } else if (!EMAIL_RE.test(c.email) || c.email.length > 255) {
    errors.push({ row: dataRowIndex1Based, field: 'email', code: 'SHEET-422', message: 'Invalid email' });
  }
  if (!c.full_name) {
    errors.push({ row: dataRowIndex1Based, field: 'full_name', code: 'SHEET-422', message: 'Required' });
  } else if (c.full_name.length > 255) {
    errors.push({ row: dataRowIndex1Based, field: 'full_name', code: 'SHEET-422', message: 'Max 255 chars' });
  }
  if (c.job_title_key.length > 100) {
    errors.push({ row: dataRowIndex1Based, field: 'job_title_key', code: 'SHEET-422', message: 'Max 100 chars' });
  }
  if (c.hired_at && Number.isNaN(Date.parse(c.hired_at))) {
    errors.push({ row: dataRowIndex1Based, field: 'hired_at', code: 'SHEET-422', message: 'Invalid date' });
  }
  return errors;
}

export function listCanonicalEmployeeHeaders(): readonly string[] {
  return EMPLOYEE_IMPORT_TEMPLATE_HEADERS;
}
