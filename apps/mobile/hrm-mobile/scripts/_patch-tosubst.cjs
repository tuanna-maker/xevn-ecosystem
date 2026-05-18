const fs=require("fs");
const p="C:/xevn-ecosystem/apps/mobile/hrm-mobile/scripts/gradle.cjs";
let c=fs.readFileSync(p,"utf8");
if(c.includes("const normalized = toJunctionPath")){console.log("ok");process.exit(0);}
const needle="  const rel = path.relative(repoRoot, absPath);";
const repl="  const normalized = toJunctionPath(absPath);\n  const rel = path.relative(repoRoot, normalized);";
if(!c.includes(needle)) throw new Error("needle missing");
fs.writeFileSync(p,c.replace(needle,repl));
console.log("patched toSubstPath");
