const path = require('path');
const { execSync } = require('child_process');
const repo = 'C:\\Users\\ADMIN\\OneDrive\\TAILIU~1\\Vibe Coding\\projects\\xevn-ecosystem';
try { execSync('subst V: /d', {stdio:'ignore'}); } catch {}
execSync(`subst V: "${repo}"`, {shell:true});
const android = 'V:\\apps\\mobile\\hrm-mobile\\android';
process.chdir(android);
let cliPath;
try {
  cliPath = require('@react-native-community/cli').bin;
} catch (e) {
  cliPath = require('react-native/cli').bin;
}
console.log('cliPath:', cliPath);
const { spawnSync } = require('child_process');
const r = spawnSync(process.execPath, [cliPath, 'config'], { cwd: android, encoding: 'utf8' });
console.log('status', r.status);
if (r.status !== 0) {
  console.error('stderr', r.stderr.slice(-500));
  console.error('stdout', r.stdout.slice(-200));
}
