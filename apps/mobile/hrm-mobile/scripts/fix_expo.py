import pathlib
p = pathlib.Path(''Z:/apps/mobile/hrm-mobile/scripts/gradle.cjs'')
s = p.read_text(encoding=''utf-8'')
old = '''  const expoCli = resolveFromMobile(" @expo/cli/package.json\);
 env.GRADLE_PATH_EXPO_CLI = toSubstPath(expoCli);'''
new = ''' const expoCliPkg = resolveFromMobile(\@expo/cli/package.json\);
 const expoCliBin = require.resolve(\@expo/cli/build/bin/cli\, { paths: [path.dirname(expoCliPkg)] });
 env.GRADLE_PATH_EXPO_CLI = toSubstPath(expoCliBin);'''
if old not in s:
 raise SystemExit('pattern missing')
p.write_text(s.replace(old, new, 1), encoding=''utf-8'')
print('fixed')
