import { describe, expect, it, beforeEach } from 'vitest';

describe('AttendanceEntry', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/hr/attendance?portal=1&companyId=main');
  });

  it('imports the thin shell quickly', async () => {
    const started = Date.now();
    const mod = await import('./AttendanceEntry');
    expect(mod.default).toBeTypeOf('function');
    expect(Date.now() - started).toBeLessThan(5000);
  });
});
