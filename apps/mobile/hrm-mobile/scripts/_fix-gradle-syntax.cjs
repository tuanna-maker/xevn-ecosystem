const fs=require("fs");
const p="scripts/gradle.cjs";
let g=fs.readFileSync(p,"utf8");
const before=g;
g=g.replace(/gradlePath\(([^)]+)\)\)\);/g,"gradlePath($1));");
g=g.replace(/gradlePath\(([^)]+)\)\);/g,"gradlePath($1);");
if(g===before){
  // manual fix common broken lines
  g=g.replace(/= gradlePath\(path\.dirname\(rnGradle\)\)\);/g,"= gradlePath(path.dirname(rnGradle));");
  g=g.replace(/= gradlePath\(expoPkg\)\);/g,"= gradlePath(expoPkg);");
  g=g.replace(/= gradlePath\(rnPkg\)\);/g,"= gradlePath(rnPkg);");
  g=g.replace(/= gradlePath\(expoAutolinking\)\);/g,"= gradlePath(expoAutolinking);");
  g=g.replace(/= gradlePath\(cliAndroid\)\);/g,"= gradlePath(cliAndroid);");
  g=g.replace(/= gradlePath\(rnDir\)\);/g,"= gradlePath(rnDir);");
  g=g.replace(/= gradlePath\(cliBin\)\);/g,"= gradlePath(cliBin);");
}
fs.writeFileSync(p,g);
console.log(g===before?"no change":"fixed parens");
