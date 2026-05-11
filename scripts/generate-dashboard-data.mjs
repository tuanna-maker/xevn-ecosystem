import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const programDir = path.join(root, 'docs', 'program');
const dashboardDir = path.join(programDir, 'dashboard');

async function read(file) {
  try {
    return await fs.readFile(path.join(programDir, file), 'utf8');
  } catch (error) {
    // Keep dashboard watch alive when a file is being rewritten concurrently.
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return '';
    }
    throw error;
  }
}

async function readJson(file) {
  try {
    const raw = await fs.readFile(path.join(programDir, file), 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return {};
    }
    throw error;
  }
}

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

function parseSections(markdown) {
  return markdown
    .split(/\r?\n/)
    .filter((line) => line.startsWith('## '))
    .map((line) => line.replace(/^##\s+/, '').trim());
}

function parseAgentActivity(busMarkdown, mailbox = {}) {
  const headings = busMarkdown
    .split(/\r?\n/)
    .filter((line) => line.startsWith('## '))
    .map((line) => line.replace(/^##\s+/, '').trim());

  const activityByAgent = new Map();
  const timeline = [];
  for (const heading of headings) {
    const agents = heading.match(/A\d+/g) || [];
    const timePart = heading.split('|')[0]?.trim() || '';
    const topicPart = heading.split('|').slice(1).join('|').trim();
    for (const agent of agents) {
      const current = activityByAgent.get(agent) || { count: 0, lastSeen: '', lastTopic: '' };
      current.count += 1;
      current.lastSeen = timePart || current.lastSeen;
      current.lastTopic = topicPart || current.lastTopic;
      activityByAgent.set(agent, current);
    }
    if (agents.length > 0) {
      timeline.push({ time: timePart, topic: topicPart, agents: [...new Set(agents)] });
    }
  }

  const mailboxAgents = (mailbox && mailbox.agents) || {};
  for (const [agent, tasks] of Object.entries(mailboxAgents)) {
    const current = activityByAgent.get(agent) || { count: 0, lastSeen: '', lastTopic: '' };
    current.currentTasks = (tasks || []).map((t) => t.task).filter(Boolean);
    activityByAgent.set(agent, current);
  }

  const rows = [...activityByAgent.entries()]
    .map(([agent, val]) => ({
      agent,
      signalCount: val.count || 0,
      lastSeen: val.lastSeen || 'N/A',
      lastTopic: val.lastTopic || 'N/A',
      currentTasks: val.currentTasks || [],
    }))
    .sort((a, b) => a.agent.localeCompare(b.agent));

  return { rows, timeline: timeline.slice(-40).reverse() };
}

function parseWaveSnapshot(markdown) {
  const obj = {};
  for (const line of markdown.split(/\r?\n/)) {
    const m = line.match(/^- ([^:]+):\s*(.+)$/);
    if (m) obj[m[1].trim()] = m[2].trim();
  }
  return obj;
}

async function main() {
  const [tower, board, bus, journal, defects, traceability, wave, dispatchQueue, mailbox] = await Promise.all([
    read('AGENT_CONTROL_TOWER.md'),
    read('SPRINT_BOARD_8_AGENT.md'),
    read('AGENT_MESSAGE_BUS.md'),
    read('PROJECT_JOURNAL.md'),
    read('DEFECT_MASTER.md'),
    read('TRACEABILITY_MASTER.md'),
    read('WAVE_AUTOPILOT_SNAPSHOT.md'),
    readJson('PM_DISPATCH_QUEUE.json'),
    readJson('TEAM_MAILBOX.json'),
  ]);

  const towerRows = parseMarkdownTable(tower, '| Agent | Role | Current Work | Status | Last Update | Waiting On |').map(
    (r) => ({
      agent: r[0],
      role: r[1],
      work: r[2],
      status: r[3],
      lastUpdate: r[4],
      waitingOn: r[5],
    }),
  );

  const activeAgents = towerRows.filter((r) => ['IN_PROGRESS', 'RUNNING', 'READY'].includes(r.status.toUpperCase()));
  const doneAgents = towerRows.filter((r) => r.status.toUpperCase() === 'DONE');

  const sprintRows = parseMarkdownTable(board, '| ID | Role | Task | Owner | Status |').map((r) => ({
    id: r[0],
    role: r[1],
    task: r[2],
    owner: r[3],
    status: r[4],
  }));

  const defectsRows = parseMarkdownTable(defects, '| ID | Severity | Module | Description | Owner | Status | Retest Evidence |').map(
    (r) => ({
      id: r[0],
      severity: r[1],
      module: r[2],
      description: r[3],
      owner: r[4],
      status: r[5],
      retestEvidence: r[6],
    }),
  );

  const traceRows = parseMarkdownTable(traceability, '| UseCase | API | DB | FE Screen | Test Evidence | Status |').map(
    (r) => ({
      useCase: r[0],
      api: r[1],
      db: r[2],
      fe: r[3],
      test: r[4],
      status: r[5],
    }),
  );

  const busEntries = parseSections(bus).slice(-30);
  const journalEntries = parseSections(journal).slice(-30);
  const waveSnapshot = parseWaveSnapshot(wave);
  const agentActivity = parseAgentActivity(bus, mailbox);

  const roleByAgent = new Map(towerRows.map((r) => [String(r.agent || '').toUpperCase(), r.role || 'Unknown Role']));

  const payload = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalAgents: towerRows.length,
      activeAgents: activeAgents.length,
      doneAgents: doneAgents.length,
      totalSprintTasks: sprintRows.length,
      doneSprintTasks: sprintRows.filter((x) => x.status.toUpperCase() === 'DONE').length,
      totalTraceabilityRows: traceRows.length,
      doneTraceabilityRows: traceRows.filter((x) => x.status.toUpperCase() === 'DONE').length,
      openDefects: defectsRows.filter((x) => x.status.toUpperCase() === 'OPEN').length,
    },
    waveSnapshot,
    pmDispatchQueue: dispatchQueue,
    teamMailbox: mailbox,
    controlTower: towerRows,
    sprintBoard: sprintRows,
    defects: defectsRows,
    traceability: traceRows,
    agentActivity,
    agentMessageBusHeadings: busEntries,
    projectJournalHeadings: journalEntries,
  };

  const roomsDir = path.join(programDir, 'agent-rooms');
  let agentRooms = [];
  try {
    const files = await fs.readdir(roomsDir);
    for (const f of files.filter((x) => /^A\d+\.md$/i.test(x)).sort()) {
      const full = path.join(roomsDir, f);
      const raw = await fs.readFile(full, 'utf8');
      const lines = raw.split(/\r?\n/);
      agentRooms.push({
        agent: f.replace(/\.md$/i, '').toUpperCase(),
        role: roleByAgent.get(f.replace(/\.md$/i, '').toUpperCase()) || 'Unknown Role',
        path: `docs/program/agent-rooms/${f}`,
        lastUpdated: (lines.find((l) => l.startsWith('Last updated:')) || 'Last updated: N/A').replace('Last updated:', '').trim(),
        tail: lines.slice(-40).join('\n'),
      });
    }
  } catch {
    agentRooms = [];
  }
  payload.agentRooms = agentRooms;

  await fs.mkdir(dashboardDir, { recursive: true });
  const jsonPath = path.join(dashboardDir, 'dashboard-data.json');
  const jsPath = path.join(dashboardDir, 'dashboard-data.js');
  await fs.writeFile(jsonPath, JSON.stringify(payload, null, 2), 'utf8');
  await fs.writeFile(jsPath, `window.__DASHBOARD_DATA__ = ${JSON.stringify(payload, null, 2)};\n`, 'utf8');
  console.log(
    JSON.stringify(
      {
        success: true,
        output_json: 'docs/program/dashboard/dashboard-data.json',
        output_js: 'docs/program/dashboard/dashboard-data.js',
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(JSON.stringify({ success: false, error: error.message }, null, 2));
  process.exit(1);
});
