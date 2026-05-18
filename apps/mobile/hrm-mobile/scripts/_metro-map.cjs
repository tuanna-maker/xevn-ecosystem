const fs=require("fs");
const metro=`const path=require("path");
const {getDefaultConfig}=require("expo/metro-config");
const {resolve:metroResolve}=require("metro-resolver");
const projectRoot=process.env.REACT_NATIVE_PACKAGER_ROOT||__dirname;
const monorepoRoot=process.env.GRADLE_SUBST_REPO_ROOT||process.env.GRADLE_REAL_REPO_ROOT||path.resolve(projectRoot,"../../..");
const realRoot=process.env.GRADLE_REAL_REPO_ROOT;
const substRoot=process.env.GRADLE_SUBST_REPO_ROOT;
function mapSubst(p){if(!realRoot||!substRoot||!p)return p;if(p.startsWith(realRoot))return substRoot+p.slice(realRoot.length);return p;}
const resolvePaths=[projectRoot,monorepoRoot,realRoot].filter(Boolean);
const config=getDefaultConfig(projectRoot);
const babelRt=mapSubst(path.dirname(require.resolve("@babel/runtime/package.json",{paths:resolvePaths})));
const expoRt=mapSubst(path.dirname(require.resolve("expo/package.json",{paths:resolvePaths})));
config.watchFolders=[monorepoRoot];
config.resolver.extraNodeModules={"@babel/runtime":babelRt,expo:expoRt};
config.resolver.nodeModulesPaths=[path.join(projectRoot,"node_modules"),path.join(monorepoRoot,"node_modules")];
const def=config.resolver.resolveRequest;
config.resolver.resolveRequest=(ctx,name,platform)=>{
  if(name==="expo"||name.startsWith("expo/")){try{return{type:"sourceFile",filePath:mapSubst(require.resolve(name==='expo'?'expo':name,{paths:resolvePaths}))};}catch{}}
  if(name.startsWith("@babel/runtime/")){for(const c of [name,name+".js"]){try{return{type:"sourceFile",filePath:mapSubst(require.resolve(c,{paths:resolvePaths}))};}catch{}}}
  return def?def(ctx,name,platform):metroResolve(ctx,name,platform);
};
module.exports=config;
`;
fs.writeFileSync("metro.config.js",metro);
