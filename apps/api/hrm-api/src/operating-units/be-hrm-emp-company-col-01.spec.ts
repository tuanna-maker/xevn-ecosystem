/**
 * @CODE-MEMORY
 * Screen:     BE-HRM-EMP-COMPANY-COL-01 jest
 * UC:         UC-HRM-21 · AC-EMP-COL-01..04
 * BR:         BR-EMP-COL-01..03
 * SRS:        docs/qa/evidence/ba-hrm-emp-company-col-01-20260722.md
 * Purpose:    Guard LE SoT for company column — no Khối final labels; upsert upgrades Khối.
 * WorkItem:   BE-HRM-EMP-COMPANY-COL-01
 * Coded:      2026-07-22
 * LastVerified: this file
 */
import { signServiceJwt } from '../common/jwt-sign';
import { HRM_GROUP_MEMBER_COMPANY_SLUGS } from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';
import { EmployeesService } from '../employees/employees.service';
import {
  ensureCompanySlugMapLegalDisplayNames,
  isLegacyKhoiDisplayName,
  resolveCompanyDisplayNameVi,
} from './hrm-company-display-name';
import {
  HRM_LEGACY_KHOI_DISPLAY_NAMES,
  HRM_OPERATING_UNIT_DEFAULT_DISPLAY_NAMES,
} from './hrm-operating-unit-registry';
import { OperatingUnitsService } from './operating-units.service';

const LE_SOT_NAMES = [
  'Tập đoàn XeVN',
  'Công ty Cổ phần Thương mại và Dịch vụ X.E',
  'Công ty TNHH Du lịch Visun',
  'Công ty TNHH Du lịch X.E Việt Nam',
  'Công ty TNHH X.E Việt Nam',
] as const;

describe('BE-HRM-EMP-COMPANY-COL-01', () => {
  describe('registry + resolve (AC-EMP-COL-01/03)', () => {
    it('default display names are ĐVTV/LE set — never Khối*', () => {
      for (const slug of HRM_GROUP_MEMBER_COMPANY_SLUGS) {
        const name = HRM_OPERATING_UNIT_DEFAULT_DISPLAY_NAMES[slug];
        expect(isLegacyKhoiDisplayName(name)).toBe(false);
        expect(name).not.toMatch(/^Khối\s+/u);
        expect(LE_SOT_NAMES).toContain(name);
      }
    });

    it('holding resolves to Tập đoàn XeVN (AC-EMP-COL-02)', () => {
      expect(resolveCompanyDisplayNameVi('holding', null)).toBe('Tập đoàn XeVN');
      expect(resolveCompanyDisplayNameVi('holding', '  ')).toBe('Tập đoàn XeVN');
    });

    it('rejects legacy Khối DB value and upgrades to LE registry', () => {
      for (const khoi of HRM_LEGACY_KHOI_DISPLAY_NAMES) {
        expect(isLegacyKhoiDisplayName(khoi)).toBe(true);
      }
      expect(resolveCompanyDisplayNameVi('logistics', 'Khối Logistics X.E')).toBe(
        'Công ty TNHH Du lịch Visun',
      );
      expect(resolveCompanyDisplayNameVi('services', 'Khối Dịch vụ X.E')).toBe(
        'Công ty TNHH X.E Việt Nam',
      );
    });

    it('keeps non-legacy DB display_name (synced LE wins)', () => {
      expect(
        resolveCompanyDisplayNameVi('trsport', 'Công ty Cổ phần Thương mại và Dịch vụ X.E'),
      ).toBe('Công ty Cổ phần Thương mại và Dịch vụ X.E');
    });

    it('unknown slug without bridge returns null (BR-EMP-COL-02 fail-closed)', () => {
      expect(resolveCompanyDisplayNameVi('unknown-slug', 'Khối Vận tải X.E')).toBeNull();
      expect(resolveCompanyDisplayNameVi('', null)).toBeNull();
    });
  });

  describe('ensureCompanySlugMapLegalDisplayNames (AC-EMP-COL-04)', () => {
    it('upsert SQL upgrades blank or Khối display_name; does not overwrite good LE', async () => {
      const query = jest.fn().mockResolvedValue({ rows: [] });
      await ensureCompanySlugMapLegalDisplayNames(query);

      expect(query.mock.calls.some(([sql]) => String(sql).includes('ADD COLUMN IF NOT EXISTS display_name'))).toBe(
        true,
      );
      const upserts = query.mock.calls.filter(([sql]) =>
        String(sql).includes('INSERT INTO public.company_slug_map'),
      );
      expect(upserts).toHaveLength(5);
      const upsertSql = String(upserts[0]?.[0] ?? '');
      expect(upsertSql).toMatch(/Khối\[\[:space:\]\]/);
      expect(upsertSql).toContain('ELSE company_slug_map.display_name');

      const seededNames = upserts.map(([, params]) => (params as unknown[])[3] as string);
      for (const name of seededNames) {
        expect(isLegacyKhoiDisplayName(name)).toBe(false);
        expect(LE_SOT_NAMES).toContain(name);
      }
    });
  });

  describe('OperatingUnitsService list (Plane A labels)', () => {
    const GROUP_CEO = () =>
      signServiceJwt({
        sub: 'ceo@xe.vn',
        tenantId: 'xevn',
        companyId: 'main',
        roleCode: 'group_ceo',
      });

    it('returns LE names even when DB still has Khối rows', async () => {
      const query = jest.fn().mockImplementation(async (sql: string) => {
        if (typeof sql === 'string' && sql.includes('FROM public.company_slug_map')) {
          return {
            rows: [
              { company_slug: 'holding', display_name: 'Tập đoàn XeVN' },
              { company_slug: 'trsport', display_name: 'Khối Vận tải X.E' },
              { company_slug: 'logistics', display_name: 'Khối Logistics X.E' },
              { company_slug: 'finance', display_name: 'Khối Tài chính X.E' },
              { company_slug: 'services', display_name: 'Khối Dịch vụ X.E' },
            ],
          };
        }
        return { rows: [] };
      });
      const service = new OperatingUnitsService({ query } as unknown as HrmDbService);
      const rows = await service.listOperatingUnits(`Bearer ${GROUP_CEO()}`, { tenantId: 'xevn' });
      expect(rows).toHaveLength(5);
      for (const row of rows) {
        expect(isLegacyKhoiDisplayName(row.display_name_vi)).toBe(false);
        expect(LE_SOT_NAMES).toContain(row.display_name_vi);
      }
      expect(rows[0]?.display_name_vi).toBe('Tập đoàn XeVN');
      expect(rows[4]?.display_name_vi).toBe('Công ty TNHH X.E Việt Nam');
    });
  });

  describe('EmployeesService company_display_name (AC-EMP-COL-01)', () => {
    it('listEmployees exposes LE company_display_name for holding + logistics', async () => {
      const db = {
        query: jest.fn().mockImplementation(async (sql: string) => {
          if (String(sql).includes('ADD COLUMN IF NOT EXISTS display_name')) {
            return { rows: [] };
          }
          if (String(sql).includes('INSERT INTO public.company_slug_map')) {
            return { rows: [] };
          }
          if (String(sql).includes('FROM public.company_slug_map')) {
            return {
              rows: [
                { company_slug: 'holding', display_name: 'Tập đoàn XeVN' },
                { company_slug: 'logistics', display_name: 'Khối Logistics X.E' },
              ],
            };
          }
          return {
            rows: [
              {
                id: '11111111-1111-4111-8111-111111111111',
                company_id: 'holding',
                employee_code: 'NV001',
                email: 'a@xe.vn',
                full_name: 'A',
                job_title_key: null,
                manager_id: null,
                status: 'active',
                hired_at: null,
                archived_at: null,
                avatar_url: null,
                custom_fields: {},
                created_at: '2026-07-22T00:00:00.000Z',
                updated_at: '2026-07-22T00:00:00.000Z',
                list_total: '2',
                created_at_cursor: '2026-07-22T00:00:00.000000Z',
              },
              {
                id: '22222222-2222-4222-8222-222222222222',
                company_id: 'logistics',
                employee_code: 'NV002',
                email: 'b@xe.vn',
                full_name: 'B',
                job_title_key: null,
                manager_id: null,
                status: 'active',
                hired_at: null,
                archived_at: null,
                avatar_url: null,
                custom_fields: {},
                created_at: '2026-07-22T00:00:00.000Z',
                updated_at: '2026-07-22T00:00:00.000Z',
                list_total: '2',
                created_at_cursor: '2026-07-22T00:00:00.000000Z',
              },
            ],
          };
        }),
        onModuleDestroy: jest.fn(),
      } as unknown as jest.Mocked<HrmDbService>;
      const service = new EmployeesService(db);
      const token = signServiceJwt({
        sub: 'ceo@xe.vn',
        tenantId: 'xevn',
        companyId: 'main',
        roleCode: 'group_ceo',
      });
      const result = await service.listEmployees(
        { company_id: 'main', page: 1, page_size: 20 },
        `Bearer ${token}`,
        { tenantId: 'xevn' },
      );
      expect(result.data[0]?.company_display_name).toBe('Tập đoàn XeVN');
      expect(result.data[1]?.company_display_name).toBe('Công ty TNHH Du lịch Visun');
      expect(isLegacyKhoiDisplayName(result.data[0]?.company_display_name)).toBe(false);
      expect(isLegacyKhoiDisplayName(result.data[1]?.company_display_name)).toBe(false);
    });
  });
});
