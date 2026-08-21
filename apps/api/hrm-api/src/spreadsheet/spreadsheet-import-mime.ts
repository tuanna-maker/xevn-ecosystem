import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';

const ALLOWED = new Set([
  '',
  'text/csv',
  'application/csv',
  'application/octet-stream',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/plain',
]);

export function assertImportUploadMime(
  mimetype: string | undefined,
  originalname: string | undefined,
): void {
  const name = originalname ?? '';
  if (/\.(png|gif|jpe?g|webp|pdf|zip|bin)$/i.test(name)) {
    throw new ApiException(
      'SHEET-415',
      'Unsupported file extension for import',
      HttpStatus.UNSUPPORTED_MEDIA_TYPE,
      {
        originalname: name,
      },
    );
  }
  const m = mimetype?.trim() ?? '';
  if (!m || ALLOWED.has(m) || m.includes('spreadsheetml')) {
    return;
  }
  throw new ApiException(
    'SHEET-415',
    'Unsupported media type for import',
    HttpStatus.UNSUPPORTED_MEDIA_TYPE,
    {
      mimetype: m,
    },
  );
}
