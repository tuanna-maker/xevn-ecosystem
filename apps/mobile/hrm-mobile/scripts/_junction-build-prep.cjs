const fs=require("fs");
const path=require("path");
const gPath=path.join("scripts","gradle.cjs");
let g=fs.readFileSync(gPath,"utf8");
if(!g.includes("JUNCTION_REPO_ROOT")){
  const old=`const mobileRoot = path.resolve(path.join(__dirname, '..'));
const repoRoot = path.resolve(path.join(mobileRoot, '..', '..', '..'));`;
  const neu=`const JUNCTION_REPO_ROOT = 'C:\\\\xevn-ecosystem';
const mobileRootFromScript = path.resolve(path.join(__dirname, '..'));
const repoRootFromScript = path.resolve(path.join(mobileRootFromScript, '..', '..', '..'));
const _cwd = process.cwd().replace(/\\//g, '\\\\');
const useJunctionRepo = _cwd.toLowerCase().startsWith(JUNCTION_REPO_ROOT.toLowerCase());
const mobileRoot = useJunctionRepo ? path.join(JUNCTION_REPO_ROOT, 'apps', 'mobile', 'hrm-mobile') : mobileRootFromScript;
const repoRoot = useJunctionRepo ? JUNCTION_REPO_ROOT : repoRootFromScript;`;
  if(!g.includes(old)) throw new Error("gradle.cjs pattern missing");
  g=g.replace(old,neu);
  g=g.replace(
    "  if (substDrive) {",
    `  if (!substDrive && useJunctionRepo) {
    env.REACT_NATIVE_PACKAGER_ROOT = mobileRoot;
    env.PROJECT_ROOT = mobileRoot;
    env.EXPO_PROJECT_ROOT = mobileRoot;
    env.GRADLE_REAL_REPO_ROOT = repoRoot;
    env.GRADLE_MOBILE_ROOT = mobileRoot;
  }
  if (substDrive) {`
  );
  fs.writeFileSync(gPath,g);
  console.log("patched gradle.cjs junction");
}else console.log("gradle junction patch present");
const mPath="metro.config.js";
let m=fs.readFileSync(mPath,"utf8");
if(!m.includes("EXPO_PROJECT_ROOT")){
  m=m.replace("const projectRoot = __dirname;","const projectRoot = process.env.EXPO_PROJECT_ROOT || process.env.PROJECT_ROOT || __dirname;");
  fs.writeFileSync(mPath,m);
  console.log("patched metro.config.js");
}
const src=path.join("node_modules","@babel","runtime");
const dest=path.join("vendor","@babel","runtime");
if(fs.existsSync(src)){
  fs.cpSync(src,dest,{recursive:true,force:true});
  console.log("synced vendor @babel/runtime");
}
