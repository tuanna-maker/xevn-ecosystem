const fs=require("fs");
const p="C:/xevn-ecosystem/apps/mobile/hrm-mobile/scripts/gradle.cjs";
let c=fs.readFileSync(p,"utf8");
const bad=`  const localRnGradleLink = path.join(mobileRoot, 'android', '.rn-gradle-plugin');
  if (fs.existsSync(localRnGradleLink)) {
    env.GRADLE_RN_PLUGIN_ROOT = localRnGradleLink;
    env.GRADLE_RN_PLUGIN_ROOT = path.resolve(localRnGradleLink);
    delete env.GRADLE_RN_PLUGIN_REL; // JUNCTION_PACKAGER_ENV
  }`;
const good=`  const localRnGradleLink = path.join(mobileRoot, 'android', '.rn-gradle-plugin');
  if (fs.existsSync(localRnGradleLink)) {
    env.GRADLE_RN_PLUGIN_ROOT = path.resolve(localRnGradleLink);
    env.GRADLE_RN_PLUGIN_REL = path
      .relative(execCwd, env.GRADLE_RN_PLUGIN_ROOT)
      .split(path.sep)
      .join('/');
  }`;
if(!c.includes("delete env.GRADLE_RN_PLUGIN_REL")){console.log("already fixed");process.exit(0);}
c=c.replace(bad,good);
fs.writeFileSync(p,c);
console.log("fixed GRADLE_RN_PLUGIN_REL block");
