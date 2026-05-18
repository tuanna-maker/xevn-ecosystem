const fs=require("fs");
const p="C:/xevn-ecosystem/apps/mobile/hrm-mobile/scripts/gradle.cjs";
let c=fs.readFileSync(p,"utf8");
const old=`    const pack =
      repoRoot === JUNCTION_REPO_ROOT
        ? mobileRoot
        : toSubstPath(mobileRoot);`;
const neu=`    const pack = toSubstPath(mobileRoot);`;
if(c.includes(old)) { c=c.replace(old,neu); fs.writeFileSync(p,c); console.log("packager uses subst path"); }
else console.log("pack block not found");
