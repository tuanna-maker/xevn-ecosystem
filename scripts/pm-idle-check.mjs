#!/usr/bin/env node
/**
 * PM idle composite check — backlog + subagent + bus INTAKE gaps.
 * Usage: pnpm run pm:idle:check [--json]
 * Exit: 0 healthy · 2 dispatch required or stale handoff
 * work_item_id: PM-IDLE-CHECK
 */
import fs from 'node:fs';
import path from 'node:path';
import { scanOpenBacklog } from './lib/pm-backlog-scan.mjs';
import { scanPipelineRecovery } from './lib/pm-pipeline-recovery.mjs';
import { scanSubagentStatus } from './lib/pm-subagent-status.mjs';
import { planSubagentRecovery, writeSubagentRecoveryArtifact } from './lib/pm-subagent-recovery.mjs';
import { extractWorkItemIds, normalizeWorkItemBase, workItemsSameSlice } from './lib/pm-work-item-id.mjs';

const jsonOnly = process.argv.includes('--json');
const root = process.cwd();

function busIntakeWithoutDispatch(scan) {
  const busPath = scan.busPath || path.join(root, 'docs/program/AGENT_MESSAGE_BUS.md');
  let tail = '';
  try {
    const lines = fs.readFileSync(busPath, 'utf8').split(/\r?\n/);
    tail = lines.slice(-120).join('\n');
  } catch {
    return [];
  }

  const gaps = [];
  const blocks = tail.split(/\n(?=##\s+)/);
  for (const block of blocks) {
    const header = (block.split(/\r?\n/)[0] || '').trim();
    if (!/INTAKE|PASS_TO_PM|READY_FOR_QA/i.test(block)) continue;
    if (!/->\s*pm\b/i.test(header)) continue;
    const ids = extractWorkItemIds(block);
    const atMs = Date.parse(header.match(/^##\s+([^\|]+)/)?.[1]?.trim() || '') || 0;
    for (const id of ids) {
      const dispatched = blocks.some((b) => {
        const h = b.split(/\r?\n/)[0] || '';
        if (!/pm\s*->/i.test(h) || !/DISPATCHED/i.test(b)) return false;
        const bMs = Date.parse(h.match(/^##\s+([^\|]+)/)?.[1]?.trim() || '') || 0;
        const dispIds = extractWorkItemIds(b);
        return bMs >= atMs && dispIds.some((d) => workItemsSameSlice(id, d));
      });
      if (!dispatched) {
        gaps.push({
          priority: 'P0',
          workItemId: id,
          role: 'pm-intake',
          reason: `Bus INTAKE/verdict chưa pm DISPATCHED sau đó (${header.slice(0, 60)})`,
          source: 'bus-intake-gap',
        });
      }
    }
  }
  return gaps;
}

const scan = scanOpenBacklog();
const pipeline = scanPipelineRecovery(24);
const sub = scanSubagentStatus();
const recovery = planSubagentRecovery({ scan: sub });
writeSubagentRecoveryArtifact(recovery);
const intakeGaps = busIntakeWithoutDispatch(scan);

const recoveryDispatch = (recovery.recoveryRequired || []).map((r) => ({
  priority: r.priority,
  workItemId: r.workItemId,
  role: r.role,
  reason: `${r.action}: ${r.reason}`,
  source: 'subagent-recovery',
  pm_dispatch_prompt: r.pm_dispatch_prompt,
  model_hint: r.model_hint,
}));

const allRequired = [...pipeline.dispatchRequired, ...scan.dispatchRequired, ...intakeGaps, ...recoveryDispatch];
const dedup = [];
const keys = new Set();
for (const item of allRequired.sort((a, b) => a.priority.localeCompare(b.priority))) {
  const k = `${item.role}:${item.workItemId}`;
  if (keys.has(k)) continue;
  keys.add(k);
  dedup.push(item);
}

const result = {
  checkedAt: new Date().toISOString(),
  healthy: dedup.length === 0 && sub.healthy && recovery.healthy,
  dispatchRequired: dedup.slice(0, 8),
  subagentHealthy: sub.healthy,
  subagentIssues: sub.issues?.length ?? 0,
  subagentRecoveryHealthy: recovery.healthy,
  subagentRecoveryPath: 'docs/program/PM_SUBAGENT_RECOVERY.json',
  recoveryRequired: recovery.recoveryRequired?.slice(0, 5) ?? [],
  idleClasses: dedup.length > 0 ? ['C', 'G', 'H', 'K', 'L', 'M'] : [],
  followupSuppressedCount: pipeline.followupSuppressedCount,
  pendingPipelinePath: 'docs/program/PM_PENDING_PIPELINE.json',
  policy: 'U58/U59 — exit 2 → PM must Task before user reply (incl. interrupt/quota/suppressed-followup)',
};

if (jsonOnly) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(`pm-idle-check — healthy=${result.healthy} dispatch=${result.dispatchRequired.length} subagent=${result.subagentHealthy}`);
  if (result.dispatchRequired.length > 0) {
    console.log('\nIDLE RISK — dispatch before reply:');
    for (const d of result.dispatchRequired) {
      console.log(`  [${d.priority}] pm -> ${d.role}  ${d.workItemId}  (${d.source})`);
    }
  }
  if (!sub.healthy || !recovery.healthy) {
    console.log('\nSubagent issues — run pnpm run pm:subagent:status');
    console.log('Recovery plan — run pnpm run pm:subagent:recover');
  }
}

process.exit(result.healthy ? 0 : 2);
