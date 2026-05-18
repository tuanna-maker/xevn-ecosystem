const { execSync } = require('child_process');
const fs = require('fs');
const repo = 'C:/Users/ADMIN/OneDrive/TAILIU~1/Vibe Coding/projects/xevn-ecosystem';
try { execSync('subst R: /d', { shell: true, stdio: 'ignore' }); } catch {}
execSync(`subst R: "${repo}"`, { shell: true });
const paths = [
  'R:/node_modules/@babel/runtime/helpers/interopRequireDefault.js',
  'R:/apps/mobile/hrm-mobile/node_modules/@babel/runtime/helpers/interopRequireDefault.js',
];
for (const p of paths) console.log(p, fs.existsSync(p));
