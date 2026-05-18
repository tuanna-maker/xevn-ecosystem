p = r"C:/xevn-ecosystem/apps/mobile/hrm-mobile/scripts/gradle.cjs"
c = open(p, encoding="utf-8").read()
if "FORCE_SUBST_MOBILE" in c:
    print("skip")
    raise SystemExit(0)
insert = """
  if (substDrive && repoRoot === JUNCTION_REPO_ROOT) {
    const substMobile = toSubstPath(mobileRoot);
    env.GRADLE_MOBILE_ROOT = substMobile;
    env.GRADLE_PATH_APP_ENTRY = path.join(substMobile, "index.ts");
    env.GRADLE_PATH_EXPO_CLI = toSubstPath(expoCli);
    env.GRADLE_PATH_RN_PKG_METRO = toSubstPath(rnPkg);
    const pack = substMobile;
    env.REACT_NATIVE_PACKAGER_ROOT = pack;
    env.PROJECT_ROOT = pack;
    env.EXPO_PROJECT_ROOT = pack;
  } // FORCE_SUBST_MOBILE

"""
needle = '  const localRnGradleLink = path.join(mobileRoot, "android", ".rn-gradle-plugin");'
c = c.replace(needle, insert + needle)
open(p, "w", encoding="utf-8").write(c)
print("ok")
