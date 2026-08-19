import { FleetService, resolveFleetSearchTerm } from './fleet.service';
import { HrmDbService } from '../db/hrm-db.service';

describe('FleetService keyword (G-FL-02 / FR-HRM-FL-01 #4)', () => {
  it('resolveFleetSearchTerm prefers q over keyword and trims', () => {
    expect(resolveFleetSearchTerm('  plate  ', '  name  ')).toBe('name');
    expect(resolveFleetSearchTerm('  plate  ', undefined)).toBe('plate');
    expect(resolveFleetSearchTerm('   ', '')).toBeUndefined();
    expect(resolveFleetSearchTerm(undefined, undefined)).toBeUndefined();
  });

  it('listVehicles adds ILIKE on license_plate and fleet_fields name keys', async () => {
    const query = jest.fn().mockImplementation(async (sql: string) => {
      if (String(sql).includes('CREATE TABLE') || String(sql).includes('CREATE UNIQUE')) {
        return { rows: [] };
      }
      return {
        rows: [
          {
            id: 'v1',
            tenant_id: 'xevn',
            company_id: 'xe-du-lich',
            license_plate: '51A-12345',
            fleet_fields: { driver_name: 'Nguyen Van A' },
            status: 'active',
            created_at: '2026-07-27T00:00:00Z',
            updated_at: '2026-07-27T00:00:00Z',
          },
        ],
      };
    });
    const service = new FleetService({ query } as unknown as HrmDbService);
    const result = await service.listVehicles('xevn', ['xe-du-lich'], { keyword: '51A' });

    expect(result.total).toBe(1);
    expect(result.data[0]?.license_plate).toBe('51A-12345');

    const selectCall = query.mock.calls.find((c) => String(c[0]).includes('SELECT id, tenant_id'));
    expect(selectCall).toBeDefined();
    const [sql, values] = selectCall as [string, unknown[]];
    expect(sql).toContain('license_plate ILIKE');
    expect(sql).toContain("fleet_fields->>'driver_name'");
    expect(sql).toContain("fleet_fields->>'manufacturer'");
    expect(sql).toContain("fleet_fields->>'model'");
    expect(values).toEqual(expect.arrayContaining(['xevn', '%51A%']));
  });

  it('listVehicles without keyword does not add ILIKE', async () => {
    const query = jest.fn().mockImplementation(async (sql: string) => {
      if (String(sql).includes('CREATE TABLE') || String(sql).includes('CREATE UNIQUE')) {
        return { rows: [] };
      }
      return { rows: [] };
    });
    const service = new FleetService({ query } as unknown as HrmDbService);
    const result = await service.listVehicles('xevn', ['xe-du-lich'], {});
    expect(result).toEqual({ total: 0, data: [] });
    const selectCall = query.mock.calls.find((c) => String(c[0]).includes('SELECT id, tenant_id'));
    expect(String(selectCall?.[0])).not.toContain('ILIKE');
  });
});
