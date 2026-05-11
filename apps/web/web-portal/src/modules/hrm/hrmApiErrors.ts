export type HrmApiEnvelope<T> = {
  success: boolean;
  code: string;
  message: string;
  data?: T;
  details?: unknown;
};

export class HrmApiClientError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(message: string, options: { status: number; code: string; details?: unknown }) {
    super(message);
    this.name = 'HrmApiClientError';
    this.status = options.status;
    this.code = options.code;
    this.details = options.details;
  }
}

/** Maps thrown errors from `fetch` (timeout abort vs network). Pure — safe for unit tests. */
export function mapCaughtFetchError(error: unknown): HrmApiClientError {
  if (error instanceof DOMException && error.name === 'AbortError') {
    return new HrmApiClientError('HRM API timeout', {
      status: 408,
      code: 'TIMEOUT',
    });
  }
  return new HrmApiClientError('HRM API network error', {
    status: 0,
    code: 'NETWORK_ERROR',
    details: error instanceof Error ? { cause: error.message } : undefined,
  });
}

export function mapFailedHttpResponse<T>(
  status: number,
  body: HrmApiEnvelope<T> | null,
): HrmApiClientError {
  return new HrmApiClientError(body?.message ?? `HRM API request failed (${status})`, {
    status,
    code: body?.code ?? `HTTP_${status}`,
    details: body?.details,
  });
}

export function mapInvalidSuccessEnvelope<T>(
  status: number,
  body: HrmApiEnvelope<T> | null,
): HrmApiClientError {
  return new HrmApiClientError(body?.message ?? 'HRM API returned invalid envelope', {
    status,
    code: body?.code ?? 'HRM_INVALID_ENVELOPE',
    details: body?.details,
  });
}
