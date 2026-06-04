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
  return files
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

function isOrphanPropLine(line) {
  return (
    /^\s+(?:\.\.\.)?[a-zA-Z_][\w]*:\s/.test(line) ||
    /^\s+_\w+:\s/.test(line) ||
    /^\s+\}\);?\s*$/.test(line) ||
    /^\s+\}\)\s*$/.test(line) ||
    /^\s+\} as any\)\s*$/.test(line)
  );
}

function isOrphanChainLine(line) {
  return (
    /^\s+\.(upsert|from|select|insert|update|delete|eq|in|order|is|maybeSingle|neq)\(/.test(line) ||
    /^\s+\*,\s*$/.test(line) ||
    /^\s+component:salary_components/.test(line) ||
    /^\s+`[\s*]/.test(line) ||
    /^\s+\)\s*`/.test(line)
  );
}

function safeFix(code) {
  const lines = code.split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isOrphanChainLine(line)) continue;
    if (isOrphanPropLine(line)) {
      while (i < lines.length && (isOrphanPropLine(lines[i]) || isOrphanChainLine(lines[i]))) i++;
      continue;
    }
    if (/^\s*if \(error\) throw error;\s*$/.test(line)) continue;
    if (/^\s*if \(uploadError\) throw uploadError;\s*$/.test(line)) continue;
    out.push(line);
  }
  let c = out.join('\n');
  c = c.replace(/\benabled:\s*([^,\n]+)&&\s*isSupabaseConfigured\b/g, 'enabled: $1');
  c = c.replace(/\nimport \{ isSupabaseConfigured \}[^\n]+\n/g, '\n');
  c = c.replace(/\nimport \{ supabase \}[^\n]+\n/g, '\n');
  c = c.replace(/\nimport \{ supabase, isSupabaseConfigured \}[^\n]+\n/g, '\n');
  return c;
}

let n = 0;
for (const file of listSyntaxErrorFiles()) {
  const before = fs.readFileSync(file, 'utf8');
  const after = safeFix(before);
  if (after !== before) {
    fs.writeFileSync(file, after);
    n++;
  }
}
console.log(`Safe-fixed ${n} files, remaining=${listSyntaxErrorFiles().length}`);
