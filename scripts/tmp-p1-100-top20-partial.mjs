#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(
  fs.readFileSync(path.join(root, 'docs/qa/evidence/uc-373-coverage.json'), 'utf8'),
);

const partials = data.entries.filter((e) => e.phase === 'P1' && e.coverage === 'partial');

function score(e) {
  let s = 0;
  if (e.refs.some((r) => r.startsWith('unit:') && !r.includes('unit-block'))) s += 100;
  if (e.refs.some((r) => r.startsWith('unit-block:'))) s += 50;
  if (e.api_hint && !e.api_hint.planned) s += 30;
  if (e.refs.some((r) => r.startsWith('integration:'))) s += 20;
  return s;
}

partials.sort((a, b) => score(b) - score(a) || a.stt - b.stt);

function testHint(e) {
  const unit = e.refs.find((r) => r.startsWith('unit:') && !r.includes('unit-block'));
  if (unit) return unit.replace('unit:', '');
  const block = e.refs.find((r) => r.startsWith('unit-block:'));
  if (block) return block.replace('unit-block:', '');
  const integ = e.refs.find((r) => r.startsWith('integration:'));
  if (integ) return integ.replace('integration:', '');
  if (e.api_hint) return `${e.api_hint.method} ${e.api_hint.path}`;
  return e.refs[0] ?? 'planned:no-automation-mapped';
}

const top20 = partials.slice(0, 20).map((e, i) => ({
  rank: i + 1,
  stt: e.stt,
  code: e.code,
  name: e.name,
  layer: e.layer,
  test_hint: testHint(e),
  refs: e.refs,
  api_hint: e.api_hint,
}));

console.log(JSON.stringify({ total_p1_partial: partials.length, top20 }, null, 2));
