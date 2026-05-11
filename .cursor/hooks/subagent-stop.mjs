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

const WEBHOOK_MS = 8000;
/** Suppress duplicate PM follow-up injects for the same subagent/task/status within this window (ms). */
const DEDUPE_WINDOW_MS = 20 * 60 * 1000;

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
  return {
    hook: "subagentStop",
    at: new Date().toISOString(),
    subagent_type,
    task_id,
    status,
    title: title.slice(0, 400),
    model,
  };
}

function followupMessage(signal) {
  const line = JSON.stringify(signal);
  return [
    "[PM Auto / subagentStop] Subagent vừa xong — KHÔNG được trả lời user bằng một câu xác nhận ngắn rồi dừng.",
    "Bắt buộc trong lượt tiếp theo: (1) đọc vài dòng cuối `.cursor/team/inbox/subagent-stop.jsonl` nếu có; (2) đọc đoạn cuối `docs/program/AGENT_MESSAGE_BUS.md` + `docs/program/TEAM_LIVE_STATUS.md`; (3) phân tích ack_status/work_item mới nhất; (4) gọi Task dispatch role kế (QA/Dev/QC/…) hoặc cập nhật bus nếu đã chốt; (5) chỉ sau đó mới tóm tắt ngắn cho user nếu cần.",
    "Ngoại lệ hỏi user: đổi scope lớn, thao tác rủi ro cao, thiếu quyền truy cập — theo PM Auto Mode đã thỏa thuận.",
    "",
    `SIGNAL_JSON: ${line}`,
  ].join("\n");
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

    const signal = buildSignal(payload);
    const dKey = dedupeKey(signal);
    const dedupePrev = await readDedupeState(dedupePath);
    const jsonlLatestMs = await latestMatchingAtFromJsonl(inboxPath, dKey);
    const stateMs = dedupePrev.key === dKey ? dedupePrev.at : 0;
    const lastSameKeyMs = Math.max(stateMs, jsonlLatestMs);
    const withinWindow =
      dKey && lastSameKeyMs > 0 && Date.now() - lastSameKeyMs < DEDUPE_WINDOW_MS;

    const webhookResult = withinWindow ? { skipped: true, reason: "dedupe_window" } : await postWebhook(signal);

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
      process.stdout.write(JSON.stringify({}));
      return;
    }

    if (dKey) await writeDedupeState(dedupePath, dKey);

    const role = signal.subagent_type;
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

    process.stdout.write(
      JSON.stringify({
        followup_message: followupMessage(signal),
      })
    );
  } catch {
    process.stdout.write(JSON.stringify({}));
  }
}

main();
