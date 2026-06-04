/**
 * P1-SUPA-FE-02 — strip @/integrations/supabase/client imports and legacy branches.
 * Run: node scripts/hrm-strip-supabase-client.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', 'apps', 'web', 'hrm', 'src');

const CLIENT_RE =
  /@\/integrations\/supabase\/client|integrations\/supabase\/client/;

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(tsx?)$/.test(name)) out.push(p);
  }
  return out;
}

function stripImports(content) {
  let c = content;
  c = c.replace(
    /^import\s+type\s+\{[^}]+\}\s+from\s+['"]@\/integrations\/supabase\/types['"];?\s*\n/gm,
    '',
  );
  c = c.replace(
    /^import\s*\{[^}]*\}\s*from\s+['"]@\/integrations\/supabase\/client['"];?\s*\n/gm,
    '',
  );
  c = c.replace(
    /^import\s*\{\s*supabase\s*\}\s*from\s+['"]@\/integrations\/supabase\/client['"];?\s*\n/gm,
    '',
  );
  c = c.replace(
    /const\s*\{\s*supabase\s*\}\s*=\s*await\s+import\(['"]@\/integrations\/supabase\/client['"]\);?\s*\n/g,
    '',
  );
  return c;
}

/** Remove `if (!useApi*) { ... }` / `else { supabase... }` blocks (heuristic, multiline). */
function stripLegacyElseBlocks(content) {
  let c = content;
  // else { ... supabase ... } after API return
  c = c.replace(
    /\}\s*else\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*supabase[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/gs,
    '}',
  );
  // if (!useApiMode) { supabase block }
  c = c.replace(
    /if\s*\(\s*!useApiMode\s*\)\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*supabase[^{}]*(?:\{[^{}]*\}[^{}]*)*\}\s*/gs,
    '',
  );
  c = c.replace(
    /if\s*\(\s*!useApi\s*\)\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*supabase[^{}]*(?:\{[^{}]*\}[^{}]*)*\}\s*/gs,
    '',
  );
  c = c.replace(
    /if\s*\(\s*!skipSupabase\s*\)\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*supabase[^{}]*(?:\{[^{}]*\}[^{}]*)*\}\s*/gs,
    '',
  );
  return c;
}

function stripSupabaseCalls(content) {
  let c = content;
  // await supabase.from(... chains — replace with empty + comment
  c = c.replace(
    /const\s*\{[^}]*\}\s*=\s*await\s+supabase[\s\S]*?;/g,
    '/* supabase removed P1-SUPA-FE-02 */',
  );
  c = c.replace(
    /await\s+supabase[\s\S]*?;/g,
    '/* supabase removed P1-SUPA-FE-02 */',
  );
  return c;
}

function simplifyApiMode(content) {
  let c = content;
  c = c.replace(
    /if\s*\(\s*useApiMode\s*\)\s*\{/g,
    'if (true) {',
  );
  c = c.replace(
    /if\s*\(\s*shouldSkipSupabaseDataFetches\([^)]*\)\s*\)\s*\{/g,
    'if (true) {',
  );
  c = c.replace(
    /if\s*\(\s*skipSupabase\s*\)\s*\{/g,
    'if (true) {',
  );
  return c;
}

const files = walk(ROOT);
let changed = 0;
const stillHas = [];

for (const file of files) {
  const rel = path.relative(path.join(__dirname, '..'), file);
  if (rel.includes('integrations\\supabase\\') || rel.includes('integrations/supabase/')) {
    continue;
  }
  let content = fs.readFileSync(file, 'utf8');
  if (!CLIENT_RE.test(content) && !content.includes('supabase.')) continue;

  const before = content;
  content = stripImports(content);
  content = stripLegacyElseBlocks(content);
  content = stripSupabaseCalls(content);
  content = simplifyApiMode(content);

  if (content !== before) {
    fs.writeFileSync(file, content, 'utf8');
    changed++;
  }
  if (CLIENT_RE.test(content) || /\bsupabase\./.test(content)) {
    stillHas.push(rel);
  }
}

console.log(`Updated ${changed} files.`);
if (stillHas.length) {
  console.log(`Still reference supabase (${stillHas.length}):`);
  stillHas.slice(0, 40).forEach((f) => console.log('  ', f));
  if (stillHas.length > 40) console.log(`  ... +${stillHas.length - 40} more`);
}
