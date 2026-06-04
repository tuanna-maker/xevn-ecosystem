/**
 * P1-SUPA-FE-02 v2 — remove supabase client imports; drop legacy else branches.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, '..', 'apps', 'web', 'hrm', 'src');
const CLIENT = '@/integrations/supabase/client';

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) {
      if (p.includes(`${path.sep}integrations${path.sep}supabase`)) continue;
      walk(p, out);
    } else if (/\.(tsx?)$/.test(name)) out.push(p);
  }
  return out;
}

function removeImports(content) {
  return content
    .split('\n')
    .filter((line) => {
      if (line.includes(CLIENT) && /^\s*import\b/.test(line)) return false;
      if (line.includes(`import('${CLIENT}')`) || line.includes(`import("${CLIENT}")`))
        return false;
      if (/const\s*\{\s*supabase\s*\}\s*=\s*await\s+import/.test(line)) return false;
      return true;
    })
    .join('\n');
}

function findMatchingBrace(s, start) {
  let depth = 0;
  for (let i = start; i < s.length; i++) {
    if (s[i] === '{') depth++;
    else if (s[i] === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/** Remove `} else { ...supabase... }` blocks */
function removeSupabaseElseBlocks(content) {
  let out = content;
  let idx = 0;
  while (true) {
    const elsePos = out.indexOf('} else {', idx);
    if (elsePos === -1) break;
    const braceStart = elsePos + '} else '.length;
    const end = findMatchingBrace(out, braceStart);
    if (end === -1) break;
    const block = out.slice(braceStart, end + 1);
    if (!block.includes('supabase')) {
      idx = end + 1;
      continue;
    }
    out = out.slice(0, elsePos) + '}' + out.slice(end + 1);
    idx = elsePos;
  }
  return out;
}

/** After `if (shouldSkip...` / `if (useApi` block with return, remove trailing supabase until catch */
function trimAfterApiReturn(content) {
  const marker = 'shouldSkipSupabaseDataFetches';
  if (!content.includes(marker) && !content.includes('useApiMode')) return content;
  return content.replace(
    /(if\s*\(\s*(?:shouldSkipSupabaseDataFetches|useApiMode|useApi|skipSupabase)[^)]*\)\s*\{[\s\S]*?return;[\s\S]*?\})\s*\n([\s\S]*?)(?=\n\s*\} catch)/g,
    '$1\n',
  );
}

function removeOrphanSupabaseStatements(content) {
  let lines = content.split('\n');
  lines = lines.filter((line) => {
    if (/^\s*let query = supabase/.test(line)) return false;
    if (/^\s*const \{[^}]*\} = await supabase/.test(line)) return false;
    if (/^\s*await supabase/.test(line)) return false;
    if (/^\s*supabase\./.test(line)) return false;
    return true;
  });
  return lines.join('\n');
}

let n = 0;
const left = [];
for (const file of walk(SRC)) {
  const before = fs.readFileSync(file, 'utf8');
  if (!before.includes('supabase') && !before.includes(CLIENT)) continue;
  let c = before;
  c = removeImports(c);
  c = removeSupabaseElseBlocks(c);
  c = trimAfterApiReturn(c);
  c = removeOrphanSupabaseStatements(c);
  if (c !== before) {
    fs.writeFileSync(file, c);
    n++;
  }
  if (c.includes(CLIENT) || /\bsupabase\b/.test(c)) left.push(path.relative(SRC, file));
}
console.log(`Patched ${n} files; ${left.length} still mention supabase:`);
left.forEach((f) => console.log(' ', f));
