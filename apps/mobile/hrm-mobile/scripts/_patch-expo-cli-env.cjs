const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const scriptsDir = __dirname;
const p = path.join(scriptsDir, 'gradle.cjs');
let c = fs.readFileSync(p, 'utf8');

if (!c.includes('GRADLE_PATH_EXPO_CLI')) {
  const needle = '  env.GRADLE_RN_CLI_BIN = toSubstPath(cliBin);';
  const add = `${needle}
  const expoCli = require.resolve('@expo/cli', { paths: [path.dirname(expoPkg), mobileRoot, repoRoot] });
  env.GRADLE_PATH_EXPO_CLI = toSubstPath(expoCli);
  const codegenPkg = require.resolve('@react-native/codegen/package.json', {
    paths: [path.dirname(rnPkg), mobileRoot, repoRoot],
  });
  env.GRADLE_PATH_CODEGEN_DIR = toSubstPath(codegenPkg);
  const entry = execFileSync(
    process.execPath,
    [
      '-e',
      "const r=require('expo/scripts/resolveAppEntry');process.stdout.write(r(process.argv[1],process.argv[2],process.argv[3]));",
      mobileRoot,
      'android',
      'absolute',
    ],
    { cwd: mobileRoot, encoding: 'utf8' },
  ).trim();
  env.GRADLE_PATH_APP_ENTRY = toSubstPath(entry);`;
  if (!c.includes(needle)) {
    console.error('needle missing in gradle.cjs');
    process.exit(1);
  }
  c = c.replace(needle, add);
  fs.writeFileSync(p, c);
  console.log('patched gradle.cjs expo cli env');
} else {
  console.log('gradle.cjs already has EXPO_CLI env');
}

const appGradle = path.join(scriptsDir, '..', 'android', 'app', 'build.gradle');
let g = fs.readFileSync(appGradle, 'utf8');
if (!g.includes('GRADLE_PATH_APP_ENTRY')) {
  const old =
    'entryFile = file(["node", "-e", "require(\'expo/scripts/resolveAppEntry\')", projectRoot, "android", "absolute"].execute(null, rootDir).text.trim())';
  const neu =
    'def entryEnv = System.getenv("GRADLE_PATH_APP_ENTRY")\n    entryFile = entryEnv != null ? file(entryEnv) : file(["node", "-e", "require(\'expo/scripts/resolveAppEntry\')", projectRoot, "android", "absolute"].execute(null, rootDir).text.trim())';
  if (!g.includes(old)) {
    console.error('entry line missing in app build.gradle');
    process.exit(1);
  }
  g = g.replace(old, neu);
  fs.writeFileSync(appGradle, g);
  console.log('patched app build.gradle entry');
} else {
  console.log('app build.gradle already has APP_ENTRY env');
}
