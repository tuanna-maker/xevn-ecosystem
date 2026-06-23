/**
 * subagentStart — ghi inbox khi Task/subagent bắt đầu (đối chiếu subagentStop → phát hiện treo).
 * Inbox: `.cursor/team/inbox/subagent-start.jsonl`
 */

import fs from "node:fs/promises";
import path from "node:path";

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
  return {
    hook: "subagentStart",
    at: new Date().toISOString(),
    subagent_type: str(payload.subagent_type) || "subagent",
    task_id: pick(payload, ["task_id", "subagent_id", "agent_id", "id", "resume"]),
    title: pick(payload, ["title", "description", "subagent_description", "prompt"]).slice(0, 400),
    model: pick(payload, ["model"]),
  };
}

async function appendJsonl(inboxPath, record) {
  await fs.mkdir(path.dirname(inboxPath), { recursive: true });
  await fs.appendFile(inboxPath, `${JSON.stringify(record)}\n`, "utf8");
}

async function main() {
  try {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString("utf8").trim();
    const payload = raw ? JSON.parse(raw) : {};

    const root = process.cwd();
    const inboxPath = path.join(root, ".cursor", "team", "inbox", "subagent-start.jsonl");
    const signal = buildSignal(payload);
    await appendJsonl(inboxPath, signal);
    process.stdout.write(JSON.stringify({}));
  } catch {
    process.stdout.write(JSON.stringify({}));
  }
}

main();
