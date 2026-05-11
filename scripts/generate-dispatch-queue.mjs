import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const programDir = path.join(root, 'docs', 'program');
const boardPath = path.join(programDir, 'SPRINT_BOARD_8_AGENT.md');
const masterQueuePath = path.join(programDir, 'MASTER_DELIVERY_QUEUE.md');
const queuePath = path.join(programDir, 'PM_DISPATCH_QUEUE.json');

function parseMarkdownTable(markdown, titleLine) {
  const lines = markdown.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === titleLine.trim());
  if (start === -1) return [];
  const rows = [];
  for (let i = start + 2; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line.startsWith('|')) break;
    const cols = line
      .split('|')
      .slice(1, -1)
      .map((s) => s.trim());
    rows.push(cols);
  }
  return rows;
}

function parseMasterQueueRows(markdown) {
  return markdown
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith('| Q-'))
    .map((line) =>
      line
        .split('|')
        .slice(1, -1)
        .map((s) => s.trim()),
    );
}

function byId(rows, id) {
  return rows.find((r) => r.id === id);
}

function normalizeStatus(status) {
  return String(status || '').trim().toUpperCase();
}

function isOpen(status) {
  const s = normalizeStatus(status);
  return s === 'TODO' || s === 'IN_PROGRESS' || s === 'READY_FOR_SA' || s === 'READY_FOR_QA' || s === 'READY_FOR_BA' || s === 'BLOCKED';
}

function roleToAgent(role) {
  const r = String(role || '').toUpperCase();
  if (r.includes('SA')) return 'A1';
  if (r.includes('BA-PROCESS')) return 'A2';
  if (r.includes('BA-DATA')) return 'A3';
  if (r === 'BA' || r.startsWith('BA ')) return 'A2';
  if (r.includes('DEV-BE-HRM')) return 'A4';
  if (r.includes('DEV-BE-XBOS')) return 'A5';
  if (r.includes('DEV-FE')) return 'A6';
  if (r.includes('QA-AUTO') || r === 'QA') return 'A7';
  if (r.includes('QA-UAT')) return 'A8';
  return 'A9';
}

function priorityWeight(priority) {
  const p = String(priority || '').toUpperCase();
  if (p === 'HIGH') return 0;
  if (p === 'MEDIUM') return 1;
  return 2;
}

async function main() {
  const board = await fs.readFile(boardPath, 'utf8');
  const masterQueue = await fs.readFile(masterQueuePath, 'utf8');
  const rows = parseMarkdownTable(board, '| ID | Role | Task | Owner | Status |').map((r) => ({
    id: r[0],
    role: r[1],
    task: r[2],
    owner: r[3],
    status: r[4],
  }));

  const SA = byId(rows, 'SA-N1');
  const BA1 = byId(rows, 'BA-N1');
  const BA2 = byId(rows, 'BA-N2');
  const DEV1 = byId(rows, 'DEV-N1');
  const DEV2 = byId(rows, 'DEV-N2');
  const DEV3 = byId(rows, 'DEV-N3');
  const QA1 = byId(rows, 'QA-N1');
  const QA2 = byId(rows, 'QA-N2');

  const queue = [];
  const done = (x) => (x?.status || '').toUpperCase() === 'DONE';
  const inProgress = (x) => (x?.status || '').toUpperCase() === 'IN_PROGRESS';
  const todo = (x) => (x?.status || '').toUpperCase() === 'TODO';

  // Stage 1: SA/BA freeze
  if (!done(SA)) queue.push({ to: 'A1', reason: 'Freeze architecture/NFR for sprint', task: 'SA-N1', priority: 'HIGH' });
  if (!done(BA1)) queue.push({ to: 'A2', reason: 'Finalize attendance acceptance', task: 'BA-N1', priority: 'HIGH' });
  if (!done(BA2)) queue.push({ to: 'A3', reason: 'Finalize payroll lifecycle + traceability', task: 'BA-N2', priority: 'HIGH' });

  // Stage 2: Dev only after SA+BA done
  const freezeReady = done(SA) && done(BA1) && done(BA2);
  if (freezeReady) {
    if (!done(DEV1) && !inProgress(DEV1)) queue.push({ to: 'A4', reason: 'Implement attendance module', task: 'DEV-N1', priority: 'HIGH' });
    if (!done(DEV2) && !inProgress(DEV2)) queue.push({ to: 'A4', reason: 'Complete payroll module', task: 'DEV-N2', priority: 'HIGH' });
    if (!done(DEV3) && !inProgress(DEV3)) queue.push({ to: 'A6', reason: 'Bind FE attendance/payroll APIs', task: 'DEV-N3', priority: 'HIGH' });
  }

  // Stage 3: QA after dev
  const devReady = done(DEV1) && done(DEV2) && done(DEV3);
  if (devReady) {
    if (!done(QA1) && !inProgress(QA1)) queue.push({ to: 'A7', reason: 'Run contract/regression', task: 'QA-N1', priority: 'HIGH' });
    if (!done(QA2) && !inProgress(QA2)) queue.push({ to: 'A8', reason: 'Run UAT flow + evidence', task: 'QA-N2', priority: 'HIGH' });
  }

  // Stage 4: PM review suggestions
  const qaReady = done(QA1) && done(QA2);
  if (qaReady) {
    queue.push({ to: 'A9', reason: 'Perform PM-Tech gate review and close wave', task: 'PM-GATE', priority: 'HIGH' });
  }

  // Multi-phase queue from MASTER_DELIVERY_QUEUE.md
  const phaseRows = parseMasterQueueRows(masterQueue).map((r) => ({
    queueId: r[0],
    phase: r[1],
    taskId: r[2],
    role: r[3],
    module: r[4],
    priority: r[5],
    exitCriteria: r[6],
    status: r[7],
  }));

  const openByPhase = new Map();
  for (const item of phaseRows) {
    if (!isOpen(item.status)) continue;
    if (!openByPhase.has(item.phase)) openByPhase.set(item.phase, []);
    openByPhase.get(item.phase).push(item);
  }

  const activePhase = [...openByPhase.keys()].sort()[0] || null;
  const phasedQueue = activePhase
    ? openByPhase
        .get(activePhase)
        .sort((a, b) => priorityWeight(a.priority) - priorityWeight(b.priority))
        .map((item) => ({
          to: roleToAgent(item.role),
          reason: `${item.module} - ${item.exitCriteria}`,
          task: item.taskId,
          priority: String(item.priority || 'MEDIUM').toUpperCase(),
          queueId: item.queueId,
          phase: item.phase,
        }))
    : [];

  // Merge and de-duplicate by task id.
  const merged = [...queue, ...phasedQueue];
  const seen = new Set();
  const finalQueue = [];
  for (const item of merged) {
    if (seen.has(item.task)) continue;
    seen.add(item.task);
    finalQueue.push(item);
  }

  const allPhases = [...new Set(phaseRows.map((x) => x.phase))].sort();
  const phaseSummary = allPhases.map((phase) => {
    const items = phaseRows.filter((x) => x.phase === phase);
    const doneCount = items.filter((x) => normalizeStatus(x.status) === 'DONE').length;
    return {
      phase,
      total: items.length,
      done: doneCount,
      open: items.length - doneCount,
    };
  });

  const upcomingQueuePreview = allPhases
    .filter((phase) => phase !== activePhase)
    .slice(0, 2)
    .flatMap((phase) =>
      phaseRows
        .filter((x) => x.phase === phase && isOpen(x.status))
        .sort((a, b) => priorityWeight(a.priority) - priorityWeight(b.priority))
        .slice(0, 3)
        .map((x) => ({
          phase: x.phase,
          task: x.taskId,
          to: roleToAgent(x.role),
          module: x.module,
          priority: x.priority,
        })),
    );

  const payload = {
    generatedAt: new Date().toISOString(),
    freezeReady,
    devReady,
    qaReady,
    activePhase,
    phaseSummary,
    upcomingQueuePreview,
    queue: finalQueue,
  };

  await fs.writeFile(queuePath, JSON.stringify(payload, null, 2), 'utf8');
  console.log(JSON.stringify({ success: true, output: 'docs/program/PM_DISPATCH_QUEUE.json', queue_size: finalQueue.length }, null, 2));
}

main().catch((error) => {
  console.error(JSON.stringify({ success: false, error: error.message }, null, 2));
  process.exit(1);
});
