const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'gradle.cjs');
let c = fs.readFileSync(p, 'utf8');
c = c.replace(/\nfunction winShortPath[\s\S]*?\n\}\n\n/, '\n');
c = c.replace('const mobileRoot = winShortPath(path.resolve(path.join(__dirname, \'..\')));', "const mobileRoot = path.resolve(path.join(__dirname, '..'));");
c = c.replace('const repoRoot = winShortPath(path.resolve(path.join(mobileRoot, \'..\', \'..\', \'..\')));', "const repoRoot = path.resolve(path.join(mobileRoot, '..', '..', '..'));");
fs.writeFileSync(p, c);
console.log('reverted winShortPath');
