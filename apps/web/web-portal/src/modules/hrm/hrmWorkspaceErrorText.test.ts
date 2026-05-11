import { describe, expect, it } from 'vitest';
import { ScopeContextError } from '../../integrations/identityScope';
import { HrmApiClientError } from './hrmApiErrors';
import { formatHrmMetadataQueueError } from './hrmWorkspaceErrorText';

describe('formatHrmMetadataQueueError', () => {
  it('formats ScopeContextError with SCOPE_* code', () => {
    const msg = formatHrmMetadataQueueError(
      new ScopeContextError('missing tenant', 'SCOPE_TENANT_REQUIRED'),
      'Không tải được hàng chờ metadata',
    );
    expect(msg).toBe('Không tải được hàng chờ metadata [SCOPE_TENANT_REQUIRED]');
  });

  it('formats HrmApiClientError with code and JSON details', () => {
    const msg = formatHrmMetadataQueueError(
      new HrmApiClientError('x', {
        status: 403,
        code: 'HTTP_403',
        details: { reason: 'policy' },
      }),
      'Không cập nhật được yêu cầu metadata',
    );
    expect(msg).toContain('[HTTP_403]');
    expect(msg).toContain('{"reason":"policy"}');
  });

  it('returns fallback for unknown errors', () => {
    expect(formatHrmMetadataQueueError(new Error('random'), 'Fallback')).toBe('Fallback');
  });
});
