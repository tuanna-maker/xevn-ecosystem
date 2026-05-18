const fs = require("fs");
const p = "scripts/gradle.cjs";
let g = fs.readFileSync(p, "utf8");
if (g.includes("JUNCTION_REPO_ROOT")) {
  console.log("junction patch already applied");
  process.exit(0);
}
g = g.replace(
  "const mobileRoot = path.resolve(path.join(__dirname, '..'));",
  `const JUNCTION_REPO_ROOT = 'C:\\\\xevn-ecosystem';
const JUNCTION_MOBILE_ROOT = path.join(JUNCTION_REPO_ROOT, 'apps', 'mobile', 'hrm-mobile');
const useJunction =
  fs.existsSync(path.join(JUNCTION_MOBILE_ROOT, 'package.json')) &&
  fs.existsSync(path.join(JUNCTION_REPO_ROOT, 'pnpm-workspace.yaml'));
const mobileRoot = useJunction
  ? JUNCTION_MOBILE_ROOT
  : path.resolve(path.join(__dirname, '..'));`
);
g = g.replace(
  "const repoRoot = path.resolve(path.join(mobileRoot, '..', '..', '..'));",
  `const repoRoot = useJunction
  ? JUNCTION_REPO_ROOT
  : path.resolve(path.join(mobileRoot, '..', '..', '..'));`
);
g = g.replace(
  "function toSubstPath(absPath) {",
  `function toJunctionPath(absPath) {
  if (!useJunction || !absPath) return absPath;
  const marker = 'xevn-ecosystem';
  const idx = absPath.toLowerCase().indexOf(marker);
  if (idx < 0) return absPath;
  let rel = absPath.slice(idx + marker.length);
  if (rel.startsWith(path.sep)) rel = rel.slice(path.sep.length);
  else if (rel.startsWith('/')) rel = rel.slice(1);
  return path.join(JUNCTION_REPO_ROOT, rel);
}

function gradlePath(absPath) {
  return substDrive ? toSubstPath(toJunctionPath(absPath)) : toJunctionPath(absPath);
}

function toSubstPath(absPath) {`
);
g = g.replace(/env\.GRADLE_\w+ = toSubstPath\([^)]+\);/g, (line) => {
  const m = line.match(/toSubstPath\((.+)\)/);
  return m ? line.replace(/toSubstPath\(.+\)/, `gradlePath(${m[1]})`) : line;
});
g = g.replace(
  "  const expoCli = require.resolve('@expo/cli', { paths: [path.dirname(expoPkg), mobileRoot, repoRoot] });",
  "  const expoCli = require.resolve('@expo/cli/build/bin/cli', { paths: [path.dirname(expoPkg), mobileRoot, repoRoot] });"
);
g = g.replace(
  "  env.GRADLE_PATH_CODEGEN_DIR = toSubstPath(codegenPkg);",
  "  env.GRADLE_PATH_CODEGEN_DIR = gradlePath(path.dirname(codegenPkg));"
);
const insertLink = `  const localRnGradleLink = path.join(mobileRoot, 'android', '.rn-gradle-plugin');
  if (fs.existsSync(localRnGradleLink)) {
    env.GRADLE_RN_PLUGIN_ROOT = path.resolve(localRnGradleLink);
    delete env.GRADLE_RN_PLUGIN_REL;
  }

  if (!substDrive && useJunction) {
    env.REACT_NATIVE_PACKAGER_ROOT = mobileRoot;
    env.PROJECT_ROOT = mobileRoot;
    env.EXPO_PROJECT_ROOT = mobileRoot;
    env.GRADLE_REAL_REPO_ROOT = repoRoot;
    env.GRADLE_PATH_RN_PKG_METRO = gradlePath(rnPkg);
    env.GRADLE_PATH_EXPO_CLI = gradlePath(expoCli);
    env.NODE_PATH = [path.join(repoRoot, 'node_modules'), path.join(mobileRoot, 'node_modules')]
      .join(path.delimiter);
  }

`;
g = g.replace("  if (substDrive) {", insertLink + "  if (substDrive) {");
fs.writeFileSync(p, g);
console.log("applied junction patch to gradle.cjs");
