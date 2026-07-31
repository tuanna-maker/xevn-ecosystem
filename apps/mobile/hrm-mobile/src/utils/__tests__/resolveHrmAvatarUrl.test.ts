import { describe, expect, it } from 'vitest';
import {
  resolveEmployeeInitials,
  resolveHrmAvatarUrl,
  withAvatarCacheBust,
} from '../resolveHrmAvatarUrl';

describe('resolveHrmAvatarUrl', () => {
  it('returns null for empty avatar_url', () => {
    expect(resolveHrmAvatarUrl('https://api.test', null)).toBeNull();
    expect(resolveHrmAvatarUrl('https://api.test', '  ')).toBeNull();
  });

  it('passes through absolute https URLs', () => {
    const url = 'https://cdn.test/avatars/u1.jpg';
    expect(resolveHrmAvatarUrl('https://api.test', url)).toBe(url);
  });

  it('prefixes relative /api/hrm/files path with baseUrl', () => {
    expect(
      resolveHrmAvatarUrl('http://127.0.0.1:28001', '/api/hrm/files/holding/u1.jpg'),
    ).toBe('http://127.0.0.1:28001/api/hrm/files/holding/u1.jpg');
  });

  it('handles baseUrl trailing slash', () => {
    expect(resolveHrmAvatarUrl('https://api.test/', '/files/x.png')).toBe('https://api.test/files/x.png');
  });

  it('returns path-only when baseUrl missing', () => {
    expect(resolveHrmAvatarUrl('', '/api/hrm/files/x.jpg')).toBe('/api/hrm/files/x.jpg');
  });
});

describe('withAvatarCacheBust', () => {
  it('appends v query param', () => {
    expect(withAvatarCacheBust('https://x/a.jpg', 42)).toBe('https://x/a.jpg?v=42');
  });

  it('uses & when query already present', () => {
    expect(withAvatarCacheBust('https://x/a.jpg?token=1', 99)).toBe('https://x/a.jpg?token=1&v=99');
  });

  it('returns null for null url', () => {
    expect(withAvatarCacheBust(null)).toBeNull();
  });
});

describe('resolveEmployeeInitials', () => {
  it('uses first and last word initials', () => {
    expect(resolveEmployeeInitials('Nguyá»…n VÄƒn An')).toBe('NA');
  });

  it('uses two chars for single word', () => {
    expect(resolveEmployeeInitials('Admin')).toBe('AD');
  });

  it('returns ? for empty name', () => {
    expect(resolveEmployeeInitials('')).toBe('?');
  });
});
