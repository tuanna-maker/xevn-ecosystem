/**
 * Remove orphaned PostgREST chains left after supabase strip (lines starting with .from / .select etc.)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, '..', 'apps', 'web', 'hrm', 'src');

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

const CHAIN_START =
  /^\s*\.(from|select|insert|update|delete|upload|remove|eq|order|gte|lte|is|single|maybeSingle|auth|rpc|getPublicUrl)\b/;
const SUPABASE_LINE = /\bsupabase\b/;

let fixed = 0;
for (const file of walk(SRC)) {
  let lines = fs.readFileSync(file, 'utf8').split('\n');
  const out = [];
  let changed = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (CHAIN_START.test(line) && !line.includes('//')) {
      changed = true;
      continue;
    }
    if (SUPABASE_LINE.test(line) && !line.includes('integrations/supabase/types')) {
      if (/vi\.mock|includes\(|supabaseRestGuard|isRemoteLocalhostSupabase/.test(line)) {
        out.push(line);
        continue;
      }
      if (/VITE_SUPABASE/.test(line)) {
        out.push(line.replace(/supabase/g, 'legacy-storage'));
        changed = true;
        continue;
      }
      changed = true;
      continue;
    }
    out.push(line);
  }
  if (changed) {
    fs.writeFileSync(file, out.join('\n'), 'utf8');
    fixed++;
  }
}
console.log(`Fixed orphan lines in ${fixed} files`);
