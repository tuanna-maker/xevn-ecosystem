#!/usr/bin/env node
/**
 * Merge .cursor/team artifacts from HEAD (remote) + stash (local) without losing entries.
 */
import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const teamDir = path.join(root, '.cursor/team');

function gitShow(ref, file) {
  try {
    return execSync(`git show ${ref}:${file}`, {
      cwd: root,
      encoding: 'utf8',
      maxBuffer: 50 * 1024 * 1024,
    });
  } catch {
    return '';
  }
}

function parseBusEntries(text) {
  const entries = [];
  const re = /^## (\d{4}-\d{2}-\d{2}T[\d:.]+Z) \|/gm;
  let match;
  const starts = [];
  while ((match = re.exec(text)) !== null) {
    starts.push({ index: match.index, header: match[0], ts: match[1] });
  }
  for (let i = 0; i < starts.length; i++) {
    const start = starts[i].index;
    const end = i + 1 < starts.length ? starts[i + 1].index : text.length;
    const block = text.slice(start, end).trimEnd();
    const key = block.split('\n')[0];
    entries.push({ ts: starts[i].ts, key, block });
  }
  return entries;
}

function mergeBus(headText, stashText) {
  const map = new Map();
  for (const e of [...parseBusEntries(headText), ...parseBusEntries(stashText)]) {
    if (!map.has(e.key)) map.set(e.key, e);
  }
  const merged = [...map.values()].sort((a, b) => a.ts.localeCompare(b.ts));
  return `${merged.map((e) => e.block).join('\n\n')}\n`;
}

function mergeJsonArray(...texts) {
  const parse = (t) => {
    try {
      const v = JSON.parse(t || '[]');
      return Array.isArray(v) ? v : [];
    } catch {
      return [];
    }
  };
  const map = new Map();
  for (const t of texts) {
    for (const item of parse(t)) {
      const id = item.id ?? item.work_item_id ?? JSON.stringify(item);
      map.set(String(id), item);
    }
  }
  return JSON.stringify([...map.values()], null, 2) + '\n';
}

function mergeJsonl(headText, stashText) {
  const lines = new Set();
  for (const line of `${headText}\n${stashText}`.split('\n')) {
    const t = line.trim();
    if (t && !t.startsWith('<<<<<<<') && !t.startsWith('=======') && !t.startsWith('>>>>>>>')) {
      lines.add(t);
    }
  }
  return [...lines].join('\n') + '\n';
}

function mergeMarkdownUnion(headText, stashText) {
  const blocks = new Map();
  const re = /^## /gm;
  const collect = (text) => {
    const indices = [];
    let m;
    while ((m = re.exec(text)) !== null) indices.push(m.index);
    for (let i = 0; i < indices.length; i++) {
      const block = text.slice(indices[i], indices[i + 1] ?? text.length).trimEnd();
      const key = block.split('\n')[0];
      if (key) blocks.set(key, block);
    }
  };
  collect(headText);
  collect(stashText);
  return `${[...blocks.values()].join('\n\n')}\n`;
}

const headBus = gitShow('HEAD', '.cursor/team/AGENT_MESSAGE_BUS.md');
const stashBus = gitShow('stash@{0}', '.cursor/team/AGENT_MESSAGE_BUS.md');
fs.writeFileSync(
  path.join(teamDir, 'AGENT_MESSAGE_BUS.md'),
  mergeBus(headBus, stashBus),
  'utf8',
);
console.log(
  'AGENT_MESSAGE_BUS.md:',
  parseBusEntries(headBus).length,
  '+',
  parseBusEntries(stashBus).length,
  '->',
  parseBusEntries(mergeBus(headBus, stashBus)).length,
);

const headQ = gitShow('HEAD', '.cursor/team/PM_INCIDENT_QUEUE.json');
const stashQ = gitShow('stash@{0}', '.cursor/team/PM_INCIDENT_QUEUE.json');
let curQ = '[]';
try {
  curQ = fs.readFileSync(path.join(teamDir, 'PM_INCIDENT_QUEUE.json'), 'utf8');
} catch {
  /* ignore */
}
fs.writeFileSync(
  path.join(teamDir, 'PM_INCIDENT_QUEUE.json'),
  mergeJsonArray(headQ, stashQ, curQ),
  'utf8',
);

const headT = gitShow('HEAD', '.cursor/team/TEMPLATE_REMINDERS.md');
const stashT = gitShow('stash@{0}', '.cursor/team/TEMPLATE_REMINDERS.md');
fs.writeFileSync(
  path.join(teamDir, 'TEMPLATE_REMINDERS.md'),
  mergeMarkdownUnion(headT, stashT),
  'utf8',
);

const headJ = gitShow('HEAD', '.cursor/team/inbox/subagent-stop.jsonl');
const stashJ = gitShow('stash@{0}', '.cursor/team/inbox/subagent-stop.jsonl');
fs.writeFileSync(
  path.join(teamDir, 'inbox/subagent-stop.jsonl'),
  mergeJsonl(headJ, stashJ),
  'utf8',
);

console.log('Team artifacts merged.');
