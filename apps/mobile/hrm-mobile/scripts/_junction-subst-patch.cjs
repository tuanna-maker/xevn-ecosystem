const fs=require("fs");
const p="C:/xevn-ecosystem/apps/mobile/hrm-mobile/scripts/gradle.cjs";
let c=fs.readFileSync(p,"utf8");
if(c.includes("forceJunctionSubst")){console.log("skip");process.exit(0);}
c=c.replace(
  "function resolveExecCwd() {\n  if (!isWin || !pathHasNonAscii(repoRoot)) {",
  "function resolveExecCwd() {\n  const forceJunctionSubst =\n    isWin && repoRoot === JUNCTION_REPO_ROOT && process.env.GRADLE_JUNCTION_SUBST !== '0';\n  if (!forceJunctionSubst && (!isWin || !pathHasNonAscii(repoRoot))) {"
);
c=c.replace(
  "  const drive = substRepoDrive(repoRoot);",
  "  const drive = substRepoDrive(repoRoot);\n  if (forceJunctionSubst) {\n    console.error('[gradle] Junction repo → subst', drive, '→', repoRoot);\n  }"
);
c=c.replace(
  "    env.GRADLE_REAL_REPO_ROOT = repoRoot;\n    env.GRADLE_RN_PLUGIN_REL = path.relative(execCwd, env.GRADLE_RN_PLUGIN_ROOT).split(path.sep).join(\"/\");\n    const pack = toSubstPath(mobileRoot);\n    env.REACT_NATIVE_PACKAGER_ROOT = pack;\n    env.PROJECT_ROOT = pack;\n    env.EXPO_PROJECT_ROOT = pack;",
  "    env.GRADLE_REAL_REPO_ROOT = repoRoot;\n    env.GRADLE_RN_PLUGIN_REL = path.relative(execCwd, env.GRADLE_RN_PLUGIN_ROOT).split(path.sep).join(\"/\");\n    const pack =\n      repoRoot === JUNCTION_REPO_ROOT\n        ? mobileRoot\n        : toSubstPath(mobileRoot);\n    env.REACT_NATIVE_PACKAGER_ROOT = pack;\n    env.PROJECT_ROOT = pack;\n    env.EXPO_PROJECT_ROOT = pack;"
);
fs.writeFileSync(p,c);
console.log("junction subst patch applied");
