import { describe, expect, it } from 'vitest';
import { getHrmRealtimeSocketUrl } from '../hrmRealtimeClient';

describe('getHrmRealtimeSocketUrl', () => {
  it('strips trailing slash and appends namespace path', () => {
    expect(getHrmRealtimeSocketUrl('http://localhost:3001/')).toBe('http://localhost:3001/hrm-realtime');
    expect(getHrmRealtimeSocketUrl('https://api.example.com')).toBe('https://api.example.com/hrm-realtime');
  });
});
