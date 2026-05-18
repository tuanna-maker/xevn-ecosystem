const fs=require("fs");
const p="C:/xevn-ecosystem/apps/mobile/hrm-mobile/scripts/link-rn-gradle-plugin.cjs";
let c=fs.readFileSync(p,"utf8");
if(c.includes("JUNCTION_MOBILE_ROOT")){console.log("skip");process.exit(0);}
c=c.replace(
  "const mobileRoot = path.resolve(__dirname, '..');",
  "const JUNCTION_MOBILE_ROOT = path.join('C:\\\\xevn-ecosystem', 'apps', 'mobile', 'hrm-mobile');\nconst mobileRoot = fs.existsSync(path.join(JUNCTION_MOBILE_ROOT, 'package.json'))\n  ? path.resolve(JUNCTION_MOBILE_ROOT)\n  : path.resolve(__dirname, '..');"
);
fs.writeFileSync(p,c);
console.log("link plugin junction mobileRoot");
