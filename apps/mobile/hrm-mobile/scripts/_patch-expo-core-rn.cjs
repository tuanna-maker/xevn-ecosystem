const fs=require("fs");
const path=require("path");
const globRoot=path.resolve("../../..");
function findBuildGradle(){
  const pnpm=path.join(globRoot,"node_modules",".pnpm");
  const hits=[];
  const stack=[pnpm];
  while(stack.length){
    const d=stack.pop();
    let ents;
    try{ ents=fs.readdirSync(d,{withFileTypes:true}); }catch{ continue; }
    for(const e of ents){
      const f=path.join(d,e.name);
      if(e.isDirectory()) stack.push(f);
      else if(e.name==="build.gradle" && f.includes("expo-modules-core@") && f.endsWith(path.join("android","build.gradle"))){
        hits.push(f);
      }
    }
  }
  return [...new Set(hits)];
}
const blockOld=`def REACT_NATIVE_DIR = REACT_NATIVE_BUILD_FROM_SOURCE
  ? findProject(":packages:react-native:ReactAndroid").getProjectDir().parent
  : {
      def rnPkg = System.getenv("GRADLE_PATH_RN_PKG")
      if (rnPkg != null && !rnPkg.isEmpty()) {
        return new File(rnPkg).parentFile
      }
      return file(providers.exec {
        workingDir(rootDir)
        commandLine("node", "--print", "require.resolve('react-native/package.json')")
      }.standardOutput.asText.get().trim()).parent
    }()`;
const blockNew=`def REACT_NATIVE_DIR = REACT_NATIVE_BUILD_FROM_SOURCE
  ? findProject(":packages:react-native:ReactAndroid").getProjectDir().parent
  : {
      def rnDirEnv = System.getenv("GRADLE_PATH_RN_DIR")
      if (rnDirEnv != null && !rnDirEnv.isEmpty()) {
        return file(rnDirEnv)
      }
      def rnPkg = System.getenv("GRADLE_PATH_RN_PKG")
      if (rnPkg != null && !rnPkg.isEmpty()) {
        return new File(rnPkg).parentFile
      }
      return file(providers.exec {
        workingDir(rootDir)
        commandLine("node", "--print", "require.resolve('react-native/package.json')")
      }.standardOutput.asText.get().trim()).parent
    }()`;
for (const f of findBuildGradle()){
  let t=fs.readFileSync(f,"utf8");
  if(t.includes("GRADLE_PATH_RN_DIR") && t.includes(blockNew.split("\n")[2])) { console.log("skip",f); continue; }
  if(!t.includes(blockOld.split("\n")[0])) { console.log("pattern mismatch",f); continue; }
  t=t.replace(blockOld,blockNew);
  fs.writeFileSync(f,t);
  console.log("patched",f);
}
