const fs = require("fs");
let c = fs.readFileSync("android/app/build.gradle", "utf8");
c = c.replace(
  /reactNativeDir = .+\n/,
  `reactNativeDir = (System.getenv("GRADLE_PATH_RN_DIR") != null ? new File(System.getenv("GRADLE_PATH_RN_DIR")) : new File(["node", "--print", "require.resolve('react-native/package.json')"].execute(null, rootDir).text.trim()).getParentFile()).getAbsoluteFile()\n`,
);
c = c.replace(
  /hermesCommand = .+\n/,
  `hermesCommand = (System.getenv("GRADLE_PATH_RN_DIR") != null ? new File(System.getenv("GRADLE_PATH_RN_DIR")) : new File(["node", "--print", "require.resolve('react-native/package.json')"].execute(null, rootDir).text.trim()).getParentFile()).getAbsolutePath() + "/sdks/hermesc/%OS-BIN%/hermesc"\n`,
);
c = c.replace(
  /codegenDir = .+\n/,
  `codegenDir = (System.getenv("GRADLE_PATH_CODEGEN_DIR") != null ? new File(System.getenv("GRADLE_PATH_CODEGEN_DIR")) : new File(["node", "--print", "require.resolve('@react-native/codegen/package.json', { paths: [require.resolve('react-native/package.json')] })"].execute(null, rootDir).text.trim()).getParentFile()).getAbsoluteFile()\n`,
);
fs.writeFileSync("android/app/build.gradle", c);
console.log("fixed react dirs");
