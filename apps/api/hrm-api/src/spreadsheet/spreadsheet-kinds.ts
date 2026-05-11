import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';

/** Initial `kind` set — extend with PM/BA; unknown → SHEET-400 */
export const SPREADSHEET_KINDS = {
  employee_import: 'employee_import',
  employee_export: 'employee_export',
} as const;

export type SpreadsheetKind = (typeof SPREADSHEET_KINDS)[keyof typeof SPREADSHEET_KINDS];

export function assertKnownKind(kind: string | undefined): SpreadsheetKind {
  if (kind === SPREADSHEET_KINDS.employee_import || kind === SPREADSHEET_KINDS.employee_export) {
    return kind;
  }
  return invalidKind(kind);
}

export function assertImportKind(kind: string | undefined): Exclude<SpreadsheetKind, 'employee_export'> {
  if (kind === SPREADSHEET_KINDS.employee_import) return kind;
  return invalidKind(kind);
}

export function assertTemplateKind(kind: string | undefined): typeof SPREADSHEET_KINDS.employee_import {
  if (kind === SPREADSHEET_KINDS.employee_import) return kind;
  throw new ApiException(
    'SHEET-400',
    `No template available for kind: ${kind ?? '(missing)'}`,
    HttpStatus.BAD_REQUEST,
    { templateKinds: [SPREADSHEET_KINDS.employee_import] },
  );
}

function invalidKind(kind: string | undefined): never {
  throw new ApiException('SHEET-400', `Unknown or invalid spreadsheet kind: ${kind ?? '(missing)'}`, HttpStatus.BAD_REQUEST, {
    allowed: Object.values(SPREADSHEET_KINDS),
  });
}

/** Canonical template / export column order for `employee_import` / `employee_export`. */
export const EMPLOYEE_IMPORT_TEMPLATE_HEADERS = [
  'employee_code',
  'email',
  'full_name',
  'job_title_key',
  'hired_at',
] as const;
