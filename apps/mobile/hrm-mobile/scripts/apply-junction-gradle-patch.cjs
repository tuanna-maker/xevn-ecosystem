const fs = require("fs");
const path = require("path");
const p = path.join(__dirname, "gradle.cjs");
let c = fs.readFileSync(p, "utf8");
if (c.includes("JUNCTION_REPO_ROOT")) {
  console.log("gradle.cjs already patched");
  process.exit(0);
}

const winShortFn = `
function winShortPath(abs) {
  if (process.platform !== "win32") return abs;
  try {
    const quoted = abs.replace(/'/g, "''");
    const out = require("child_process")
      .execSync(
        \`powershell -NoProfile -Command "(New-Object -ComObject Scripting.FileSystemObject).GetFolder('\${quoted}').ShortPath"\`,
        { encoding: "utf8" },
      )
      .trim();
    return out || abs;
  } catch {
    return abs;
  }
}
`;

if (!c.includes("function winShortPath")) {
  c = c.replace(
    "const mobileRoot = path.resolve(path.join(__dirname, '..'));",
    winShortFn +
      "\nconst JUNCTION_REPO_ROOT = 'C:\\\\xevn-ecosystem';\nconst JUNCTION_MOBILE_ROOT = path.join(JUNCTION_REPO_ROOT, 'apps', 'mobile', 'hrm-mobile');\nconst mobileRoot = fs.existsSync(path.join(JUNCTION_MOBILE_ROOT, 'package.json'))\n  ? JUNCTION_MOBILE_ROOT\n  : path.resolve(path.join(__dirname, '..'));",
  );
  c = c.replace(
    "const repoRoot = path.resolve(path.join(mobileRoot, '..', '..', '..'));",
    "const repoRoot = fs.existsSync(path.join(JUNCTION_REPO_ROOT, 'pnpm-workspace.yaml'))\n  ? JUNCTION_REPO_ROOT\n  : path.resolve(path.join(mobileRoot, '..', '..', '..'));",
  );
}

const junctionSubst = `function resolveExecCwd() {
  const forceJunctionSubst =
    isWin && repoRoot === JUNCTION_REPO_ROOT && process.env.GRADLE_JUNCTION_SUBST !== "0";
  if (!forceJunctionSubst && (!isWin || !pathHasNonAscii(repoRoot))) {
    return { execCwd: androidDir, substDrive: null };
  }
  const drive = substRepoDrive(repoRoot);
  if (forceJunctionSubst) {
    console.error("[gradle] Junction repo → subst", drive, "→", repoRoot);
  } else {
    console.error("[gradle] Unicode path → subst", drive, "→", repoRoot);
  }
  const relAndroid = path.relative(repoRoot, androidDir);
  const execCwd = path.resolve(\`\${drive}\\\\\`, relAndroid);
  if (!fs.existsSync(path.join(execCwd, isWin ? "gradlew.bat" : "gradlew"))) {
    substDelete(drive);
    throw new Error(\`[gradle] Không thấy gradlew tại: \${execCwd}\`);
  }
  console.error("[gradle] cwd Gradle:", execCwd);
  return { execCwd, substDrive: drive };
}`;

c = c.replace(/function resolveExecCwd\(\) \{[\s\S]*?return \{ execCwd, substDrive: drive \};\n\}/, junctionSubst);

const toJunctionFn = `
function toJunctionPath(absPath) {
  if (!absPath) return absPath;
  const marker = "xevn-ecosystem";
  const lower = absPath.toLowerCase();
  const idx = lower.indexOf(marker.toLowerCase());
  if (idx < 0) return absPath;
  let rel = absPath.slice(idx + marker.length);
  if (rel.startsWith(path.sep)) rel = rel.slice(path.sep.length);
  else if (rel.startsWith("/")) rel = rel.slice(1);
  return path.join(JUNCTION_REPO_ROOT, rel);
}

function gradlePath(absPath) {
  return substDrive ? toSubstPath(absPath) : toJunctionPath(absPath);
}
`;

if (!c.includes("function gradlePath")) {
  c = c.replace("function toSubstPath(absPath) {", toJunctionFn + "\nfunction toSubstPath(absPath) {");
}

const envBlockStart = c.indexOf("  env.GRADLE_RN_PLUGIN_ROOT = ");
const envBlockEnd = c.indexOf("  if (substDrive) {");
if (envBlockStart < 0 || envBlockEnd < 0) throw new Error("env block not found");
const newEnv = `  env.GRADLE_RN_PLUGIN_ROOT = gradlePath(path.dirname(rnGradle));
  env.GRADLE_PATH_EXPO_PKG = gradlePath(expoPkg);
  env.GRADLE_PATH_RN_PKG = gradlePath(rnPkg);
  env.GRADLE_PATH_RN_PKG_METRO = gradlePath(rnPkg);
  env.GRADLE_PATH_EXPO_MODULES_AUTOLINKING_PKG = gradlePath(expoAutolinking);
  env.GRADLE_PATH_CLI_ANDROID_PKG = gradlePath(cliAndroid);
  env.GRADLE_PATH_EXPO_MODULES_CORE_DIR = gradlePath(path.join(path.dirname(expoCore), "android"));
  env.GRADLE_PATH_RN_DIR = gradlePath(rnDir);
  env.GRADLE_PATH_JSC_DIST = gradlePath(path.join(path.dirname(jscPkg), "dist"));
  env.GRADLE_RN_CLI_BIN = gradlePath(cliBin);
  env.GRADLE_PATH_EXPO_CLI = gradlePath(expoCli);
  env.GRADLE_PATH_CODEGEN_DIR = gradlePath(path.dirname(codegenPkg));
  env.GRADLE_MOBILE_ROOT = gradlePath(mobileRoot);
  env.GRADLE_PATH_APP_ENTRY = gradlePath(path.join(mobileRoot, "index.ts"));

  const localRnGradleLink = path.join(mobileRoot, "android", ".rn-gradle-plugin");
  if (fs.existsSync(localRnGradleLink)) {
    env.GRADLE_RN_PLUGIN_ROOT = path.resolve(localRnGradleLink);
    env.GRADLE_RN_PLUGIN_REL = path
      .relative(execCwd, env.GRADLE_RN_PLUGIN_ROOT)
      .split(path.sep)
      .join("/");
  }

`;
c = c.slice(0, envBlockStart) + newEnv + c.slice(envBlockEnd);

c = c.replace(
  /if \(substDrive\) \{[\s\S]*?env\.EXPO_PROJECT_ROOT = pack;\n  \}/,
  `if (substDrive) {
    const substRootAbs = path.resolve(\`\${substDrive}\\\\\`);
    env.GRADLE_SUBST_REPO_ROOT = substRootAbs;
    env.GRADLE_REAL_REPO_ROOT = repoRoot;
    env.GRADLE_RN_PLUGIN_REL = path
      .relative(execCwd, env.GRADLE_RN_PLUGIN_ROOT)
      .split(path.sep)
      .join("/");
    const pack = toSubstPath(mobileRoot);
    env.REACT_NATIVE_PACKAGER_ROOT = pack;
    env.PROJECT_ROOT = pack;
    env.EXPO_PROJECT_ROOT = pack;
  }`,
);

fs.writeFileSync(p, c);
console.log("gradle.cjs patched (junction + subst + gradlePath)");
