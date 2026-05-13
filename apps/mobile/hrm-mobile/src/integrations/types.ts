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
  tenantId: string;
  companyId: string;
};
