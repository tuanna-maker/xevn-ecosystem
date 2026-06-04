/**
 * stop hook — PM auto followup + watchdog (prompt 100% tiếng Việt, lệnh cụ thể).
 */

import fs from "node:fs/promises";
import path from "node:path";
import {
  readLatestInbox,
  deriveDispatchHint,
  buildPmFollowupVi,
  hasFreshDispatch,
  isWaveClosedOnBus,
  isWorkItemClosed,
  isWorkItemVerdictClosedOnBus,
} from "./pm-dispatch-hint.mjs";

const MODE_PATH_SEG = [".cursor", "team", "PM_ORCHESTRATION_MODE"];
const WATCHDOG_STATE_SEG = [".cursor", "team", "inbox", "pm-watchdog-state.json"];
const PROGRAM_BUS_SEG = ["docs", "program", "AGENT_MESSAGE_BUS.md"];
const MAX_DEFAULT = 10;
const SUBAGENT_RECENT_MS = 180_000;
const WATCHDOG_STALE_MS =
  Number.parseInt(String(process.env.PM_WATCHDOG_STALE_MS ?? 7 * 60 * 1000), 10) ||
  7 * 60 * 1000;
const WATCHDOG_MAX_REPEAT =
  Number.parseInt(String(process.env.PM_WATCHDOG_MAX_REPEAT ?? 2), 10) || 2;

async function readMode(root) {
  const p = path.join(root, ...MODE_PATH_SEG);
  try {
    const raw = (await fs.readFile(p, "utf8")).trim();
    const first = raw.split(/\r?\n/)[0]?.trim().toUpperCase() ?? "";
    return first === "RUN" ? "RUN" : "STOP";
  } catch {
    return "STOP";
  }
}

async function readBusTail(root) {
  const p = path.join(root, ...PROGRAM_BUS_SEG);
  try {
    const fh = await fs.open(p, "r");
    const st = await fh.stat();
    const n = Math.min(st.size, 256 * 1024);
    const buf = Buffer.alloc(n);
    await fh.read(buf, 0, n, st.size - n);
    await fh.close();
    return buf.toString("utf8");
  } catch {
    return "";
  }
}

function latestDispatchAtMs(busTail) {
  const lines = busTail.split(/\r?\n/);
  for (let i = lines.length - 1; i >= 0; i--) {
    const L = lines[i];
    if (!/DISPATCHED/i.test(L)) continue;
    const m = L.match(/^##\s+([0-9T:+\-\.Z]+)/);
    if (!m) continue;
    const t = Date.parse(m[1]);
    if (Number.isFinite(t)) return t;
  }
  return 0;
}

async function latestSubagentCompletionAtMs(root) {
  const rec = await readLatestInbox(root);
  if (!rec?.at) return 0;
  const t = Date.parse(rec.at);
  return Number.isFinite(t) ? t : 0;
}

async function recentSubagentStop(root) {
  const t = await latestSubagentCompletionAtMs(root);
  return t > 0 && Date.now() - t < SUBAGENT_RECENT_MS;
}

async function readWatchdogState(root) {
  const p = path.join(root, ...WATCHDOG_STATE_SEG);
  try {
    const raw = await fs.readFile(p, "utf8");
    const o = JSON.parse(raw);
    return { tracked_at: Number(o.tracked_at) || 0, repeats: Number(o.repeats) || 0 };
  } catch {
    return { tracked_at: 0, repeats: 0 };
  }
}

async function writeWatchdogState(root, state) {
  const p = path.join(root, ...WATCHDOG_STATE_SEG);
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify(state), "utf8");
}

async function main() {
  try {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString("utf8").trim();
    const payload = raw ? JSON.parse(raw) : {};
    const status = String(payload.status ?? "");
    const loopCount = Number(payload.loop_count ?? 0);
    const root = process.cwd();

    if ((await readMode(root)) !== "RUN") {
      process.stdout.write(JSON.stringify({}));
      return;
    }

    const maxLoops = Math.max(
      1,
      Number.parseInt(String(process.env.PM_STOP_LOOP_MAX ?? MAX_DEFAULT), 10) || MAX_DEFAULT
    );
    if (loopCount >= maxLoops || status !== "completed") {
      process.stdout.write(JSON.stringify({}));
      return;
    }

    const busTail = await readBusTail(root);
    const inboxRec = await readLatestInbox(root);
    const hint = deriveDispatchHint({ busTail, inboxRec });
    const dispatchAt = latestDispatchAtMs(busTail);
    const completionAt = await latestSubagentCompletionAtMs(root);
    const skipSub = await recentSubagentStop(root);

    if (hasFreshDispatch(busTail, hint.role)) {
      process.stdout.write(JSON.stringify({}));
      return;
    }

    if (skipSub) {
      process.stdout.write(JSON.stringify({}));
      return;
    }

    const wiClosed =
      hint.closed ||
      isWaveClosedOnBus(busTail) ||
      isWorkItemVerdictClosedOnBus(busTail, hint.workItemId) ||
      (await isWorkItemClosed(root, hint.workItemId));
    if (wiClosed) {
      await writeWatchdogState(root, { tracked_at: 0, repeats: 0 });
      process.stdout.write(JSON.stringify({}));
      return;
    }

    const shouldWatchdog =
      completionAt > 0 &&
      Date.now() - completionAt >= WATCHDOG_STALE_MS &&
      dispatchAt < completionAt;

    if (shouldWatchdog) {
      const state = await readWatchdogState(root);
      const same = state.tracked_at === completionAt;
      const repeats = same ? state.repeats + 1 : 1;
      await writeWatchdogState(root, { tracked_at: completionAt, repeats });
      if (repeats <= WATCHDOG_MAX_REPEAT) {
        const waitedMin = Math.floor((Date.now() - completionAt) / 60000);
        process.stdout.write(
          JSON.stringify({
            followup_message: buildPmFollowupVi({
              hint,
              variant: "watchdog",
              waitedMin,
            }),
          })
        );
      } else {
        process.stdout.write(JSON.stringify({}));
      }
      return;
    }

    if (dispatchAt >= completionAt && completionAt > 0) {
      await writeWatchdogState(root, { tracked_at: 0, repeats: 0 });
    }

    const msg = buildPmFollowupVi({ hint, variant: "normal" });
    process.stdout.write(JSON.stringify({ followup_message: msg }));
  } catch {
    process.stdout.write(JSON.stringify({}));
  }
}

main();
