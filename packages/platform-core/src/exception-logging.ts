import type { Logger } from 'pino';

export function logHttpException(
  logger: Logger | undefined,
  input: {
    status: number;
    code: string;
    message: string;
    exception: unknown;
    path?: string;
    method?: string;
  },
): void {
  const base = {
    status: input.status,
    code: input.code,
    method: input.method,
    path: input.path,
    msg: input.message,
  };
  if (input.status >= 500 && input.exception instanceof Error) {
    logger?.error({ ...base, err: input.exception }, 'unhandled exception');
    return;
  }
  if (input.status >= 400) {
    logger?.warn(base, 'http exception');
    return;
  }
}
