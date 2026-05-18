const fs=require("fs");
const p="scripts/link-rn-gradle-plugin.cjs";
let s=fs.readFileSync(p,"utf8");
if(!s.includes("SKIP_IF_LINK_EXISTS")){
  const needle="removeOldLink();";
  const ins=`if (fs.existsSync(linkPath)) {
  console.log("[link-rn-gradle-plugin] skip (already exists):", linkPath);
  process.exit(0);
}
// SKIP_IF_LINK_EXISTS
`;
  s=s.replace(needle, ins+needle);
  fs.writeFileSync(p,s);
  console.log("patched link skip");
}
