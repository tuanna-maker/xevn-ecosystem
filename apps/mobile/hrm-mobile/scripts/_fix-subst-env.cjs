const fs=require("fs");
let g=fs.readFileSync("scripts/gradle.cjs","utf8");
g=g.replace(
  /  if \(substDrive\) \{[\s\S]*?env\.EXPO_PROJECT_ROOT = mobileRoot;\n  \}/,
`  if (substDrive) {
    const substRootAbs = path.resolve(\`\${substDrive}\\\\\`);
    env.GRADLE_SUBST_REPO_ROOT = substRootAbs;
    env.GRADLE_REAL_REPO_ROOT = pathHasNonAscii(repoRoot) ? shortRepoRoot : repoRoot;
    env.GRADLE_RN_PLUGIN_REL = path
      .relative(execCwd, env.GRADLE_RN_PLUGIN_ROOT)
      .split(path.sep)
      .join("/");
    if (pathHasNonAscii(repoRoot)) {
      env.REACT_NATIVE_PACKAGER_ROOT = shortMobileRoot;
      env.PROJECT_ROOT = shortMobileRoot;
      env.EXPO_PROJECT_ROOT = shortMobileRoot;
    }
  }`
);
fs.writeFileSync("scripts/gradle.cjs",g);
console.log("fixed subst overwrite");
