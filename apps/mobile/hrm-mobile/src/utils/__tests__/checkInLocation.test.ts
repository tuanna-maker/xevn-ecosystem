import { describe, expect, it } from 'vitest';
import {
  CHECK_IN_LOCATION_DENIED,
  CHECK_IN_LOCATION_ERROR,
  CHECK_IN_LOCATION_LOADING,
  CHECK_IN_LOCATION_READY,
  CHECK_IN_LOCATION_SECTION_TITLE,
  assertCheckInLocationCopySafe,
  buildCheckInSubmitBody,
  resolveDeviceLocationLabel,
} from '../checkInLocation';

const FORBIDDEN_UI_TERMS = ['gps', 'geofence'];

function expectNoForbiddenTerms(copy: string) {
  const lower = copy.toLowerCase();
  for (const term of FORBIDDEN_UI_TERMS) {
    expect(lower).not.toContain(term);
  }
}

describe('checkInLocation copy helpers', () => {
  it('section title uses «Vị trí thiết bị» not GPS/geofence', () => {
    expect(CHECK_IN_LOCATION_SECTION_TITLE).toBe('Vị trí thiết bị');
    expectNoForbiddenTerms(CHECK_IN_LOCATION_SECTION_TITLE);
    expect(assertCheckInLocationCopySafe(CHECK_IN_LOCATION_SECTION_TITLE)).toBe(true);
  });

  it('resolveDeviceLocationLabel maps states to Vietnamese copy', () => {
    expect(resolveDeviceLocationLabel('loading')).toBe(CHECK_IN_LOCATION_LOADING);
    expect(resolveDeviceLocationLabel('idle')).toBe(CHECK_IN_LOCATION_LOADING);
    expect(resolveDeviceLocationLabel('ready')).toBe(CHECK_IN_LOCATION_READY);
    expect(resolveDeviceLocationLabel('denied')).toBe(CHECK_IN_LOCATION_DENIED);
    expect(resolveDeviceLocationLabel('error')).toBe(CHECK_IN_LOCATION_ERROR);
  });

  it('all exported location strings are GPS/geofence-free', () => {
    const copies = [
      CHECK_IN_LOCATION_SECTION_TITLE,
      CHECK_IN_LOCATION_LOADING,
      CHECK_IN_LOCATION_READY,
      CHECK_IN_LOCATION_DENIED,
      CHECK_IN_LOCATION_ERROR,
      resolveDeviceLocationLabel('loading'),
      resolveDeviceLocationLabel('ready'),
      resolveDeviceLocationLabel('denied'),
    ];
    for (const copy of copies) {
      expectNoForbiddenTerms(copy);
      expect(assertCheckInLocationCopySafe(copy)).toBe(true);
    }
  });
});

describe('buildCheckInSubmitBody', () => {
  const base = {
    companyId: '6c887177-0000-4000-8000-000000000001',
    employeeId: 'emp-uat-0001',
    now: new Date('2026-06-09T08:30:00.000Z'),
  };

  it('includes latitude/longitude when permission granted with finite coords', () => {
    const body = buildCheckInSubmitBody({
      ...base,
      location: { granted: true, latitude: 21.0285, longitude: 105.8542 },
    });
    expect(body.company_id).toBe(base.companyId);
    expect(body.employee_id).toBe(base.employeeId);
    expect(body.attendance_date).toBe('2026-06-09');
    expect(body.check_in_at).toBe('2026-06-09T08:30:00.000Z');
    expect(body.status).toBe('present');
    expect(body.latitude).toBe(21.0285);
    expect(body.longitude).toBe(105.8542);
  });

  it('omits coords when permission denied', () => {
    const body = buildCheckInSubmitBody({
      ...base,
      location: { granted: false },
    });
    expect(body.latitude).toBeUndefined();
    expect(body.longitude).toBeUndefined();
    expect(body.employee_id).toBe(base.employeeId);
  });

  it('omits coords when granted but values are not finite', () => {
    const body = buildCheckInSubmitBody({
      ...base,
      location: { granted: true, latitude: Number.NaN, longitude: 105 },
    });
    expect(body.latitude).toBeUndefined();
    expect(body.longitude).toBeUndefined();
  });
});
