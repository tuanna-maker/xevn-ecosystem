/**
 * Static scope parity audit — list APIs using resolveHrmListScope vs get-by-id paths.
 * work_item_id: P1-PROD-INT-BE-01
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const SKIP_FILES = new Set([
  'hrm-admin.service.ts',
  'mobile-auth.service.ts',
  'catalog-sync.service.ts',
  'push-outbound.service.ts',
  'hrm-db.service.ts',
]);

const LIST_METHOD_RE = /^list[A-Z]|^list$/;
const GET_BY_ID_RE = /ById$|^getById$/;

function walkServiceFiles(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      walkServiceFiles(full, out);
    } else if (entry.endsWith('.service.ts') && !SKIP_FILES.has(entry)) {
      out.push(full);
    }
  }
  return out;
}

function extractAsyncMethods(source) {
  const methods = [];
  const re = /(?:(private|protected|public)\s+)?async\s+(\w+)\s*\([^)]*\)\s*\{/g;
  let match;
  while ((match = re.exec(source)) !== null) {
    const visibility = match[1] ?? 'public';
    const name = match[2];
    let depth = 0;
    let end = match.index + match[0].length - 1;
    for (let i = end; i < source.length; i++) {
      const ch = source[i];
      if (ch === '{') depth += 1;
      else if (ch === '}') {
        depth -= 1;
        if (depth === 0) {
          end = i + 1;
          break;
        }
      }
    }
    methods.push({ name, visibility, body: source.slice(match.index, end) });
  }
  return methods;
}

function usesScopeHelper(body) {
  return (
    body.includes('resolveHrmListScope(') ||
    body.includes('assertResourceInHrmScope(') ||
    body.includes('pushEmployeeListScopeFilters(') ||
    body.includes('pushWorkforceEmployeeScopeFilter(')
  );
}

function delegatesToScopedHelper(body, methodsByName) {
  const calls = [...body.matchAll(/this\.(\w+)\(/g)].map((m) => m[1]);
  for (const name of calls) {
    const target = methodsByName.get(name);
    if (target && usesScopeHelper(target.body)) return true;
  }
  return false;
}

/**
 * @param {string} hrmApiSrcRoot — apps/api/hrm-api/src
 * @returns {{ pass: boolean, findings: Array<{ file: string, method: string, severity: string, detail: string }>, summary: object }}
 */
export function auditHrmScopeParity(hrmApiSrcRoot) {
  const files = walkServiceFiles(hrmApiSrcRoot);
  const findings = [];
  let listWithScope = 0;
  let getByIdScoped = 0;
  let getByIdGap = 0;

  for (const filePath of files) {
    const rel = filePath.replace(/\\/g, '/').split('/apps/api/hrm-api/src/')[1] ?? filePath;
    const source = readFileSync(filePath, 'utf8');
    if (!source.includes('resolveHrmListScope')) continue;

    const methods = extractAsyncMethods(source);
    const methodsByName = new Map(methods.map((m) => [m.name, m]));
    const listMethods = methods.filter((m) => LIST_METHOD_RE.test(m.name));
    const getMethods = methods.filter(
      (m) => GET_BY_ID_RE.test(m.name) && m.visibility !== 'private' && m.visibility !== 'protected',
    );

    const anyListScoped = listMethods.some((m) => m.body.includes('resolveHrmListScope('));
    if (!anyListScoped) continue;

    for (const m of listMethods) {
      if (m.body.includes('resolveHrmListScope(')) listWithScope += 1;
    }

    for (const m of getMethods) {
      if (usesScopeHelper(m.body) || delegatesToScopedHelper(m.body, methodsByName)) {
        getByIdScoped += 1;
      } else {
        getByIdGap += 1;
        findings.push({
          file: rel,
          method: m.name,
          severity: 'P1',
          detail: 'get-by-id missing resolveHrmListScope / assertResourceInHrmScope while sibling list uses rollup',
        });
      }
    }
  }

  return {
    pass: getByIdGap === 0,
    findings,
    summary: { listWithScope, getByIdScoped, getByIdGap, filesScanned: files.length },
  };
}
