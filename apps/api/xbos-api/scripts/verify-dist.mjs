import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, '..', 'dist');

if (!fs.existsSync(distPath)) {
    console.error(`Error: dist directory is missing at ${distPath}`);
    process.exit(1);
}
console.log('Verified dist directory exists.');
