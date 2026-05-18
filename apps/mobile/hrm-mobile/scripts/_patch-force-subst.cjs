const fs=require("fs");
const p="scripts/gradle.cjs";
let g=fs.readFileSync(p,"utf8");
if(!g.includes("FORCE_SUBST_JUNCTION")){
g=g.replace(
`function resolveExecCwd() {
  if (!isWin || !pathHasNonAscii(repoRoot)) {
    return { execCwd: androidDir, substDrive: null };
  }`,
`function resolveExecCwd() {
  const forceSubstJunction =
    useJunction && isWin && process.env.GRADLE_JUNCTION_SUBST !== '0';
  if (!forceSubstJunction && (!isWin || !pathHasNonAscii(repoRoot))) {
    return { execCwd: androidDir, substDrive: null };
  }
  // FORCE_SUBST_JUNCTION`
);
g=g.replace(
`  const drive = substRepoDrive(repoRoot);`,
`  const drive = substRepoDrive(repoRoot);
  if (forceSubstJunction) {
    console.error('[gradle] Junction repo ? subst', drive, '?', repoRoot);
  }`
);
g=g.replace(
`    const pack = toSubstPath(mobileRoot);
    env.REACT_NATIVE_PACKAGER_ROOT = pack;
    env.PROJECT_ROOT = pack;
    env.EXPO_PROJECT_ROOT = pack;`,
`    const pack = toSubstPath(mobileRoot);
    const metroRoot = useJunction ? mobileRoot : pack;
    env.REACT_NATIVE_PACKAGER_ROOT = metroRoot;
    env.PROJECT_ROOT = metroRoot;
    env.EXPO_PROJECT_ROOT = metroRoot;`
);
fs.writeFileSync(p,g);
console.log("added FORCE_SUBST_JUNCTION");
}else console.log("already");
