const fs=require("fs"); 
const f=__dirname+"/gradle.cjs"; 
let s=fs.readFileSync(f,"utf8"); 
if(s.includes("shouldUseWinSubst")){console.log("skip");process.exit(0);} 
s=s.replace("if (!isWin ^|^| !pathHasNonAscii(repoRoot))","if (!shouldUseWinSubst())");
