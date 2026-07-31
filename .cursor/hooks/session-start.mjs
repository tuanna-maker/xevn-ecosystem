import fs from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { checkPeerPmPing } from "./peer-pm-check.mjs";
import { checkPeerClaudeWatchdog } from "./peer-claude-watchdog-check.mjs";
import { checkTelegramPmIntake } from "./telegram-pm-check.mjs";

async function resolvePaths(root) {
  const teamDir = path.join(root, ".cursor", "team");
  await fs.mkdir(teamDir, { recursive: true });
  return {
    busPath: path.join(teamDir, "AGENT_MESSAGE_BUS.md"),
  };
}

/** Sponsor lock: open project → telegram channel auto (no manual pnpm). */
function ensureTelegramChannel(root) {
  try {
    const script = path.join(
      root,
      ".cursor",
      "team",
      "telegram-pm",
      "ensure-channel.mjs",
    );
    spawn(process.execPath, [script], {
      cwd: root,
      detached: true,
      stdio: "ignore",
      windowsHide: true,
    }).unref();
  } catch {
    /* fail-open */
  }
}

async function main() {
  try {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString("utf8").trim();
    if (raw) JSON.parse(raw);

    const now = new Date().toISOString();
    const root = process.cwd();

    ensureTelegramChannel(root);

    try {
      const wd = await checkPeerClaudeWatchdog(root);
      if (wd?.followup_message) {
        process.stdout.write(JSON.stringify(wd));
        return;
      }
    } catch {
      /* fail-open */
    }

    const peer = await checkPeerPmPing(root);
    if (peer?.followup_message) {
      process.stdout.write(JSON.stringify(peer));
      return;
    }

    const tg = await checkTelegramPmIntake(root);
    if (tg?.followup_message) {
      process.stdout.write(JSON.stringify(tg));
      return;
    }

    const { busPath } = await resolvePaths(root);
    const entry = [
      "",
      `## ${now} | Hook sessionStart -> PM | LOW`,
      "- Topic: Session bootstrap",
      "- Work Item: TEAM-BOOTSTRAP",
      "- Request / Handoff: Session started; telegram channel ensure; load queue/rules.",
      "- Needed by: Immediate",
      "- Evidence: .cursor/team/AGENT_MESSAGE_BUS.md",
      "- ACK: AUTO",
      "",
    ].join("\n");

    await fs.appendFile(busPath, entry, "utf8");
    process.stdout.write(JSON.stringify({}));
  } catch {
    process.stdout.write(JSON.stringify({}));
  }
}

main();
