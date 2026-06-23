/**
 * Per-company contract cohort — AC-FID-03 (CARD-CON-01).
 * Deterministic: sort by employee_code, take ceil(N × ratio) per company_slug.
 */
export const PER_COMPANY_CONTRACT_RATIO = Number(
  process.env.HRM_FIDELITY_PER_COMPANY_CONTRACT_RATIO ?? 0.95,
);

/**
 * @param {Array<{ id: string, company_id: string, employee_code?: string }>} employees
 * @param {(companyId: string) => string} resolveSlug
 * @param {number} [minRatio]
 * @returns {Set<string>} employee ids selected for contract seed
 */
export function buildPerCompanyContractCohort(employees, resolveSlug, minRatio = PER_COMPANY_CONTRACT_RATIO) {
  const bySlug = new Map();
  for (const emp of employees) {
    const slug = resolveSlug(emp.company_id);
    if (!bySlug.has(slug)) bySlug.set(slug, []);
    bySlug.get(slug).push(emp);
  }

  const cohortIds = new Set();
  for (const emps of bySlug.values()) {
    const sorted = [...emps].sort((a, b) =>
      String(a.employee_code ?? '').localeCompare(String(b.employee_code ?? '')),
    );
    const target = Math.ceil(sorted.length * minRatio);
    for (let i = 0; i < Math.min(target, sorted.length); i += 1) {
      cohortIds.add(sorted[i].id);
    }
  }
  return cohortIds;
}
