import { XbosDbService } from '../db/xbos-db.service';
import {
  ensureAllPilotMemberships,
  ensurePilotMembershipForUser,
  findPilotPortalUser,
  upsertPilotMembership,
} from './pilot-membership.bootstrap';

describe('pilot-membership.bootstrap', () => {
  const db = { query: jest.fn() } as unknown as XbosDbService;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('findPilotPortalUser normalizes email case', () => {
    expect(findPilotPortalUser('CEO@XE.VN')?.tenantId).toBe('xevn');
    expect(findPilotPortalUser('unknown@xe.vn')).toBeUndefined();
  });

  it('upsertPilotMembership skips when tenant registry inactive', async () => {
    (db.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
    const pilot = findPilotPortalUser('ceo@xe.vn');
    expect(pilot).toBeDefined();
    const ok = await upsertPilotMembership(db, pilot!);
    expect(ok).toBe(false);
    expect(db.query).toHaveBeenCalledTimes(1);
  });

  it('ensurePilotMembershipForUser upserts ceo@xe.vn master membership', async () => {
    (db.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ '1': 1 }] })
      .mockResolvedValueOnce({ rows: [] });
    await ensurePilotMembershipForUser(db, 'ceo@xe.vn');
    expect(db.query).toHaveBeenCalledTimes(2);
    const insertSql = String((db.query as jest.Mock).mock.calls[1][0]);
    expect(insertSql).toContain('xbos_user_tenant_membership');
    expect((db.query as jest.Mock).mock.calls[1][1]).toEqual(['ceo@xe.vn', 'xevn', 'group_ceo']);
  });

  it('ensureAllPilotMemberships iterates pilot personas', async () => {
    (db.query as jest.Mock).mockResolvedValue({ rows: [{ '1': 1 }] });
    await ensureAllPilotMemberships(db);
    expect(db.query).toHaveBeenCalled();
  });
});
