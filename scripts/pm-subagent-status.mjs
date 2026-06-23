#!/usr/bin/env node
/**
 * PM subagent hang / stale detector.
 * Usage:
 *   pnpm run pm:subagent:status
 *   pnpm run pm:subagent:status -- --json
 *   pnpm run pm:subagent:status -- --watch 30   # poll every 30s (Ctrl+C stop)
 *
 * Exit: 0 healthy · 2 issues found (stale/zombie/stuck)
 */
import { scanSubagentStatus, renderSubagentStatusReport } from "./lib/pm-subagent-status.mjs";

const jsonOnly = process.argv.includes("--json");
const watchArg = process.argv.find((a) => a.startsWith("--watch"));
const watchSec = watchArg ? Number.parseInt(watchArg.split("=")[1] || process.argv[process.argv.indexOf("--watch") + 1], 10) : 0;

function runOnce() {
  const scan = scanSubagentStatus();
  if (jsonOnly) {
    console.log(JSON.stringify(scan, null, 2));
  } else {
    console.log(renderSubagentStatusReport(scan));
  }
  return scan.healthy ? 0 : 2;
}

if (watchSec > 0) {
  const tick = () => {
    console.clear?.();
    const code = runOnce();
    console.log(`\n(refresh ${watchSec}s · exit ${code} when stale)`);
  };
  tick();
  setInterval(tick, watchSec * 1000);
} else {
  process.exit(runOnce());
}
