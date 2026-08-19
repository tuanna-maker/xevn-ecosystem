/**
 * Dev helper: list relative imports under hrm-mobile that do not resolve on disk.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const exts = ['.ts', '.tsx', '.js', '.jsx', '.json'];

function walk(d, acc = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === 'dist' || e.name === 'android' || e.name === 'ios') continue;
      walk(p, acc);
    } else if (/\.(ts|tsx)$/.test(e.name) && !/\.test\.(ts|tsx)$/.test(e.name)) {
      acc.push(p);
    }
  }
  return acc;
}

const files = walk(path.join(root, 'src'));
for (const f of ['App.tsx', 'index.ts']) {
  const p = path.join(root, f);
  if (fs.existsSync(p)) files.push(p);
}

const missing = new Set();
const re = /from\s+['"](\.[^'"]+)['"]/g;
for (const f of files) {
  const t = fs.readFileSync(f, 'utf8');
  let m;
  while ((m = re.exec(t))) {
    const rel = m[1];
    const base = path.resolve(path.dirname(f), rel);
    let ok = false;
    for (const e of ['', ...exts, ...exts.map((x) => `/index${x}`)]) {
      if (fs.existsSync(base + e) || fs.existsSync(path.join(base, e.replace(/^\//, '')))) {
        ok = true;
        break;
      }
    }
    if (!ok) {
      missing.add(path.relative(root, base).replace(/\\/g, '/'));
    }
  }
}

const list = [...missing].sort();
console.log(list.length ? list.join('\n') : '(none)');
process.exit(list.length ? 2 : 0);
