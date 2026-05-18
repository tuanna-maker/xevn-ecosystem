import * as fs from 'node:fs';
import * as path from 'node:path';
import { config } from 'dotenv';

const deployDir = path.resolve(__dirname, '../../../../deploy/xevn-ecosystem');
const deployEnv = path.join(deployDir, '.env');
const deployExample = path.join(deployDir, '.env.example');
const apiEnv = path.resolve(__dirname, '../.env');

if (fs.existsSync(deployEnv)) config({ path: deployEnv });
else if (fs.existsSync(deployExample)) config({ path: deployExample });
if (fs.existsSync(apiEnv)) config({ path: apiEnv, override: true });
