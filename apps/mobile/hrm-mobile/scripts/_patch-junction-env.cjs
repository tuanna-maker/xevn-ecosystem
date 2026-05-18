const fs=require("fs");
const p="scripts/gradle.cjs";
let g=fs.readFileSync(p,"utf8");
if(!g.includes("JUNCTION_PACKAGER_ENV")){
  g=g.replace(
    `  if (substDrive) {
    const substRootAbs = path.resolve(\`\${substDrive}\\\\\`);
    env.GRADLE_SUBST_REPO_ROOT = substRootAbs;
    env.GRADLE_REAL_REPO_ROOT = repoRoot;`,
    `  if (!substDrive && repoRoot === JUNCTION_REPO_ROOT) {
    env.REACT_NATIVE_PACKAGER_ROOT = mobileRoot;
    env.PROJECT_ROOT = mobileRoot;
    env.EXPO_PROJECT_ROOT = mobileRoot;
    env.GRADLE_REAL_REPO_ROOT = repoRoot;
  }
  if (substDrive) {
    const substRootAbs = path.resolve(\`\${substDrive}\\\\\`);
    env.GRADLE_SUBST_REPO_ROOT = substRootAbs;
    env.GRADLE_REAL_REPO_ROOT = repoRoot;`
  );
  g=g.replace(
    `    env.GRADLE_RN_PLUGIN_REL = path
      .relative(execCwd, localRnGradleLink)
      .split(path.sep)
      .join('/');`,
    `    env.GRADLE_RN_PLUGIN_ROOT = path.resolve(localRnGradleLink);
    delete env.GRADLE_RN_PLUGIN_REL; // JUNCTION_PACKAGER_ENV`
  );
  fs.writeFileSync(p,g);
  console.log("patched gradle env for junction");
}else console.log("already patched");
