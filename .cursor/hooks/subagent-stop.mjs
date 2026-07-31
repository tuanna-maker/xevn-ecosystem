/**
 * subagentStop — báo PM ngay trong chat + (tuỳ chọn) webhook + inbox jsonl; ghi bus .md cuối cùng làm audit.
 *
 * Env (tuỳ chọn, đặt trong Windows User env hoặc shell trước khi mở Cursor):
 *   AGENT_WEBHOOK_URL       — POST khi subagent xong (không log URL/token).
 *   AGENT_WEBHOOK_MODE      — "json" (mặc định) | "slack" (body { text: "..." }).
 *   AGENT_WEBHOOK_AUTH      — header Authorization, ví dụ "Bearer ..." (không commit).
 *
 * stdin: JSON payload từ Cursor (các field có thể khác phiên bản; script đọc defensively).
 */

import fs from "node:fs/promises";
import path from "node:path";
import { deriveDispatchHint, buildPmFollowupVi } from "./pm-dispatch-hint.mjs";

const WEBHOOK_MS = 8000;
/** Suppress duplicate PM follow-up injects for the same subagent/task/status within this window (ms). */
const DEDUPE_WINDOW_MS = 20 * 60 * 1000;
const COUNT_WINDOW_MS = 24 * 60 * 60 * 1000;
const ENFORCED_ROLES = new Set([
  "dev-be",
  "dev-fe",
  "dev-mobile",
  "devops",
  "qa",
  "qc",
  "ba-process",
  "ba-data",
  "sa",
  "technical-manager",
]);

function str(v) {
  if (v === null || v === undefined) return "";
  return String(v).trim();
}

function pick(payload, keys) {
  for (const k of keys) {
    const v = payload[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") return String(v);
  }
  return "";
}

function buildSignal(payload) {
  const subagent_type = str(payload.subagent_type) || "subagent";
  const task_id = pick(payload, [
    "task_id",
    "subagent_id",
    "agent_id",
    "id",
    "resume",
  ]);
  const status = pick(payload, ["status", "task_status", "outcome", "result"]);
  const title = pick(payload, ["title", "description", "subagent_description", "prompt"]);
  const model = pick(payload, ["model"]);
  const error_message = pick(payload, ["error", "error_message", "failure_reason", "detail"]).slice(0, 500);
  return {
    hook: "subagentStop",
    at: new Date().toISOString(),
    subagent_type,
    task_id,
    status,
    title: title.slice(0, 400),
    model,
    error_message: error_message || undefined,
  };
}

async function readBusTailShort(root) {
  const p = path.join(root, "docs", "program", "AGENT_MESSAGE_BUS.md");
  try {
    const fh = await fs.open(p, "r");
    const st = await fh.stat();
    const n = Math.min(st.size, 32 * 1024);
    const buf = Buffer.alloc(n);
    await fh.read(buf, 0, n, st.size - n);
    await fh.close();
    return buf.toString("utf8");
  } catch {
    return "";
  }
}

function followupMessage(signal, busTail) {
  const hint = deriveDispatchHint({
    busTail,
    inboxRec: {
      subagent_type: signal.subagent_type,
      title: signal.title,
      status: signal.status,
    },
  });
  // Closed wave (JWT GWC / SUPERSEDE) — do not inject stale Dev-BE Task
  if (hint?.closed || hint?.workItemId === "P1-EX-PM-IDLE") return "";
  return buildPmFollowupVi({ hint, variant: "subagent" });
}

function extractCompletionText(payload) {
  const candidates = [
    payload?.response,
    payload?.result,
    payload?.output,
    payload?.assistant_response,
    payload?.final_response,
    payload?.message,
    payload?.detail,
  ];
  for (const v of candidates) {
    if (typeof v === "string" && v.trim()) return v;
    if (v && typeof v === "object") {
      try {
        const s = JSON.stringify(v);
        if (s && s !== "{}") return s;
      } catch {
        /* ignore */
      }
    }
  }
  return "";
}

function hasHandoffContract(text) {
  const t = (text || "").toLowerCase();
  if (!t) return false;
  return (
    t.includes("completion_report") &&
    t.includes("next_dispatch_prompt") &&
    (t.includes("next_owner") || t.includes("to_role")) &&
    t.includes("evidence_path") &&
    t.includes("ack_status")
  );
}

async function appendJsonl(inboxPath, record) {
  await fs.mkdir(path.dirname(inboxPath), { recursive: true });
  await fs.appendFile(inboxPath, `${JSON.stringify(record)}\n`, "utf8");
}

function dedupeKey(signal) {
  const tid = str(signal.task_id);
  if (!tid) return "";
  return `${str(signal.subagent_type)}|${tid}|${str(signal.status)}`;
}

async function readDedupeState(dedupePath) {
  try {
    const raw = await fs.readFile(dedupePath, "utf8");
    const o = JSON.parse(raw);
    return {
      key: str(o.key),
      at: Number(o.at) || 0,
    };
  } catch {
    return { key: "", at: 0 };
  }
}

async function writeDedupeState(dedupePath, key) {
  await fs.writeFile(dedupePath, JSON.stringify({ key, at: Date.now() }, null, 0), "utf8");
}

/** Latest `at` (ms) for this dedupe key in inbox jsonl — survives missing local dedupe state file. */
async function latestMatchingAtFromJsonl(inboxPath, dKey) {
  if (!dKey) return 0;
  try {
    const raw = await fs.readFile(inboxPath, "utf8");
    let best = 0;
    for (const line of raw.split("\n")) {
      if (!line.trim()) continue;
      try {
        const rec = JSON.parse(line);
        if (dedupeKey(rec) !== dKey) continue;
        const t = Date.parse(rec.at);
        if (Number.isFinite(t) && t > best) best = t;
      } catch {
        /* ignore bad line */
      }
    }
    return best;
  } catch {
    return 0;
  }
}

async function countRoleCompletions24h(inboxPath, role) {
  if (!role) return 0;
  const now = Date.now();
  try {
    const raw = await fs.readFile(inboxPath, "utf8");
    let n = 0;
    for (const line of raw.split("\n")) {
      if (!line.trim()) continue;
      try {
        const rec = JSON.parse(line);
        if (str(rec.subagent_type) !== role) continue;
        const status = str(rec.status).toLowerCase();
        if (status !== "completed" && status !== "success") continue;
        const t = Date.parse(rec.at);
        if (!Number.isFinite(t)) continue;
        if (now - t <= COUNT_WINDOW_MS) n++;
      } catch {
        /* ignore bad line */
      }
    }
    return n;
  } catch {
    return 0;
  }
}

async function postWebhook(signal) {
  const url = str(process.env.AGENT_WEBHOOK_URL);
  if (!url) return { skipped: true };

  const mode = (str(process.env.AGENT_WEBHOOK_MODE) || "json").toLowerCase();
  const auth = str(process.env.AGENT_WEBHOOK_AUTH);

  let body;
  const headers = { "content-type": "application/json" };
  if (auth) headers.authorization = auth;

  if (mode === "slack") {
    const text = [
      `*subagentStop*`,
      `type: \`${signal.subagent_type}\``,
      signal.task_id ? `task: \`${signal.task_id}\`` : null,
      signal.status ? `status: \`${signal.status}\`` : null,
      signal.title ? `title: ${signal.title}` : null,
    ]
      .filter(Boolean)
      .join("\n");
    body = JSON.stringify({ text });
  } else {
    body = JSON.stringify({
      event: "subagentStop",
      ...signal,
      repo: str(process.env.CURSOR_REPO_NAME || process.env.REPO_NAME || ""),
    });
  }

  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), WEBHOOK_MS);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body,
      signal: ac.signal,
    });
    return { ok: res.ok, status: res.status };
  } catch {
    return { ok: false, error: "webhook_failed" };
  } finally {
    clearTimeout(t);
  }
}

async function main() {
  try {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString("utf8").trim();
    const payload = raw ? JSON.parse(raw) : {};

    const now = new Date().toISOString();
    const root = process.cwd();
    const teamDir = path.join(root, ".cursor", "team");
    const inboxDir = path.join(teamDir, "inbox");
    const inboxPath = path.join(inboxDir, "subagent-stop.jsonl");
    const dedupePath = path.join(inboxDir, "subagent-stop-dedupe-state.json");
    /** Hook audit mirror only — formal program bus is `docs/program/AGENT_MESSAGE_BUS.md`. */
    const busPath = path.join(teamDir, "AGENT_MESSAGE_BUS.md");

    // Telegram sponsor = chat-priority wake (even when PM_ORCHESTRATION_MODE=STOP)
    try {
      const { checkTelegramPmIntake } = await import("./telegram-pm-check.mjs");
      const tg = await checkTelegramPmIntake(root);
      if (tg?.followup_message) {
        process.stdout.write(JSON.stringify(tg));
        return;
      }
    } catch {
      /* fail-open — continue normal subagentStop */
    }

    const signal = buildSignal(payload);
    const completionText = extractCompletionText(payload);
    const role = signal.subagent_type;
    const statusLower = str(signal.status).toLowerCase();
    const shouldEnforceContract =
      ENFORCED_ROLES.has(role) &&
      (statusLower === "completed" || statusLower === "success");
    if (shouldEnforceContract && completionText && !hasHandoffContract(completionText)) {
      throw new Error(
        `INVALID-HANDOFF ${role}: missing completion_report/next_dispatch_prompt contract in subagent completion`
      );
    }
    const dKey = dedupeKey(signal);
    const dedupePrev = await readDedupeState(dedupePath);
    const jsonlLatestMs = await latestMatchingAtFromJsonl(inboxPath, dKey);
    const stateMs = dedupePrev.key === dKey ? dedupePrev.at : 0;
    const lastSameKeyMs = Math.max(stateMs, jsonlLatestMs);
    const withinWindow =
      dKey && lastSameKeyMs > 0 && Date.now() - lastSameKeyMs < DEDUPE_WINDOW_MS;

    const webhookResult = withinWindow ? { skipped: true, reason: "dedupe_window" } : await postWebhook(signal);
    const member_completed_count_24h = await countRoleCompletions24h(inboxPath, signal.subagent_type);
    signal.member_completed_count_24h = member_completed_count_24h + 1;

    const inboxRecord = {
      ...signal,
      webhook: withinWindow
        ? { skipped: true, reason: "dedupe_window" }
        : webhookResult.skipped
          ? "skipped"
          : webhookResult,
      followup_suppressed: withinWindow || undefined,
    };
    await appendJsonl(inboxPath, inboxRecord);

    if (withinWindow) {
      // U59: dedupe suppresses hook inject — still nudge PM via pending pipeline file
      try {
        const { scanPipelineRecovery } = await import(
          path.join(root, "scripts", "lib", "pm-pipeline-recovery.mjs")
        );
        scanPipelineRecovery(6);
      } catch {
        /* non-fatal */
      }
      process.stdout.write(JSON.stringify({}));
      return;
    }

    if (dKey) await writeDedupeState(dedupePath, dKey);

    const summaryBits = [signal.status, signal.task_id, signal.title].filter(Boolean);
    const summary = summaryBits.length ? summaryBits.join(" | ") : `${role} finished`;

    const entry = [
      "",
      `## ${now} | Hook subagentStop -> PM | MEDIUM`,
      "- Topic: Subagent completion (PM-first notify, audit trail last)",
      `- Subagent type: \`${role}\``,
      signal.task_id ? `- Task / id: \`${signal.task_id}\`` : null,
      signal.status ? `- Status: \`${signal.status}\`` : null,
      signal.title ? `- Title/summary: ${signal.title.slice(0, 240)}` : null,
      `- Webhook: ${webhookResult.skipped ? "skipped (set AGENT_WEBHOOK_URL to enable)" : JSON.stringify(webhookResult)}`,
      `- Inbox: \`.cursor/team/inbox/subagent-stop.jsonl\` (append-only)`,
      "- Needed by: Immediate",
      "- Next: PM reads Task result in chat, dispatches next role; update formal bus when closing the loop.",
      "- ACK: AUTO",
      "",
    ]
      .filter(Boolean)
      .join("\n");

    await fs.mkdir(teamDir, { recursive: true });
    await fs.appendFile(busPath, entry, "utf8");

    const busTail = await readBusTailShort(root);
    const msg = followupMessage(signal, busTail);
    process.stdout.write(
      msg ? JSON.stringify({ followup_message: msg }) : JSON.stringify({})
    );
  } catch {
    process.stdout.write(JSON.stringify({}));
  }
}

main();
