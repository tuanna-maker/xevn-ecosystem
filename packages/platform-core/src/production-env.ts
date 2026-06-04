const FORBIDDEN_SECRETS = new Set(['xevn-dev-jwt-secret', 'xevn-dev-internal-key', 'change-me', 'secret']);

export type ProductionEnvCheckResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
};

export function validateProductionEnv(service: string): ProductionEnvCheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (process.env.NODE_ENV !== 'production') {
    return { ok: true, errors, warnings };
  }

  const jwt = process.env.SERVICE_JWT_SECRET?.trim();
  if (!jwt) {
    errors.push(`${service}: SERVICE_JWT_SECRET is required in production`);
  } else if (FORBIDDEN_SECRETS.has(jwt)) {
    errors.push(`${service}: SERVICE_JWT_SECRET must not use dev/default value`);
  }

  const internalKey = process.env.INTERNAL_API_KEY?.trim();
  if (!internalKey) {
    warnings.push(`${service}: INTERNAL_API_KEY not set (internal routes may be disabled)`);
  } else if (FORBIDDEN_SECRETS.has(internalKey)) {
    errors.push(`${service}: INTERNAL_API_KEY must not use dev default in production`);
  }

  if (!process.env.CORS_ALLOWED_ORIGINS?.trim()) {
    errors.push(`${service}: CORS_ALLOWED_ORIGINS is required in production`);
  }

  return { ok: errors.length === 0, errors, warnings };
}

export function assertProductionEnvOrExit(service: string): void {
  const result = validateProductionEnv(service);
  for (const w of result.warnings) {
    console.warn(`[${service}] ${w}`);
  }
  if (!result.ok) {
    for (const e of result.errors) {
      console.error(`[${service}] ${e}`);
    }
    process.exit(1);
  }
}
