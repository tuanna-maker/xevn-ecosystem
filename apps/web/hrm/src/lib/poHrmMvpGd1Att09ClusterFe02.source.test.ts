/**
 * Source lock — PO-HRM-MVP-GD1-ATT-09-CLUSTER-FE-02 TYPE-BLOCK overlap UX.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const libDir = dirname(fileURLToPath(import.meta.url));
const root = join(libDir, '..');

function read(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

describe('PO-HRM-MVP-GD1-ATT-09-CLUSTER-FE-02 — TYPE-BLOCK overlap UX', () => {
  it('LeaveTab — create banner att-09-type-block + list hint + open detail', () => {
    const tab = read('components/attendance/LeaveTab.tsx');
    expect(tab).toContain('findAtt09DateOverlapConflict');
    expect(tab).toContain('att09OverlapTypeBlockBannerMessage');
    expect(tab).toContain('data-testid="att-09-type-block"');
    expect(tab).toContain('att-09-type-block-hint');
    expect(tab).toContain('att-09-type-block-open-detail');
    expect(tab).toContain('leave-detail-type-readonly');
  });

  it('useLeaveRequests — overlap 409 returns LeaveCreateOutcome', () => {
    const hook = read('hooks/useLeaveRequests.ts');
    expect(hook).toContain('LeaveCreateOutcome');
    expect(hook).toContain('parseAtt09OverlapConflictId');
    expect(hook).toContain("ok: false");
  });

  it('attLeave09Ring — overlap helpers · DENY att_leave_hold · Nest deny RETAIN', () => {
    const ring = read('lib/attLeave09Ring.ts');
    expect(ring).toContain('findAtt09DateOverlapConflict');
    expect(ring).toContain('parseAtt09OverlapConflictId');
    expect(ring).toContain('att09OverlapTypeBlockBannerMessage');
    expect(ring).toContain('PO-HRM-MVP-GD1-ATT-09-CLUSTER-FE-02');
    expect(ring).toContain("inventHoldTableDenied: 'att_leave_hold'");
  });
});
