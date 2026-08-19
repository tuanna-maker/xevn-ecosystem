import { describe, expect, it } from 'vitest';
import { resolveContractCreatePositionKey } from '@/lib/contractCreatePayload';

describe('contractCreatePayload', () => {
  const positionOptions = [
    { value: 'TP_KD', label: 'Trưởng phòng KD', code: 'TP_KD' },
    { value: 'DRV', label: 'Tài xế', code: 'DRV' },
  ] as const;

  it('resolveContractCreatePositionKey — prefers employee job_title_key in catalog', () => {
    expect(
      resolveContractCreatePositionKey({
        employeeJobTitleKey: 'TP_KD',
        positionOptions,
      }),
    ).toEqual({ position_key: 'TP_KD', position: 'Trưởng phòng KD' });
  });

  it('resolveContractCreatePositionKey — falls back to first catalog row', () => {
    expect(
      resolveContractCreatePositionKey({
        employeeJobTitleKey: 'UNKNOWN',
        positionOptions,
      }),
    ).toEqual({ position_key: 'TP_KD', position: 'Trưởng phòng KD' });
  });

  it('resolveContractCreatePositionKey — pass-through empKey when catalog empty', () => {
    expect(
      resolveContractCreatePositionKey({
        employeeJobTitleKey: 'PILOT_KEY',
        positionOptions: [],
      }),
    ).toEqual({ position_key: 'PILOT_KEY', position: 'PILOT_KEY' });
  });

  it('resolveContractCreatePositionKey — department snapshot when catalog empty', () => {
    expect(
      resolveContractCreatePositionKey({
        employeeJobTitleKey: '',
        positionOptions: [],
        departmentSnapshot: 'Phòng Vận hành',
      }),
    ).toEqual({ position_key: 'Phòng Vận hành', position: 'Phòng Vận hành' });
  });

  it('resolveContractCreatePositionKey — employee_code last resort', () => {
    expect(
      resolveContractCreatePositionKey({
        employeeJobTitleKey: '',
        positionOptions: [],
        employeeCodeSnapshot: 'QAHDSDTA1G6',
      }),
    ).toEqual({ position_key: 'QAHDSDTA1G6', position: 'QAHDSDTA1G6' });
  });

  it('resolveContractCreatePositionKey — null when catalog empty', () => {
    expect(
      resolveContractCreatePositionKey({
        employeeJobTitleKey: '',
        positionOptions: [],
      }),
    ).toBeNull();
  });
});
