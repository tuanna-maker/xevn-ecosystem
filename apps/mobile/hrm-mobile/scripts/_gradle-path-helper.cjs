const fs=require("fs");
const p="C:/xevn-ecosystem/apps/mobile/hrm-mobile/scripts/gradle.cjs";
let c=fs.readFileSync(p,"utf8");
if(c.includes("function gradlePath")){console.log("skip");process.exit(0);}
c=c.replace(
  "function toJunctionPath(absPath) {",
  "function gradlePath(absPath) {\n  return substDrive ? toSubstPath(absPath) : toJunctionPath(absPath);\n}\n\nfunction toJunctionPath(absPath) {"
);
c=c.replace(/toJunctionPath\(toSubstPath\(/g, "gradlePath(");
c=c.replace(/toJunctionPath\(substDrive \? toSubstPath\(rnPkg\) : rnPkg\)/g, "gradlePath(rnPkg)");
c=c.replace(/toJunctionPath\(substDrive \? toSubstPath\(expoCli\) : expoCli\)/g, "gradlePath(expoCli)");
fs.writeFileSync(p,c);
console.log("gradlePath helper applied");
