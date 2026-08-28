/**
 * @CODE-MEMORY
 * UC: UC-G0-01..04 | SRS: SRS_G0_FOUNDATION_PAY_POLICY_GROUPS_v1.md
 * Purpose: Unit tests cho PayPolicyGroupService — test coverage ≥80%
 */
import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../../common/api.exception';
import { PayPolicyGroupService } from './pay-policy-group.service';

// Mock HrmDbService
const mockDb = {
  query: jest.fn(),
  withTransaction: jest.fn(),
};

describe('PayPolicyGroupService', () => {
  let svc: PayPolicyGroupService;

  beforeEach(() => {
    jest.clearAllMocks();
    svc = new PayPolicyGroupService(mockDb as any);
  });

  // ─── findAll ─────────────────────────────────────────────────────────────
  describe('findAll', () => {
    it('trả về danh sách nhóm (platform + tenant)', async () => {
      const mockRows = [
        { id: '1', code: 'LUONG', is_platform: true, active_policy_count: 3 },
        { id: '2', code: 'MY_GROUP', is_platform: false, active_policy_count: 0 },
      ];
      mockDb.query.mockResolvedValueOnce({ rows: mockRows });

      const result = await svc.findAll('tenant-1');
      expect(result).toEqual(mockRows);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('tenant_id = $1 OR ppg.is_platform = true'),
        ['tenant-1'],
      );
    });

    it('filter is_active=true khi truyền param', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });
      await svc.findAll('tenant-1', true);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('ppg.is_active = $2'),
        ['tenant-1', true],
      );
    });
  });

  // ─── checkCodeAvailable ──────────────────────────────────────────────────
  describe('checkCodeAvailable', () => {
    it('LUONG → available=false (reserved)', async () => {
      const result = await svc.checkCodeAvailable('LUONG', 'tenant-1');
      expect(result).toEqual({ available: false, reason: expect.stringContaining('hệ thống') });
      expect(mockDb.query).not.toHaveBeenCalled(); // No DB call needed
    });

    it('code mới chưa có → available=true', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });
      const result = await svc.checkCodeAvailable('KHOAN', 'tenant-1');
      expect(result).toEqual({ available: true });
    });

    it('code đã tồn tại → available=false', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [{ '?column?': 1 }] });
      const result = await svc.checkCodeAvailable('KHOAN', 'tenant-1');
      expect(result).toEqual({ available: false });
    });
  });

  // ─── create ──────────────────────────────────────────────────────────────
  describe('create', () => {
    const dto = { code: 'KHOAN', name_vi: 'Khấu trừ khác' };

    it('success → trả về row mới', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] }); // unique check
      const newRow = { id: '10', code: 'KHOAN', name_vi: 'Khấu trừ khác', is_platform: false };
      mockDb.query.mockResolvedValueOnce({ rows: [newRow] }); // insert
      const result = await svc.create('tenant-1', dto as any, 'user-1');
      expect(result).toEqual(newRow);
    });

    it('code reserved (THUONG) → throw 409 HRM-G0-CODE-RESERVED', async () => {
      await expect(svc.create('tenant-1', { code: 'THUONG', name_vi: 'X' } as any, 'user-1'))
        .rejects.toMatchObject({ code: 'HRM-G0-CODE-RESERVED', status: HttpStatus.CONFLICT });
    });

    it('code duplicate → throw 409 HRM-G0-CODE-DUPLICATE', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [{ '?column?': 1 }] }); // code exists
      await expect(svc.create('tenant-1', dto as any, 'user-1'))
        .rejects.toMatchObject({ code: 'HRM-G0-CODE-DUPLICATE', status: HttpStatus.CONFLICT });
    });
  });

  // ─── update ──────────────────────────────────────────────────────────────
  describe('update', () => {
    it('platform group → throw 403 HRM-G0-PLATFORM-READONLY', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [{ id: '1', is_platform: true, tenant_id: '' }] });
      await expect(svc.update(1, 'tenant-1', { name_vi: 'X' }, 'user-1'))
        .rejects.toMatchObject({ code: 'HRM-G0-PLATFORM-READONLY', status: HttpStatus.FORBIDDEN });
    });

    it('tenant mismatch → throw 403 HRM-AUTH-FORBIDDEN', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [{ id: '2', is_platform: false, tenant_id: 'tenant-OTHER' }] });
      await expect(svc.update(2, 'tenant-1', { name_vi: 'X' }, 'user-1'))
        .rejects.toMatchObject({ code: 'HRM-AUTH-FORBIDDEN', status: HttpStatus.FORBIDDEN });
    });

    it('not found → throw 404 HRM-G0-NOT-FOUND', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });
      await expect(svc.update(999, 'tenant-1', {}, 'user-1'))
        .rejects.toMatchObject({ code: 'HRM-G0-NOT-FOUND', status: HttpStatus.NOT_FOUND });
    });

    it('success → trả về row đã cập nhật', async () => {
      const existing = { id: '3', is_platform: false, tenant_id: 'tenant-1' };
      const updated = { ...existing, name_vi: 'Tên mới' };
      mockDb.query.mockResolvedValueOnce({ rows: [existing] }); // findById
      mockDb.query.mockResolvedValueOnce({ rows: [updated] }); // update
      const result = await svc.update(3, 'tenant-1', { name_vi: 'Tên mới' }, 'user-1');
      expect(result).toEqual(updated);
    });
  });

  // ─── remove ──────────────────────────────────────────────────────────────
  describe('remove', () => {
    it('platform group → throw 403 HRM-G0-PLATFORM-READONLY', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [{ id: '1', is_platform: true, tenant_id: '' }] });
      await expect(svc.remove(1, 'tenant-1'))
        .rejects.toMatchObject({ code: 'HRM-G0-PLATFORM-READONLY' });
    });

    it('not found → throw 404', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });
      await expect(svc.remove(999, 'tenant-1'))
        .rejects.toMatchObject({ code: 'HRM-G0-NOT-FOUND' });
    });

    it('success → gọi transaction soft-delete + cascade null', async () => {
      const existing = { id: '5', is_platform: false, tenant_id: 'tenant-1' };
      mockDb.query.mockResolvedValueOnce({ rows: [existing] }); // findById
      mockDb.withTransaction.mockImplementation(async (fn: (q: any) => Promise<void>) => {
        const mockQuery = jest.fn()
          .mockResolvedValueOnce({ rowCount: 1 })  // soft-delete
          .mockResolvedValueOnce({ rowCount: 2 });  // cascade null
        await fn(mockQuery);
        expect(mockQuery).toHaveBeenCalledTimes(2);
      });
      await expect(svc.remove(5, 'tenant-1')).resolves.toBeUndefined();
    });
  });
});