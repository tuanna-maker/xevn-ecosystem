export type ApiEnvelopeSuccess<T> = {
  success: true;
  code: string;
  message: string;
  data: T;
  timestamp: string;
};

export type ApiEnvelopeError = {
  success: false;
  code: string;
  message: string;
  details?: unknown;
  timestamp?: string;
};

export type HrmAuthConfig = {
  baseUrl: string;
  accessToken?: string;
  internalApiKey?: string;
  /** Bỏ trống khi gọi login công khai (server tự suy tenant từ hồ sơ). */
  tenantId?: string;
  /** Scope slug from membership (e.g. main, holding); used only when companyUuid absent. */
  companyId?: string;
  /** Active membership legal-entity UUID — preferred for x-company-id. */
  companyUuid?: string;
};
