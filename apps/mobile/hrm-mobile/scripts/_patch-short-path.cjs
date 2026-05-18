const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'gradle.cjs');
let c = fs.readFileSync(p, 'utf8');
if (c.includes('function winShortPath')) {
  console.log('gradle.cjs already has winShortPath');
  process.exit(0);
}
const insertFn = `
function winShortPath(abs) {
  if (process.platform !== 'win32') return abs;
  try {
    const quoted = abs.replace(/'/g, "''");
    const out = require('child_process')
      .execSync(
        \`powershell -NoProfile -Command "(New-Object -ComObject Scripting.FileSystemObject).GetFolder('\${quoted}').ShortPath"\`,
        { encoding: 'utf8' },
      )
      .trim();
    return out || abs;
  } catch {
    return abs;
  }
}
`;
c = c.replace(
  "const mobileRoot = path.resolve(path.join(__dirname, '..'));",
  insertFn +
    "\nconst mobileRoot = winShortPath(path.resolve(path.join(__dirname, '..')));",
);
c = c.replace(
  'const repoRoot = path.resolve(path.join(mobileRoot, \'..\', \'..\', \'..\'));',
  "const repoRoot = winShortPath(path.resolve(path.join(mobileRoot, '..', '..', '..')));",
);
fs.writeFileSync(p, c);
console.log('patched winShortPath in gradle.cjs');
