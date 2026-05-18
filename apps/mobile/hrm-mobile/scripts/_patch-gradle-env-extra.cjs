const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'gradle.cjs');
let c = fs.readFileSync(p, 'utf8');
if (c.includes('GRADLE_PATH_EXPO_MODULES_CORE_DIR')) {
  console.log('already patched');
  process.exit(0);
}
const old = 'env.GRADLE_MOBILE_ROOT = toSubstPath(mobileRoot);';
const neu = [
  old,
  "  const expoCore = resolveFromMobile('expo-modules-core/package.json');",
  "  env.GRADLE_PATH_EXPO_MODULES_CORE_DIR = toSubstPath(path.join(path.dirname(expoCore), 'android'));",
  '  const rnDir = path.dirname(rnPkg);',
  '  env.GRADLE_PATH_RN_DIR = toSubstPath(rnDir);',
  "  const jscPkg = require.resolve('jsc-android/package.json', { paths: [rnDir, mobileRoot, repoRoot] });",
  "  env.GRADLE_PATH_JSC_DIST = toSubstPath(path.join(path.dirname(jscPkg), 'dist'));",
  "  const cliBin = require.resolve('@react-native-community/cli/build/bin.js', { paths: [mobileRoot, repoRoot, rnDir] });",
  '  env.GRADLE_RN_CLI_BIN = toSubstPath(cliBin);',
].join('\n');
if (!c.includes(old)) {
  console.error('marker missing');
  process.exit(1);
}
fs.writeFileSync(p, c.replace(old, neu));
console.log('patched gradle.cjs');
