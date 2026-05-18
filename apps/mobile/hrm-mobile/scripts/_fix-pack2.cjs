const fs=require("fs");
const p="C:/xevn-ecosystem/apps/mobile/hrm-mobile/scripts/gradle.cjs";
let c=fs.readFileSync(p,"utf8");
const needle="    const pack = toSubstPath(mobileRoot);";
const repl="    const pack =\n      repoRoot === JUNCTION_REPO_ROOT ? mobileRoot : toSubstPath(mobileRoot);";
if(c.includes("repoRoot === JUNCTION_REPO_ROOT ? mobileRoot : toSubstPath")){console.log("ok");}
else { c=c.replace(needle,repl); fs.writeFileSync(p,c); console.log("fixed"); }
