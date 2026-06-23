/**
 * PM subagent health — detect in-flight / stale / zombie handoffs.
 * work_item_id: PM-SUBAGENT-STATUS
 */
import fs from "node:fs";
import path from "node:path";
import { extractWorkItemIds } from "./pm-work-item-id.mjs";

const DEFAULT_STALE_MS = Number.parseInt(String(process.env.PM_SUBAGENT_STALE_MS ?? 7 * 60 * 1000), 10) || 7 * 60 * 1000;
const TRANSCRIPT_STALE_MS = Number.parseInt(String(process.env.PM_TRANSCRIPT_STALE_MS ?? 5 * 60 * 1000), 10) || 5 * 60 * 1000;
const WARMUP_STUCK_MS = Number.parseInt(String(process.env.PM_SUBAGENT_WARMUP_MS ?? 90 * 1000), 10) || 90 * 1000;
const BROWSER_HANG_MS = Number.parseInt(String(process.env.PM_BROWSER_HANG_MS ?? 3 * 60 * 1000), 10) || 3 * 60 * 1000;

const TRANSCRIPT_ERROR_PATTERNS = [
  { id: "cdn", re: /cdn\.|cloudfront|jsdelivr|unpkg|ECONNRESET|ETIMEDOUT|fetch failed/i },
  { id: "connection", re: /ECONNREFUSED|ERR_CONNECTION|network error|socket hang up/i },
  { id: "quota", re: /quota|usage limit|billing|rate limit|too many requests/i },
  { id: "browser_denied", re: /browser_cdp.*denied|Input\.\*|navigation.*denied/i },
  { id: "timeout", re: /timed out|timeout|taking longer than expected/i },
];

const BROWSER_TOOLS = new Set([
  "browser_cdp",
  "browser_navigate",
  "browser_click",
  "browser_snapshot",
  "CallMcpTool",
  "browser_take_screenshot",
]);

const BUS_PATHS = [
  "docs/program/AGENT_MESSAGE_BUS.md",
  ".cursor/team/AGENT_MESSAGE_BUS.md",
];

function readJsonl(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return raw
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

function readBusTail(maxBytes = 512 * 1024) {
  for (const rel of BUS_PATHS) {
    const p = path.join(process.cwd(), rel);
    try {
      const st = fs.statSync(p);
      const n = Math.min(st.size, maxBytes);
      const fd = fs.openSync(p, "r");
      const buf = Buffer.alloc(n);
      fs.readSync(fd, buf, 0, n, st.size - n);
      fs.closeSync(fd);
      return { path: rel, text: buf.toString("utf8") };
    } catch {
      /* next */
    }
  }
  return { path: "", text: "" };
}

function parseMs(iso) {
  const t = Date.parse(iso || "");
  return Number.isFinite(t) ? t : 0;
}

function extractWorkItems(text) {
  return extractWorkItemIds(text);
}

/** Latest stop record per task_id (or type|title fallback key). */
function indexStops(stops) {
  /** @type {Map<string, object>} */
  const byKey = new Map();
  for (const rec of stops) {
    const tid = str(rec.task_id);
    const key = tid || `${str(rec.subagent_type)}|${str(rec.title).slice(0, 80)}`;
    const prev = byKey.get(key);
    if (!prev || parseMs(rec.at) >= parseMs(prev.at)) byKey.set(key, rec);
  }
  return byKey;
}

function str(v) {
  return v === null || v === undefined ? "" : String(v).trim();
}

function stopStatus(rec) {
  const s = str(rec?.status).toLowerCase();
  if (s === "completed" || s === "success") return "completed";
  if (s === "error" || s === "failed" || s === "failure") return "error";
  return s || "unknown";
}

/** Parse formal bus DISPATCHED / verdict blocks from tail only. */
function parseBusDispatches(busText, maxLines = 400) {
  const tailLines = busText.split(/\r?\n/).slice(-maxLines).join("\n");
  const blocks = tailLines.split(/\n(?=##\s+)/);
  /** @type {Array<{atMs:number, role:string, workItems:string[], kind:string}>} */
  const events = [];
  for (const block of blocks) {
    const header = block.split(/\r?\n/)[0] || "";
    const hm = header.match(/^##\s+([^\|]+)\|\s*([^\|]+?)\s*->\s*([^\|]+)/i);
    if (!hm) continue;
    const atMs = parseMs(hm[1].trim());
    const from = hm[2].trim().toLowerCase();
    const to = hm[3].trim().toLowerCase();
    const body = block;
    const workItems = extractWorkItems(body);
    if (workItems.length === 0) continue;
    if (/DISPATCHED/i.test(body) && from === "pm") {
      events.push({ atMs, role: to, workItems, kind: "dispatch" });
    }
    if (/PASS_TO_PM|FAIL_TO_PM|READY_FOR_QA|READY_FOR_QC|BLOCKED|INTAKE/i.test(body)) {
      events.push({ atMs, role: from || to, workItems, kind: "verdict" });
    }
  }
  return events.sort((a, b) => a.atMs - b.atMs);
}

function findOpenDispatches(events, now = Date.now(), maxAgeMs = 48 * 60 * 60 * 1000) {
  /** @type {Map<string, {kind:string, role:string, atMs:number}>} */
  const last = new Map();
  for (const ev of events) {
    if (now - ev.atMs > maxAgeMs) continue;
    for (const wi of ev.workItems) {
      last.set(wi, { kind: ev.kind, role: ev.role, atMs: ev.atMs });
    }
  }
  /** @type {Array<{workItem:string, role:string, dispatchAtMs:number, ageMin:number}>} */
  const open = [];
  for (const [workItem, st] of last) {
    if (st.kind !== "dispatch") continue;
    open.push({
      workItem,
      role: st.role,
      dispatchAtMs: st.atMs,
      ageMin: Math.round((now - st.atMs) / 60000),
    });
  }
  return open;
}

function evidenceExists(workItem) {
  const dir = path.join(process.cwd(), "docs/qa/evidence");
  const slug = workItem.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const short = slug.replace(/-/g, "").slice(0, 12);
  try {
    const files = fs.readdirSync(dir);
    return files.some((f) => {
      const fl = f.toLowerCase();
      return fl.includes(slug) || fl.includes(short) || fl.includes(workItem.toLowerCase().replace(/_/g, "-"));
    });
  } catch {
    return false;
  }
}

function resolveTranscriptsDir(root) {
  const env = str(process.env.CURSOR_AGENT_TRANSCRIPTS_DIR);
  if (env && fs.existsSync(env)) return env;
  const home = process.env.USERPROFILE || process.env.HOME || "";
  if (!home) return "";
  const slug = path.basename(root).toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const candidates = [
    path.join(home, ".cursor", "projects", slug, "agent-transcripts"),
    path.join(home, ".cursor", "projects", "c-Users-ADMIN-OneDrive-Ta-i-li-u-Vibe-Coding-projects-xevn-ecosystem", "agent-transcripts"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  try {
    const projectsDir = path.join(home, ".cursor", "projects");
    const dirs = fs.readdirSync(projectsDir);
    for (const d of dirs) {
      if (!d.toLowerCase().includes("xevn-ecosystem")) continue;
      const p = path.join(projectsDir, d, "agent-transcripts");
      if (fs.existsSync(p)) return p;
    }
  } catch {
    /* ignore */
  }
  return "";
}

function scanTranscriptTail(raw) {
  const lines = raw.split(/\r?\n/).filter(Boolean);
  let lastRole = "";
  let lastTool = "";
  let errorPattern = "";
  const tailText = lines.slice(-30).join("\n");
  for (const p of TRANSCRIPT_ERROR_PATTERNS) {
    if (p.re.test(tailText)) {
      errorPattern = p.id;
      break;
    }
  }
  for (const line of lines.slice(-8)) {
    try {
      const o = JSON.parse(line);
      lastRole = str(o.role) || lastRole;
      const content = o.message?.content;
      if (Array.isArray(content)) {
        for (const c of content) {
          if (c.type === "tool_use" && c.name) lastTool = c.name;
        }
      }
    } catch {
      /* ignore */
    }
  }
  return { lineCount: lines.length, lastRole, lastTool, errorPattern, tailText };
}

function findErrorStops(stops, now = Date.now()) {
  /** @type {Array<object>} */
  const errors = [];
  const recent = stops.filter((s) => now - parseMs(s.at) < 6 * 60 * 60 * 1000);
  for (const rec of recent) {
    const status = stopStatus(rec);
    if (status !== "error") continue;
    errors.push({
      subagent_type: rec.subagent_type,
      task_id: rec.task_id,
      title: rec.title,
      completedAt: rec.at,
      verdict: "subagent_error_stop",
      hint: "subagentStop status=error — PM retry spawn_fresh_task + model fallback",
    });
  }
  return errors;
}

function scanSubagentTranscripts(transcriptsDir, now = Date.now()) {
  if (!transcriptsDir) return [];
  /** @type {Array<object>} */
  const rows = [];
  const walk = (dir) => {
    let entries = [];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(full);
      else if (ent.isFile() && ent.name.endsWith(".jsonl") && dir.includes(`${path.sep}subagents${path.sep}`)) {
        try {
          const st = fs.statSync(full);
          const ageMs = now - st.mtimeMs;
          if (ageMs > 6 * 60 * 60 * 1000) continue;
          const raw = fs.readFileSync(full, "utf8");
          const parsed = scanTranscriptTail(raw);
          const { lineCount, lastRole, lastTool, errorPattern } = parsed;
          const agentId = path.basename(full, ".jsonl");
          let verdict = "active";
          if (errorPattern && ageMs > WARMUP_STUCK_MS) {
            verdict = "transcript_error_pattern";
          } else if (lineCount <= 3 && ageMs > WARMUP_STUCK_MS && ageMs < DEFAULT_STALE_MS) {
            verdict = "warming_up_stuck";
          } else if (lineCount <= 2 && ageMs > TRANSCRIPT_STALE_MS) {
            verdict = "stuck_at_start";
          } else if (BROWSER_TOOLS.has(lastTool) && ageMs > BROWSER_HANG_MS) {
            verdict = "browser_tool_hang";
          } else if (lastTool === "browser_cdp" && ageMs > TRANSCRIPT_STALE_MS) {
            verdict = "possible_cdp_hang";
          } else if (ageMs > DEFAULT_STALE_MS && lineCount > 2) {
            verdict = "possibly_stale";
          }
          rows.push({
            agentId,
            path: full,
            lineCount,
            lastRole,
            lastTool,
            errorPattern: errorPattern || undefined,
            ageSec: Math.round(ageMs / 1000),
            mtime: new Date(st.mtimeMs).toISOString(),
            verdict,
          });
        } catch {
          /* skip file */
        }
      }
    }
  };
  walk(transcriptsDir);
  return rows.sort((a, b) => b.ageSec - a.ageSec);
}

function matchInFlightStarts(starts, stopsByKey, now = Date.now()) {
  /** @type {Array<object>} */
  const open = [];
  for (const start of starts) {
    const tid = str(start.task_id);
    const key = tid || `${str(start.subagent_type)}|${str(start.title).slice(0, 80)}`;
    const stop = stopsByKey.get(key);
    const startMs = parseMs(start.at);
    if (stop && parseMs(stop.at) >= startMs) continue;
    const ageMs = now - startMs;
    open.push({
      subagent_type: start.subagent_type,
      task_id: tid,
      title: start.title,
      startedAt: start.at,
      ageSec: Math.round(ageMs / 1000),
      ageMin: Math.round(ageMs / 60000),
      verdict: ageMs >= DEFAULT_STALE_MS ? "stale_in_flight" : "in_flight",
    });
  }
  return open.sort((a, b) => b.ageSec - a.ageSec);
}

function findZombieStops(stops, now = Date.now()) {
  /** @type {Array<object>} */
  const zombies = [];
  const recent = stops.filter((s) => now - parseMs(s.at) < 6 * 60 * 60 * 1000);
  for (const rec of recent) {
    if (stopStatus(rec) !== "completed") continue;
    const workItems = extractWorkItems(`${rec.title || ""} ${rec.task_id || ""}`);
    const qaLike = /qa|qc|dev-|evidence|retest|finish/i.test(rec.title || "");
    if (!qaLike || workItems.length === 0) continue;
    for (const wi of workItems) {
      if (!evidenceExists(wi)) {
        zombies.push({
          subagent_type: rec.subagent_type,
          task_id: rec.task_id,
          title: rec.title,
          workItem: wi,
          completedAt: rec.at,
          verdict: "zombie_completed",
          hint: "subagentStop=completed nhưng thiếu evidence — INVALID-HANDOFF",
        });
      }
    }
  }
  return zombies;
}

export function scanSubagentStatus(options = {}) {
  const root = options.root || process.cwd();
  const now = options.now ?? Date.now();
  const staleMs = options.staleMs ?? DEFAULT_STALE_MS;

  const inboxDir = path.join(root, ".cursor", "team", "inbox");
  const starts = readJsonl(path.join(inboxDir, "subagent-start.jsonl"));
  const stops = readJsonl(path.join(inboxDir, "subagent-stop.jsonl"));
  const stopsByKey = indexStops(stops);

  const bus = readBusTail();
  const busEvents = parseBusDispatches(bus.text);
  const openDispatches = findOpenDispatches(busEvents, now).filter((d) => now - d.dispatchAtMs >= staleMs);

  const inFlight = matchInFlightStarts(starts, stopsByKey, now);
  const staleInFlight = inFlight.filter((x) => x.verdict === "stale_in_flight");

  const latestStop = stops.length ? stops[stops.length - 1] : null;
  const latestStart = starts.length ? starts[starts.length - 1] : null;

  const transcriptsDir = resolveTranscriptsDir(root);
  const transcripts = scanSubagentTranscripts(transcriptsDir, now);
  const riskyVerdicts = [
    "stuck_at_start",
    "warming_up_stuck",
    "possible_cdp_hang",
    "browser_tool_hang",
    "possibly_stale",
    "transcript_error_pattern",
  ];
  const riskyTranscripts = transcripts.filter((t) => riskyVerdicts.includes(t.verdict));

  const errorStops = findErrorStops(stops, now);
  const zombies = findZombieStops(stops, now);

  const issues = [
    ...staleInFlight.map((x) => ({ severity: "P0", type: "stale_in_flight", ...x })),
    ...errorStops.map((x) => ({ severity: "P0", type: x.verdict, ...x })),
    ...openDispatches.map((x) => ({
      severity: "P1",
      type: "bus_dispatch_stale",
      workItem: x.workItem,
      role: x.role,
      ageMin: x.ageMin,
      hint: "PM DISPATCHED trên bus nhưng chưa có verdict PASS_TO_PM",
    })),
    ...zombies.map((x) => ({ severity: "P0", type: x.verdict, ...x })),
    ...riskyTranscripts.map((x) => ({
      severity:
        x.verdict === "possible_cdp_hang" ||
        x.verdict === "browser_tool_hang" ||
        x.verdict === "warming_up_stuck" ||
        x.verdict === "transcript_error_pattern"
          ? "P0"
          : "P1",
      type: x.verdict,
      agentId: x.agentId,
      lastTool: x.lastTool,
      lineCount: x.lineCount,
      ageSec: x.ageSec,
      errorPattern: x.errorPattern,
      hint:
        x.verdict === "warming_up_stuck"
          ? "Subagent warming up quá lâu — spawn Task mới, shell-first"
          : x.verdict === "transcript_error_pattern"
            ? `Transcript lỗi runtime (${x.errorPattern}) — retry không CDN/browser`
            : "Transcript subagent không cập nhật — có thể treo tool (CDP/shell)",
    })),
  ];

  const healthy = issues.length === 0;

  return {
    scannedAt: new Date(now).toISOString(),
    healthy,
    staleThresholdMin: Math.round(staleMs / 60000),
    sources: {
      subagentStarts: starts.length,
      subagentStops: stops.length,
      busPath: bus.path,
      transcriptsDir: transcriptsDir || "(not found)",
    },
    latest: {
      start: latestStart,
      stop: latestStop,
    },
    inFlight,
    staleInFlight,
    openBusDispatches: openDispatches,
    riskyTranscripts,
    errorStops,
    zombies,
    issues,
  };
}

export function renderSubagentStatusReport(scan) {
  const lines = [];
  lines.push(`pm:subagent:status — ${scan.healthy ? "HEALTHY" : `${scan.issues.length} ISSUE(S)`}`);
  lines.push(`  scanned: ${scan.scannedAt} · stale threshold: ${scan.staleThresholdMin} min`);
  lines.push(
    `  inbox: ${scan.sources.subagentStarts} starts / ${scan.sources.subagentStops} stops · transcripts: ${scan.sources.transcriptsDir}`,
  );

  if (scan.latest.stop) {
    const s = scan.latest.stop;
    lines.push(
      `  last stop: ${s.at} · ${s.subagent_type} · ${s.status} · ${(s.title || "").slice(0, 60)}`,
    );
  }
  if (scan.inFlight.length) {
    lines.push(`\nIN-FLIGHT (${scan.inFlight.length}):`);
    for (const x of scan.inFlight.slice(0, 8)) {
      lines.push(
        `  [${x.verdict}] ${x.subagent_type} · ${x.ageMin}m · ${(x.title || x.task_id || "").slice(0, 55)}`,
      );
    }
  } else if (scan.sources.subagentStarts === 0) {
    lines.push("\nIN-FLIGHT: (unknown — bật hook subagentStart để theo dõi chính xác)");
  } else {
    lines.push("\nIN-FLIGHT: none");
  }

  if (scan.issues.length) {
    lines.push("\nISSUES:");
    for (const i of scan.issues.slice(0, 12)) {
      lines.push(`  [${i.severity}] ${i.type} — ${i.hint || i.workItem || i.agentId || i.title || ""}`);
    }
  }

  if (scan.riskyTranscripts.length) {
    lines.push("\nTRANSCRIPT WATCH (subagents/):");
    for (const t of scan.riskyTranscripts.slice(0, 5)) {
      lines.push(
        `  [${t.verdict}] ${t.agentId} · ${t.ageSec}s · lines=${t.lineCount} · lastTool=${t.lastTool || "-"}`,
      );
    }
  }

  lines.push("\nCommands:");
  lines.push("  pnpm run pm:subagent:status          # human report");
  lines.push("  pnpm run pm:subagent:recover         # recovery actions → PM_SUBAGENT_RECOVERY.json");
  lines.push("  pnpm run pm:subagent:status -- --json  # CI/automation");
  lines.push("  PM_SUBAGENT_WARMUP_MS=90000          # warming stuck threshold (default 90s)");
  lines.push("  PM_SUBAGENT_STALE_MS=420000 ...      # custom 7m threshold");

  return lines.join("\n");
}
