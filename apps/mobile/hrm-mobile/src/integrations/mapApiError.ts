import type { HrmRequestResult } from './hrmApiClient';

export function formatHrmError(result: HrmRequestResult<unknown>): string {
  if (result.ok) return '';
  return `${result.code}: ${result.message}`;
}

export function isAuthError(result: HrmRequestResult<unknown>): boolean {
  if (result.ok) return false;
  return result.code === 'HRM-ERR-AUTH-INVALID' || result.httpStatus === 401;
}
