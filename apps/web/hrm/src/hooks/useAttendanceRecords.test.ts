import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  buildAttendanceCheckInApiPayload,
  buildAttendanceRecordsQuery,
  toApiAttendanceStatus,
} from './useAttendanceRecords';

const hookSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'useAttendanceRecords.ts'),
  'utf8',
);

describe('buildAttendanceRecordsQuery', () => {
  it('never exceeds Nest page_size cap of 100', () => {
    expect(buildAttendanceRecordsQuery('main', '2025-06-01').page_size).toBe(100);
    expect(buildAttendanceRecordsQuery('main').page_size).toBe(100);
  });
});

describe('buildAttendanceCheckInApiPayload — GPS lat/lon (PO-MFD-M2-ATT-CLOCK-GPS-LATLON-01)', () => {
  const base = {
    company_id: 'trsport',
    employee_id: 'b06422c0-0000-4000-8000-000000000001',
    attendance_date: '2026-08-04',
    check_in_at: '2026-08-04T06:16:00.000Z',
    status: 'present' as const,
    note: undefined as string | undefined,
    created_by: 'user-1',
  };

  it('includes latitude and longitude when GPS coords are finite numbers', () => {
    const payload = buildAttendanceCheckInApiPayload({
      ...base,
      latitude: 10,
      longitude: 10,
      check_in_method: 'gps',
    });
    expect(payload.latitude).toBe(10);
    expect(payload.longitude).toBe(10);
    expect(payload.check_in_method).toBe('gps');
    expect(Object.keys(payload)).toEqual(
      expect.arrayContaining(['latitude', 'longitude', 'check_in_method', 'company_id', 'employee_id']),
    );
  });

  it('omits lat/lon for manual check-in (coords undefined)', () => {
    const payload = buildAttendanceCheckInApiPayload({ ...base });
    expect(payload).not.toHaveProperty('latitude');
    expect(payload).not.toHaveProperty('longitude');
    expect(payload).not.toHaveProperty('check_in_method');
  });

  it('omits lat/lon when coords are non-finite (NaN)', () => {
    const payload = buildAttendanceCheckInApiPayload({
      ...base,
      latitude: Number.NaN,
      longitude: 10,
      check_in_method: 'gps',
    });
    expect(payload).not.toHaveProperty('latitude');
    expect(payload).not.toHaveProperty('longitude');
    // CNS-05: method still forwarded so BE can emit HRM-ATT-GEO-REQ
    expect(payload.check_in_method).toBe('gps');
  });
});

describe('buildAttendanceCheckInApiPayload — CNS-05 check_in_method (PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-FE-01)', () => {
  const base = {
    company_id: 'main',
    employee_id: 'b06422c0-0000-4000-8000-000000000002',
    attendance_date: '2026-08-08',
    check_in_at: '2026-08-08T02:00:00.000Z',
    status: 'present' as const,
  };

  it('forwards check_in_method=gps without coords (GEO-REQ wire)', () => {
    const payload = buildAttendanceCheckInApiPayload({
      ...base,
      check_in_method: 'gps',
    });
    expect(payload.check_in_method).toBe('gps');
    expect(payload).not.toHaveProperty('latitude');
    expect(payload).not.toHaveProperty('longitude');
  });

  it('PO-HRM-MVP-GD1-ATT-03D-CLUSTER-FE-02 — passes Nest effective code on GPS POST', () => {
    const payload = buildAttendanceCheckInApiPayload({
      ...base,
      status: 'wfh_qa_fe_mskcja95',
      check_in_method: 'gps',
      latitude: 10,
      longitude: 106,
    });
    expect(payload.status).toBe('wfh_qa_fe_mskcja95');
  });

  it('omits check_in_method when not provided (manual soft-skip RETAIN)', () => {
    const payload = buildAttendanceCheckInApiPayload({ ...base });
    expect(payload).not.toHaveProperty('check_in_method');
  });

  it('GPSAttendance source stamps check_in_method gps on checkIn', () => {
    const gpsSource = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), '../components/attendance/GPSAttendance.tsx'),
      'utf8',
    );
    expect(gpsSource).toMatch(/check_in_method:\s*['"]gps['"]/);
  });
});

describe('toApiAttendanceStatus — open catalog (PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-FE-01)', () => {
  it('passes through Nest-valid statuses (closed-4 bootstrap + N+1)', () => {
    expect(toApiAttendanceStatus('pending')).toBe('pending');
    expect(toApiAttendanceStatus('present')).toBe('present');
    expect(toApiAttendanceStatus('absent')).toBe('absent');
    expect(toApiAttendanceStatus('leave')).toBe('leave');
    expect(toApiAttendanceStatus('wfh')).toBe('wfh');
  });

  it('pass-through format-valid legacy keys — BE KEY assert (không coerce closed-4 sole SoT)', () => {
    // early_leave|on_leave|late|business_trip khớp KEY format → submit nguyên mã;
    // Edit Select resolve riêng (EFF>0 không sole option trừ Nest có code).
    expect(toApiAttendanceStatus('on_leave')).toBe('on_leave');
    expect(toApiAttendanceStatus('late')).toBe('late');
    expect(toApiAttendanceStatus('early_leave')).toBe('early_leave');
    expect(toApiAttendanceStatus('business_trip')).toBe('business_trip');
  });

  it('defaults empty / invalid-format to pending; format-valid invent pass-through for BE KEY', () => {
    expect(toApiAttendanceStatus('')).toBe('pending');
    expect(toApiAttendanceStatus(undefined)).toBe('pending');
    expect(toApiAttendanceStatus('2bad')).toBe('pending');
    // Uppercase normalized → lowercase pass-through (khớp BE assertKeyFormat).
    expect(toApiAttendanceStatus('WFH')).toBe('wfh');
    // Invent format-valid → pass-through; BE returns 400 HRM-ATT-CODE-KEY when EFF>0.
    expect(toApiAttendanceStatus('not_in_catalog_xyz')).toBe('not_in_catalog_xyz');
  });
});

describe('updateRecord mutate scope — PO-MFD-M2-ATT-RECORDS-EDIT-01-R3-FE', () => {
  it('passes currentCompanyId into updateAttendanceStatus (parity leave/ATT approve)', () => {
    expect(hookSource).toContain('updateAttendanceStatus');
    expect(hookSource).toMatch(
      /updateAttendanceStatus\(\s*id,\s*\{[\s\S]*?\},\s*currentCompanyId/,
    );
  });
});

describe('leave funnel display-ready — PO-HRM-ATT-LEAVE-FUNNEL-FE-01', () => {
  it('toUiRecord passthrough leave fields (no null hardcode / no leave-requests join)', () => {
    expect(hookSource).toContain('status_label: row.status_label');
    expect(hookSource).toContain('leave_type_label: row.leave_type_label');
    expect(hookSource).toContain('leave_request_id: row.leave_request_id');
    expect(hookSource).not.toMatch(/leave_type:\s*null/);
    expect(hookSource).not.toMatch(/leave_request_id:\s*null/);
    // Executable import/call only — CODE-MEMORY may mention «leave-requests» as forbidden.
    expect(hookSource).not.toMatch(/\blistLeaveRequests\b/);
    expect(hookSource).not.toMatch(/['"`][^'"`]*\/leave-requests/);
  });
});
