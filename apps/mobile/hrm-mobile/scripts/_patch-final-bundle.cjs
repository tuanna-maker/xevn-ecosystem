const fs=require("fs");
const path=require("path");
let g=fs.readFileSync("scripts/gradle.cjs","utf8");
g=g.replace(/env\.GRADLE_MOBILE_ROOT = toSubstPath\(mobileRoot\);/,"env.GRADLE_MOBILE_ROOT = mobileRoot;");
g=g.replace(/env\.GRADLE_PATH_APP_ENTRY = toSubstPath\(path\.join\(mobileRoot, 'index\.ts'\)\);/,"env.GRADLE_PATH_APP_ENTRY = path.join(mobileRoot, 'index.ts');");
g=g.replace(/env\.GRADLE_PATH_RN_PKG_METRO = toSubstPath\(rnPkg\);/,"env.GRADLE_PATH_RN_PKG_METRO = rnPkg;");
g=g.replace(/env\.GRADLE_PATH_EXPO_CLI = toSubstPath\(expoCli\);/,"env.GRADLE_PATH_EXPO_CLI = expoCli;");
g=g.replace(
  /  if \(substDrive\) \{[\s\S]*?\n  \}/,
`  if (substDrive) {
    const substRootAbs = path.resolve(\`\${substDrive}\\\\\`);
    env.GRADLE_SUBST_REPO_ROOT = substRootAbs;
    env.GRADLE_REAL_REPO_ROOT = repoRoot;
    env.GRADLE_RN_PLUGIN_REL = path.relative(execCwd, env.GRADLE_RN_PLUGIN_ROOT).split(path.sep).join("/");
    env.REACT_NATIVE_PACKAGER_ROOT = mobileRoot;
    env.PROJECT_ROOT = mobileRoot;
    env.EXPO_PROJECT_ROOT = mobileRoot;
  }`
);
fs.writeFileSync("scripts/gradle.cjs",g);
let a=fs.readFileSync("android/app/build.gradle","utf8");
if(!a.includes("buildDir = new File(realRepoRoot)")){
  const block=`\ndef realRepoRoot = System.getenv("GRADLE_REAL_REPO_ROOT")\nif (realRepoRoot != null && !realRepoRoot.isEmpty()) {\n    android {\n        buildDir = new File(realRepoRoot, "apps/mobile/hrm-mobile/android/app/build")\n    }\n}\n`;
  a=a.replace('apply plugin: "com.android.application"','apply plugin: "com.android.application"'+block);
}
if(!a.includes('hermesFlags = ["-O"]')){
  a=a.replace("react {","react {\n    hermesFlags = [\"-O\"]");
}
fs.writeFileSync("android/app/build.gradle",a);
const metro=`const path=require("path");
const {getDefaultConfig}=require("expo/metro-config");
const {resolve:metroResolve}=require("metro-resolver");
const projectRoot=process.env.REACT_NATIVE_PACKAGER_ROOT||__dirname;
const monorepoRoot=process.env.GRADLE_REAL_REPO_ROOT||path.resolve(projectRoot,"../../..");
const resolvePaths=[projectRoot,monorepoRoot];
const config=getDefaultConfig(projectRoot);
config.watchFolders=[monorepoRoot];
config.resolver.extraNodeModules={"@babel/runtime":path.dirname(require.resolve("@babel/runtime/package.json",{paths:resolvePaths}))};
config.resolver.nodeModulesPaths=[path.join(projectRoot,"node_modules"),path.join(monorepoRoot,"node_modules")];
const def=config.resolver.resolveRequest;
config.resolver.resolveRequest=(ctx,name,platform)=>{
  if(name.startsWith("@babel/runtime/")){
    for(const c of [name,name+".js"]){try{return{type:"sourceFile",filePath:require.resolve(c,{paths:resolvePaths})};}catch{}}
  }
  return def?def(ctx,name,platform):metroResolve(ctx,name,platform);
};
module.exports=config;
`;
fs.writeFileSync("metro.config.js",metro);
console.log("patched");
