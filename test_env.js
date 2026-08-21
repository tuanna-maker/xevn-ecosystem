const { existsSync } = require('fs');
const { resolve } = require('path');
const dotenv = require('dotenv');

function moduleDir() { return __dirname; }
function findMonorepoRoot() {
  const candidates = [
    process.cwd(),
    resolve(process.cwd(), '..', '..', '..'),
    resolve(moduleDir(), '..', '..', '..'),
    resolve(moduleDir(), '..', '..', '..', '..'),
  ];
  for (const root of candidates) {
    const deployDir = resolve(root, 'deploy', 'xevn-ecosystem');
    if (existsSync(resolve(deployDir, '.env')) || existsSync(resolve(deployDir, '.env.example'))) {
      return root;
    }
  }
  return resolve(process.cwd(), '..', '..', '..');
}

console.log("Found root:", findMonorepoRoot());
const deployEnv = resolve(findMonorepoRoot(), 'deploy', 'xevn-ecosystem', '.env');
console.log("Target .env:", deployEnv, "Exists:", existsSync(deployEnv));

dotenv.config({ path: deployEnv });
console.log("DB_HOST:", process.env.DB_HOST);
