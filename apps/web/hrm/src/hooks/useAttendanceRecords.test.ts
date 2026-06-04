import { describe, expect, it } from 'vitest';
import { buildAttendanceRecordsQuery } from './useAttendanceRecords';

describe('buildAttendanceRecordsQuery', () => {
  it('never exceeds Nest page_size cap of 100', () => {
    expect(buildAttendanceRecordsQuery('main', '2025-06-01').page_size).toBe(100);
    expect(buildAttendanceRecordsQuery('main').page_size).toBe(100);
  });
});
