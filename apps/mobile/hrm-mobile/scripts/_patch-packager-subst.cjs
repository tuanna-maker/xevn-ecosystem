const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'gradle.cjs');
let c = fs.readFileSync(p, 'utf8');
if (c.includes('env.REACT_NATIVE_PACKAGER_ROOT = pack')) {
  console.log('packager subst already patched');
  process.exit(0);
}
const old = `  applyGradlePathEnv(env);
  runLinkPlugin(env);`;
const neu = `  applyGradlePathEnv(env);
  if (substDrive) {
    const pack = toSubstPath(mobileRoot);
    env.REACT_NATIVE_PACKAGER_ROOT = pack;
    env.PROJECT_ROOT = pack;
    env.EXPO_PROJECT_ROOT = pack;
  }
  runLinkPlugin(env);`;
if (!c.includes(old)) { console.error('marker missing'); process.exit(1); }
fs.writeFileSync(p, c.replace(old, neu));
console.log('patched packager roots for subst');
