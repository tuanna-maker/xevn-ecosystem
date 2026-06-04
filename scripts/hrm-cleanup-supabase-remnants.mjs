/**
 * Second pass: remove dead code after supabase strip + leftover supabase refs.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', 'apps', 'web', 'hrm', 'src');

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx?)$/.test(name)) out.push(p);
  }
  return out;
}

function cleanup(content) {
  let c = content;

  // Remove comment marker lines and following dead supabase block until catch/finally/}
  c = c.replace(
    /\n\s*\/\* supabase removed P1-SUPA-FE-02 \*\/[\s\S]*?(?=\n\s*\} catch|\n\s*\} finally|\n\s*catch \(|\n\s*finally \{)/g,
    '\n',
  );

  // Remove orphaned supabase query chains
  c = c.replace(/\n\s*let query = supabase[\s\S]*?;/g, '\n');
  c = c.replace(/\n\s*supabase\.from\([^)]*\)[\s\S]*?;/g, '\n');

  // if (true) { ... return; } -> unwrap inner (single-level heuristic)
  c = c.replace(/if\s*\(\s*true\s*\)\s*\{\s*\n/g, '{\n');

  // Remove unused shouldSkip import-only if no other usage
  if (!c.includes('shouldSkipSupabaseDataFetches(') && c.includes('shouldSkipSupabaseDataFetches')) {
    // keep
  }

  // storage calls -> gap
  c = c.replace(
    /supabase\.storage\.[\s\S]*?;/g,
    "notifyHrmApiGap({ feature: 'storage-upload', workItemId: 'P1-SUPA-BE-02' });",
  );

  c = c.replace(
    /supabase\.auth\.[\s\S]*?;/g,
    '/* auth via portal/mobile — no supabase */',
  );

  c = c.replace(/\bsupabase\b/g, '/* removed-supabase */');

  return c;
}

let n = 0;
for (const file of walk(ROOT)) {
  if (file.includes(`${path.sep}integrations${path.sep}supabase${path.sep}`)) continue;
  const before = fs.readFileSync(file, 'utf8');
  const after = cleanup(before);
  if (after !== before) {
    fs.writeFileSync(file, after, 'utf8');
    n++;
  }
}
console.log(`Cleaned ${n} files`);
