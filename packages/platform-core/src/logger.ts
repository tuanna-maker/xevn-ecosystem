import pino, { type Logger } from 'pino';

const REDACT_PATHS = [
  'password',
  'req.headers.authorization',
  'headers.authorization',
  'mobile_password_hash',
  'token',
  'access_token',
  'refresh_token',
];

export type PlatformLoggerOptions = {
  service: string;
  level?: string;
};

export function createPlatformLogger(opts: PlatformLoggerOptions): Logger {
  const level = opts.level ?? process.env.LOG_LEVEL ?? (process.env.NODE_ENV === 'production' ? 'info' : 'debug');
  return pino({
    level,
    base: { service: opts.service },
    redact: { paths: REDACT_PATHS, censor: '[REDACTED]' },
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level: (label) => ({ level: label }),
    },
  });
}
