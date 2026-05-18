const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = process.env.EXPO_PROJECT_ROOT || process.env.PROJECT_ROOT || __dirname;
const monorepoRoot = path.resolve(projectRoot, '../../..');

const config = getDefaultConfig(projectRoot);
config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];
const extra = {
  '@babel/runtime': path.join(projectRoot, 'vendor', '@babel', 'runtime'),
};
for (const name of ['expo', 'expo-modules-core', 'react', 'react-native']) {
  try {
    extra[name] = path.dirname(
      require.resolve(`${name}/package.json`, { paths: [projectRoot, monorepoRoot] }),
    );
  } catch {
    /* optional */
  }
}
config.resolver.extraNodeModules = extra;
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
