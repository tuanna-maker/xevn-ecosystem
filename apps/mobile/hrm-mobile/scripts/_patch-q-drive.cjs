const fs=require("fs");
const path=require("path");
let g=fs.readFileSync("scripts/gradle.cjs","utf8");
g=g.replace(/  const shortRepoRoot[\s\S]*?env\.EXPO_PROJECT_ROOT = shortMobileRoot;\n  \}\n/,"");
g=g.replace("env.GRADLE_PATH_RN_PKG_METRO = rnPkg;","env.GRADLE_PATH_RN_PKG_METRO = toSubstPath(rnPkg);");
g=g.replace("env.GRADLE_PATH_EXPO_CLI = expoCli;","env.GRADLE_PATH_EXPO_CLI = toSubstPath(expoCli);");
g=g.replace("env.GRADLE_MOBILE_ROOT = mobileRoot;","env.GRADLE_MOBILE_ROOT = toSubstPath(mobileRoot);");
g=g.replace("env.GRADLE_PATH_APP_ENTRY = path.join(mobileRoot, 'index.ts');","env.GRADLE_PATH_APP_ENTRY = toSubstPath(path.join(mobileRoot, 'index.ts'));");
g=g.replace(
  /  if \(substDrive\) \{[\s\S]*?\n  \}/,
`  if (substDrive) {
    const substRootAbs = path.resolve(\`\${substDrive}\\\\\`);
    env.GRADLE_SUBST_REPO_ROOT = substRootAbs;
    env.GRADLE_REAL_REPO_ROOT = repoRoot;
    env.GRADLE_RN_PLUGIN_REL = path.relative(execCwd, env.GRADLE_RN_PLUGIN_ROOT).split(path.sep).join("/");
    const pack = toSubstPath(mobileRoot);
    env.REACT_NATIVE_PACKAGER_ROOT = pack;
    env.PROJECT_ROOT = pack;
    env.EXPO_PROJECT_ROOT = pack;
  }`
);
fs.writeFileSync("scripts/gradle.cjs",g);
let a=fs.readFileSync("android/app/build.gradle","utf8");
a=a.replace(/\ndef realRepoRoot[\s\S]*?\n}\n/,"\n");
fs.writeFileSync("android/app/build.gradle",a);
const metro=`const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const projectRoot = process.env.REACT_NATIVE_PACKAGER_ROOT || __dirname;
const monorepoRoot = process.env.GRADLE_SUBST_REPO_ROOT || process.env.GRADLE_REAL_REPO_ROOT || path.resolve(projectRoot, '../../..');
const resolvePaths = [projectRoot, monorepoRoot];
const config = getDefaultConfig(projectRoot);
const babelRuntimePkg = require.resolve('@babel/runtime/package.json', { paths: resolvePaths });
config.watchFolders = [monorepoRoot];
config.resolver.extraNodeModules = { '@babel/runtime': path.dirname(babelRuntimePkg) };
config.resolver.nodeModulesPaths = [path.join(projectRoot, 'node_modules'), path.join(monorepoRoot, 'node_modules')];
module.exports = config;
`;
fs.writeFileSync("metro.config.js",metro);
console.log("ok");
