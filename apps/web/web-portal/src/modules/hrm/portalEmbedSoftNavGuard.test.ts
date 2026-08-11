import { describe, expect, it } from 'vitest';
import {
  iframeAppPathMatchesExpected,
  normalizeHrmEmbedAppPath,
  shouldForceEmbedSrcReload,
} from './portalEmbedSoftNavGuard';

describe('portalEmbedSoftNavGuard (CD-FB-09-SOFT-NAV)', () => {
  it('normalizes iframe /hr/attendance and app-rel /attendance', () => {
    expect(normalizeHrmEmbedAppPath('/hr/attendance')).toBe('/attendance');
    expect(normalizeHrmEmbedAppPath('/attendance', '')).toBe('/attendance');
    expect(normalizeHrmEmbedAppPath('/hr/')).toBe('/');
    expect(normalizeHrmEmbedAppPath('/hr/dashboard')).toBe('/');
    expect(normalizeHrmEmbedAppPath('/hr/recruitment/')).toBe('/recruitment');
  });

  it('matches expected soft-nav target for recruitment', () => {
    expect(iframeAppPathMatchesExpected('/hr/recruitment', '/recruitment')).toBe(true);
    expect(iframeAppPathMatchesExpected('/hr/attendance', '/recruitment')).toBe(false);
  });

  it('forces src reload when Attendance stuck after soft click Tuyển dụng', () => {
    expect(shouldForceEmbedSrcReload('/hr/attendance', '/recruitment')).toBe(true);
    expect(shouldForceEmbedSrcReload('/hr/recruitment', '/recruitment')).toBe(false);
    expect(shouldForceEmbedSrcReload(null, '/recruitment')).toBe(false);
  });
});
