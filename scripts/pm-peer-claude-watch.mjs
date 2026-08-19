#!/usr/bin/env node
/**
 * Peer Claude CLI watchdog CLI.
 * Usage: pnpm run pm:peer-claude:watch [--json] [--no-reclaim]
 * Exit: 0 healthy · 2 reclaim triggered
 */
import { runPeerClaudeWatchdog } from './lib/pm-peer-claude-watchdog.mjs';

const jsonOnly = process.argv.includes('--json');
const noReclaim = process.argv.includes('--no-reclaim');

const result = runPeerClaudeWatchdog(process.cwd(), { autoReclaim: !noReclaim });

if (jsonOnly) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(
    `pm-peer-claude-watch — healthy=${result.healthy} delegations=${result.activeDelegations} reclaim=${result.reclaim.length}`,
  );
  if (result.heartbeat?.updated_at) {
    console.log(
      `  heartbeat: ${result.heartbeat.status} @ ${result.heartbeat.updated_at} (${result.heartbeat.work_item_id})`,
    );
  } else {
    console.log('  heartbeat: (missing — Claude should write peer-claude-heartbeat.json)');
  }
  for (const r of result.reclaim) {
    console.log(`  RECLAIM [${r.state}] ${r.work_item_id} — ${r.reason} (${r.idle_min}m idle)`);
  }
  for (const n of result.nudge) {
    console.log(`  NUDGE ${n.work_item_id} — ${n.classification.reason}`);
  }
  if (result.reclaimed.length) {
    console.log(`  auto-reclaimed: ${result.reclaimed.join(', ')}`);
  }
}

process.exit(result.healthy ? 0 : 2);
