/**
 * Chế độ nhúng trong X-BOS portal (iframe + ?portal=1 / companyId).
 * Dùng chung cho ProtectedRoute, PermissionRoute, TrialExpiredGuard.
 */
export function getHrmPortalMode(search: string): boolean {
  const searchParams = new URLSearchParams(search);
  const portalParam = searchParams.get('portal');
  const portalQs =
    portalParam != null && (portalParam === '1' || portalParam.toLowerCase() === 'true');

  const companyIdParam = searchParams.get('companyId');
  const portalCompanyId =
    companyIdParam != null && companyIdParam !== '' && companyIdParam !== 'all';

  const qsPortal = portalQs || portalCompanyId;
  const storedSession =
    typeof sessionStorage !== 'undefined' && sessionStorage.getItem('hrm_portal_mode') === '1';
  const storedLocal =
    typeof localStorage !== 'undefined' && localStorage.getItem('hrm_portal_mode') === '1';

  if (qsPortal) {
    if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('hrm_portal_mode', '1');
    if (typeof localStorage !== 'undefined') localStorage.setItem('hrm_portal_mode', '1');
  }

  return qsPortal || storedSession || storedLocal;
}
