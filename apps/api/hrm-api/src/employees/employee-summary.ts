import type { EmployeeSummarySalaryRange } from './employee-summary.types';

/** SQL fragment: numeric salary from custom_fields.salary | base_salary. */
export const EMPLOYEE_SALARY_NUM_SQL = `
  CASE
    WHEN NULLIF(TRIM(custom_fields->>'salary'), '') ~ '^[0-9]+(\\.[0-9]+)?$'
      THEN (NULLIF(TRIM(custom_fields->>'salary'), ''))::numeric
    WHEN NULLIF(TRIM(custom_fields->>'base_salary'), '') ~ '^[0-9]+(\\.[0-9]+)?$'
      THEN (NULLIF(TRIM(custom_fields->>'base_salary'), ''))::numeric
    ELSE NULL
  END
`;

export const EMPLOYEE_SUMMARY_SALARY_RANGE_DEFS: Array<{
  key: string;
  min: number;
  max: number | null;
}> = [
  { key: 'above_30m', min: 30_000_000, max: null },
  { key: 'range_20_30m', min: 20_000_000, max: 30_000_000 },
  { key: 'range_15_20m', min: 15_000_000, max: 20_000_000 },
  { key: 'below_15m', min: 0, max: 15_000_000 },
];

export function buildSalaryRangesFromCounts(row: Record<string, string | number>): EmployeeSummarySalaryRange[] {
  const countKeys: Record<string, string> = {
    above_30m: 'salary_range_above_30m',
    range_20_30m: 'salary_range_20_30m',
    range_15_20m: 'salary_range_15_20m',
    below_15m: 'salary_range_below_15m',
  };
  return EMPLOYEE_SUMMARY_SALARY_RANGE_DEFS.map((def) => ({
    key: def.key,
    min: def.min,
    max: def.max,
    count: Number(row[countKeys[def.key] ?? ''] ?? 0),
  }));
}
