#!/usr/bin/env node
/**
 * afterAgentResponse → send Cursor reply to Telegram (direct API + outbox backup).
 * SoT: _vibe-team-os/23-TELEGRAM-PM-BRIDGE.md
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function readStdin() {
  try {
    return fs.readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function readJson(p, fallback) {
  try {
    if (!fs.existsSync(p)) return fallback;
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return fallback;
  }
}

function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

function findRoot(start) {
  let dir = start;
  for (let i = 0; i < 10; i++) {
    if (
      fs.existsSync(path.join(dir, ".git")) ||
      fs.existsSync(path.join(dir, "pnpm-workspace.yaml")) ||
      fs.existsSync(path.join(dir, "package.json"))
    ) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.resolve(start, "../..");
}

async function sendTelegram(token, chatId, text) {
  const API = `https://api.telegram.org/bot${token}`;
  const chunks = [];
  const s = String(text ?? "");
  for (let i = 0; i < s.length; i += 3500) chunks.push(s.slice(i, i + 3500));
  for (const chunk of chunks) {
    const res = await fetch(`${API}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: chunk,
        disable_web_page_preview: true,
      }),
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.description || "send failed");
  }
}

async function main() {
  const raw = readStdin();
  let payload = {};
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {
    return;
  }

  const text = String(payload.text || "")
    .replace(/\r\n/g, "\n")
    .trim();
  if (!text || text.length < 2) return;

  const root = Array.isArray(payload.workspace_roots)?.[0]
    ? payload.workspace_roots[0]
    : findRoot(path.resolve(__dirname, "../.."));

  const tgDir = path.join(root, ".cursor", "team", "telegram-pm");
  const config = readJson(path.join(tgDir, "config.json"), null);
  if (!config || config.mirrorCursorReplies === false) return;

  loadEnvFile(path.join(tgDir, ".env"));
  const token = (process.env.TELEGRAM_BOT_TOKEN || "").trim();

  const statePath =
    config.paths?.state != null
      ? path.isAbsolute(config.paths.state)
        ? config.paths.state
        : path.join(root, config.paths.state)
      : path.join(tgDir, "state.json");
  const state = readJson(statePath, {});
  const allow = Array.isArray(config.allowedChatIds)
    ? config.allowedChatIds.map(Number).filter((n) => !Number.isNaN(n))
    : [];
  const bound =
    state.boundChatId != null
      ? Number(state.boundChatId)
      : allow.length
        ? allow[0]
        : null;

  if (config.mirrorOnlyWhenBound !== false && !bound) return;

  const genId = payload.generation_id || payload.conversation_id || "";
  const mirrorStatePath = path.join(tgDir, "mirror-state.json");
  const mirrorState = readJson(mirrorStatePath, {});
  if (genId && mirrorState.lastGenerationId === genId) return;

  const maxChars =
    Number(config.mirrorMaxChars) > 0 ? Number(config.mirrorMaxChars) : 8000;
  let body = text;
  if (body.length > maxChars) {
    body = `${body.slice(0, maxChars)}\n\n…(cắt ${body.length - maxChars} ký tự — xem đủ trên Cursor)`;
  }

  const projectId = config.projectId || "project";
  const full = `[${projectId} · Cursor-PM]\n${body}`;
  const at = new Date().toISOString();

  // 1) Direct send — không phụ thuộc bridge còn sống
  let sent = false;
  if (token && bound) {
    try {
      await sendTelegram(token, bound, full);
      sent = true;
    } catch (err) {
      fs.appendFileSync(
        path.join(tgDir, "mirror-errors.log"),
        `${at} ${err.message}\n`,
        "utf8",
      );
    }
  }

  // 2) Outbox backup nếu direct fail
  if (!sent) {
    const outboxRel =
      config.paths?.outbox || ".cursor/team/inbox/telegram-pm-outbox.jsonl";
    const outbox = path.isAbsolute(outboxRel)
      ? outboxRel
      : path.join(root, outboxRel);
    fs.mkdirSync(path.dirname(outbox), { recursive: true });
    fs.appendFileSync(
      outbox,
      `${JSON.stringify({
        at,
        toChatId: bound,
        kind: "cursor_mirror",
        generation_id: genId || null,
        text: full,
      })}\n`,
      "utf8",
    );
  }

  fs.mkdirSync(tgDir, { recursive: true });
  fs.writeFileSync(
    mirrorStatePath,
    `${JSON.stringify(
      { lastGenerationId: genId, lastAt: at, sentDirect: sent },
      null,
      2,
    )}\n`,
    "utf8",
  );

  try {
    const inboxRel =
      config.paths?.inbox || ".cursor/team/inbox/telegram-pm.jsonl";
    const inbox = path.isAbsolute(inboxRel)
      ? inboxRel
      : path.join(root, inboxRel);
    if (fs.existsSync(inbox)) {
      const lines = fs.readFileSync(inbox, "utf8").split(/\r?\n/);
      const next = lines.map((L) => {
        if (!L.trim()) return L;
        try {
          const o = JSON.parse(L);
          if (o.ack_status === "OPEN") {
            o.ack_status = "ACKED";
            o.acked_at = at;
            o.acked_via = sent ? "afterAgentResponse-direct" : "afterAgentResponse-outbox";
          }
          return JSON.stringify(o);
        } catch {
          return L;
        }
      });
      fs.writeFileSync(inbox, `${next.filter(Boolean).join("\n")}\n`, "utf8");
    }
  } catch {
    /* ignore */
  }
}

main().catch(() => process.exit(0));
