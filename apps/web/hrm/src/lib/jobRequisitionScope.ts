/**
 * Prefer row partition for requisition PATCH/GET-by-id; fall back to operating-unit / auth scope.
 * @CODE-MEMORY GWC-HRM-REC-UF12-01 — scope parity list → detail/mutate (J-HRM-05).
 */
export function resolveRequisitionMutateCompanyId(
  rowCompanyId: string | null | undefined,
  listCompanyId: string | null | undefined,
  authCompanyId: string | null | undefined,
): string | null {
  const fromRow = rowCompanyId?.trim();
  if (fromRow) return fromRow;
  const fromList = listCompanyId?.trim();
  if (fromList) return fromList;
  const fromAuth = authCompanyId?.trim();
  return fromAuth || null;
}
