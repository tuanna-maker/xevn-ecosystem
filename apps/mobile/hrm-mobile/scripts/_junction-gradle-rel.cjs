const fs=require("fs");
const p="C:/xevn-ecosystem/apps/mobile/hrm-mobile/scripts/gradle.cjs";
let c=fs.readFileSync(p,"utf8");
if(c.includes("localRnGradleLink")){console.log("skip rel patch");process.exit(0);}
const needle="  env.GRADLE_PATH_APP_ENTRY = toSubstPath(path.join(mobileRoot, 'index.ts'));";
const insert=`  env.GRADLE_PATH_APP_ENTRY = toSubstPath(path.join(mobileRoot, 'index.ts'));

  const localRnGradleLink = path.join(mobileRoot, 'android', '.rn-gradle-plugin');
  if (fs.existsSync(localRnGradleLink)) {
    env.GRADLE_RN_PLUGIN_ROOT = localRnGradleLink;
    env.GRADLE_RN_PLUGIN_REL = path
      .relative(execCwd, localRnGradleLink)
      .split(path.sep)
      .join('/');
  }`;
if(!c.includes(needle)) throw new Error("anchor missing");
fs.writeFileSync(p,c.replace(needle,insert));
console.log("local .rn-gradle-plugin env patch applied");
