/**
 * PM subagent recovery planner — map health issues → PM actions (spawn / retry / shell).
 * work_item_id: PM-SUBAGENT-RECOVERY
 */
import fs from "node:fs";
import path from "node:path";
import { scanSubagentStatus } from "./pm-subagent-status.mjs";
import { extractWorkItemIds } from "./pm-work-item-id.mjs";

const RECOVERY_OUT = "docs/program/PM_SUBAGENT_RECOVERY.json";

const BROWSER_TOOLS = new Set([
  "browser_cdp",
  "browser_navigate",
  "browser_click",
  "browser_snapshot",
  "CallMcpTool",
  "browser_take_screenshot",
]);

function str(v) {
  return v === null || v === undefined ? "" : String(v).trim();
}

function extractWorkItemFromTitle(title) {
  const ids = extractWorkItemIds(title || "");
  return ids[0] || "";
}

function buildRecoveryAction(issue, scan) {
  const type = issue.type;
  const role = issue.subagent_type || issue.role || "generalPurpose";
  const workItem =
    issue.workItem ||
    extractWorkItemFromTitle(issue.title) ||
    `PM-RECOVER-${type}`.slice(0, 40);
  const taskId = issue.task_id || issue.agentId || "";

  /** @type {{action:string, priority:string, role:string, workItemId:string, taskId:string, reason:string, pm_dispatch_prompt:string, model_hint?:string}} */
  const base = {
    action: "spawn_fresh_task",
    priority: issue.severity || "P1",
    role,
    workItemId: workItem,
    taskId,
    reason: issue.hint || type,
    pm_dispatch_prompt: "",
  };

  switch (type) {
    case "warming_up_stuck":
    case "stuck_at_start":
      return {
        ...base,
        action: "spawn_fresh_task",
        priority: "P0",
        pm_dispatch_prompt: `RECOVERY: prior subagent ${taskId || role} stuck warming up (${issue.ageSec || "?"}s, lines=${issue.lineCount || 0}). Spawn NEW Task ${role} same work_item_id ${workItem}. Skip browser/CDP — use curl + API smoke only unless sponsor requires UI. Set run_in_background=false. Evidence must cite recovery from PM_SUBAGENT_RECOVERY.json.`,
        model_hint: "gemini-3-flash",
      };

    case "possible_cdp_hang":
    case "browser_tool_hang":
      return {
        ...base,
        action: "interrupt_and_spawn_fresh",
        priority: "P0",
        role: "qa",
        pm_dispatch_prompt: `RECOVERY: subagent ${taskId} hung on ${issue.lastTool || "browser"} (${issue.ageSec}s). Task NEW qa: API/L1 smoke only (pnpm qc:dev-stack, curl :8088) — NO browser_cdp. work_item_id ${workItem}. If UI required: qa-device or manual sponsor screenshot.`,
        model_hint: "composer-2-fast",
      };

    case "transcript_error_pattern":
      return {
        ...base,
        action: "spawn_fresh_task",
        priority: "P0",
        pm_dispatch_prompt: `RECOVERY: subagent hit runtime error (${issue.errorPattern}). Retry ${role} work_item_id ${workItem} with shell-first path; avoid CDN/browser tools. If quota: follow pm-task-quota-fallback model_hint chain.`,
        model_hint: "gemini-3-flash",
      };

    case "subagent_error_stop":
      return {
        ...base,
        action: "retry_with_model_fallback",
        priority: "P0",
        pm_dispatch_prompt: `RECOVERY: subagentStop status=error for ${workItem}. Re-dispatch ${role} with simplified scope; shell/API evidence only. model fallback per pm-task-quota-fallback.mdc.`,
        model_hint: "gpt-5-mini",
      };

    case "stale_in_flight":
      return {
        ...base,
        action: "spawn_fresh_task",
        priority: "P0",
        pm_dispatch_prompt: `RECOVERY: in-flight > threshold (${issue.ageMin}m) task_id ${taskId}. Assume zombie — spawn NEW ${role} for ${workItem}. Do not resume same agent unless user confirms still running.`,
      };

    case "zombie_completed":
      return {
        ...base,
        action: "re_dispatch_invalid_handoff",
        priority: "P0",
        pm_dispatch_prompt: `RECOVERY: INVALID-HANDOFF — ${role} reported completed but no evidence for ${workItem}. Re-dispatch same role with mandatory evidence_path + completion_report.`,
      };

    default:
      return {
        ...base,
        pm_dispatch_prompt: `RECOVERY: issue type ${type} for ${workItem}. PM inspect pm:subagent:status and re-dispatch ${role}.`,
      };
  }
}

/**
 * @param {object} [options]
 * @returns {object}
 */
export function planSubagentRecovery(options = {}) {
  const root = options.root || process.cwd();
  const scan = options.scan || scanSubagentStatus({ root });
  const recoveryRequired = [];

  for (const issue of scan.issues || []) {
    recoveryRequired.push(buildRecoveryAction(issue, scan));
  }

  const dedup = [];
  const keys = new Set();
  for (const r of recoveryRequired) {
    const k = `${r.action}:${r.workItemId}:${r.role}`;
    if (keys.has(k)) continue;
    keys.add(k);
    dedup.push(r);
  }

  const healthy = dedup.length === 0;

  return {
    generatedAt: new Date().toISOString(),
    healthy,
    staleThresholdMin: scan.staleThresholdMin,
    inFlightCount: scan.inFlight?.length ?? 0,
    issuesCount: scan.issues?.length ?? 0,
    recoveryRequired: dedup.slice(0, 8),
    scanSummary: {
      healthy: scan.healthy,
      latestStop: scan.latest?.stop,
      riskyTranscripts: (scan.riskyTranscripts || []).slice(0, 5),
    },
    pmPlaybook: [
      "1. pnpm run pm:subagent:status — human report",
      "2. pnpm run pm:subagent:recover — actions JSON + exit 2",
      "3. PM: Task(recoveryRequired[0].role) with pm_dispatch_prompt; run_in_background=false for stuck agents",
      "4. If warming/CDP: spawn NEW subagent — do not wait same task_id",
      "5. Ghi bus PM -> role | RE-DISPATCHED recovery",
    ],
    outputPath: RECOVERY_OUT,
  };
}

export function writeSubagentRecoveryArtifact(plan, root = process.cwd()) {
  const outPath = path.join(root, RECOVERY_OUT);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify(plan, null, 2)}\n`, "utf8");
  return outPath;
}

export function renderRecoveryReport(plan) {
  const lines = [];
  lines.push(`pm:subagent:recover — ${plan.healthy ? "HEALTHY" : `${plan.recoveryRequired.length} RECOVERY ACTION(S)`}`);
  lines.push(`  generated: ${plan.generatedAt} · in-flight: ${plan.inFlightCount}`);
  if (plan.recoveryRequired.length) {
    lines.push("\nRECOVERY (PM must Task before idle):");
    for (const r of plan.recoveryRequired) {
      lines.push(`  [${r.priority}] ${r.action} -> ${r.role} · ${r.workItemId}`);
      lines.push(`       ${r.reason.slice(0, 90)}`);
      if (r.model_hint) lines.push(`       model_hint: ${r.model_hint}`);
    }
    lines.push(`\nSoT: ${plan.outputPath}`);
  }
  return lines.join("\n");
}
