const fs=require("fs");
const p="C:/xevn-ecosystem/apps/mobile/hrm-mobile/scripts/gradle.cjs";
let c=fs.readFileSync(p,"utf8");
if(c.includes("JUNCTION_REPO_ROOT")){console.log("already");process.exit(0);}
const oldMobile="const mobileRoot = winShortPath(path.resolve(path.join(__dirname, '..')));";
const newMobile=`const JUNCTION_REPO_ROOT = 'C:\\\\xevn-ecosystem';
const JUNCTION_MOBILE_ROOT = path.join(JUNCTION_REPO_ROOT, 'apps', 'mobile', 'hrm-mobile');
const mobileRoot = fs.existsSync(path.join(JUNCTION_MOBILE_ROOT, 'package.json'))
  ? JUNCTION_MOBILE_ROOT
  : winShortPath(path.resolve(path.join(__dirname, '..')));`;
const oldRepo="const repoRoot = winShortPath(path.resolve(path.join(mobileRoot, '..', '..', '..')));";
const newRepo=`const repoRoot = fs.existsSync(path.join(JUNCTION_REPO_ROOT, 'pnpm-workspace.yaml'))
  ? JUNCTION_REPO_ROOT
  : winShortPath(path.resolve(path.join(mobileRoot, '..', '..', '..')));`;
if(!c.includes(oldMobile)) throw new Error("mobile anchor missing");
c=c.replace(oldMobile,newMobile).replace(oldRepo,newRepo);
fs.writeFileSync(p,c);
console.log("junction override applied");
