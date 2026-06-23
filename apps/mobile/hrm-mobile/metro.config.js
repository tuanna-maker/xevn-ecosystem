const fs = require('fs');
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const JUNCTION_ROOT = 'C:\\xevn-ecosystem';

/** Map OneDrive realpaths → ASCII junction (Metro SHA-1 + Windows MAX_PATH). */
function toJunctionPath(absPath) {
  if (!absPath || process.platform !== 'win32') return absPath;
  const normalized = absPath.replace(/\//g, '\\');
  const marker = 'xevn-ecosystem';
  const idx = normalized.toLowerCase().indexOf(marker);
  if (idx >= 0) {
    const rel = normalized.slice(idx + marker.length).replace(/^\\/, '');
    const mapped = path.join(JUNCTION_ROOT, rel);
    if (fs.existsSync(mapped)) return mapped;
  }
  try {
    const realRepo = fs.realpathSync.native(JUNCTION_ROOT);
    const realPath = fs.realpathSync.native(absPath);
    if (realPath.toLowerCase().startsWith(realRepo.toLowerCase())) {
      const rel = path.relative(realRepo, realPath);
      const mapped = path.join(JUNCTION_ROOT, rel);
      if (fs.existsSync(mapped)) return mapped;
    }
  } catch {
    /* keep absPath */
  }
  return absPath;
}

const projectRoot = toJunctionPath(
  process.env.EXPO_PROJECT_ROOT || process.env.PROJECT_ROOT || __dirname,
);
const monorepoRoot = toJunctionPath(path.resolve(projectRoot, '../../..'));
const nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
].map(toJunctionPath);

function addVirtualStorePaths(pkgName) {
  try {
    const pkgDir = toJunctionPath(
      path.dirname(require.resolve(`${pkgName}/package.json`, { paths: [projectRoot, monorepoRoot] })),
    );
    const virtualStore = path.dirname(pkgDir);
    if (fs.existsSync(virtualStore) && !nodeModulesPaths.includes(virtualStore)) {
      nodeModulesPaths.push(virtualStore);
    }
    return virtualStore;
  } catch {
    return null;
  }
}

const expoVirtualStore = addVirtualStorePaths('expo');
const rnVirtualStore = addVirtualStorePaths('react-native');

let realMonorepoRoot = monorepoRoot;
try {
  realMonorepoRoot = fs.realpathSync.native(monorepoRoot);
} catch {
  /* junction only */
}

const config = getDefaultConfig(projectRoot);
config.watchFolders = [
  monorepoRoot,
  realMonorepoRoot,
  path.join(monorepoRoot, 'node_modules'),
  path.join(realMonorepoRoot, 'node_modules'),
  path.join(projectRoot, 'node_modules'),
];
config.resolver.nodeModulesPaths = nodeModulesPaths;
config.resolver.disableHierarchicalLookup = false;
config.resolver.unstable_enableSymlinks = true;
config.resolver.useWatchman = false;

const nodeStubModules = [
  'tty', 'fs', 'net', 'child_process', 'dgram', 'dns', 'http', 'https', 'util', 'os', 'stream', 'zlib', 'crypto',
  'assert', 'url', 'querystring', 'readline', 'string_decoder', 'timers', 'domain', 'punycode', 'vm',
  'worker_threads', 'perf_hooks', 'async_hooks', 'inspector', 'trace_events', 'v8', 'tls', 'cluster',
];
const nodeStub = path.join(projectRoot, 'vendor', 'node-stub.js');
const extra = {
  '@babel/runtime': path.join(projectRoot, 'vendor', '@babel', 'runtime'),
};
for (const mod of nodeStubModules) {
  extra[mod] = nodeStub;
}
const pkg = require(path.join(projectRoot, 'package.json'));
const resolveRoots = [projectRoot, monorepoRoot, expoVirtualStore, rnVirtualStore].filter(Boolean);

for (const name of [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.devDependencies || {}),
  '@react-native/virtualized-lists',
  '@react-native/js-polyfills',
  '@react-native/assets-registry',
  'invariant',
  'nullthrows',
  'buffer',
  'punycode',
  'memoize-one',
]) {
  if (extra[name]) continue;
  try {
    extra[name] = toJunctionPath(
      path.dirname(require.resolve(`${name}/package.json`, { paths: resolveRoots })),
    );
  } catch {
    /* optional */
  }
}

for (const virtualStore of [expoVirtualStore, rnVirtualStore]) {
  const storePath = toJunctionPath(virtualStore);
  if (!storePath || !fs.existsSync(storePath)) continue;
  for (const entry of fs.readdirSync(storePath, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('@')) {
      const scopeDir = path.join(storePath, entry.name);
      for (const sub of fs.readdirSync(scopeDir, { withFileTypes: true })) {
        if (!sub.isDirectory()) continue;
        const key = `${entry.name}/${sub.name}`;
        if (extra[key]) continue;
        const pkgJson = path.join(scopeDir, sub.name, 'package.json');
        if (fs.existsSync(pkgJson)) {
          extra[key] = path.join(scopeDir, sub.name);
        }
      }
      continue;
    }
    if (extra[entry.name]) continue;
    const pkgJson = path.join(storePath, entry.name, 'package.json');
    if (fs.existsSync(pkgJson)) {
      extra[entry.name] = path.join(storePath, entry.name);
    }
  }
}

try {
  const expoPkg = require(path.join(
    toJunctionPath(path.dirname(require.resolve('expo/package.json', { paths: [projectRoot, monorepoRoot] }))),
    'package.json',
  ));
  for (const name of Object.keys(expoPkg.dependencies || {})) {
    if (extra[name]) continue;
    try {
      extra[name] = toJunctionPath(
        path.dirname(require.resolve(`${name}/package.json`, { paths: resolveRoots })),
      );
    } catch {
      /* optional */
    }
  }
} catch {
  /* optional */
}

for (const name of [
  '@react-native/virtualized-lists',
  '@react-native/assets-registry',
  '@react-native/js-polyfills',
  '@react-native/normalize-colors',
  '@react-native/codegen',
]) {
  if (extra[name]) continue;
  try {
    extra[name] = toJunctionPath(
      path.dirname(require.resolve(`${name}/package.json`, { paths: [monorepoRoot, projectRoot] })),
    );
  } catch {
    /* optional */
  }
}

config.resolver.extraNodeModules = extra;

module.exports = config;
