import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';
import { globSync } from 'glob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, '..', 'apps', 'web', 'hrm', 'src');

function brokenFiles() {
  return globSync('**/*.{ts,tsx}', { cwd: SRC, ignore: ['**/*.test.ts', 'integrations/supabase/types.ts'] })
    .map((f) => path.join(SRC, f))
    .filter((full) => {
      try {
        esbuild.transformSync(fs.readFileSync(full, 'utf8'), {
          loader: full.endsWith('.tsx') ? 'tsx' : 'ts',
          tsconfigRaw: { compilerOptions: { jsx: 'react-jsx' } },
        });
        return false;
      } catch {
        return true;
      }
    });
}

function isOrphan(line) {
  return (
    /^\s+(?:\.\.\.)?[a-zA-Z_][\w]*:\s/.test(line) ||
    /^\s+_\w+:\s/.test(line) ||
    /^\s+\}\);?\s*$/.test(line) ||
    /^\s+\}\)\s*$/.test(line)
  );
}

function fix(content) {
  const lines = content.split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s+try \{\s*$/.test(line) && lines[i + 1] && isOrphan(lines[i + 1])) {
      out.push(line);
      const indent = line.match(/^(\s+)/)?.[1] ?? '      ';
      if (!content.includes('notifyHrmApiGap')) {
        // import added separately
      }
      out.push(`${indent}notifyHrmApiGap({ feature: 'hrm-api-gap', workItemId: 'P1-SUPA-BE-02', silent: true });`);
      i++;
      while (i < lines.length && isOrphan(lines[i])) i++;
      continue;
    }
    out.push(line);
  }
  let c = out.join('\n');
  if (c.includes('notifyHrmApiGap') && !c.includes("from '@/lib/hrmApiGap'")) {
    const li = c.split('\n');
    const lastImport = li.reduce((idx, l, n) => (l.startsWith('import ') ? n : idx), 0);
    li.splice(lastImport + 1, 0, "import { notifyHrmApiGap } from '@/lib/hrmApiGap';");
    c = li.join('\n');
  }
  return c;
}

let round = 0;
while (round < 15) {
  round++;
  const files = brokenFiles();
  if (!files.length) break;
  for (const f of files) {
    const before = fs.readFileSync(f, 'utf8');
    const after = fix(before);
    if (after !== before) fs.writeFileSync(f, after);
  }
}
console.log('rounds', round, 'remaining', brokenFiles().length);
