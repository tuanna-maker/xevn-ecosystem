#!/usr/bin/env node
/**
 * PM subagent recovery planner — detect stuck/warming/CDP/error → dispatch actions.
 * Usage:
 *   pnpm run pm:subagent:recover
 *   pnpm run pm:subagent:recover -- --json
 *   pnpm run pm:subagent:recover -- --watch 45
 *
 * Exit: 0 healthy · 2 recovery actions required
 */
import {
  planSubagentRecovery,
  renderRecoveryReport,
  writeSubagentRecoveryArtifact,
} from "./lib/pm-subagent-recovery.mjs";

const jsonOnly = process.argv.includes("--json");
const watchArg = process.argv.find((a) => a.startsWith("--watch"));
const watchSec = watchArg
  ? Number.parseInt(watchArg.split("=")[1] || process.argv[process.argv.indexOf("--watch") + 1], 10)
  : 0;

function runOnce() {
  const plan = planSubagentRecovery();
  writeSubagentRecoveryArtifact(plan);
  if (jsonOnly) {
    console.log(JSON.stringify(plan, null, 2));
  } else {
    console.log(renderRecoveryReport(plan));
  }
  return plan.healthy ? 0 : 2;
}

if (watchSec > 0) {
  const tick = () => {
    console.clear?.();
    const code = runOnce();
    console.log(`\n(refresh ${watchSec}s · exit ${code} when recovery needed)`);
  };
  tick();
  setInterval(tick, watchSec * 1000);
} else {
  process.exit(runOnce());
}
