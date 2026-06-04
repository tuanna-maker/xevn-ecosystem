#!/usr/bin/env node
/**
 * Kiểm tra khối ```mermaid trong BRD (và tùy chọn SRS build) — phát hiện lỗi cú pháp thường gặp.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { applyBrdVietnameseProse } from './lib/brd-vietnamese-prose.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BRD = path.join(ROOT, 'docs/ecosystem/BRD_TONG_HOP_HE_SINH_THAI_XEVN.md');

function extractMermaidBlocks(md) {
  const re = /```mermaid\r?\n([\s\S]*?)```/g;
  const blocks = [];
  let m;
  let i = 0;
  while ((m = re.exec(md)) !== null) {
    i += 1;
    const body = m[1];
    const lineStart = md.slice(0, m.index).split('\n').length;
    blocks.push({ index: i, lineStart, body, kind: body.trim().split('\n')[0] });
  }
  return blocks;
}

function auditBlock(block) {
  const issues = [];
  const lines = block.body.split('\n');
  const participants = new Set();
  const ids = [];

  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith('participant ')) {
      const id = t.split(/\s+/)[1];
      if (participants.has(id)) issues.push(`participant trùng id: ${id}`);
      participants.add(id);
      ids.push(id);
    }
    if (/^\s*lặp\b/i.test(t)) issues.push('dùng "lặp" thay vì loop (lỗi Việt hóa)');
    if (/^\s*tùy chọn\b/i.test(t)) issues.push('dùng "tùy chọn" thay vì opt (lỗi Việt hóa)');
    if (/^\s*loop\b/i.test(t) && !/end\s*$/m.test(block.body)) {
      const loopCount = (block.body.match(/^\s*loop\b/gim) || []).length;
      const endCount = (block.body.match(/^\s*end\s*$/gim) || []).length;
      if (loopCount > endCount) issues.push('loop thiếu end');
    }
  }

  const arrowRefs = block.body.match(/->>?\s*([A-Za-zÀ-ỹ_][A-Za-z0-9À-ỹ_]*)/g) || [];
  for (const ref of arrowRefs) {
    const id = ref.replace(/^-*>+\s*/, '');
    if (id && !participants.has(id) && block.kind.includes('sequence')) {
      issues.push(`mũi tên tới participant không khai báo: ${id}`);
    }
  }

  if (block.kind.startsWith('flowchart')) {
    const nodeDefs = [...block.body.matchAll(/([A-Za-z_][A-Za-z0-9_]*)\[/g)].map((x) => x[1]);
    const nodeSet = new Set(nodeDefs);
    const edges = [...block.body.matchAll(/([A-Za-z_][A-Za-z0-9_]*)\s*-->/g)].map((x) => x[1]);
    for (const e of edges) {
      if (!nodeSet.has(e)) issues.push(`flowchart: nút "${e}" được nối nhưng chưa định nghĩa`);
    }
  }

  const noteRefs = block.body.match(/Note over ([A-Za-z0-9_,\s]+)/g) || [];
  for (const note of noteRefs) {
    const refs = note.replace('Note over ', '').split(',').map((s) => s.trim());
    for (const r of refs) {
      if (r && !participants.has(r) && block.kind.includes('sequence')) {
        issues.push(`Note over tham chiếu "${r}" không có participant`);
      }
    }
  }

  return issues;
}

function main() {
  const md = fs.readFileSync(BRD, 'utf8');
  const blocks = extractMermaidBlocks(md);
  let fail = 0;

  console.log(`BRD: ${BRD}`);
  console.log(`Mermaid blocks: ${blocks.length}\n`);

  for (const b of blocks) {
    const issues = auditBlock(b);
    const title = b.kind.slice(0, 60);
    if (issues.length) {
      fail += 1;
      console.log(`❌ #${b.index} (dòng ~${b.lineStart}) ${title}`);
      for (const i of issues) console.log(`   - ${i}`);
    } else {
      console.log(`✅ #${b.index} (dòng ~${b.lineStart}) ${title}`);
    }
  }

  const poisoned = applyBrdVietnameseProse('```mermaid\nloop x\nopt y\n```');
  if (poisoned.includes('lặp') || poisoned.includes('tùy chọn')) {
    console.log('\n❌ applyBrdVietnameseProse vẫn sửa trong fence');
    fail += 1;
  } else {
    console.log('\n✅ Việt hóa không phá khối mermaid (fence guard)');
  }

  console.log(fail ? `\nKết quả: FAIL (${fail} block/issue)` : '\nKết quả: PASS');
  process.exit(fail ? 1 : 0);
}

main();
