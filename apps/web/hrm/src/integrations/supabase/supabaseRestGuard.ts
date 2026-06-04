import { isHrmApiDataMode, isRemoteLocalhostSupabaseMisconfig } from '@/lib/hrmDataMode';

export const SUPABASE_REST_BLOCKED_CODE = 'HRM_SUPABASE_REST_BLOCKED';

export type BlockedPostgrestResult = {
  data: unknown;
  error: {
    message: string;
    code: string;
    details: string;
    hint: string;
    name: string;
  } | null;
  count: null;
  status: number;
  statusText: string;
};

function blockedError(): NonNullable<BlockedPostgrestResult['error']> {
  return {
    message:
      'Supabase REST is disabled in HRM API mode. Use Nest /api/hrm endpoints (hrmApi.ts) instead.',
    code: SUPABASE_REST_BLOCKED_CODE,
    details: '',
    hint: 'Set VITE_HRM_USE_API=false only for legacy standalone Supabase dev.',
    name: 'PostgrestError',
  };
}

/** True when Supabase REST must not hit the network (API mode or remote+localhost URL). */
export function shouldBlockSupabaseRest(_search?: string): boolean {
  if (isRemoteLocalhostSupabaseMisconfig()) return true;
  return isHrmApiDataMode();
}

/**
 * Chainable PostgREST builder that fails closed — rejects with a PostgREST-shaped error, no network I/O.
 */
export function createBlockedPostgrestBuilder(): PromiseLike<BlockedPostgrestResult> {
  const result: BlockedPostgrestResult = {
    data: null,
    error: blockedError(),
    count: null,
    status: 400,
    statusText: 'Bad Request',
  };
  const proxyTarget: Record<string, unknown> = {};

  const chain = (): PromiseLike<BlockedPostgrestResult> =>
    new Proxy(proxyTarget, {
      get(_target, prop) {
        if (prop === 'then') {
          return (
            onFulfilled?: (value: BlockedPostgrestResult) => unknown,
            onRejected?: (reason: unknown) => unknown,
          ) => Promise.resolve(result).then(onFulfilled, onRejected);
        }
        if (prop === 'catch') {
          return (onRejected?: (reason: unknown) => unknown) => Promise.resolve(result).catch(onRejected);
        }
        if (prop === 'finally') {
          return (onFinally?: () => void) => Promise.resolve(result).finally(onFinally);
        }
        if (prop === 'single' || prop === 'maybeSingle') {
          return () => createBlockedPostgrestBuilder();
        }
        return chain;
      },
    }) as PromiseLike<BlockedPostgrestResult>;

  return chain();
}
