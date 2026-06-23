import { ApiClientError } from '@/lib/apiError';
import { applyPortalSession, type PortalSessionUser } from '@/lib/portalAuthBridge';
import { safeRandomUuid } from '@/lib/safeRandomUuid';

const HRM_API_ORIGIN = (import.meta.env.VITE_HRM_API_ORIGIN ?? '').replace(/\/$/, '');

type HrmEnvelope<T> = {
  success: boolean;
  code: string;
  message: string;
  data?: T;
};

export type MobileAuthMembership = {
  employee_id: string;
  company_id: string;
  tenant_id?: string;
  role?: string;
};

export type MobileLoginResult = {
  access_token: string;
  expires_in_sec?: number;
  memberships?: MobileAuthMembership[];
  user?: { user_id?: string; email?: string; display_name?: string };
};

function apiBase(): string {
  if (HRM_API_ORIGIN) return `${HRM_API_ORIGIN}/api/hrm`;
  return '/api/hrm';
}

async function parseEnvelope<T>(res: Response): Promise<T> {
  let body: HrmEnvelope<T> | undefined;
  try {
    body = (await res.json()) as HrmEnvelope<T>;
  } catch {
    // ignore
  }
  if (!res.ok || !body?.success || body.data === undefined) {
    throw new ApiClientError({
      status: res.status,
      code: body?.code,
      message: body?.message ?? `Đăng nhập thất bại (${res.status})`,
      details: body?.details,
    });
  }
  return body.data;
}

export async function mobileLogin(email: string, password: string): Promise<MobileLoginResult> {
  const res = await fetch(`${apiBase()}/auth/mobile/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-request-id': safeRandomUuid(),
    },
    body: JSON.stringify({ email, password }),
  });
  return parseEnvelope<MobileLoginResult>(res);
}

export function persistMobileSession(result: MobileLoginResult, email: string): void {
  const expiresAt =
    Date.now() + (result.expires_in_sec ?? 43200) * 1000;
  const user: PortalSessionUser = {
    userId: result.user?.user_id ?? email,
    displayName: result.user?.display_name ?? email,
  };
  applyPortalSession({
    accessToken: result.access_token,
    user,
    expiresAt,
  });
}
