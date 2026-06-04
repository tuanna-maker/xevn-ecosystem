export function resolveCorsOptions(): {
  origin: boolean | string | RegExp | (string | RegExp)[];
  credentials: boolean;
} {
  const raw = process.env.CORS_ALLOWED_ORIGINS?.trim();
  if (process.env.NODE_ENV === 'production') {
    const origins = (raw ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    return { origin: origins.length ? origins : false, credentials: true };
  }
  if (raw) {
    const origins = raw.split(',').map((s) => s.trim()).filter(Boolean);
    return { origin: origins, credentials: true };
  }
  return { origin: true, credentials: true };
}
