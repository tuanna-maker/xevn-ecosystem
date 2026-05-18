const fs=require("fs");
const p="C:/xevn-ecosystem/apps/mobile/hrm-mobile/scripts/gradle.cjs";
let c=fs.readFileSync(p,"utf8");
const marker="  const localRnGradleLink = path.join(mobileRoot, \"android\", \".rn-gradle-plugin\");";
const insert=`  if (substDrive && repoRoot === JUNCTION_REPO_ROOT) {
    env.GRADLE_MOBILE_ROOT = mobileRoot;
    env.GRADLE_PATH_APP_ENTRY = path.join(mobileRoot, "index.ts");
    env.GRADLE_PATH_EXPO_CLI = toJunctionPath(expoCli);
    env.GRADLE_PATH_RN_PKG_METRO = toJunctionPath(rnPkg);
    const pack = mobileRoot;
    env.REACT_NATIVE_PACKAGER_ROOT = pack;
    env.PROJECT_ROOT = pack;
    env.EXPO_PROJECT_ROOT = pack;
  }

`;
if(c.includes("JUNCTION_METRO_PACK")){console.log("skip");process.exit(0);}
if(!c.includes(marker)) throw new Error("marker");
c=c.replace(marker, "  // JUNCTION_METRO_PACK\n" + insert + marker);
// remove duplicate pack in subst block - use only when not junction
c=c.replace(
  "    const pack = repoRoot === JUNCTION_REPO_ROOT ? mobileRoot : toSubstPath(mobileRoot);",
  "    const pack = toSubstPath(mobileRoot);"
);
fs.writeFileSync(p,c);
console.log("junction metro override");
