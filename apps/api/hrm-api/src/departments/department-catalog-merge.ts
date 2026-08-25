export type DepartmentRow = {
  id: string;
  company_id: string;
  tenant_id?: string | null;
  parent_id: string | null;
  name: string;
  code: string | null;
  description: string | null;
  manager_name: string | null;
  manager_email: string | null;
  employee_count: number;
  level: number;
  sort_order: number;
  status: string;
  created_at: string;
  updated_at: string;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isDepartmentUuid(id: string | null | undefined): boolean {
  return Boolean(id && UUID_RE.test(id.trim()));
}

/** Stable merge key — prefer catalog code, else normalized name; tenant prefix when rollup. */
export function departmentMergeKey(
  row: Pick<DepartmentRow, 'code' | 'name' | 'tenant_id' | 'company_id'>,
  rollupByTenant = false,
): string {
  const tenant = rollupByTenant
    ? (row.tenant_id?.trim().toLowerCase() ||
        row.company_id?.trim().toLowerCase() ||
        '')
    : '';
  const prefix = tenant ? `${tenant}:` : '';
  const code = row.code?.trim().toLowerCase();
  if (code) return `${prefix}code:${code}`;
  return `${prefix}name:${row.name.trim().toLowerCase()}`;
}

/**
 * Union HRM physical departments + settings catalog effective items.
 * HRM row wins on duplicate key; rollup mode keeps same code across tenants distinct.
 */
export function mergeDepartmentCatalogRows(
  hrmRows: DepartmentRow[],
  catalogRows: DepartmentRow[],
  rollupByTenant = false,
): DepartmentRow[] {
  const merged = new Map<string, DepartmentRow>();
  for (const row of catalogRows) {
    if (!row.name?.trim()) continue;
    merged.set(departmentMergeKey(row, rollupByTenant), row);
  }
  for (const row of hrmRows) {
    if (!row.name?.trim()) continue;
    merged.set(departmentMergeKey(row, rollupByTenant), row);
  }

  for (const catalogRow of catalogRows) {
    if (!catalogRow.code?.trim() || !catalogRow.name?.trim()) continue;
    const codeKey = departmentMergeKey(catalogRow, rollupByTenant);
    const nameKey = departmentMergeKey(
      { ...catalogRow, code: null },
      rollupByTenant,
    );
    const hrmByName = merged.get(nameKey);
    const catalogAtCode = merged.get(codeKey);
    if (
      hrmByName &&
      catalogAtCode &&
      isDepartmentUuid(hrmByName.id) &&
      !hrmByName.code?.trim() &&
      !isDepartmentUuid(catalogAtCode.id)
    ) {
      merged.delete(nameKey);
      merged.set(codeKey, {
        ...hrmByName,
        code: catalogRow.code.trim(),
      });
    }
  }

  return [...merged.values()].sort(
    (a, b) =>
      a.sort_order - b.sort_order ||
      a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' }),
  );
}
