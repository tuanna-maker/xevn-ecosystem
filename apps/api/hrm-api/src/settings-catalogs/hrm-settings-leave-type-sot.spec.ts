/**
 * PO-HRM-SETTINGS-ATT-LVT-SOT-BE-01 — HRM-SC-01 dual SoT bridge
 */
import { HttpStatus } from '@nestjs/common';
import { CatalogSyncService } from '../catalog-sync/catalog-sync.service';
import { HrmDbService } from '../db/hrm-db.service';
import {
  assertLeaveTypesExtensionMutateForbidden,
  HRM_SC_LEAVE_EFFECTIVE_API,
  HRM_SC_LEAVE_REF_EXTENSION_FORBIDDEN,
  HRM_SC_LEAVE_TENANT_WRITER_API,
  isLeaveTypesGroupRefCatalogKey,
} from './hrm-settings-leave-type-sot';
import { SettingsCatalogsService } from './settings-catalogs.service';
import { XbosCatalogWorkflowBridge } from './xbos-catalog-workflow.bridge';

describe('hrm-settings-leave-type-sot (PO-HRM-SETTINGS-ATT-LVT-SOT-BE-01)', () => {
  it('isLeaveTypesGroupRefCatalogKey matches leave family aliases', () => {
    expect(isLeaveTypesGroupRefCatalogKey('leave_types')).toBe(true);
    expect(isLeaveTypesGroupRefCatalogKey('job_titles')).toBe(false);
  });

  it('assertLeaveTypesExtensionMutateForbidden rejects tenant extension on leave_types', () => {
    expect(() =>
      assertLeaveTypesExtensionMutateForbidden('leave_types'),
    ).toThrow(
      expect.objectContaining({ code: HRM_SC_LEAVE_REF_EXTENSION_FORBIDDEN }),
    );
    expect(() =>
      assertLeaveTypesExtensionMutateForbidden('departments'),
    ).not.toThrow();
  });

  describe('SettingsCatalogsService integration', () => {
    const db = { query: jest.fn() } as unknown as HrmDbService;
    const catalogSync = {
      listSyncedCatalogs: jest.fn().mockResolvedValue({ total: 0, data: [] }),
    } as unknown as CatalogSyncService;
    const xbosWorkflow = {} as unknown as XbosCatalogWorkflowBridge;
    let service: SettingsCatalogsService;

    beforeEach(() => {
      jest.resetAllMocks();
      service = new SettingsCatalogsService(db, catalogSync, xbosWorkflow);
      (db.query as jest.Mock).mockImplementation(async (sql: string) => {
        if (String(sql).includes('CREATE TABLE')) return { rows: [] };
        if (String(sql).includes('CREATE UNIQUE INDEX')) return { rows: [] };
        return { rows: [] };
      });
    });

    it('appendExtensionItems on leave_types → 409 HRM-SC-LEAVE-REF-ONLY', async () => {
      await expect(
        service.appendExtensionItems('xevn', 'holding', 'leave_types', [
          { code: 'hr_custom', label: 'X', status: 'active' },
        ]),
      ).rejects.toMatchObject({
        code: HRM_SC_LEAVE_REF_EXTENSION_FORBIDDEN,
        status: HttpStatus.CONFLICT,
      });
    });

    it('getOverview stamps tenantWriter on leave_types row', async () => {
      (catalogSync.listSyncedCatalogs as jest.Mock).mockResolvedValue({
        total: 1,
        data: [
          {
            key: 'leave_types',
            version: 1,
            syncedAt: '2026-08-10T00:00:00.000Z',
            payload: {
              items: [{ code: 'annual', label: 'Phép năm', status: 'active' }],
            },
          },
        ],
      });
      const out = await service.getOverview('xevn', 'holding');
      const leave = out.catalogs.find((c) => c.catalogKey === 'leave_types');
      expect(leave?.tenantWriter).toEqual({
        kind: 'att_leave_type',
        apiPath: HRM_SC_LEAVE_TENANT_WRITER_API,
        effectiveApiPath: HRM_SC_LEAVE_EFFECTIVE_API,
        groupRefReadOnly: true,
      });
    });
  });
});
