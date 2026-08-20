/**
 * Telegram PM intake check — inject followup when sponsor messaged via bot.
 * Wired: sessionStart · stop · subagentStop (priority over other followups).
 *
 * Honest limit: Cursor only injects when an agent turn ends / session starts.
 * Bridge writes wake.json so the next stop/subagentStop picks it up immediately.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEDUPE_MS = 20_000;

function findRoot() {
  let dir = path.resolve(__dirname, "../..");
  for (let i = 0; i < 6; i++) {
    if (
      fs.existsSync(path.join(dir, "pnpm-workspace.yaml")) ||
      fs.existsSync(path.join(dir, ".git"))
    ) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return path.resolve(__dirname, "../..");
}

function readJson(p, fb) {
  try {
    if (!fs.existsSync(p)) return fb;
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return fb;
  }
}

function latestOpenIntake(inboxPath) {
  if (!fs.existsSync(inboxPath)) return null;
  const lines = fs
    .readFileSync(inboxPath, "utf8")
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  for (let i = lines.length - 1; i >= 0; i--) {
    try {
      const o = JSON.parse(lines[i]);
      if (o.ack_status === "OPEN" && o.work_item_id) return o;
    } catch {
      /* ignore */
    }
  }
  return null;
}

/**
 * @returns {Promise<{ followup_message: string } | null>}
 */
export async function checkTelegramPmIntake(rootArg) {
  const root = rootArg || findRoot();
  const cfg = readJson(
    path.join(root, ".cursor", "team", "telegram-pm", "config.json"),
    null,
  );
  if (!cfg) return null;

  const inboxRel = cfg.paths?.inbox || ".cursor/team/inbox/telegram-pm.jsonl";
  const inbox = path.isAbsolute(inboxRel) ? inboxRel : path.join(root, inboxRel);
  const latest = latestOpenIntake(inbox);
  if (!latest) return null;

  const statePath = path.join(
    root,
    ".cursor",
    "team",
    "telegram-pm",
    "intake-hook-state.json",
  );
  const hookState = readJson(statePath, { lastWi: null });
  const now = Date.now();
  const lastAt = hookState.at ? Date.parse(hookState.at) : 0;
  const sameRecent =
    hookState.lastWi === latest.work_item_id &&
    Number.isFinite(lastAt) &&
    now - lastAt < DEDUPE_MS;
  if (sameRecent) return null;

  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.writeFileSync(
    statePath,
    `${JSON.stringify(
      { lastWi: latest.work_item_id, at: new Date().toISOString() },
      null,
      2,
    )}\n`,
  );

  const wakePath = path.join(
    root,
    ".cursor",
    "team",
    "telegram-pm",
    "wake.json",
  );
  try {
    if (fs.existsSync(wakePath)) fs.unlinkSync(wakePath);
  } catch {
    /* ignore */
  }

  const sponsorText = String(latest.text || "").slice(0, 1200);
  const followup_message = [
    `TELEGRAM → CURSOR-PM (tín hiệu như chat sponsor — ưu tiên cao nhất)`,
    `work_item: ${latest.work_item_id}`,
    `sponsor hỏi: ${sponsorText}`,
    `Bắt buộc ≤3 tool đầu: (1) trả lời đúng câu hỏi (2) gửi cùng nội dung qua Telegram send-once hoặc để afterAgentResponse mirror (3) đóng ack OPEN trên telegram-pm.jsonl.`,
    `Cấm: chỉ ack «Đã nhận» · im trong Cursor · bảo «sẽ kiểm tra inbox».`,
  ].join("\n");

  return { followup_message };
}

if (process.argv[1] && process.argv[1].includes("telegram-pm-check")) {
  const r = await checkTelegramPmIntake();
  if (r?.followup_message) {
    process.stdout.write(JSON.stringify(r));
  }
}
