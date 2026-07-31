import { describe, expect, it } from 'vitest';

import { resolveHrmWriteHeaderId } from '../hrmApiClient';
import {
  buildAvatarUploadUrl,
  buildLeaveAttachmentUploadUrl,
  resolveAvatarUploadCompanyId,
  validateLeaveAttachmentUpload,
} from '../hrmFileUpload';
import type { HrmAuthConfig } from '../types';

const HOLDING_UUID = '10000000-0000-4000-8000-000000000001';
const EMPLOYEE_ID = '3796d949-4513-45c0-88fa-33030a062b17';

function holdingAuth(overrides: Partial<HrmAuthConfig> = {}): HrmAuthConfig {
  return {
    baseUrl: 'http://127.0.0.1:28001',
    accessToken: 'token',
    tenantId: 'xevn',
    companyId: 'holding',
    companyUuid: HOLDING_UUID,
    employeeId: EMPLOYEE_ID,
    memberships: [
      {
        tenant_id: 'xevn',
        company_id: 'holding',
        company_uuid: HOLDING_UUID,
        employee_id: EMPLOYEE_ID,
      },
    ],
    ...overrides,
  };
}

describe('resolveAvatarUploadCompanyId', () => {
  it('PCOMP-W4-PROFILE-AVATAR-MOB-JAVT-03: holding slug for upload query when scope is holding', () => {
    expect(resolveAvatarUploadCompanyId(holdingAuth())).toBe('holding');
  });

  it('PCOMP-W7-MOB-WHOS-OUT-02: recovers holding slug when companyId is legal UUID', () => {
    expect(
      resolveAvatarUploadCompanyId(
        holdingAuth({
          companyId: HOLDING_UUID,
        }),
      ),
    ).toBe('holding');
  });

  it('does not use legal UUID for upload query (would cause HRM-FILE-409)', () => {
    const queryId = resolveAvatarUploadCompanyId(
      holdingAuth({
        companyId: HOLDING_UUID,
      }),
    );
    expect(queryId).not.toBe(HOLDING_UUID);
    expect(queryId).toBe('holding');
  });
});

describe('buildAvatarUploadUrl', () => {
  it('PCOMP-W4-PROFILE-AVATAR-MOB-JAVT-03: query company_id=holding not UUID', () => {
    const auth = holdingAuth({ companyId: HOLDING_UUID });
    const queryCompanyId = resolveAvatarUploadCompanyId(auth);
    const url = buildAvatarUploadUrl(auth.baseUrl, queryCompanyId);

    expect(url).toContain('company_id=holding');
    expect(url).not.toContain(encodeURIComponent(HOLDING_UUID));
    expect(url).toContain('feature=employee-avatar');
    expect(url).toBe(
      'http://127.0.0.1:28001/api/hrm/files/upload?feature=employee-avatar&company_id=holding',
    );
  });

  it('write header stays legal UUID while query uses holding slug', () => {
    const auth = holdingAuth();
    const queryCompanyId = resolveAvatarUploadCompanyId(auth);
    const writeHeader = resolveHrmWriteHeaderId(auth.companyUuid, auth.companyId);

    expect(queryCompanyId).toBe('holding');
    expect(writeHeader).toBe(HOLDING_UUID);
    expect(queryCompanyId).not.toBe(writeHeader);
  });
});

describe('buildLeaveAttachmentUploadUrl â€” PCOMP-W7-MOB-LEAVE-DOC', () => {
  it('uses leave-attachment feature and holding slug query', () => {
    const url = buildLeaveAttachmentUploadUrl('http://127.0.0.1:28001', 'holding');
    expect(url).toContain('feature=leave-attachment');
    expect(url).toContain('company_id=holding');
  });
});

describe('validateLeaveAttachmentUpload', () => {
  it('accepts PDF under 10MB', () => {
    expect(
      validateLeaveAttachmentUpload({
        uri: 'file:///doc.pdf',
        fileName: 'doc.pdf',
        mimeType: 'application/pdf',
        byteSize: 1024,
      }),
    ).toBeNull();
  });
});
