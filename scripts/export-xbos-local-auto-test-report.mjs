#!/usr/bin/env node
/**
 * Chạy unit test local (xbos-api + web-portal CC) và xuất Excel báo cáo.
 * Usage: pnpm run docs:xbos:auto-test:excel
 * Output: docs/qa/evidence/Bao_cao_auto_test_XBOS_local_YYYYMMDD.xlsx
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(root, 'apps/api/hrm-api/package.json'));
const ExcelJS = require('exceljs');

const dateStamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
const evidenceDir = path.join(root, 'docs/qa/evidence');
const jestJsonPath = path.join(evidenceDir, 'xbos-jest-run-local.json');
const vitestJsonPath = path.join(evidenceDir, 'web-portal-vitest-run-local.json');
const catalogPath = path.join(evidenceDir, 'uc-373-coverage.json');
const outXlsx = path.join(evidenceDir, `Bao_cao_auto_test_XBOS_local_${dateStamp}.xlsx`);
const summaryJsonPath = path.join(evidenceDir, `xbos-local-auto-test-summary-${dateStamp}.json`);

function isXbosUc(code) {
  if (/^UC-HRM|^HRM-|^UC-HRM-MOB/.test(code)) return false;
  if (/^LG-/.test(code) && !/^XBOS/.test(code)) return false;
  if (/^XBOS-DM-HRM/.test(code)) return false;
  return /^(UC-XBOS|XBOS-DM|UC-ECO|UC-CC|UC-RACI|UC-ECO-MASTER)/.test(code);
}

function runStep(label, fn) {
  console.log(`\n▶ ${label}`);
  return fn();
}

function runJest() {
  fs.mkdirSync(evidenceDir, { recursive: true });
  const relOut = path.relative(path.join(root, 'apps/api/xbos-api'), jestJsonPath).replace(/\\/g, '/');
  const r = spawnSync(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    ['jest', '--json', `--outputFile=${relOut}`],
    { cwd: path.join(root, 'apps/api/xbos-api'), encoding: 'utf8', shell: process.platform === 'win32' },
  );
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
  if (!fs.existsSync(jestJsonPath)) {
    throw new Error(`Jest JSON not written: ${jestJsonPath}`);
  }
  return r.status ?? 1;
}

function runVitest() {
  fs.mkdirSync(evidenceDir, { recursive: true });
  const relOut = path.relative(path.join(root, 'apps/web/web-portal'), vitestJsonPath).replace(/\\/g, '/');
  const r = spawnSync(
    process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm',
    ['exec', 'vitest', 'run', '--reporter=json', `--outputFile=${relOut}`],
    { cwd: path.join(root, 'apps/web/web-portal'), encoding: 'utf8', shell: process.platform === 'win32' },
  );
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
  return { status: r.status ?? 1, hasJson: fs.existsSync(vitestJsonPath) };
}

function runUcCatalog() {
  const r = spawnSync(process.execPath, [path.join(root, 'scripts/uc-test-catalog.mjs')], {
    cwd: root,
    encoding: 'utf8',
    stdio: 'inherit',
  });
  return r.status ?? 1;
}

function flattenJest(jestReport) {
  const rows = [];
  for (const suite of jestReport.testResults ?? []) {
    const file = path.relative(root, suite.name).replace(/\\/g, '/');
    for (const test of suite.assertionResults ?? []) {
      rows.push({
        layer: 'xbos-api unit (Jest)',
        suite_file: file,
        test_case: test.fullName || test.title,
        status: test.status === 'passed' ? 'PASS' : test.status === 'failed' ? 'FAIL' : test.status.toUpperCase(),
        duration_ms: Math.round(test.duration ?? 0),
        uc_hints: extractUcHints(test.fullName + ' ' + test.title + ' ' + file),
      });
    }
  }
  return rows;
}

function flattenVitest(report) {
  const rows = [];
  for (const suite of report.testResults ?? []) {
    const file = path.relative(root, suite.name).replace(/\\/g, '/');
    for (const test of suite.assertionResults ?? []) {
      rows.push({
        layer: 'web-portal unit (Vitest)',
        suite_file: file,
        test_case: test.fullName || test.title,
        status: test.status === 'passed' ? 'PASS' : test.status === 'failed' ? 'FAIL' : String(test.status ?? '').toUpperCase(),
        duration_ms: Math.round(test.duration ?? 0),
        uc_hints: extractUcHints((test.fullName || test.title) + ' ' + file),
      });
    }
  }
  return rows;
}

function extractUcHints(text) {
  const m = text.match(/\b(UC-[A-Z0-9-]+|XBOS-DM-[A-Z0-9-]+|HRM-[A-Z0-9-]+|UC-CC-[A-Z0-9-]+)\b/g);
  return m ? [...new Set(m)] : [];
}

function mapUcToTests(catalogEntries, testRows) {
  const byCode = new Map();
  for (const e of catalogEntries) {
    if (!isXbosUc(e.code)) continue;
    const linked = [];
    for (const ref of e.refs ?? []) {
      if (ref.startsWith('unit:')) linked.push(ref.replace('unit:', ''));
    }
    const matchedTests = testRows.filter((t) => {
      if (t.uc_hints.includes(e.code)) return true;
      return linked.some((spec) => t.suite_file.includes(spec.replace(/\/$/, '')));
    });
    const pass = matchedTests.filter((t) => t.status === 'PASS').length;
    const fail = matchedTests.filter((t) => t.status === 'FAIL').length;
    byCode.set(e.code, {
      ...e,
      matched_test_count: matchedTests.length,
      pass_count: pass,
      fail_count: fail,
      auto_verdict:
        fail > 0 ? 'FAIL' : matchedTests.length > 0 ? 'PASS' : e.coverage === 'covered' ? 'PASS (block)' : 'NO_TEST',
    });
  }
  return [...byCode.values()].sort((a, b) => a.stt - b.stt);
}

function headerStyle(row) {
  row.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
  row.alignment = { vertical: 'middle', wrapText: true };
}

async function writeExcel({ jestRows, vitestRows, ucRows, jestSummary, meta }) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'xevn-ecosystem QA';
  wb.created = new Date();

  const ws0 = wb.addWorksheet('Tong_quan');
  ws0.columns = [
    { header: 'Chi_so', key: 'k', width: 36 },
    { header: 'Gia_tri', key: 'v', width: 60 },
  ];
  headerStyle(ws0.getRow(1));
  const summaryRows = [
    ['Ngay chay', meta.generated_at],
    ['Moi truong', 'Local unit test (khong can VPS)'],
    ['xbos-api Jest', `${jestSummary.pass}/${jestSummary.total} PASS`],
    ['web-portal Vitest (CC/XBOS)', `${meta.vitest_pass}/${meta.vitest_total} PASS`],
    ['UC Phase1 XBOS (co map test)', `${ucRows.filter((u) => u.auto_verdict.startsWith('PASS')).length}/${ucRows.length}`],
    ['File JSON Jest', path.relative(root, jestJsonPath)],
    ['File JSON Vitest', meta.vitest_json ? path.relative(root, vitestJsonPath) : 'N/A'],
    ['Ghi chu', 'PASS (block) = UC co test block/module map, chua co test truc tiep ten UC trong file spec'],
  ];
  for (const [k, v] of summaryRows) ws0.addRow({ k, v });

  const ws1 = wb.addWorksheet('Chi_tiet_test_case');
  ws1.columns = [
    { header: 'Lop', key: 'layer', width: 22 },
    { header: 'File test', key: 'suite_file', width: 55 },
    { header: 'Test case', key: 'test_case', width: 70 },
    { header: 'Trang_thai', key: 'status', width: 12 },
    { header: 'Thoi_gian_ms', key: 'duration_ms', width: 14 },
    { header: 'UC goi y', key: 'uc_hints', width: 28 },
  ];
  headerStyle(ws1.getRow(1));
  for (const r of [...jestRows, ...vitestRows]) {
    ws1.addRow({ ...r, uc_hints: r.uc_hints.join(', ') });
  }

  const ws2 = wb.addWorksheet('UC_XBOS_P1');
  ws2.columns = [
    { header: 'STT', key: 'stt', width: 6 },
    { header: 'Ma UC', key: 'code', width: 22 },
    { header: 'Ten UC', key: 'name', width: 45 },
    { header: 'Lop SRS', key: 'layer', width: 12 },
    { header: 'Coverage catalog', key: 'coverage', width: 14 },
    { header: 'So test khop', key: 'matched_test_count', width: 12 },
    { header: 'PASS', key: 'pass_count', width: 8 },
    { header: 'FAIL', key: 'fail_count', width: 8 },
    { header: 'Ket qua auto', key: 'auto_verdict', width: 16 },
    { header: 'Test refs (catalog)', key: 'refs', width: 50 },
  ];
  headerStyle(ws2.getRow(1));
  for (const u of ucRows) {
    ws2.addRow({ ...u, refs: (u.refs ?? []).slice(0, 3).join(' | ') });
  }

  await wb.xlsx.writeFile(outXlsx);
}

async function main() {
  console.log('XBOS local auto-test report\n');

  runStep('UC catalog index', () => {
    const st = runUcCatalog();
    if (st !== 0) console.warn('WARN: uc catalog exit', st);
  });

  const jestExit = runStep('xbos-api Jest', runJest);
  const jestReport = JSON.parse(fs.readFileSync(jestJsonPath, 'utf8'));
  const jestRows = flattenJest(jestReport);

  const vitestResult = runStep('web-portal Vitest', runVitest);
  let vitestRows = [];
  if (vitestResult.hasJson) {
    try {
      vitestRows = flattenVitest(JSON.parse(fs.readFileSync(vitestJsonPath, 'utf8')));
    } catch {
      console.warn('WARN: could not parse vitest JSON — using empty FE rows');
    }
  }

  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  const allTestRows = [...jestRows, ...vitestRows];
  const ucRows = mapUcToTests(catalog.entries ?? [], allTestRows);

  const meta = {
    generated_at: new Date().toISOString(),
    jest_exit: jestExit,
    vitest_exit: vitestResult.status,
    vitest_pass: vitestRows.filter((r) => r.status === 'PASS').length,
    vitest_total: vitestRows.length,
    vitest_json: vitestResult.hasJson,
  };

  await writeExcel({
    jestRows,
    vitestRows,
    ucRows,
    jestSummary: {
      pass: jestReport.numPassedTests ?? jestRows.filter((r) => r.status === 'PASS').length,
      total: jestReport.numTotalTests ?? jestRows.length,
    },
    meta,
  });

  const summary = {
    ...meta,
    xlsx: path.relative(root, outXlsx),
    jest: { suites: jestReport.numTotalTestSuites, tests: jestReport.numTotalTests, passed: jestReport.numPassedTests },
    uc_xbos_p1: {
      total: ucRows.length,
      pass: ucRows.filter((u) => u.auto_verdict.startsWith('PASS')).length,
      fail: ucRows.filter((u) => u.auto_verdict === 'FAIL').length,
      no_test: ucRows.filter((u) => u.auto_verdict === 'NO_TEST').length,
    },
  };
  fs.writeFileSync(summaryJsonPath, `${JSON.stringify(summary, null, 2)}\n`);

  console.log(`\n✓ Excel: ${path.relative(root, outXlsx)}`);
  console.log(`✓ Summary JSON: ${path.relative(root, summaryJsonPath)}`);
  console.log(`  Jest: ${summary.jest.passed}/${summary.jest.tests} PASS`);
  console.log(`  UC XBOS P1 auto PASS: ${summary.uc_xbos_p1.pass}/${summary.uc_xbos_p1.total}`);

  process.exit(jestExit !== 0 || vitestResult.status !== 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
