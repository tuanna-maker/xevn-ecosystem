import fs from 'node:fs/promises';
import path from 'node:path';

/** Hint for hooks/PM: is active sprint stalled (plan but no dispatch)? */
export async function readSprintDispatchHint(root) {
  const runnerPath = path.join(root, 'docs/program/PHASE1_SPRINT_RUNNER.json');
  const glancePath = path.join(root, 'docs/program/SPRINT_STATUS_AT_A_GLANCE.md');
  try {
    const runner = JSON.parse(await fs.readFile(runnerPath, 'utf8'));
    const active = runner.active_sprint ?? '?';
    const dispatch = runner.next_dispatch ?? [];
    const dispatched = dispatch.filter((d) => d.status === 'dispatched');
    const queued = dispatch.filter((d) => !d.status || d.status === 'queued');
    const stale = dispatch.filter(
      (d) => /^P1-S\d-/.test(d.work_item_id ?? '') && !d.work_item_id?.includes(active?.replace('S', 'S1-').slice(0, 3)),
    );

    let glanceLine = '';
    try {
      const g = await fs.readFile(glancePath, 'utf8');
      glanceLine = g.split(/\r?\n/).find((l) => l.includes('ACTIVE'))?.trim().slice(0, 120) ?? '';
    } catch {
      glanceLine = '(no glance)';
    }

    if (dispatched.length === 0 && queued.length > 0) {
      const first = queued[0];
      return {
        level: 'P0',
        text: `SPRINT ${active} STALLED — publish plan is not enough. Task dispatch NOW: ${first.work_item_id} → ${first.role}. Then verify:sprint:transition.`,
      };
    }
    if (dispatched.length > 0) {
      return {
        level: 'ok',
        text: `SPRINT ${active} in flight: ${dispatched.map((d) => d.work_item_id).join(', ')}. ${glanceLine}`,
      };
    }
    return { level: 'warn', text: `SPRINT ${active}: check next_dispatch. ${glanceLine}` };
  } catch {
    return { level: 'warn', text: 'SPRINT runner unreadable' };
  }
}
