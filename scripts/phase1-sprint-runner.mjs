#!/usr/bin/env node
/**
 * Phase 1 sequential sprint runner — read/update PHASE1_SPRINT_RUNNER.json
 * Usage:
 *   node scripts/phase1-sprint-runner.mjs status
 *   node scripts/phase1-sprint-runner.mjs next
 *   node scripts/phase1-sprint-runner.mjs complete P1-S0-DO-01
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const RUNNER_PATH = resolve(ROOT, 'docs/program/PHASE1_SPRINT_RUNNER.json');
const TODO_PATH = resolve(ROOT, 'docs/program/PHASE1_MASTER_TODO.md');

function load() {
  return JSON.parse(readFileSync(RUNNER_PATH, 'utf8'));
}

function save(data) {
  data.updated = new Date().toISOString();
  writeFileSync(RUNNER_PATH, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function findNext(data) {
  const active = data.active_sprint;
  const pending = data.sequence.filter(
    (s) => s.sprint === active && (s.status === 'pending' || s.status === 'in_progress'),
  );
  return pending[0] ?? null;
}

function status(data) {
  const active = data.active_sprint;
  const items = data.sequence.filter((s) => s.sprint === active);
  const done = items.filter((s) => s.status === 'done').length;
  console.log(`Program: ${data.program_status}`);
  console.log(`Active sprint: ${active} (${done}/${items.length} seq done)`);
  const next = findNext(data);
  if (next) {
    console.log(`Next dispatch: [${next.seq}] ${next.id} -> ${next.role} (${next.status})`);
  } else {
    console.log('Sprint seq complete — PM should run P1-S*-PM-02 review and unlock next sprint.');
  }
  console.log(`Master todo: ${TODO_PATH}`);
}

function complete(id) {
  const data = load();
  const row = data.sequence.find((s) => s.id === id);
  if (!row) {
    console.error(`Unknown id: ${id}`);
    process.exit(1);
  }
  row.status = 'done';
  const sprintRows = data.sequence.filter((s) => s.sprint === row.sprint);
  const allDone = sprintRows.every((s) => s.status === 'done');
  if (data.sprints[row.sprint]) {
    data.sprints[row.sprint].items_done = sprintRows.filter((s) => s.status === 'done').length;
    if (allDone) data.sprints[row.sprint].status = 'done';
  }
  const next = findNext(data);
  if (next) {
    data.next_dispatch = { work_item_id: next.id, role: next.role, seq: next.seq };
  }
  save(data);
  console.log(`Marked done: ${id}`);
  status(data);
}

const cmd = process.argv[2] ?? 'status';
const arg = process.argv[3];

try {
  const data = load();
  if (cmd === 'status' || cmd === 'next') {
    status(data);
    if (cmd === 'next') {
      const n = findNext(data);
      if (n) console.log(JSON.stringify(n, null, 2));
    }
  } else if (cmd === 'complete' && arg) {
    complete(arg);
  } else {
    console.log('Commands: status | next | complete <work_item_id>');
    process.exit(1);
  }
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
