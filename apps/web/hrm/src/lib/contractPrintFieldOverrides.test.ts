import { describe, expect, it } from 'vitest';
import {
  buildContractPrintFieldOverrides,
  normalizePreviewMissingFields,
  resolvePrintOverrideInputKeys,
} from './contractPrintFieldOverrides';

describe('contractPrintFieldOverrides (PO-HRM-CONTRACT-LEGAL-PRINT-FE-03)', () => {
  it('normalizes BE { field, message }[] and string[]', () => {
    expect(
      normalizePreviewMissingFields([
        { field: 'work_location', message: 'Work location is required' },
        { field: '  ', message: 'skip' },
        'license_class',
      ]),
    ).toEqual([
      { field: 'work_location', message: 'Work location is required' },
      { field: 'license_class' },
    ]);
  });

  it('builds field_overrides omitting blanks — no company_id invent', () => {
    expect(
      buildContractPrintFieldOverrides({
        work_location: '  Hà Nội  ',
        license_class: '  ',
        vehicle_plate: '',
      }),
    ).toEqual({ work_location: 'Hà Nội' });
    expect(buildContractPrintFieldOverrides({ work_location: '' })).toBeUndefined();
  });

  it('always includes work_location + DRIVER missing keys', () => {
    expect(resolvePrintOverrideInputKeys([])).toEqual(['work_location']);
    expect(
      resolvePrintOverrideInputKeys([
        { field: 'license_class' },
        { field: 'vehicle_plate' },
        { field: 'employee_full_name' },
      ]),
    ).toEqual(['work_location', 'license_class', 'vehicle_plate']);
  });

  it('forceDriverBlock expands GPLX keys; aliases driver_license_class', () => {
    expect(resolvePrintOverrideInputKeys([], { forceDriverBlock: true })).toEqual([
      'work_location',
      'license_class',
      'driver_license_number',
      'driver_license_issued_on',
      'driver_license_issued_place',
      'vehicle_plate',
    ]);
    expect(
      resolvePrintOverrideInputKeys([{ field: 'driver_license_class' }, { field: 'driver_license_number' }]),
    ).toEqual(['work_location', 'license_class', 'driver_license_number']);
  });
});
