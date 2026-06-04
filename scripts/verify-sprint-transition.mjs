#!/usr/bin/env node
/**
 * Gate: closing sprint N requires sprint N+1 plan visible + at least one dispatch.
 * work_item_id: SPRINT-TRANSITION-GATE
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const runnerPath = path.join(root, 'docs/program/PHASE1_SPRINT_RUNNER.json');
const glancePath = path.join(root, 'docs/program/SPRINT_STATUS_AT_A_GLANCE.md');
const roadmapPath = path.join(root, 'docs/program/SPRINT_ROADMAP_S0-S5.md');

function fail(msg) {
  console.error(`FAIL  ${msg}`);
  return false;
}

function pass(msg) {
  console.log(`PASS  ${msg}`);
  return true;
}

function main() {
  let ok = true;
  if (!fs.existsSync(runnerPath)) {
    process.exit(fail('missing PHASE1_SPRINT_RUNNER.json') ? 1 : 1);
  }
  const runner = JSON.parse(fs.readFileSync(runnerPath, 'utf8'));
  const active = runner.active_sprint;
  if (!active) {
    ok = fail('active_sprint empty') && ok;
  } else {
    ok = pass(`active_sprint=${active}`) && ok;
  }

  const backlog = path.join(root, 'docs/program/sprints', `${active}_SPRINT_BACKLOG.md`);
  if (!fs.existsSync(backlog)) {
    ok = fail(`missing ${active}_SPRINT_BACKLOG.md`) && ok;
  } else {
    ok = pass(`backlog ${active}_SPRINT_BACKLOG.md`) && ok;
  }

  if (!fs.existsSync(glancePath)) {
    ok = fail('missing SPRINT_STATUS_AT_A_GLANCE.md') && ok;
  } else {
    const glance = fs.readFileSync(glancePath, 'utf8');
    if (!glance.includes(`${active}`) || !/ACTIVE/i.test(glance)) {
      ok = fail('SPRINT_STATUS_AT_A_GLANCE missing ACTIVE sprint') && ok;
    } else {
      ok = pass('SPRINT_STATUS_AT_A_GLANCE references active sprint') && ok;
    }
  }

  if (!fs.existsSync(roadmapPath)) {
    ok = fail('missing SPRINT_ROADMAP_S0-S5.md') && ok;
  } else {
    ok = pass('SPRINT_ROADMAP_S0-S5.md') && ok;
  }

  const dispatch = runner.next_dispatch ?? [];
  const dispatched = dispatch.filter((d) => d.status === 'dispatched');
  const staleS1 = dispatch.some((d) => /^P1-S1-/.test(d.work_item_id ?? '') && active === 'S2');
  if (staleS1) {
    ok = fail('next_dispatch still lists S1 work items while S2 active') && ok;
  }
  if (dispatched.length === 0) {
    ok = fail('next_dispatch has zero status=dispatched — PM must Task at least W0') && ok;
  } else {
    ok = pass(`dispatched: ${dispatched.map((d) => d.work_item_id).join(', ')}`) && ok;
  }

  const prevNum = Number(String(active).replace(/\D/g, '')) - 1;
  if (prevNum >= 0) {
    const retro = path.join(root, 'docs/program/sprints', `S${prevNum}_RETRO.md`);
    const prevKey = `S${prevNum}`;
    if (runner.sprints?.[prevKey]?.status === 'done' && !fs.existsSync(retro)) {
      ok = fail(`missing ${prevKey}_RETRO.md`) && ok;
    } else if (runner.sprints?.[prevKey]?.status === 'done') {
      ok = pass(`${prevKey}_RETRO.md`) && ok;
    }
  }

  console.log(`\n=== Sprint transition: ${ok ? 'PASS' : 'FAIL'} ===`);
  process.exit(ok ? 0 : 1);
}

main();
