#!/usr/bin/env node
/**
 * PM pipeline recovery — must run when user says "lại dừng" or after interrupt.
 * Usage: pnpm run pm:recover:pipeline [--json]
 * Exit: 0 healthy · 2 dispatch required
 */
import { scanPipelineRecovery } from './lib/pm-pipeline-recovery.mjs';

const jsonOnly = process.argv.includes('--json');
const result = scanPipelineRecovery(24);

if (jsonOnly) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(
    `pm-recover-pipeline — healthy=${result.healthy} dispatch=${result.dispatchRequired.length} suppressed_hooks=${result.followupSuppressedCount}`,
  );
  if (result.dispatchRequired.length > 0) {
    console.log('\nRECOVER — PM must Task before reply (U59):');
    for (const d of result.dispatchRequired) {
      console.log(`  [${d.priority}] pm -> ${d.role}  ${d.workItemId}  (${d.source})`);
      console.log(`         ${d.reason.slice(0, 100)}`);
    }
    console.log(`\nSoT: docs/program/PM_PENDING_PIPELINE.json`);
  }
}

process.exit(result.healthy ? 0 : 2);
