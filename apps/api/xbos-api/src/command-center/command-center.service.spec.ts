import { CommandCenterService, resolveWorkspaceAsOf, workspaceMetaCompanyIds } from './command-center.service';
import { XbosDbService } from '../db/xbos-db.service';

describe('CommandCenterService workspace meta (UC-CC-P0-08)', () => {
  const db = { query: jest.fn() };
  let service: CommandCenterService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CommandCenterService(db as unknown as XbosDbService);
  });

  describe('resolveWorkspaceAsOf', () => {
    it('replaces null with current ISO time', () => {
      const iso = resolveWorkspaceAsOf(null);
      expect(new Date(iso).getTime()).toBeGreaterThan(Date.UTC(2020, 0, 1));
    });

    it('replaces epoch zero with current ISO time', () => {
      const iso = resolveWorkspaceAsOf('1970-01-01T00:00:00.000Z');
      expect(iso).not.toBe('1970-01-01T00:00:00.000Z');
      expect(new Date(iso).getFullYear()).toBeGreaterThanOrEqual(2020);
    });

    it('keeps valid timestamps', () => {
      expect(resolveWorkspaceAsOf('2026-05-24T12:00:00.000Z')).toBe('2026-05-24T12:00:00.000Z');
    });
  });

  describe('workspaceMetaCompanyIds', () => {
    it('rolls up main and holding for group partitions', () => {
      expect(workspaceMetaCompanyIds('main')).toEqual(['holding', 'main']);
      expect(workspaceMetaCompanyIds('holding')).toEqual(['holding', 'main']);
    });

    it('passes member slug unchanged', () => {
      expect(workspaceMetaCompanyIds('logistics')).toEqual(['logistics']);
    });
  });

  it('queries holding+main partitions and never returns epoch asOf', async () => {
    db.query.mockResolvedValue({ rows: [{ as_of: '1970-01-01T00:00:00.000Z', data_sync_note: null }] });
    const result = await service.getWorkspaceMeta('xevn', 'holding');
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('ANY($2::text[])'), [
      'xevn',
      ['holding', 'main'],
    ]);
    expect(result.asOf).not.toBe('1970-01-01T00:00:00.000Z');
    expect(new Date(result.asOf).getFullYear()).toBeGreaterThanOrEqual(2020);
  });

  it('returns DB max when present', async () => {
    db.query.mockResolvedValue({
      rows: [{ as_of: '2026-05-30T08:15:00.000Z', data_sync_note: null }],
    });
    const result = await service.getWorkspaceMeta('xevn', 'holding');
    expect(result.asOf).toBe('2026-05-30T08:15:00.000Z');
  });
});
