import type { HrmAuthConfig } from './types';
import { hrmRequest } from './hrmApiClient';

/** Fail-closed cancel — Nest API has no DELETE leave endpoint (web parity). */
export async function tryCancelLeaveRequest(
  auth: HrmAuthConfig,
  _requestId: string,
): Promise<{ ok: false; message: string }> {
  void auth;
  return {
    ok: false,
    message:
      'Hệ thống chưa hỗ trợ hủy đơn nghỉ trên ứng dụng. Vui lòng liên hệ quản lý hoặc HR để rút đơn.',
  };
}
