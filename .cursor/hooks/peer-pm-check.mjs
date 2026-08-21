/**
 * Peer-PM L2 — detect unhandled pings to CURSOR-PM in peer-pm.jsonl.
 * Wired from sessionStart + stop when PEER_PM_AUTO=RUN
 * (independent of PM_ORCHESTRATION_MODE so peer pings still wake Cursor-PM).
 *
 * SoT: _vibe-team-os/19-PEER-PM-COLLAB.md
 */

import fs from "node:fs/promises";
import path from "node:path";

const AUTO_SEG = [".cursor", "team", "PEER_PM_AUTO"];
const INBOX_SEG = [".cursor", "team", "inbox", "peer-pm.jsonl"];
const STATE_SEG = [".cursor", "team", "inbox", "peer-pm-cursor-intake-state.json"];

function str(v) {
  if (v == null) return "";
  return String(v).trim();
}

async function readPeerAuto(root) {
  try {
    const raw = (await fs.readFile(path.join(root, ...AUTO_SEG), "utf8")).trim();
    const first = raw.split(/\r?\n/)[0]?.trim().toUpperCase() ?? "";
    return first === "RUN";
  } catch {
    return false;
  }
}

function isToCursor(rec) {
  const to = str(rec.to).toUpperCase();
  return to === "CURSOR-PM" || to === "CURSOR-PEER" || to === "CURSOR" || to.includes("CURSOR-PM");
}

function needsCursorAction(rec) {
  const ack = str(rec.ack_status).toUpperCase();
  const summary = str(rec.summary);
  if (ack === "OPEN") return true;
  if (ack === "PASS_TO_PEER" || ack === "PASS_TO_PM") return true;
  if (ack === "CLOSED" && /PASS_TO_PEER|đợi Cursor|doi Cursor|sign-off|review|Next:/i.test(summary)) {
    return true;
  }
  return false;
}

function fingerprint(rec) {
  return [str(rec.at) || str(rec.ts), str(rec.from), str(rec.work_item_id), str(rec.ack_status)]
    .join("|")
    .slice(0, 240);
}

async function readState(root) {
  try {
    const o = JSON.parse(await fs.readFile(path.join(root, ...STATE_SEG), "utf8"));
    return {
      lastFp: str(o.lastFp),
      handled: Array.isArray(o.handled) ? o.handled.slice(-40) : [],
    };
  } catch {
    return { lastFp: "", handled: [] };
  }
}

async function writeState(root, state) {
  const p = path.join(root, ...STATE_SEG);
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify(state), "utf8");
}

async function readInboxTail(root, maxLines = 40) {
  const p = path.join(root, ...INBOX_SEG);
  try {
    const raw = await fs.readFile(p, "utf8");
    return raw.split(/\r?\n/).filter((L) => L.trim()).slice(-maxLines);
  } catch {
    return [];
  }
}

/**
 * @param {string} [root]
 * @returns {Promise<{ followup_message: string } | null>}
 */
export async function checkPeerPmPing(root = process.cwd()) {
  if (!(await readPeerAuto(root))) return null;

  const lines = await readInboxTail(root);
  const state = await readState(root);
  const handled = new Set(state.handled);

  let pick = null;
  for (let i = lines.length - 1; i >= 0; i--) {
    let rec;
    try {
      rec = JSON.parse(lines[i]);
    } catch {
      continue;
    }
    if (!isToCursor(rec) || !needsCursorAction(rec)) continue;
    // Telegram sponsor pings are handled by telegram-pm-check / afterAgentResponse — never re-inject via peer hook
    const fromU = str(rec.from).toUpperCase();
    if (fromU === "SPONSOR-TELEGRAM" || fromU === "TELEGRAM" || fromU.includes("TELEGRAM")) {
      continue;
    }
    const fp = fingerprint(rec);
    if (handled.has(fp) || fp === state.lastFp) continue;
    pick = { rec, fp };
    break;
  }
  if (!pick) return null;

  const { rec, fp } = pick;
  const wi = str(rec.work_item_id) || "(no work_item_id)";
  const from = str(rec.from) || "PEER";
  const ack = str(rec.ack_status) || "?";
  const evidence = str(rec.evidence_path) || "docs/program/PEER_PM_COLLAB.md";
  const summary = str(rec.summary).slice(0, 500);

  const followup_message = [
    `PEER-PM PING → CURSOR-PM (auto · PEER_PM_AUTO=RUN)`,
    `from: ${from} · ack: ${ack} · work_item: ${wi}`,
    `evidence: ${evidence}`,
    summary ? `summary: ${summary}` : "",
    `Hành động (≤3 tool): (1) APPEND PEER_PM_COLLAB.md INTAKE/sign-off (2) bus (3) Task owner kế hoặc SUPERSEDE nếu lane đã đóng — cấm idle «đã thấy ping».`,
  ]
    .filter(Boolean)
    .join("\n");

  await writeState(root, { lastFp: fp, handled: [...handled, fp].slice(-40) });
  return { followup_message };
}

async function main() {
  try {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    void Buffer.concat(chunks).toString("utf8");
    const hit = await checkPeerPmPing(process.cwd());
    process.stdout.write(JSON.stringify(hit ?? {}));
  } catch {
    process.stdout.write(JSON.stringify({}));
  }
}

// Cursor/hooks invoke: `node .cursor/hooks/peer-pm-check.mjs` — Windows path compare is flaky
const argvPath = String(process.argv[1] ?? "").replace(/\\/g, "/");
if (argvPath.includes("peer-pm-check.mjs")) {
  main();
}