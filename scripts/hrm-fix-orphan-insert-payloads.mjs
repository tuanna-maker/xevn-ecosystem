import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';
import { globSync } from 'glob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, '..', 'apps', 'web', 'hrm', 'src');

function listSyntaxErrorFiles() {
  const files = globSync('**/*.{ts,tsx}', {
    cwd: SRC,
    ignore: ['**/*.test.ts', '**/*.test.tsx', 'integrations/supabase/types.ts'],
  });
  const broken = [];
  for (const f of files) {
    const full = path.join(SRC, f);
    const code = fs.readFileSync(full, 'utf8');
    try {
      esbuild.transformSync(code, {
        loader: f.endsWith('.tsx') ? 'tsx' : 'ts',
        tsconfigRaw: { compilerOptions: { jsx: 'react-jsx' } },
      });
    } catch {
      broken.push(full);
    }
  }
  return broken;
}

function isOrphanPropLine(line) {
  return (
    /^\s+(?:\.\.\.)?[a-zA-Z_][\w]*:\s/.test(line) ||
    /^\s+_\w+:\s/.test(line) ||
    /^\s+\}\);?\s*$/.test(line) ||
    /^\s+\}\)\s*$/.test(line)
  );
}

function isOrphanChainLine(line) {
  return (
    /^\s+\.(upsert|from|select|insert|update|delete|eq|in|order|is|maybeSingle)\(/.test(line) ||
    /^\s+\*,\s*$/.test(line) ||
    /^\s+component:salary_components/.test(line) ||
    /^\s+`[\s*]/.test(line) ||
    /^\s+\)\s*`/.test(line)
  );
}

function stripOrphanPayloadLines(code) {
  const lines = code.split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const next = lines[i + 1];

    if (isOrphanChainLine(line)) {
      continue;
    }

    if ((/^\s+try \{\s*$/.test(line) || /^\s+if \([^)]+\) \{\s*$/.test(line)) && next && isOrphanPropLine(next)) {
      out.push(line);
      const indent = line.match(/^(\s+)/)?.[1] ?? '      ';
      out.push(`${indent}notifyHrmApiGap({ feature: 'hrm-api-gap', workItemId: 'P1-SUPA-BE-02', silent: true });`);
      i++;
      while (i < lines.length && (isOrphanPropLine(lines[i]) || isOrphanChainLine(lines[i]))) i++;
      continue;
    }

    // Bare orphan prop block (no try/if) — e.g. queryFn body
    if (isOrphanPropLine(line) && !out[out.length - 1]?.includes('notifyHrmApiGap')) {
      const indent = line.match(/^(\s+)/)?.[1] ?? '      ';
      out.push(`${indent}notifyHrmApiGap({ feature: 'hrm-api-gap', workItemId: 'P1-SUPA-BE-02', silent: true });`);
      while (i < lines.length && (isOrphanPropLine(lines[i]) || isOrphanChainLine(lines[i]))) i++;
      i--;
      continue;
    }

    out.push(line);
  }

  let c = out.join('\n');
  c = c.replace(/\benabled:\s*!![^,]+&&\s*isSupabaseConfigured\b/g, (m) => m.replace(' && isSupabaseConfigured', ''));
  c = c.replace(/\n\s*enabled:\s*isSupabaseConfigured,?\n/g, '\n');
  c = c.replace(/\nimport \{ isSupabaseConfigured \}[^\n]+\n/g, '\n');
  return c;
}

function ensureGapImport(code) {
  if (!code.includes('notifyHrmApiGap') || code.includes("from '@/lib/hrmApiGap'")) return code;
  const lines = code.split('\n');
  const lastImport = lines.reduce((idx, line, i) => (line.startsWith('import ') ? i : idx), 0);
  lines.splice(lastImport + 1, 0, "import { notifyHrmApiGap } from '@/lib/hrmApiGap';");
  return lines.join('\n');
}

let rounds = 0;
while (rounds < 12) {
  rounds++;
  const broken = listSyntaxErrorFiles();
  if (broken.length === 0) break;
  for (const file of broken) {
    const before = fs.readFileSync(file, 'utf8');
    let c = stripOrphanPayloadLines(before);
    c = ensureGapImport(c);
    if (c !== before) fs.writeFileSync(file, c);
  }
}

const remaining = listSyntaxErrorFiles();
console.log(`Rounds=${rounds}, remaining=${remaining.length}`);
remaining.slice(0, 20).forEach((f) => console.log(' -', path.relative(SRC, f)));
