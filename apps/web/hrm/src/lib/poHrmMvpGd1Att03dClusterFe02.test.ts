/**
 * PO-HRM-MVP-GD1-ATT-03D-CLUSTER-FE-02 — GPS punch status vs EFF catalog (R-ATT-03D-CNS-STATUS-CODE).
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { buildAttendanceCheckInApiPayload } from '@/hooks/useAttendanceRecords';
import {
  resolveCheckInRecordStatus,
  resolveDefaultCheckInStatusFromCatalog,
} from '@/hooks/useAttAttendanceCodesEffective';

const hooksDir = dirname(fileURLToPath(import.meta.url));
const gpsSource = readFileSync(
  join(hooksDir, '..', 'components', 'attendance', 'GPSAttendance.tsx'),
  'utf8',
);

describe('resolveCheckInRecordStatus — EFF catalog (FE-02)', () => {
  const nestOptions = [
    { code: 'wfh_qa_fe_mskcja95', name: 'WFH QA' },
    { code: 'ct', name: 'Công tác' },
  ];

  it('EFF>0 rejects present when absent from catalog', () => {
    expect(
      resolveCheckInRecordStatus({
        catalogBound: true,
        nestOptions,
        explicitStatus: 'present',
      }),
    ).toBeNull();
  });

  it('EFF>0 accepts Nest code from picker', () => {
    expect(
      resolveCheckInRecordStatus({
        catalogBound: true,
        nestOptions,
        explicitStatus: 'wfh_qa_fe_mskcja95',
      }),
    ).toBe('wfh_qa_fe_mskcja95');
  });

  it('EFF=0 bootstrap defaults to present when no explicit', () => {
    expect(
      resolveCheckInRecordStatus({
        catalogBound: false,
        nestOptions: [],
        explicitStatus: undefined,
      }),
    ).toBe('present');
  });

  it('default picker prefers present when in catalog else first', () => {
    expect(
      resolveDefaultCheckInStatusFromCatalog([
        { code: 'wfh_qa_fe_mskcja95', name: 'A' },
        { code: 'present', name: 'Có mặt' },
      ]),
    ).toBe('present');
    expect(
      resolveDefaultCheckInStatusFromCatalog([{ code: 'wfh_qa_fe_mskcja95', name: 'A' }]),
    ).toBe('wfh_qa_fe_mskcja95');
  });
});

describe('buildAttendanceCheckInApiPayload — Nest open key (FE-02)', () => {
  it('forwards effective catalog code without coercing to present', () => {
    const payload = buildAttendanceCheckInApiPayload({
      company_id: 'main',
      employee_id: 'emp-1',
      attendance_date: '2026-08-09',
      check_in_at: '2026-08-09T01:00:00.000Z',
      status: 'wfh_qa_fe_mskcja95',
      latitude: 10.77,
      longitude: 106.69,
      check_in_method: 'gps',
    });
    expect(payload.status).toBe('wfh_qa_fe_mskcja95');
    expect(payload.check_in_method).toBe('gps');
  });
});

describe('GPSAttendance source — FE-02 bind catalog picker', () => {
  it('uses effective catalog hook + status on checkIn — no sole hardcode present', () => {
    expect(gpsSource).toContain('PO-HRM-MVP-GD1-ATT-03D-CLUSTER-FE-02');
    expect(gpsSource).toContain('useAttAttendanceCodesEffective');
    expect(gpsSource).toContain('resolveCheckInRecordStatus');
    expect(gpsSource).toContain('clock-in-gps-attendance-code');
    expect(gpsSource).toMatch(/status:\s*resolvedStatus/);
    expect(gpsSource).not.toMatch(/checkIn\(\{[\s\S]{0,400}status:\s*['"]present['"]/);
  });
});
