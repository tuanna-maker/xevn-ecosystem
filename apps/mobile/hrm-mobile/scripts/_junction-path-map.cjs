const fs=require("fs");
const p="C:/xevn-ecosystem/apps/mobile/hrm-mobile/scripts/gradle.cjs";
let c=fs.readFileSync(p,"utf8");
if(c.includes("function toJunctionPath")){console.log("skip");process.exit(0);}
const insertFn=`
function toJunctionPath(absPath) {
  if (!absPath || !JUNCTION_REPO_ROOT) return absPath;
  const marker = 'xevn-ecosystem';
  const lower = absPath.toLowerCase();
  const idx = lower.indexOf(marker.toLowerCase());
  if (idx < 0) return absPath;
  let rel = absPath.slice(idx + marker.length);
  if (rel.startsWith(path.sep)) rel = rel.slice(path.sep.length);
  else if (rel.startsWith('/')) rel = rel.slice(1);
  return path.join(JUNCTION_REPO_ROOT, rel);
}
`;
c=c.replace("function toSubstPath(absPath) {", insertFn + "\nfunction toSubstPath(absPath) {");
const keys=[
  "GRADLE_RN_PLUGIN_ROOT","GRADLE_PATH_EXPO_PKG","GRADLE_PATH_RN_PKG","GRADLE_PATH_RN_PKG_METRO",
  "GRADLE_PATH_EXPO_MODULES_AUTOLINKING_PKG","GRADLE_PATH_CLI_ANDROID_PKG","GRADLE_PATH_EXPO_MODULES_CORE_DIR",
  "GRADLE_PATH_RN_DIR","GRADLE_PATH_JSC_DIST","GRADLE_RN_CLI_BIN","GRADLE_PATH_EXPO_CLI",
  "GRADLE_PATH_CODEGEN_DIR","GRADLE_MOBILE_ROOT","GRADLE_PATH_APP_ENTRY"
];
for(const k of keys){
  const re=new RegExp(`env\\.${k} = ([^;]+);`);
  c=c.replace(re, `env.${k} = toJunctionPath($1);`);
}
fs.writeFileSync(p,c);
console.log("toJunctionPath applied to env paths");
