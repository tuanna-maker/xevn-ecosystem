/**
 * Inject followup when peer Claude watchdog triggers RECLAIM.
 * Wired: sessionStart + stop-pm-orchestration (before/after peer-pm-check).
 */
import { runPeerClaudeWatchdog } from "../../scripts/lib/pm-peer-claude-watchdog.mjs";

/**
 * @param {string} [root]
 * @returns {Promise<{ followup_message: string } | null>}
 */
export async function checkPeerClaudeWatchdog(root = process.cwd()) {
  const result = runPeerClaudeWatchdog(root, { autoReclaim: true });
  if (result.healthy || result.reclaim.length === 0) return null;

  const lines = result.reclaim.map(
    (r) => `- ${r.work_item_id}: ${r.state} — ${r.reason} (${r.idle_min}m)`,
  );
  const followup_message = [
    "PEER-CLAUDE WATCHDOG — AUTO-RECLAIM (chạy pm:peer-claude:watch)",
    ...lines,
    "SoT: docs/program/PEER_CLAUDE_WATCHDOG.md · state: .cursor/team/inbox/peer-claude-watchdog-state.json",
    "Hành động (≤3 tool): (1) đọc watchdog state (2) bus RECLAIM (3) dispatch Cursor BF owner — cấm chờ Claude.",
  ].join("\n");

  return { followup_message };
}

async function main() {
  try {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    void Buffer.concat(chunks).toString("utf8");
    const hit = await checkPeerClaudeWatchdog(process.cwd());
    process.stdout.write(JSON.stringify(hit ?? {}));
  } catch {
    process.stdout.write(JSON.stringify({}));
  }
}

const argvPath = String(process.argv[1] ?? "").replace(/\\/g, "/");
if (argvPath.includes("peer-claude-watchdog-check.mjs")) {
  main();
}
