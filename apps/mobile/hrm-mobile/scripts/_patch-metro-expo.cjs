const fs=require("fs");
const path=require("path");
const p="metro.config.js";
let m=fs.readFileSync(p,"utf8");
if(!m.includes("resolveExpoRoot")){
const insert=`const monorepoRoot = path.resolve(projectRoot, "../../..");
function resolvePkg(name) {
  try {
    return path.dirname(require.resolve(name + "/package.json", { paths: [projectRoot, monorepoRoot] }));
  } catch { return null; }
}
`;
m=m.replace("const projectRoot = process.env.EXPO_PROJECT_ROOT || process.env.PROJECT_ROOT || __dirname;",
insert+"const projectRoot = process.env.EXPO_PROJECT_ROOT || process.env.PROJECT_ROOT || __dirname;");
m=m.replace('config.resolver.extraNodeModules = {',
`const _extra = {
  expo: resolvePkg("expo"),
  react: resolvePkg("react"),
  "react-native": resolvePkg("react-native"),
};
config.resolver.extraNodeModules = {
  ...Object.fromEntries(Object.entries(_extra).filter(([,v]) => v)),
`);
fs.writeFileSync(p,m);
console.log("patched metro extraNodeModules");
}else console.log("metro already patched");
