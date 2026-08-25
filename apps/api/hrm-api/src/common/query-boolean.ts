/** Parse query-string booleans (`true`/`false`/`1`/`0`) for ValidationPipe + forbidNonWhitelisted. */
export function toOptionalQueryBoolean(value: unknown): boolean | undefined {
  if (value === true || value === 'true' || value === '1') return true;
  if (value === false || value === 'false' || value === '0') return false;
  return undefined;
}
