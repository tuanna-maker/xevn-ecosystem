#!/usr/bin/env node
/**
 * PM open backlog scanner — writes PM_OPEN_BACKLOG.json + TEAM_WORKING_NOW.md
 * Usage: pnpm run pm:scan:backlog [--json-only] [--no-write-working]
 */
import fs from 'node:fs';
import path from 'node:path';
import { scanOpenBacklog, renderWorkingNow } from './lib/pm-backlog-scan.mjs';

const root = process.cwd();
const jsonOnly = process.argv.includes('--json-only');
const noWriteWorking = process.argv.includes('--no-write-working');

const scan = scanOpenBacklog();
const outJson = path.join(root, 'docs/program/PM_OPEN_BACKLOG.json');
fs.writeFileSync(outJson, `${JSON.stringify(scan, null, 2)}\n`, 'utf8');

if (!noWriteWorking) {
  const workingNow = path.join(root, 'docs/program/TEAM_WORKING_NOW.md');
  fs.writeFileSync(workingNow, `${renderWorkingNow(scan)}\n`, 'utf8');
}

console.log(`pm-scan-open-backlog — ${scan.dispatchRequired.length} dispatch required, ${scan.inFlight.length} in-flight`);
console.log(`  closed AC-FID: ${scan.closedAcFid.join(', ') || 'none'}`);
console.log(`  next fidelity: ${scan.nextFidelityWave || 'DONE'}`);
console.log(`  wrote ${path.relative(root, outJson)}`);

if (scan.dispatchRequired.length > 0) {
  console.log('\nDISPATCH REQUIRED (PM must Task before user reply):');
  for (const d of scan.dispatchRequired) {
    console.log(`  [${d.priority}] pm -> ${d.role}  ${d.workItemId}  (${d.source})`);
  }
  if (!jsonOnly) process.exit(2);
} else {
  console.log('\nOK  queue empty or all in-flight');
  if (!jsonOnly) process.exit(0);
}
