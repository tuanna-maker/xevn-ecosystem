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

let n = 0;
for (const file of walk(SRC)) {
  let c = fs.readFileSync(file, 'utf8');
  const before = c;
  // Remove orphan error blocks (no preceding supabase destructure)
  c = c.replace(
    /\n\s*if \(error\) throw error;\s*\n\s*return \(data \|\| \[\]\)/g,
    '\n      return []',
  );
  c = c.replace(/\n\s*if \(error\) throw error;\s*\n\s*return data/g, '\n      return null');
  c = c.replace(/\n\s*if \(error\) throw error;\s*\n\s*return \(/g, '\n      return (');
  c = c.replace(/\n\s*if \(error\) throw error;\s*\n\s*set/g, '\n      set');
  c = c.replace(/\n\s*if \(error\) throw error;\s*$/gm, '');
  c = c.replace(/\n\s*if \(uploadError\) throw uploadError;\s*/g, '\n');
  c = c.replace(/\n\s*if \(empErr\) throw empErr;\s*/g, '\n');
  if (c !== before) {
    fs.writeFileSync(file, c);
    n++;
  }
}
console.log(`Patched ${n} files`);
