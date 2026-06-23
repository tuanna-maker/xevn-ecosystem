import {
  getDefaultBaseUrl,
  resolveHrmWriteHeaderId,
  type HrmRequestResult,
} from './hrmApiClient';
import { resolveAvatarUploadQueryCompanyId } from './companyWireScope';
import type { HrmAuthConfig } from './types';
import {
  LEAVE_ATTACHMENT_ALLOWED_MIME,
  LEAVE_ATTACHMENT_MAX_BYTES,
  type LeaveAttachmentDraft,
  validateLeaveAttachment,
} from '../utils/leaveAttachment';
import { AVATAR_ALLOWED_MIME, AVATAR_MAX_BYTES, resolveHrmAvatarUrl } from '../utils/resolveHrmAvatarUrl';

export type HrmFileUploadPayload = {
  uri: string;
  fileName: string;
  mimeType: string;
  byteSize?: number;
};

function randomRequestId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return `mob-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

/** Rollup slug for upload `company_id` query — not legal UUID (HRM-FILE-409 if UUID). */
export function resolveAvatarUploadCompanyId(auth: HrmAuthConfig): string {
  return resolveAvatarUploadQueryCompanyId({
    companyUuid: auth.companyUuid,
    companyId: auth.companyId,
    accessToken: auth.accessToken,
    memberships: auth.memberships,
    employeeId: auth.employeeId,
    tenantId: auth.tenantId,
  });
}

export function buildAvatarUploadUrl(baseUrl: string, companyIdForQuery: string): string {
  return buildHrmFeatureUploadUrl(baseUrl, companyIdForQuery, 'employee-avatar');
}

export function buildLeaveAttachmentUploadUrl(baseUrl: string, companyIdForQuery: string): string {
  return buildHrmFeatureUploadUrl(baseUrl, companyIdForQuery, 'leave-attachment');
}

export function buildHrmFeatureUploadUrl(
  baseUrl: string,
  companyIdForQuery: string,
  feature: string,
): string {
  const search = new URLSearchParams({
    feature,
    company_id: companyIdForQuery,
  });
  return `${stripTrailingSlash(baseUrl)}/api/hrm/files/upload?${search.toString()}`;
}

export function validateAvatarUpload(payload: HrmFileUploadPayload): string | null {
  const mime = payload.mimeType?.trim().toLowerCase() ?? '';
  if (!AVATAR_ALLOWED_MIME.has(mime)) {
    return 'Chỉ hỗ trợ ảnh JPEG, PNG hoặc WebP.';
  }
  if (payload.byteSize != null && payload.byteSize > AVATAR_MAX_BYTES) {
    return 'Ảnh tối đa 5 MB.';
  }
  if (!payload.uri?.trim()) return 'Không đọc được file ảnh.';
  return null;
}

/**
 * Multipart upload mirroring web `uploadHrmFile` — `POST /api/hrm/files/upload`.
 * Uses `resolveHrmWriteHeaderId` for `x-company-id` on write path.
 */
export function validateLeaveAttachmentUpload(payload: LeaveAttachmentDraft): string | null {
  return validateLeaveAttachment(payload);
}

async function uploadHrmMultipartFile(
  auth: HrmAuthConfig,
  payload: HrmFileUploadPayload,
  companyIdForQuery: string,
  uploadUrl: string,
  clientErrorCode: string,
): Promise<HrmRequestResult<{ url: string; absoluteUrl: string }>> {
  const companyId = companyIdForQuery.trim();
  if (!companyId) {
    return {
      ok: false,
      code: 'HRM-FILE-400',
      message: 'Thiếu company_id cho upload.',
      requestId: randomRequestId(),
    };
  }

  const requestId = randomRequestId();
  const baseUrl = stripTrailingSlash(auth.baseUrl?.trim() || getDefaultBaseUrl());

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'x-request-id': requestId,
  };
  const writeHeader = resolveHrmWriteHeaderId(auth.companyUuid, auth.companyId);
  if (writeHeader) headers['x-company-id'] = writeHeader;
  if (auth.tenantId?.trim()) headers['x-tenant-id'] = auth.tenantId.trim();
  if (auth.accessToken) {
    headers.Authorization = auth.accessToken.startsWith('Bearer ')
      ? auth.accessToken
      : `Bearer ${auth.accessToken}`;
  }
  if (auth.internalApiKey) headers['x-internal-api-key'] = auth.internalApiKey;

  const form = new FormData();
  form.append('file', {
    uri: payload.uri,
    name: payload.fileName || 'upload.bin',
    type: payload.mimeType,
  } as unknown as Blob);

  try {
    const res = await fetch(uploadUrl, { method: 'POST', headers, body: form });
    const text = await res.text();
    let body: unknown = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = { raw: text };
    }

    const envelope = body as {
      success?: boolean;
      code?: string;
      message?: string;
      data?: { url?: string };
    };

    if (envelope?.success === true && envelope.data?.url) {
      const relative = envelope.data.url;
      const absoluteUrl = resolveHrmAvatarUrl(baseUrl, relative) ?? relative;
      return {
        ok: true,
        data: { url: relative, absoluteUrl },
        code: envelope.code ?? 'HRM-FILE-201',
        requestId,
      };
    }

    if (envelope?.success === false) {
      return {
        ok: false,
        code: envelope.code ?? 'HRM-ERR-UNKNOWN',
        message: envelope.message ?? 'Upload thất bại',
        requestId,
        httpStatus: res.status,
      };
    }

    return {
      ok: false,
      code: 'HRM-FILE-NO-URL',
      message: 'Upload thành công nhưng không có URL.',
      requestId,
      httpStatus: res.status,
    };
  } catch (e) {
    return {
      ok: false,
      code: clientErrorCode,
      message: e instanceof Error ? e.message : 'Lỗi mạng khi upload',
      requestId,
    };
  }
}

/**
 * Multipart upload for leave medical certificate — `feature=leave-attachment`.
 */
export async function uploadLeaveAttachmentFile(
  auth: HrmAuthConfig,
  payload: LeaveAttachmentDraft,
  companyIdForQuery: string,
): Promise<HrmRequestResult<{ url: string; absoluteUrl: string }>> {
  const validationError = validateLeaveAttachmentUpload(payload);
  if (validationError) {
    return {
      ok: false,
      code: 'HRM-MOB-DOC-400',
      message: validationError,
      requestId: randomRequestId(),
    };
  }

  const mime = payload.mimeType?.trim().toLowerCase() ?? '';
  if (!LEAVE_ATTACHMENT_ALLOWED_MIME.has(mime)) {
    return {
      ok: false,
      code: 'HRM-MOB-DOC-400',
      message: 'Chỉ hỗ trợ ảnh JPEG/PNG/WebP hoặc PDF.',
      requestId: randomRequestId(),
    };
  }
  if (payload.byteSize != null && payload.byteSize > LEAVE_ATTACHMENT_MAX_BYTES) {
    return {
      ok: false,
      code: 'HRM-MOB-DOC-400',
      message: 'Tệp tối đa 10 MB.',
      requestId: randomRequestId(),
    };
  }

  const baseUrl = stripTrailingSlash(auth.baseUrl?.trim() || getDefaultBaseUrl());
  const url = buildLeaveAttachmentUploadUrl(baseUrl, companyIdForQuery);
  return uploadHrmMultipartFile(
    auth,
    payload,
    companyIdForQuery,
    url,
    'HRM-MOB-ERR-NETWORK',
  );
}

export async function uploadHrmAvatarFile(
  auth: HrmAuthConfig,
  payload: HrmFileUploadPayload,
  companyIdForQuery: string,
): Promise<HrmRequestResult<{ url: string; absoluteUrl: string }>> {
  const validationError = validateAvatarUpload(payload);
  if (validationError) {
    return {
      ok: false,
      code: 'HRM-MOB-AVT-400',
      message: validationError,
      requestId: randomRequestId(),
    };
  }

  const companyId = companyIdForQuery.trim();
  if (!companyId) {
    return {
      ok: false,
      code: 'HRM-FILE-400',
      message: 'Thiếu company_id cho upload.',
      requestId: randomRequestId(),
    };
  }

  const baseUrl = stripTrailingSlash(auth.baseUrl?.trim() || getDefaultBaseUrl());
  const url = buildAvatarUploadUrl(baseUrl, companyId);
  return uploadHrmMultipartFile(
    auth,
    payload,
    companyId,
    url,
    'HRM-MOB-ERR-NETWORK',
  );
}
