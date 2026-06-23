/**
 * PM backlog scanner — machine-readable queue from bus + fidelity + QC residuals.
 * work_item_id: PM-SCAN-BACKLOG
 */
import fs from 'node:fs';
import path from 'node:path';
import { extractWorkItemIds, normalizeWorkItemBase, workItemsSameSlice } from './pm-work-item-id.mjs';

const ROOT = process.cwd();

const BUS_PATHS = [
  path.join(ROOT, 'docs/program/AGENT_MESSAGE_BUS.md'),
  path.join(ROOT, '.cursor/team/AGENT_MESSAGE_BUS.md'),
];

/** AC-FID waves PM auto-dispatches in order (U37). */
export const FIDELITY_WAVES = [
  {
    acId: 'AC-FID-07',
    workItemId: 'P1-HRM-H17-AC-FID-07-PAY',
    role: 'dev-be',
    summary: 'payroll_periods >= 60 group',
    seedScript: 'seed:hrm:payroll-density',
  },
  {
    acId: 'AC-FID-08',
    workItemId: 'P1-HRM-H18-AC-FID-08-PAYSLIP',
    role: 'dev-be',
    summary: 'payslip ratio >= 0.90 latest closed period',
    seedScript: 'seed:hrm:payslip-density',
  },
  {
    acId: 'AC-FID-09',
    workItemId: 'P1-HRM-H19-AC-FID-09-REC',
    role: 'dev-be',
    summary: 'requisitions >= 5, candidates >= 15',
    seedScript: 'seed:hrm:recruitment-density',
  },
  {
    acId: 'AC-FID-10',
    workItemId: 'P1-HRM-H20-AC-FID-10-CAT',
    role: 'dev-be',
    summary: 'settings catalogs >= 8 keys per pilot company',
    seedScript: 'seed:hrm:catalog-density',
  },
  {
    acId: 'AC-FID-11',
    workItemId: 'P1-HRM-H21-AC-FID-11-META',
    role: 'dev-be',
    summary: 'metadata change requests >= 20',
    seedScript: 'seed:hrm:metadata-density',
  },
  {
    acId: 'AC-FID-12',
    workItemId: 'P1-HRM-H22-AC-FID-12-OPS',
    role: 'dev-be',
    summary: 'tasks >= 25, service_requests >= 50',
    seedScript: 'seed:hrm:operations-density',
  },
  {
    acId: 'AC-FID-13',
    workItemId: 'P1-HRM-H23-AC-FID-13-PERF',
    role: 'dev-be',
    summary: 'performance cycles >= 5, evaluations >= 300',
    seedScript: 'seed:hrm:performance-density',
  },
];

/** Closed when matching QA evidence exists (PASS). */
const CLOSED_EVIDENCE_GLOBS = [
  { ac: 'AC-FID-03', pattern: /p1-hrm-r-h10-01-seed-qa|p1-hrm-h13-ac-fid-slugs-qa/ },
  { ac: 'AC-FID-04', pattern: /p1-hrm-h14-ac-fid-04-ins-qa/ },
  { ac: 'AC-FID-05', pattern: /p1-hrm-h15-ac-fid-05-att-qa/ },
  { ac: 'AC-FID-06', pattern: /p1-hrm-h16-ac-fid-06-leave-qa/ },
];

const HANDOFF_ACK = /READY_FOR_QA|PASS_TO_PM|FAIL_TO_PM|READY_FOR_QC|BLOCKED/i;

function readBusTail(maxLines = 500) {
  for (const p of BUS_PATHS) {
    try {
      const raw = fs.readFileSync(p, 'utf8');
      const lines = raw.split(/\r?\n/);
      return { path: p, tail: lines.slice(-maxLines).join('\n'), lines: lines.slice(-maxLines) };
    } catch {
      /* try next */
    }
  }
  return { path: '', tail: '', lines: [] };
}

/** Formal bus entries: ## timestamp | from -> to | STATUS work_item */
function parseBusEvents(lines) {
  const events = [];
  for (const line of lines) {
    const m = line.match(
      /^##\s+([^\|]+)\|\s*([^\|]+?)\s*->\s*([^\|]+?)\|\s*(.+)$/i,
    );
    if (!m) continue;
    const body = m[4].trim();
    const ids = extractWorkItemIds(body);
    events.push({
      at: m[1].trim(),
      atMs: Date.parse(m[1].trim()) || 0,
      from: m[2].trim().toLowerCase(),
      to: m[3].trim().toLowerCase(),
      body,
      workItems: [...new Set(ids.map((x) => x.toUpperCase()))],
      isDispatch: /DISPATCHED/i.test(body),
      isClosed: /CLOSED|VERIFIED|DONE\b/i.test(body),
      ack: HANDOFF_ACK.exec(body)?.[0]?.toUpperCase() || '',
    });
  }
  return events.sort((a, b) => a.atMs - b.atMs);
}

function loadClosedFromQcEvidence() {
  const closed = new Set();
  const dir = path.join(ROOT, 'docs/qa/evidence');
  let files = [];
  try {
    files = fs.readdirSync(dir).filter((f) => /^qc-.*\.md$/i.test(f));
  } catch {
    return closed;
  }
  for (const f of files) {
    try {
      const text = fs.readFileSync(path.join(dir, f), 'utf8');
      if (!/\bGO\b|GO WITH CONDITIONS/i.test(text)) continue;
      for (const id of extractWorkItemIds(text)) {
        closed.add(id);
        closed.add(normalizeWorkItemBase(id));
      }
    } catch {
      /* skip */
    }
  }
  return closed;
}

/** Per work_item state machine — chỉ báo dispatch khi trạng thái cuối = cần PM. */
function findUndispatchedHandoffs(events) {
  /** @type {Map<string, { status: string, from?: string, at?: string, body?: string, base?: string }>} */
  const state = new Map();

  const closeBase = (base, at, body) => {
    for (const [key, st] of state) {
      if (st.base === base) state.set(key, { ...st, status: 'closed', at, body });
    }
  };

  for (const ev of events) {
    for (const id of ev.workItems) {
      const base = normalizeWorkItemBase(id);
      if (ev.isClosed) {
        state.set(id, { status: 'closed', at: ev.at, body: ev.body, base });
        closeBase(base, ev.at, ev.body);
        continue;
      }
      if (ev.isDispatch && ev.from === 'pm') {
        state.set(id, { status: 'dispatched', to: ev.to, at: ev.at, body: ev.body, base });
        closeBase(base, ev.at, ev.body);
        for (const [key, st] of [...state]) {
          if (st.status === 'handoff' && workItemsSameSlice(key, id)) {
            state.set(key, { ...st, status: 'closed', at: ev.at, body: ev.body });
          }
        }
        continue;
      }
      if (ev.to === 'pm' && HANDOFF_ACK.test(ev.body)) {
        state.set(id, {
          status: ev.ack.includes('FAIL') ? 'fail' : 'handoff',
          from: ev.from,
          ack: ev.ack,
          at: ev.at,
          body: ev.body,
          base,
        });
        continue;
      }
      if (ev.from === 'pm' && /PASS_TO_PM|VERIFIED/i.test(ev.body)) {
        state.set(id, { status: 'closed', at: ev.at, body: ev.body, base });
        closeBase(base, ev.at, ev.body);
      }
    }
  }

  const required = [];
  for (const [id, st] of state) {
    if (st.status === 'closed' || st.status === 'dispatched') continue;
    if (st.status !== 'handoff' && st.status !== 'fail') continue;

    let nextRole = '';
    if (st.status === 'fail') {
      nextRole = st.from?.includes('fe') ? 'dev-fe' : 'dev-be';
    } else if (st.ack?.includes('READY_FOR_QA')) nextRole = 'qa';
    else if (st.ack?.includes('READY_FOR_QC')) nextRole = 'qc';
    else if (st.ack?.includes('PASS_TO_PM')) {
      if (st.from === 'qa' || st.from === 'qa-device') nextRole = 'qc';
      else if (['dev-be', 'dev-fe', 'dev-mobile', 'devops'].includes(st.from || '')) nextRole = 'qa';
      else if (st.from === 'qc') continue;
      else nextRole = 'qa';
    }
    if (!nextRole) continue;

    required.push({
      priority: st.status === 'fail' ? 'P0' : 'P1',
      workItemId: id,
      role: nextRole,
      reason: `Trạng thái cuối bus: ${st.from}->pm ${st.ack || 'FAIL'} chưa pm->${nextRole} DISPATCHED`,
      source: 'bus-handoff',
      busAt: st.at,
    });
  }
  return required;
}

function loadClosedWorkItems() {
  const p = path.join(ROOT, 'docs/program/PM_CLOSED_WORK_ITEMS.json');
  try {
    const j = JSON.parse(fs.readFileSync(p, 'utf8'));
    return new Set((j.items || []).map((x) => String(x).toUpperCase()));
  } catch {
    return new Set();
  }
}

function listEvidenceFiles() {
  const dir = path.join(ROOT, 'docs/qa/evidence');
  try {
    return fs.readdirSync(dir);
  } catch {
    return [];
  }
}

function closedAcFidIds() {
  const files = listEvidenceFiles();
  const closed = new Set();
  for (const { ac, pattern } of CLOSED_EVIDENCE_GLOBS) {
    if (files.some((f) => pattern.test(f))) closed.add(ac);
  }
  // Also read status file if present
  const statusPath = path.join(ROOT, 'docs/program/PM_FIDELITY_STATUS.json');
  try {
    const st = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
    for (const [k, v] of Object.entries(st.closed || {})) {
      if (v === true) closed.add(k);
    }
  } catch {
    /* optional */
  }
  return closed;
}

function nextFidelityWave(closedAc) {
  for (const wave of FIDELITY_WAVES) {
    if (!closedAc.has(wave.acId)) return wave;
  }
  return null;
}

function findInFlightDispatches(events, closedItems) {
  const inflight = [];
  const completed = new Set([...closedItems]);

  for (let i = events.length - 1; i >= 0; i--) {
    const ev = events[i];
    if (/PASS_TO_PM|READY_FOR_QA|VERIFIED|CLOSED/i.test(ev.body)) {
      for (const id of ev.workItems) completed.add(id);
    }
  }

  for (let i = events.length - 1; i >= 0; i--) {
    const ev = events[i];
    if (!ev.isDispatch || ev.from !== 'pm') continue;
    for (const id of ev.workItems) {
      if (completed.has(id)) continue;
      if (inflight.some((x) => x.workItemId === id)) continue;
      inflight.push({
        workItemId: id,
        role: ev.to,
        dispatchedAt: ev.at,
        source: 'bus-inflight',
        needsQa: false,
      });
    }
  }
  return inflight.slice(0, 12);
}

/** Subagent vừa xong → READY_FOR_QA cho đúng work_item (match title/id). */
function findInboxReadyForQa(inFlight) {
  const inboxPath = path.join(ROOT, '.cursor/team/inbox/subagent-stop.jsonl');
  let latest = null;
  try {
    const lines = fs.readFileSync(inboxPath, 'utf8').trim().split(/\r?\n/).filter(Boolean);
    for (let i = lines.length - 1; i >= 0; i--) {
      const rec = JSON.parse(lines[i]);
      const st = String(rec.status || '').toLowerCase();
      if (st === 'completed' || st === 'success') {
        latest = rec;
        break;
      }
    }
  } catch {
    return [];
  }
  if (!latest) return [];

  const role = String(latest.subagent_type || '').toLowerCase();
  const title = String(latest.title || '').toLowerCase();
  if (!['dev-be', 'dev-fe', 'dev-mobile', 'devops'].includes(role)) return [];

  const required = [];
  for (const item of inFlight) {
    if (item.role !== role) continue;
    const id = item.workItemId.toLowerCase();
    const idSlug = id.replace(/^p1-/, '').replace(/-/g, ' ');
    const titleHit =
      title.includes(id.replace(/^p1-/, '')) ||
      idSlug.split(' ').filter((w) => w.length > 3).some((w) => title.includes(w));
    if (!titleHit && inFlight.length > 3) continue;
    required.push({
      priority: 'P1',
      workItemId: item.workItemId,
      role: 'qa',
      reason: `Subagent ${role} completed (${latest.title}) — READY_FOR_QA`,
      source: 'subagent-inbox',
    });
    break;
  }
  return required;
}

/** Subagent completed in inbox but no pm DISPATCHED after — U58 class G. */
function findSubagentStopPending(events) {
  const inboxPath = path.join(ROOT, '.cursor/team/inbox/subagent-stop.jsonl');
  let latest = null;
  try {
    const lines = fs.readFileSync(inboxPath, 'utf8').trim().split(/\r?\n/).filter(Boolean);
    for (let i = lines.length - 1; i >= 0; i--) {
      const rec = JSON.parse(lines[i]);
      const st = String(rec.status || '').toLowerCase();
      if (st === 'completed' || st === 'success') {
        latest = rec;
        break;
      }
    }
  } catch {
    return [];
  }
  if (!latest) return [];

  const atMs = Date.parse(latest.at || '') || 0;
  const title = String(latest.title || '');
  const role = String(latest.subagent_type || '').toLowerCase();
  const ids = extractWorkItemIds(title);
  if (ids.length === 0) return [];

  const pmDispatchedAfter = events.some(
    (e) =>
      e.isDispatch &&
      e.from === 'pm' &&
      e.atMs >= atMs &&
      e.workItems.some((id) => ids.includes(id)),
  );
  if (pmDispatchedAfter) return [];

  const id = ids[0];
  let nextRole = 'qa';
  if (role === 'qa' || role === 'qa-device') nextRole = 'qc';
  else if (role === 'qc') nextRole = 'pm';
  else if (['dev-be', 'dev-fe', 'dev-mobile', 'devops'].includes(role)) nextRole = 'qa';

  return [
    {
      priority: 'P0',
      workItemId: id,
      role: nextRole,
      reason: `subagentStop ${role} completed (${title}) — chưa pm->${nextRole} DISPATCHED sau ${latest.at || '?'}`,
      source: 'subagent-stop-pending',
    },
  ];
}

/** Recent QC/QA evidence next_dispatch_prompt — U58 class H. */
function findEvidenceHandoffHints(events, closedItems) {
  const dir = path.join(ROOT, 'docs/qa/evidence');
  let files = [];
  try {
    files = fs
      .readdirSync(dir)
      .filter((f) => /^(qc|qa)-.*\.md$/i.test(f))
      .map((f) => {
        const p = path.join(dir, f);
        const st = fs.statSync(p);
        return { name: f, path: p, mtime: st.mtimeMs };
      })
      .sort((a, b) => b.mtime - a.mtime)
      .slice(0, 8);
  } catch {
    return [];
  }

  const required = [];
  const now = Date.now();
  for (const { path: filePath, mtime } of files) {
    if (now - mtime > 72 * 60 * 60 * 1000) continue;
    let text = '';
    try {
      text = fs.readFileSync(filePath, 'utf8');
    } catch {
      continue;
    }
    if (!/next_dispatch_prompt/i.test(text)) continue;
    const block = text.match(/next_dispatch_prompt[:\s]*```?([\s\S]*?)```?/i)?.[1] || text;
    const ids = extractWorkItemIds(block).filter((id) => !closedItems.has(id));
    for (const id of ids.slice(0, 2)) {
      const alreadyDispatched = events.some(
        (e) => e.isDispatch && e.from === 'pm' && e.workItems.includes(id) && e.atMs >= mtime - 60000,
      );
      if (alreadyDispatched) continue;
      const roleHint =
        /dispatch\s+(qc|qa-device|qa|dev-mobile|dev-be|dev-fe|devops)/i.exec(block)?.[1]?.toLowerCase() ||
        'qa';
      required.push({
        priority: 'P1',
        workItemId: id,
        role: roleHint,
        reason: `Evidence handoff hint chưa DISPATCHED (${path.basename(filePath)})`,
        source: 'evidence-handoff-hint',
        evidenceFile: path.relative(ROOT, filePath),
      });
    }
    break;
  }
  return required;
}

function staticDeferrals() {
  return [
    {
      id: 'C-HRMQC-01',
      reason: 'VPS :8088 retest — U32 local first; chỉ khi user yêu cầu deploy',
      owner: 'devops',
      trigger: 'user-request-deploy',
    },
    {
      id: 'C-MOB-H9-DEVICE-01',
      reason: 'adb device UI smoke — optional GWC',
      owner: 'qa-device',
      trigger: 'adb-available',
    },
  ];
}

export function scanOpenBacklog() {
  const { path: busPath, lines } = readBusTail(600);
  const events = parseBusEvents(lines);
  const closedItems = loadClosedWorkItems();
  const qcClosed = loadClosedFromQcEvidence();
  for (const id of qcClosed) closedItems.add(id);
  let handoffRequired = findUndispatchedHandoffs(events).filter(
    (d) => !closedItems.has(d.workItemId) && !closedItems.has(normalizeWorkItemBase(d.workItemId)),
  );
  const inFlight = findInFlightDispatches(events, closedItems);
  const inboxRequired = findInboxReadyForQa(inFlight).filter(
    (d) => !closedItems.has(d.workItemId),
  );
  const stopPending = findSubagentStopPending(events).filter(
    (d) => !closedItems.has(d.workItemId),
  );
  const evidenceHints = findEvidenceHandoffHints(events, closedItems);
  const closedAc = closedAcFidIds();
  const nextFid = nextFidelityWave(closedAc);

  const dispatchRequired = [...handoffRequired, ...inboxRequired, ...stopPending, ...evidenceHints];
  const inflightIds = new Set(inFlight.map((x) => x.workItemId));

  // Auto-queue next fidelity wave if nothing in flight for it
  if (nextFid && !inflightIds.has(nextFid.workItemId)) {
    const alreadyQueued = dispatchRequired.some((d) => d.workItemId === nextFid.workItemId);
    const recentlyDispatched = events.some(
      (e) =>
        e.isDispatch &&
        e.from === 'pm' &&
        e.to === nextFid.role &&
        e.workItems.includes(nextFid.workItemId),
    );
    if (!alreadyQueued && !recentlyDispatched) {
      dispatchRequired.push({
        priority: 'P1',
        workItemId: nextFid.workItemId,
        role: nextFid.role,
        reason: `${nextFid.acId} chưa closed — ${nextFid.summary}`,
        source: 'fidelity-queue',
        acId: nextFid.acId,
      });
    }
  }

  // Dedupe by workItemId+role, sort P0 first
  const deduped = [];
  const keys = new Set();
  for (const item of dispatchRequired.sort((a, b) => a.priority.localeCompare(b.priority))) {
    const k = `${item.role}:${item.workItemId}`;
    if (keys.has(k)) continue;
    keys.add(k);
    deduped.push(item);
  }

  return {
    generatedAt: new Date().toISOString(),
    busPath,
    closedAcFid: [...closedAc].sort(),
    nextFidelityWave: nextFid?.acId || null,
    dispatchRequired: deduped.slice(0, 6),
    inFlight,
    defer: staticDeferrals(),
    policy:
      'U37/U58 — PM chạy pm:idle:check (hoặc pm:scan:backlog) trước mỗi lượt; dispatchRequired>0 → Task ngay; exit 0 ≠ idle hợp lệ nếu bus INTAKE chưa DISPATCHED',
  };
}

export function renderWorkingNow(scan) {
  const lines = [
    '# Team đang làm — pulse PM',
    '',
    `**Cập nhật:** ${scan.generatedAt} · **auto-generated** bởi \`pnpm run pm:scan:backlog\``,
    '',
    '## Đang chạy (in-flight)',
    '',
  ];
  if (scan.inFlight.length === 0) {
    lines.push('| — | Không có DISPATCHED chưa verdict |');
  } else {
    lines.push('| Work item | Role | Dispatched |');
    lines.push('|-----------|------|------------|');
    for (const x of scan.inFlight) {
      lines.push(`| \`${x.workItemId}\` | ${x.role} | ${x.dispatchedAt} |`);
    }
  }
  lines.push('', '## Cần dispatch ngay', '');
  if (scan.dispatchRequired.length === 0) {
    lines.push('*(queue trống — fidelity waves closed hoặc đang in-flight)*');
  } else {
    lines.push('| Priority | Work item | Role | Lý do |');
    lines.push('|----------|-----------|------|-------|');
    for (const d of scan.dispatchRequired) {
      lines.push(`| ${d.priority} | \`${d.workItemId}\` | **${d.role}** | ${d.reason.slice(0, 80)} |`);
    }
  }
  lines.push('', '## Defer (không auto-dispatch)', '');
  for (const d of scan.defer) {
    lines.push(`- **${d.id}** — ${d.reason}`);
  }
  lines.push('', `Fidelity closed: ${scan.closedAcFid.join(', ') || 'none'} · Next: **${scan.nextFidelityWave || 'DONE'}**`);
  lines.push('', 'SoT: `docs/program/PM_OPEN_BACKLOG.json`');
  return lines.join('\n');
}
