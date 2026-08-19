import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import {
  HRM_PAY_INP_PROFILE_422,
  type PaySetupContextSnapshot,
} from './pay-cntt-setup.constants';

type PolicyRow = {
  id: string;
  code: string;
  updated_at: string;
  rate_params_json: unknown;
};

type ProfileRow = {
  id: string;
  code: string;
  updated_at: string;
  allowed_source_kinds_json: unknown;
  required_component_codes_json: unknown;
};

export function parseSetupContextFromSnapshot(snapshot: unknown): PaySetupContextSnapshot | null {
  if (!snapshot || typeof snapshot !== 'object') return null;
  const setup = (snapshot as Record<string, unknown>).setupContext;
  if (!setup || typeof setup !== 'object') return null;
  const ctx = setup as Record<string, unknown>;
  const allowed = Array.isArray(ctx.allowedSourceKinds)
    ? ctx.allowedSourceKinds.filter((k): k is string => typeof k === 'string')
    : undefined;
  const required = Array.isArray(ctx.requiredComponentCodes)
    ? ctx.requiredComponentCodes.filter((c): c is string => typeof c === 'string')
    : undefined;
  return {
    policyPackId: typeof ctx.policyPackId === 'string' ? ctx.policyPackId : undefined,
    policyPackCode: typeof ctx.policyPackCode === 'string' ? ctx.policyPackCode : undefined,
    policyPackVersionAt:
      typeof ctx.policyPackVersionAt === 'string' ? ctx.policyPackVersionAt : undefined,
    policyPackRateParams:
      ctx.policyPackRateParams && typeof ctx.policyPackRateParams === 'object'
        ? (ctx.policyPackRateParams as Record<string, unknown>)
        : undefined,
    inputPackProfileId:
      typeof ctx.inputPackProfileId === 'string' ? ctx.inputPackProfileId : undefined,
    inputPackProfileCode:
      typeof ctx.inputPackProfileCode === 'string' ? ctx.inputPackProfileCode : undefined,
    inputPackProfileVersionAt:
      typeof ctx.inputPackProfileVersionAt === 'string' ? ctx.inputPackProfileVersionAt : undefined,
    allowedSourceKinds: allowed,
    requiredComponentCodes: required,
  };
}

export function assertSourceKindAllowedByProfile(
  sourceKind: string,
  setupContext: PaySetupContextSnapshot | null,
): void {
  const allowed = setupContext?.allowedSourceKinds;
  if (!allowed || allowed.length === 0) return;
  const normalized = sourceKind.trim().toLowerCase();
  const ok = allowed.some((k) => k.trim().toLowerCase() === normalized);
  if (!ok) {
    throw new ApiException(
      HRM_PAY_INP_PROFILE_422,
      `source_kind "${sourceKind}" không thuộc profile kỳ. Cho phép: ${allowed.join(', ')}`,
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}

export function buildSetupContextFromPackRows(
  policy: PolicyRow | null | undefined,
  profile: ProfileRow | null | undefined,
): PaySetupContextSnapshot {
  const ctx: PaySetupContextSnapshot = {};
  if (policy) {
    ctx.policyPackId = policy.id;
    ctx.policyPackCode = policy.code;
    ctx.policyPackVersionAt = policy.updated_at;
    if (policy.rate_params_json && typeof policy.rate_params_json === 'object') {
      ctx.policyPackRateParams = policy.rate_params_json as Record<string, unknown>;
    }
  }
  if (profile) {
    ctx.inputPackProfileId = profile.id;
    ctx.inputPackProfileCode = profile.code;
    ctx.inputPackProfileVersionAt = profile.updated_at;
    if (Array.isArray(profile.allowed_source_kinds_json)) {
      ctx.allowedSourceKinds = profile.allowed_source_kinds_json.filter(
        (k): k is string => typeof k === 'string',
      );
    }
    if (Array.isArray(profile.required_component_codes_json)) {
      ctx.requiredComponentCodes = profile.required_component_codes_json.filter(
        (c): c is string => typeof c === 'string',
      );
    }
  }
  return ctx;
}

/** Validate policy_doc_refs_json array shape — reference-only GĐ1. */
export function assertPolicyDocRefsShape(refs: unknown): void {
  if (refs == null) return;
  if (!Array.isArray(refs)) {
    throw new ApiException('HRM-VAL-400', 'policyDocRefs must be an array', HttpStatus.BAD_REQUEST);
  }
  for (const item of refs) {
    if (!item || typeof item !== 'object') {
      throw new ApiException('HRM-VAL-400', 'policyDocRefs items must be objects', HttpStatus.BAD_REQUEST);
    }
    const row = item as Record<string, unknown>;
    if (row.docId != null && typeof row.docId !== 'string') {
      throw new ApiException('HRM-VAL-400', 'policyDocRefs.docId must be string', HttpStatus.BAD_REQUEST);
    }
    if (row.path != null && typeof row.path !== 'string') {
      throw new ApiException('HRM-VAL-400', 'policyDocRefs.path must be string', HttpStatus.BAD_REQUEST);
    }
    if (row.fragmentIds != null && !Array.isArray(row.fragmentIds)) {
      throw new ApiException(
        'HRM-VAL-400',
        'policyDocRefs.fragmentIds must be array',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}

/** rate_params_json — finite numeric leaves only (no formula eval GĐ1). */
export function assertRateParamsShape(params: unknown, path = ''): void {
  if (params == null) return;
  if (typeof params === 'number') {
    if (!Number.isFinite(params)) {
      throw new ApiException(
        'HRM-VAL-400',
        `rateParams${path} must be finite number`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return;
  }
  if (typeof params !== 'object' || Array.isArray(params)) {
    throw new ApiException('HRM-VAL-400', 'rateParams must be object', HttpStatus.BAD_REQUEST);
  }
  for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
    assertRateParamsShape(value, `${path}.${key}`);
  }
}
