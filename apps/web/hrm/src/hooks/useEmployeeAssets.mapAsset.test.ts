/**
 * mapAsset — PO-HRM-MVP-GD1-CORE-05-CLUSTER-FE-01 display-ready bind
 */
import { describe, expect, it } from 'vitest';
import { mapAsset } from '@/hooks/useEmployeeAssets';

describe('mapAsset CORE-05 display-ready', () => {
  it('maps camelCase BE envelope + confirm flags', () => {
    const row = mapAsset(
      {
        id: 'a1',
        employeeId: 'e1',
        companyId: 'main',
        assetName: 'Laptop Dell',
        assetCode: 'IT-001',
        serialNumber: 'SN-9',
        status: 'assigned',
        statusLabelVi: 'Đang sử dụng',
        handoverConfirmed: true,
        handoverConfirmedAt: '2026-08-09T08:00:00Z',
        handoverDocId: 'a1',
        value: 15000000,
      },
      'e1',
    );
    expect(row.asset_name).toBe('Laptop Dell');
    expect(row.status_label_vi).toBe('Đang sử dụng');
    expect(row.handover_confirmed).toBe(true);
    expect(row.handover_doc_id).toBe('a1');
    expect(row.serial_number).toBe('SN-9');
  });

  it('maps snake_case + derives handoverDocId when confirmed without alias', () => {
    const row = mapAsset(
      {
        id: 'a2',
        employee_id: 'e1',
        asset_name: 'Thẻ từ',
        status: 'assigned',
        handover_confirmed_at: '2026-08-01',
      },
      'e1',
    );
    expect(row.handover_confirmed).toBe(true);
    expect(row.handover_doc_id).toBe('a2');
    expect(row.status_label_vi).toBe('Đang sử dụng');
  });

  it('unconfirmed assigned — CTA gate fields false', () => {
    const row = mapAsset(
      {
        id: 'a3',
        asset_name: 'Màn hình',
        status: 'assigned',
      },
      'e1',
    );
    expect(row.handover_confirmed).toBe(false);
    expect(row.handover_doc_id).toBeNull();
  });
});
