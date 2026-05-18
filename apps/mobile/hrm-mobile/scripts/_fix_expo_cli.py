import pathlib 
p=pathlib.Path(r"Z:/apps/mobile/hrm-mobile/scripts/gradle.cjs") 
s=p.read_text(encoding="utf-8") 
s=s.replace("const expoCli = resolveFromMobile(\"@expo/cli/package.json\");","const expoCliPkg = resolveFromMobile(\"@expo/cli/package.json\");^n  const expoCliBin = require.resolve(\"@expo/cli/build/bin/cli\", { paths: [path.dirname(expoCliPkg)] });")
