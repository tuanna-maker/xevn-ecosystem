/**
 * PM pipeline recovery — detect interrupt / followup_suppressed / stale tool_proof gaps.
 * work_item_id: PM-PIPELINE-RECOVERY
 */
import fs from 'node:fs';
import path from 'node:path';
import { scanOpenBacklog } from './pm-backlog-scan.mjs';
import { extractWorkItemIds, normalizeWorkItemBase, workItemsSameSlice } from './pm-work-item-id.mjs';

const ROOT = process.cwd();

const BUS_PATHS = [
  path.join(ROOT, 'docs/program/AGENT_MESSAGE_BUS.md'),
  path.join(ROOT, '.cursor/team/AGENT_MESSAGE_BUS.md'),
];

const ROLE_NEXT = {
  'dev-be': 'qa',
  'dev-fe': 'qa',
  'dev-mobile': 'qa-device',
  'devops': 'qa',
  qa: 'qc',
  'qa-device': 'qc',
  qc: 'pm-program',
};

function parseMs(iso) {
  const t = Date.parse(iso || '');
  return Number.isFinite(t) ? t : 0;
}

function readBusTail(maxLines = 800) {
  for (const p of BUS_PATHS) {
    try {
      const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/);
      return { path: p, lines: lines.slice(-maxLines) };
    } catch {
      /* next */
    }
  }
  return { path: '', lines: [] };
}

function parseBusEvents(lines) {
  const events = [];
  for (const line of lines) {
    const m = line.match(/^##\s+([^\|]+)\|\s*([^\|]+?)\s*->\s*([^\|]+?)\|\s*(.+)$/i);
    if (!m) continue;
    const body = m[4].trim();
    events.push({
      atMs: parseMs(m[1].trim()),
      from: m[2].trim().toLowerCase(),
      to: m[3].trim().toLowerCase(),
      body,
      workItems: extractWorkItemIds(body),
      isDispatch: /DISPATCHED/i.test(body),
      isIntake: /INTAKE/i.test(body) && /->\s*pm\b/i.test(`${m[2]} -> ${m[3]}`),
      isVerdict: /PASS_TO_PM|READY_FOR_QA|FAIL|BLOCKED/i.test(body),
    });
  }
  return events.sort((a, b) => a.atMs - b.atMs);
}

function readSubagentStops(maxLines = 80) {
  const p = path.join(ROOT, '.cursor/team/inbox/subagent-stop.jsonl');
  try {
    const lines = fs.readFileSync(p, 'utf8').trim().split(/\r?\n/).filter(Boolean);
    return lines.slice(-maxLines).map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    }).filter(Boolean);
  } catch {
    return [];
  }
}

function workItemFromTitle(title) {
  return extractWorkItemIds(String(title || ''))[0] || '';
}

function inferWorkItem(rec, stops, idx) {
  const fromTitle = workItemFromTitle(rec.title);
  if (fromTitle) return fromTitle;
  const role = String(rec.subagent_type || '').toLowerCase();
  for (let i = idx + 1; i < stops.length; i++) {
    const later = stops[i];
    if (String(later.subagent_type).toLowerCase() !== 'pm') continue;
    const ids = extractWorkItemIds(String(later.title || ''));
    if (ids[0]) return ids[0];
  }
  return '';
}

function pmDispatchedAfter(events, workItem, role, afterMs) {
  return events.some(
    (e) =>
      e.isDispatch &&
      e.from === 'pm' &&
      e.atMs >= afterMs - 5000 &&
      e.to === role &&
      e.workItems.some((id) => workItemsSameSlice(id, workItem)),
  );
}

function pmIntakeAfter(events, workItem, afterMs) {
  return events.some(
    (e) =>
      e.isIntake &&
      e.to === 'pm' &&
      e.atMs >= afterMs - 5000 &&
      e.workItems.some((id) => workItemsSameSlice(id, workItem)),
  );
}

function readOrchestrationState() {
  const p = path.join(ROOT, 'docs/program/PM_ORCHESTRATION_STATE.json');
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return {};
  }
}

function findEvidenceNextDispatch(workItem) {
  const dir = path.join(ROOT, 'docs/qa/evidence');
  let files = [];
  try {
    files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.md'))
      .map((f) => ({ name: f, mtime: fs.statSync(path.join(dir, f)).mtimeMs }))
      .sort((a, b) => b.mtime - a.mtime)
      .slice(0, 15);
  } catch {
    return null;
  }
  const slug = normalizeWorkItemBase(workItem).toLowerCase().replace(/_/g, '-');
  for (const { name } of files) {
    if (!name.toLowerCase().includes(slug.slice(0, 12))) continue;
    try {
      const text = fs.readFileSync(path.join(dir, name), 'utf8');
      if (!/next_dispatch_prompt/i.test(text)) continue;
      const role =
        /dispatch\s+(qc|qa-device|qa|dev-mobile|dev-be|dev-fe|devops|technical-manager)/i.exec(text)?.[1]?.toLowerCase() ||
        '';
      const ids = extractWorkItemIds(text);
      return { evidenceFile: name, suggestedRole: role, workItems: ids };
    } catch {
      /* skip */
    }
  }
  return null;
}

/** @param {number} [maxAgeHours=12] */
export function scanPipelineRecovery(maxAgeHours = 12) {
  const now = Date.now();
  const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
  const { lines } = readBusTail();
  const events = parseBusEvents(lines);
  const stops = readSubagentStops();
  const backlog = scanOpenBacklog();
  const orch = readOrchestrationState();
  const proof = orch.last_pm_tool_proof || {};
  const proofTurnMs = parseMs(proof.turn?.replace(' ', 'T') + ':00+07:00') || 0;

  /** @type {Array<object>} */
  const gaps = [];
  const seen = new Set();

  const pushGap = (item) => {
    const k = `${item.role}:${item.workItemId}:${item.source}`;
    if (seen.has(k)) return;
    seen.add(k);
    gaps.push(item);
  };

  const seenTask = new Set();
  for (let i = stops.length - 1; i >= 0; i--) {
    const rec = stops[i];
    const status = String(rec.status || '').toLowerCase();
    if (status !== 'completed' && status !== 'success') continue;
    const taskKey = String(rec.task_id || `${rec.subagent_type}|${rec.title}`);
    if (seenTask.has(taskKey)) continue;
    seenTask.add(taskKey);

    const atMs = parseMs(rec.at);
    if (!atMs || now - atMs > maxAgeMs) continue;

    const role = String(rec.subagent_type || '').toLowerCase();
    if (!ROLE_NEXT[role] && role !== 'qc') continue;

    let workItem = inferWorkItem(rec, stops, i) || workItemFromTitle(rec.title);
    if (!workItem && role === 'qc' && /umbrella|w8 mobile/i.test(String(rec.title))) {
      workItem = 'PCOMP-W8-MOB-UI-QC-01';
    }
    if (!workItem && role === 'qa-device' && /regression pack/i.test(String(rec.title))) {
      workItem = 'PCOMP-W8-MOB-UI-QA-01';
    }

    let nextRole = ROLE_NEXT[role] || 'qa';
    if (role === 'qc') {
      const hint = workItem ? findEvidenceNextDispatch(workItem) : findEvidenceNextDispatch('PCOMP-W8');
      if (hint?.suggestedRole) nextRole = hint.suggestedRole;
      else nextRole = 'qa';
    }
    if (nextRole === 'pm-program') {
      const hint = findEvidenceNextDispatch(workItem || 'PCOMP');
      if (hint?.suggestedRole) nextRole = hint.suggestedRole;
      else nextRole = 'qa';
    }

    const wi =
      workItem ||
      extractWorkItemIds(String(rec.title || ''))[0] ||
      `HOOK-${role}-${rec.task_id?.slice(-8) || i}`;
    const hasIntake = pmIntakeAfter(events, wi, atMs);
    const hasDispatch =
      nextRole !== 'pm-program' && pmDispatchedAfter(events, wi, nextRole, atMs);

    if (!hasIntake || !hasDispatch) {
      const reasons = [];
      if (rec.followup_suppressed) reasons.push('followup_suppressed');
      if (!hasIntake) reasons.push('no_bus_INTAKE');
      if (!hasDispatch) reasons.push(`no_pm->${nextRole}_DISPATCHED`);

      pushGap({
        priority: rec.followup_suppressed || !hasDispatch ? 'P0' : 'P1',
        workItemId: wi,
        role: nextRole,
        reason: `${role} completed @ ${rec.at} — ${reasons.join(', ')} (${rec.title?.slice(0, 50) || ''})`,
        source: 'pipeline-recovery',
        subagentAt: rec.at,
        followupSuppressed: Boolean(rec.followup_suppressed),
      });
    }
    if (seenTask.size >= 5) break;
  }

  const latestStop = [...stops].reverse().find((r) => /completed|success/i.test(r.status));
  if (latestStop && proofTurnMs > 0) {
    const stopMs = parseMs(latestStop.at);
    if (stopMs > proofTurnMs + 60000) {
      pushGap({
        priority: 'P0',
        workItemId: workItemFromTitle(latestStop.title) || 'PM-TOOL-PROOF-STALE',
        role: ROLE_NEXT[String(latestStop.subagent_type).toLowerCase()] || 'qa',
        reason: `last_pm_tool_proof (${proof.turn}) older than subagentStop ${latestStop.at}`,
        source: 'tool-proof-stale',
        subagentAt: latestStop.at,
      });
    }
  }

  for (const d of backlog.dispatchRequired) {
    pushGap({ ...d, source: d.source || 'backlog-scan' });
  }

  gaps.sort((a, b) => a.priority.localeCompare(b.priority));

  const result = {
    checkedAt: new Date().toISOString(),
    healthy: gaps.length === 0,
    dispatchRequired: gaps.slice(0, 10),
    followupSuppressedCount: stops.filter((s) => s.followup_suppressed).length,
    policy: 'U59 — interrupt/quota/suppressed-followup → pm:recover:pipeline exit 2 → Task same turn',
  };

  const outPath = path.join(ROOT, 'docs/program/PM_PENDING_PIPELINE.json');
  fs.writeFileSync(outPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');

  return result;
}
